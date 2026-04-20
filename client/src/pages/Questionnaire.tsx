import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const QUESTIONS = [
  { id: "age", label: "How old are you?", type: "select", options: ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"] },
  { id: "gender", label: "How do you identify?", type: "select", options: ["Man", "Woman", "Non-binary", "Prefer not to say"] },
  { id: "lifestyle", label: "Best describes your lifestyle?", type: "select", options: ["Homebody", "Active / Outdoorsy", "Social butterfly", "Work-focused", "Balanced"] },
  { id: "diet", label: "Your diet?", type: "multi", options: ["Omnivore", "Vegetarian", "Vegan", "Keto", "Gluten-free", "Halal", "Kosher"] },
  { id: "style", label: "Your fashion vibe?", type: "multi", options: ["Casual", "Smart casual", "Professional", "Streetwear", "Minimalist", "Maximalist", "Sporty"] },
  { id: "health", label: "Health goals?", type: "multi", options: ["Lose weight", "Build muscle", "Improve energy", "Reduce stress", "Better sleep", "No specific goal"] },
  { id: "climate", label: "Your climate / location?", type: "select", options: ["Tropical / Hot", "Mediterranean", "Temperate", "Cold / Snowy", "Desert", "Coastal"] },
  { id: "budget", label: "Your budget mindset?", type: "select", options: ["Budget-conscious", "Mid-range", "Willing to splurge", "Varies by category"] },
  { id: "morning", label: "Morning person or night owl?", type: "select", options: ["Early bird 🐦", "Night owl 🦉", "Somewhere in between"] },
  { id: "interests", label: "Your interests?", type: "multi", options: ["Fitness", "Cooking", "Travel", "Reading", "Gaming", "Art / Music", "Tech", "Nature", "Social events"] },
];

interface QuestionnairePageProps {
  params: { profileId: string };
}

export default function Questionnaire() {
  const [, navigate] = useLocation();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const profileId = parseInt(pathname.split("/")[2]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const existingAnswersQuery = trpc.questionnaire.get.useQuery(
    { profileId },
    { enabled: Number.isFinite(profileId) && profileId > 0 }
  );

  useEffect(() => {
    const existing = existingAnswersQuery.data?.answers as Record<string, any> | undefined;
    if (existing && Object.keys(existing).length > 0) {
      setAnswers(existing);
    }
  }, [existingAnswersQuery.data]);

  const saveAnswersMutation = trpc.questionnaire.save.useMutation({
    onSuccess: () => {
      toast.success("Preferences saved!");
      navigate(`/dashboard/${profileId}`, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save answers");
    },
  });

  const q = QUESTIONS[step];
  const val = answers[q.id];
  const canNext = q.type === "multi" ? (val || []).length > 0 : !!val;
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleToggle = (option: string) => {
    setAnswers((prev) => {
      if (q.type === "multi") {
        const cur = prev[q.id] || [];
        return {
          ...prev,
          [q.id]: cur.includes(option) ? cur.filter((o: string) => o !== option) : [...cur, option],
        };
      }
      return { ...prev, [q.id]: option };
    });
  };

  const handleFinish = () => {
    saveAnswersMutation.mutate({ profileId, answers });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-accent">DayWise</span>
            <span className="text-sm text-muted-foreground">Setting up your profile</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-3">
            Question {step + 1} of {QUESTIONS.length}
            {q.type === "multi" && " · Pick all that apply"}
          </div>
          {existingAnswersQuery.data?.answers && (
            <div className="text-xs text-muted-foreground mt-2">
              Editing existing preferences
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-6">{q.label}</h2>
            <div className="space-y-2">
              {q.options.map((option) => {
                const isSel = q.type === "multi" ? (val || []).includes(option) : val === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleToggle(option)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left font-medium ${
                      isSel
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border hover:border-accent hover:bg-secondary"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <Button
                onClick={() => setStep((s) => s - 1)}
                variant="outline"
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={() => (isLast ? handleFinish() : setStep((s) => s + 1))}
              disabled={!canNext || saveAnswersMutation.isPending}
              className="flex-1"
            >
              {isLast ? "Finish & Let's Go" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
