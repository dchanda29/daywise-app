import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createProfile,
  createAdviceFeedback,
  getUserProfiles,
  updateProfile,
  deleteProfile,
  saveQuestionnaireAnswers,
  getQuestionnaireAnswers,
  getRecentAdviceFeedback,
  createColorPalette,
  getUserColorPalettes,
  updateColorPalette,
  deleteColorPalette,
  getUserPreferences,
  updateUserPreferences,
  userOwnsProfile,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Profile management
  profiles: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserProfiles(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), emoji: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await createProfile(ctx.user.id, input.name, input.emoji);
        } catch (error) {
          if (error instanceof Error && error.message.includes("up to")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: error.message,
            });
          }
          throw error;
        }
      }),

    update: protectedProcedure
      .input(z.object({ profileId: z.number(), name: z.string().min(1), emoji: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!(await userOwnsProfile(ctx.user.id, input.profileId))) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this profile." });
        }
        return await updateProfile(input.profileId, input.name, input.emoji);
      }),

    delete: protectedProcedure
      .input(z.object({ profileId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!(await userOwnsProfile(ctx.user.id, input.profileId))) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this profile." });
        }
        return await deleteProfile(input.profileId);
      }),
  }),

  // Questionnaire
  questionnaire: router({
    save: protectedProcedure
      .input(z.object({ profileId: z.number(), answers: z.record(z.string(), z.any()) }))
      .mutation(async ({ ctx, input }) => {
        if (!(await userOwnsProfile(ctx.user.id, input.profileId))) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this profile." });
        }
        return await saveQuestionnaireAnswers(input.profileId, input.answers);
      }),

    get: protectedProcedure
      .input(z.object({ profileId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!(await userOwnsProfile(ctx.user.id, input.profileId))) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this profile." });
        }
        return await getQuestionnaireAnswers(input.profileId);
      }),
  }),

  // AI Advice
  advice: router({
    generate: protectedProcedure
      .input(
        z.object({
          profileId: z.number(),
          categories: z.array(z.string()),
          prompt: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!(await userOwnsProfile(ctx.user.id, input.profileId))) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this profile." });
        }
        const answers = await getQuestionnaireAnswers(input.profileId);
        if (!answers) {
          throw new Error("Profile questionnaire not completed");
        }

        const profileSummary = Object.entries((answers.answers as Record<string, any>) || {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n");

        const feedback = await getRecentAdviceFeedback(input.profileId, 8);
        const feedbackSummary = feedback
          .map((item) => {
            const notePart = item.note ? ` (${item.note})` : "";
            return `${item.category}: ${item.rating}${notePart} -> ${item.recommendation}`;
          })
          .join("\n");

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a warm, practical personal AI life advisor.\nUser profile:\n${profileSummary}\n\nPast feedback from this user:\n${feedbackSummary || "No prior feedback yet."}\n\nReturn concise, personalized guidance as JSON with this shape:\n{"primary":"string","alternatives":["string","string"],"reason":"string"}.\nRules: keep advice actionable, realistic, and aligned with the user's preferences/budget/lifestyle.`,
              },
              {
                role: "user",
                content: input.prompt,
              },
            ],
            responseFormat: { type: "json_object" },
          });

          const text = response.choices?.[0]?.message?.content;
          if (typeof text === "string" && text.trim().length > 0) {
            try {
              const parsed = JSON.parse(text) as {
                primary?: string;
                alternatives?: string[];
                reason?: string;
              };
              const alternatives = Array.isArray(parsed.alternatives) ? parsed.alternatives.slice(0, 2) : [];
              const finalText = [
                parsed.primary ? `Primary: ${parsed.primary}` : "",
                alternatives.length > 0 ? `Alternatives:\n- ${alternatives.join("\n- ")}` : "",
                parsed.reason ? `Why this fits you: ${parsed.reason}` : "",
              ]
                .filter(Boolean)
                .join("\n\n");
              return {
                text: finalText || text,
                mock: false,
              };
            } catch {
              return { text, mock: false };
            }
          }
          throw new Error("Invalid response format");
        } catch (error) {
          console.error("LLM error:", error);
          // Return mock response as fallback
          return {
            text: "I'd love to help you with this decision! Based on your preferences, consider what aligns best with your goals and values. Trust your instincts—you've got this!",
            mock: true,
          };
        }
      }),
    feedback: protectedProcedure
      .input(
        z.object({
          profileId: z.number(),
          category: z.string().min(1),
          recommendation: z.string().min(1),
          rating: z.enum(["like", "dislike"]),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!(await userOwnsProfile(ctx.user.id, input.profileId))) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this profile." });
        }
        await createAdviceFeedback(
          ctx.user.id,
          input.profileId,
          input.category,
          input.recommendation,
          input.rating,
          input.note
        );
        return { success: true } as const;
      }),
  }),

  // Color Palettes
  palettes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserColorPalettes(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), colors: z.record(z.string(), z.string()) }))
      .mutation(async ({ ctx, input }) => {
        const colors = input.colors as Record<string, string>;
        return await createColorPalette(ctx.user.id, input.name, colors);
      }),

    update: protectedProcedure
      .input(z.object({ paletteId: z.number(), name: z.string().min(1), colors: z.record(z.string(), z.string()) }))
      .mutation(async ({ input }) => {
        const colors = input.colors as Record<string, string>;
        return await updateColorPalette(input.paletteId, input.name, colors);
      }),

    delete: protectedProcedure
      .input(z.object({ paletteId: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteColorPalette(input.paletteId);
      }),
  }),

  // User Preferences
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPreferences(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({ selectedPaletteId: z.number().optional(), theme: z.enum(["light", "dark"]).optional() }))
      .mutation(async ({ ctx, input }) => {
        return await updateUserPreferences(ctx.user.id, input.selectedPaletteId, input.theme);
      }),
  }),
});

export type AppRouter = typeof appRouter;
