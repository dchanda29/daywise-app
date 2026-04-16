import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, RotateCcw, Settings, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "outfit", icon: "👗", label: "What to Wear", prompt: "Suggest a complete outfit for today based on my style preferences and climate." },
  { id: "meal", icon: "🍽️", label: "What to Eat", prompt: "Suggest what I should eat today for breakfast, lunch, and dinner based on my diet and health goals." },
  { id: "activity", icon: "🏃", label: "Today's Activity", prompt: "What physical activity or exercise should I do today given my lifestyle and health goals?" },
  { id: "mood", icon: "🧘", label: "Mood Boost", prompt: "Give me a personalized mood-boosting tip or micro-activity for today." },
  { id: "productivity", icon: "⚡", label: "Productivity Tip", prompt: "Give me a tailored productivity tip or focus strategy for today based on my lifestyle and interests." },
  { id: "social", icon: "💬", label: "Social Plan", prompt: "What social activity or connection should I prioritize today?" },
  { id: "purchase", icon: "🛍️", label: "Buy or Not Buy", prompt: "Help me decide if I should make a purchase today and what factors to weigh, given my budget mindset." },
  { id: "selfcare", icon: "✨", label: "Self-Care", prompt: "Recommend a self-care routine or ritual for today that fits my lifestyle and health goals." },
];

const PRESET_PALETTES = [
  {
    name: "Ocean Blue",
    colors: {
      primary: "#0EA5E9",
      secondary: "#06B6D4",
      accent: "#F0C060",
      background: "#0D0D0F",
      surface: "#16161A",
    },
  },
  {
    name: "Forest Green",
    colors: {
      primary: "#10B981",
      secondary: "#34D399",
      accent: "#F0C060",
      background: "#0D0D0F",
      surface: "#16161A",
    },
  },
  {
    name: "Sunset",
    colors: {
      primary: "#F97316",
      secondary: "#FB923C",
      accent: "#FCD34D",
      background: "#0D0D0F",
      surface: "#16161A",
    },
  },
];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const profileId = parseInt(pathname.split("/")[2]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, any>>({});
  const [asked, setAsked] = useState(false);
  const [showPaletteDialog, setShowPaletteDialog] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [paletteColors, setPaletteColors] = useState({
    primary: "#0EA5E9",
    secondary: "#06B6D4",
    accent: "#F0C060",
  });

  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dayStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const generateAdviceMutation = trpc.advice.generate.useMutation({
    onSuccess: (data, variables) => {
      const catId = variables.categories[0];
      setResults((prev) => ({
        ...prev,
        [catId]: { loading: false, text: data.text, mock: data.mock },
      }));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate advice");
    },
  });

  const createPaletteMutation = trpc.palettes.create.useMutation({
    onSuccess: () => {
      toast.success("Palette created!");
      setPaletteName("");
      setShowPaletteDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create palette");
    },
  });

  const toggleCategory = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setResults((r) => {
      const n = { ...r };
      delete n[id];
      return n;
    });
    if (asked) setAsked(false);
  };

  const getAdvice = async () => {
    setAsked(true);
    const cats = Array.from(selected);
    const newResults: Record<string, any> = {};
    cats.forEach((catId) => {
      newResults[catId] = { loading: true, text: "", mock: false };
    });
    setResults(newResults);

    for (const catId of cats) {
      const cat = CATEGORIES.find((c) => c.id === catId);
      if (cat) {
        await new Promise((resolve) => {
          generateAdviceMutation.mutate(
            {
              profileId,
              categories: [catId],
              prompt: cat.prompt,
            },
            {
              onSuccess: () => resolve(null),
              onError: () => resolve(null),
            }
          );
        });
      }
    }
  };

  const regen = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      setResults((r) => ({ ...r, [catId]: { loading: true, text: "", mock: false } }));
      generateAdviceMutation.mutate({
        profileId,
        categories: [catId],
        prompt: cat.prompt + " Give a fresh, different suggestion.",
      });
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    setPaletteName(preset.name);
    setPaletteColors(preset.colors);
  };

  const handleCreatePalette = () => {
    if (!paletteName.trim()) {
      toast.error("Please enter a palette name");
      return;
    }
    createPaletteMutation.mutate({
      name: paletteName.trim(),
      colors: paletteColors,
    });
  };

  const clearAll = () => {
    setSelected(new Set());
    setResults({});
    setAsked(false);
  };

  const orderedSelected = CATEGORIES.filter((c) => selected.has(c.id));
  const anySelected = selected.size > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/profiles", { replace: true })} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-accent">DayWise</h1>
          </div>
          <Dialog open={showPaletteDialog} onOpenChange={setShowPaletteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Color Palette</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Palette Name</label>
                  <Input
                    value={paletteName}
                    onChange={(e) => setPaletteName(e.target.value)}
                    placeholder="e.g., My Favorite"
                    className="mt-1"
                  />
                </div>

                <div className="space-y-3">
                  {Object.entries(paletteColors).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm font-medium capitalize w-20">{key}</label>
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => setPaletteColors((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-12 h-10 rounded border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setPaletteColors((p) => ({ ...p, [key]: e.target.value }))}
                        className="flex-1 px-2 py-1 rounded border border-border text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Preset Palettes</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_PALETTES.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handleApplyPreset(preset)}
                        className="p-3 rounded border border-border hover:border-accent transition-all text-center text-xs font-medium"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleCreatePalette} disabled={createPaletteMutation.isPending} className="w-full">
                  Save Palette
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">
            {greet}, <span className="text-accent">DayWise</span> ✦
          </h2>
          <p className="text-muted-foreground">{dayStr} · What do you need help deciding today?</p>
        </div>

        <Card className="mb-8 bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <p className="text-sm">
              💡 Select one or more topics, then tap <strong>Get AI Advice</strong> — you'll get personalized guidance for everything at once.
            </p>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Today's Decisions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selected.has(cat.id)
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent hover:bg-secondary"
                }`}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="text-sm font-medium">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <Button
            onClick={getAdvice}
            disabled={!anySelected || generateAdviceMutation.isPending}
            size="lg"
            className="flex-1 md:flex-none md:min-w-[250px]"
          >
            {anySelected ? `Get AI Advice (${selected.size} topic${selected.size > 1 ? "s" : ""})` : "Select topics above"}
            {generateAdviceMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          </Button>
          {anySelected && (
            <Button onClick={clearAll} variant="outline">
              Clear all
            </Button>
          )}
        </div>

        {asked && orderedSelected.length > 0 && (
          <div className="space-y-4">
            {orderedSelected.map((cat) => {
              const r = results[cat.id];
              return (
                <Card key={cat.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{cat.label}</CardTitle>
                          <CardDescription>Personalized for you</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!r || r.loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Getting advice...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">{r.text}</p>
                        {r.mock && (
                          <p className="text-xs text-muted-foreground mb-4">⚡ Preview response — full AI activates once deployed with your API key.</p>
                        )}
                        <Button
                          onClick={() => regen(cat.id)}
                          variant="outline"
                          size="sm"
                          disabled={generateAdviceMutation.isPending}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          New suggestion
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!asked && (
          <Card className="bg-secondary/50 border-border/50">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-muted-foreground">
                Select topics above and tap <strong className="text-foreground">Get AI Advice</strong>.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
