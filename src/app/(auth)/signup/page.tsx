"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "fair" | "good" | "strong">("weak");

  function checkPasswordStrength(pwd: string) {
    if (pwd.length < 8) setPasswordStrength("weak");
    else if (pwd.length < 12) setPasswordStrength("fair");
    else if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) setPasswordStrength("strong");
    else setPasswordStrength("good");
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create account via signup API
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password, name: name.trim() }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(signupData.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Sign in automatically
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase(),
        password,
      });

      if (signInResult?.error) {
        setError(signInResult.error || "Login failed after signup. Please try signing in.");
        setLoading(false);
        return;
      }

      if (!signInResult?.ok) {
        setError("Failed to complete signup. Please try signing in manually.");
        setLoading(false);
        return;
      }

      // Step 3: Redirect to onboarding
      router.push("/onboarding");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-gradient-to-br from-brand/20 to-brand/5 rounded-full p-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-charcoal">Join SkillSwap AR</h1>
          <p className="text-slate-600">Start your local skill exchange journey today</p>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal">Full name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
                disabled={loading}
                placeholder="John Doe"
                className="w-full"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal">Email address</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                disabled={loading}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-charcoal">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkPasswordStrength(e.target.value);
                }} 
                required 
                disabled={loading}
                minLength={8}
                placeholder="Create a strong password"
                className="w-full"
              />
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1 h-2">
                    {["weak", "fair", "good", "strong"].map((level, idx) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition ${
                          ["weak", "fair", "good", "strong"].indexOf(passwordStrength) >= idx
                            ? passwordStrength === "weak"
                              ? "bg-rose-400"
                              : passwordStrength === "fair"
                              ? "bg-amber-400"
                              : passwordStrength === "good"
                              ? "bg-blue-400"
                              : "bg-green-400"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">
                    Password strength: <span className="font-semibold capitalize">{passwordStrength}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-sm font-medium text-rose-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand hover:bg-[#2a6f3b] text-white font-semibold py-2.5 rounded-lg transition"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Agreement Text */}
          <p className="text-xs text-slate-600 text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Sign in
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

