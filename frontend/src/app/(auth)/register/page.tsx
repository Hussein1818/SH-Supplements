"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Check, X, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";

const BASE_URL = "https://sh-supplements.runasp.net";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "", LastName: "", userName: "", email: "", password: "",
  });
  const router          = useRouter();
  const [showPassword,  setShowPassword]  = useState(false);
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  // ── Password rules (logic unchanged) ─────────────────────────────────────
  const passwordRules = {
    length:       formData.password.length >= 6,
    hasLowerCase: /[a-z]/.test(formData.password),
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(formData.password),
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const passwordStrength = Object.values(passwordRules).filter(Boolean).length;

  // ── Submit handler (logic unchanged) ─────────────────────────────────────
  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isPasswordValid) return;
    setIsSubmitting(true);
    try {
      const response = await api.post(`${BASE_URL}/api/auth/register`, formData);
      const successMessage =
        response.data?.Message ||
        "Account created! Please check your email to confirm your account.";
      toast.success(successMessage);
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      const serverResponse = error.response?.data;
      if (serverResponse?.Message)       toast.error(serverResponse.Message);
      else if (typeof serverResponse === "string") toast.error(serverResponse);
      else if (Array.isArray(serverResponse)) serverResponse.forEach((err: string) => toast.error(err));
      else toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
  const strengthLabel  = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans antialiased" dir="ltr">

      {/* ── Left — Branding Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-stone-900 flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          aria-hidden="true"
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl" aria-hidden="true" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="SH Supplements Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
          <div>
            <span className="font-bold text-white text-sm">SH<span className="text-emerald-400">Supplements</span></span>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">Premium Nutrition</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="h-px w-12 bg-emerald-600" aria-hidden="true" />
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Start your<br />
            <span className="text-emerald-400">wellness journey.</span>
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            Create your free account and unlock personalized supplement recommendations tailored to your goals.
          </p>

          <div className="space-y-3 pt-2">
            {["Personalized supplement plans", "BMI & progress tracking", "Flash deals and member discounts"].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                </div>
                <span className="text-xs text-stone-300 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-stone-600">© {new Date().getFullYear()} SH Supplements</p>
      </div>

      {/* ── Right — Form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-7 animate-fade-up">

          {/* Logo above form */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <Image
              src="/logo.png"
              alt="SH Supplements Logo"
              width={44}
              height={44}
              className="h-10 sm:h-11 w-auto object-contain"
              priority
            />
            <span className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight">
              SH<span className="text-emerald-600">Supplements</span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Create account</h1>
            <p className="text-stone-500 text-sm mt-1.5">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                  <Input
                    id="firstName" type="text" placeholder="John" className="pl-9"
                    required autoComplete="given-name"
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                  <Input
                    id="lastName" type="text" placeholder="Doe" className="pl-9"
                    required autoComplete="family-name"
                    onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="userName" className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                <Input
                  id="userName" type="text" placeholder="john_doe" className="pl-10"
                  required autoComplete="username"
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                <Input
                  id="email" type="email" placeholder="name@example.com" className="pl-10"
                  required autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  required autoComplete="new-password"
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

              {/* Password strength */}
              {formData.password && (
                <div className="space-y-2.5 mt-2">
                  {/* Strength bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1" role="progressbar" aria-label={`Password strength: ${strengthLabel[passwordStrength]}`} aria-valuenow={passwordStrength} aria-valuemin={0} aria-valuemax={4}>
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-stone-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-stone-500 w-12 text-right">
                      {strengthLabel[passwordStrength]}
                    </span>
                  </div>

                  {/* Rules */}
                  <div className="grid grid-cols-2 gap-1" role="list" aria-label="Password requirements">
                    {[
                      { rule: passwordRules.length,       label: "6+ characters" },
                      { rule: passwordRules.hasLowerCase, label: "Lowercase (a-z)" },
                      { rule: passwordRules.hasUpperCase, label: "Uppercase (A-Z)" },
                      { rule: passwordRules.hasSpecialChar,label: "Special character" },
                    ].map(({ rule, label }) => (
                      <div
                        key={label}
                        role="listitem"
                        className={cn(
                          "flex items-center gap-1.5 text-[11px] font-medium transition-colors",
                          rule ? "text-emerald-600" : "text-stone-400"
                        )}
                      >
                        {rule ? (
                          <Check className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        ) : (
                          <X className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        )}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={!isPasswordValid}
              className="w-full rounded-xl font-bold mt-2"
              aria-label="Create your account"
            >
              {!isSubmitting && <>Create Account <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
            </Button>
          </form>

          <p className="text-center text-xs text-stone-400">
            By creating an account, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-stone-600 transition-colors">Terms of Service</span>
            {" "}and{" "}
            <span className="underline cursor-pointer hover:text-stone-600 transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
