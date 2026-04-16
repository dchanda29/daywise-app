import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
                Sign in with your Manus account to get started with personalized daily advice.
              </p>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full"
                size="lg"
              >
                Sign In with Manus →
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Create a new account to start using DayWise. You'll need a Manus account to sign up.
              </p>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="w-full"
                size="lg"
              >
                Create Account with Manus →
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
