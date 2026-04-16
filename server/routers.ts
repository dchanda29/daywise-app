import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createProfile,
  getUserProfiles,
  updateProfile,
  deleteProfile,
  saveQuestionnaireAnswers,
  getQuestionnaireAnswers,
  createColorPalette,
  getUserColorPalettes,
  updateColorPalette,
  deleteColorPalette,
  getUserPreferences,
  updateUserPreferences,
} from "./db";
import { invokeLLM } from "./_core/llm";

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
        return await createProfile(ctx.user.id, input.name, input.emoji);
      }),

    update: protectedProcedure
      .input(z.object({ profileId: z.number(), name: z.string().min(1), emoji: z.string() }))
      .mutation(async ({ input }) => {
        return await updateProfile(input.profileId, input.name, input.emoji);
      }),

    delete: protectedProcedure
      .input(z.object({ profileId: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteProfile(input.profileId);
      }),
  }),

  // Questionnaire
  questionnaire: router({
    save: protectedProcedure
      .input(z.object({ profileId: z.number(), answers: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => {
        return await saveQuestionnaireAnswers(input.profileId, input.answers);
      }),

    get: protectedProcedure
      .input(z.object({ profileId: z.number() }))
      .query(async ({ input }) => {
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
      .mutation(async ({ input }) => {
        const answers = await getQuestionnaireAnswers(input.profileId);
        if (!answers) {
          throw new Error("Profile questionnaire not completed");
        }

        const profileSummary = Object.entries((answers.answers as Record<string, any>) || {})
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n");

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a warm, witty personal AI life advisor. You know this person well:\n${profileSummary}\n\nGive specific, actionable advice tailored to their exact profile. Be concise (3–5 sentences). Be conversational and encouraging. Start directly with the advice — no preamble.`,
              },
              {
                role: "user",
                content: input.prompt,
              },
            ],
          });

          const text = response.choices?.[0]?.message?.content;
          if (typeof text === "string") {
            return { text, mock: false };
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
