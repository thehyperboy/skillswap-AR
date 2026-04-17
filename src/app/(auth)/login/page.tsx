"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(error);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase(),
        password,
      });

      if (result?.error) {
        setLocalError(result.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (!result?.ok) {
        setLocalError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setLocalError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-gradient-to-br from-brand/20 to-brand/5 rounded-full p-4">
            <span className="text-3xl">🌍</span>
          </div>
          <h1 className="text-3xl font-bold text-charcoal">Welcome back</h1>
          <p className="text-slate-600">Sign in to your SkillSwap AR account</p>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal">Email address</label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
                type="email"
                placeholder="you@example.com"
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal">Password</label>
              <Input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={loading}
                type="password"
                placeholder="••••••••"
                minLength={8}
                className="w-full"
              />
            </div>

            {/* Error Message */}
            {localError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-sm font-medium text-rose-700">{localError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand hover:bg-[#2a6f3b] text-white font-semibold py-2.5 rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue as</span>
            </div>
          </div>

          {/* Guest Option */}
          <Button
            type="button"
            variant="outline"
            className="w-full border border-slate-300 py-2.5 rounded-lg text-charcoal font-medium hover:bg-slate-50"
            onClick={() => router.push("/explore")}
            disabled={loading}
          >
            Browse as guest
          </Button>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-brand hover:underline">
              Create one
            </Link>
          </p>
          <Link href="/" className="inline-block text-sm text-slate-600 hover:text-charcoal">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

