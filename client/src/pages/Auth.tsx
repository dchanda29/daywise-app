import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";

export default function Auth() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl font-bold text-accent mb-2">DayWise</div>
          <CardDescription className="text-base">Your AI co-pilot for everyday decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in with Google to continue. If this is your first time, your account is created automatically.
              </p>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full"
                size="lg"
              >
                Continue with Google →
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Create your account with Google in one click. Existing users are signed in directly.
              </p>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full"
                size="lg"
              >
                Create Account with Google →
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
