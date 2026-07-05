"use client";

import Link from "next/link";
import { Lock, User, Eye, EyeOff, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import { cn } from "@/src/lib/utils";

const BASE_URL = "https://sh-supplements.runasp.net/api";

export default function Login() {
  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginStore = useAuthStore((state) => state.login);
  const router     = useRouter();

  // ── Login handler (logic unchanged) ──────────────────────────────────────
  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/Auth/login`,
        { usernameOrEmail: formData.usernameOrEmail, password: formData.password },
        { withCredentials: true }
      );
      const data  = response.data;
      const token = data.token || data.accessToken;
      loginStore(token);
      router.push("/");
      toast.success("Welcome back!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.Message || error.message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans antialiased" dir="ltr">

      {/* ── Left — Branding Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-stone-900 flex-col justify-between p-12">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          aria-hidden="true"
        />
        {/* Emerald glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl" aria-hidden="true" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">SH<span className="text-emerald-400">Supplements</span></span>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Premium Nutrition</p>
          </div>
        </div>

        {/* Centre text */}
        <div className="relative z-10 space-y-6">
          <div className="h-px w-12 bg-emerald-600" aria-hidden="true" />
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Your goals.<br />
            <span className="text-emerald-400">Precisely fuelled.</span>
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            Access personalized supplement recommendations, track your progress, and achieve your peak performance.
          </p>

          {/* Trust badges */}
          <div className="space-y-3 pt-2">
            {[
              "Clinically formulated supplements",
              "Personalized nutrition plans",
              "Trusted by thousands of athletes",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                </div>
                <span className="text-xs text-stone-300 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-xs text-stone-600">© {new Date().getFullYear()} SH Supplements</p>
      </div>

      {/* ── Right — Form Panel ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-stone-900 text-sm">SH<span className="text-emerald-600">Supplements</span></span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Sign in</h1>
            <p className="text-stone-500 text-sm mt-1.5">
              New here?{" "}
              <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLoginSubmit} noValidate>
            {/* Username / Email */}
            <div className="space-y-1.5">
              <Label htmlFor="usernameOrEmail" className="text-sm font-semibold text-stone-700">
                Username or Email
              </Label>
              <div className="relative" dir="ltr">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                <Input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="Enter your username or email"
                  className="pl-10"
                  required
                  autoComplete="username"
                  value={formData.usernameOrEmail}
                  onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-stone-700">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative" dir="ltr">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full rounded-xl font-bold mt-2"
              aria-label="Sign in to your account"
            >
              {!isSubmitting && <>Sign In <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
            </Button>
          </form>

          {/* Footer links */}
          <p className="text-center text-xs text-stone-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
