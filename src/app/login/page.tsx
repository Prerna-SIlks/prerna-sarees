"use client";

import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const ADMIN_EMAIL = "prernasilks@gmail.com";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login credentials") || msg.includes("invalid")) {
        toast.error("Incorrect email or password. Please try again.");
      } else if (msg.includes("email not confirmed")) {
        toast.error("Please verify your email before logging in.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success("Successfully logged in!");

    const returnUrl = searchParams.get('returnUrl');
    const dest = data.user?.email === ADMIN_EMAIL && (!returnUrl || returnUrl === '/') 
      ? '/admin' 
      : (returnUrl || '/');

    router.push(dest);
    router.refresh();
  };

  return (
    <div className="flex-1 flex items-center justify-center py-24 bg-background px-4">
      <Card className="w-full max-w-md border border-border shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-serif font-bold tracking-tight text-primary">Welcome Back</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Sign in to your Prerna Silks account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="m@example.com" required className="h-12 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 focus-visible:ring-primary" />
              </div>
              <Button type="submit" className="w-full h-12 text-lg mt-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center border-t border-border pt-6 pb-8">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-24">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
