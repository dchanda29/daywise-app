import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const EMOJIS = ["🙂", "😎", "🧑", "👩", "🧔", "🧕", "👶", "🧓", "🐱", "🐶", "🦊", "🌟", "🔥", "🌙", "🎯", "🚀"];

export default function ProfilePicker() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🙂");
  const [open, setOpen] = useState(false);

  const { data: profiles = [], refetch } = trpc.profiles.list.useQuery();
  const createProfileMutation = trpc.profiles.create.useMutation({
    onSuccess: () => {
      refetch();
      setNewName("");
      setNewEmoji("🙂");
      setOpen(false);
      toast.success("Profile created!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create profile");
    },
  });

  const deleteProfileMutation = trpc.profiles.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Profile deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete profile");
    },
  });

  const handleCreateProfile = () => {
    if (!newName.trim()) {
      toast.error("Please enter a profile name");
      return;
    }
    createProfileMutation.mutate({ name: newName.trim(), emoji: newEmoji });
  };

  const handleSelectProfile = (profileId: number) => {
    navigate(`/questionnaire/${profileId}`, { replace: true });
  };

  const handleDeleteProfile = (profileId: number) => {
    if (window.confirm("Delete this profile? This cannot be undone.")) {
      deleteProfileMutation.mutate({ profileId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">DayWise</h1>
          <p className="text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{user?.name || user?.email}</span>
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Who's using DayWise?</CardTitle>
            <CardDescription>Each profile has its own preferences and AI history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile.id)}
                  className="relative group cursor-pointer"
                >
                  <Card className="hover:border-accent hover:shadow-lg transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{profile.emoji}</div>
                      <p className="font-semibold text-sm">{profile.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProfile(profile.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </CardContent>
                  </Card>
                </div>
              ))}

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Card className="hover:border-accent hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                      <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="font-semibold text-sm">Add Profile</p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Profile name</label>
                      <Input
                        placeholder="e.g., Weekend Me"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="mt-1"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Pick an emoji</label>
                      <div className="grid grid-cols-8 gap-2 mt-2">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setNewEmoji(emoji)}
                            className={`p-2 rounded border-2 transition-all ${
                              newEmoji === emoji
                                ? "border-accent bg-accent/10"
                                : "border-border hover:border-accent"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateProfile}
                        disabled={createProfileMutation.isPending}
                        className="flex-1"
                      >
                        Create Profile
                      </Button>
                      <Button
                        onClick={() => setOpen(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Button
              onClick={() => logout()}
              variant="ghost"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
