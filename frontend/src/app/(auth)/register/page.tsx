"use client";

import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const BASE_URL = "https://sh-supplements.runasp.net";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    LastName: "",
    userName: "",
    email: "",
    password: "",
  });

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const passwordRules = {
    length: formData.password.length >= 6,
    hasLowerCase: /[a-z]/.test(formData.password),
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isPasswordValid) return;

    try {
      const response = await api.post(
        `${BASE_URL}/api/auth/register`,
        formData,
      );
      const successMessage =
        response.data?.Message ||
        "Account created successfully!, User registered successfully. Please check your email to confirm your account.";
      toast.success(successMessage);
      router.push('/co')
    } catch (error: any) {
      const serverResponse = error.response?.data;
      console.error("Registration Error:", serverResponse);
      if (serverResponse?.Message) {
        toast.error(serverResponse.Message);
      } else if (typeof serverResponse === "string") {
        toast.error(serverResponse);
      } else if (Array.isArray(serverResponse)) {
        serverResponse.forEach((err: string) => toast.error(err));
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F9F9F9] flex flex-col justify-between font-sans antialiased"
      dir="ltr"
    >
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-md">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-base font-medium text-gray-500">
              Start Your Journey
            </CardTitle>
            <CardDescription className="text-xl font-bold text-gray-900">
              create your account to access personalized nutrition and
              supplement recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* first name field */}
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  first Name
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="pl-10 pr-3 focus-visible:ring-[#0044CC] text-left"
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* last name field */}
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  last Name
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="pl-10 pr-3 focus-visible:ring-[#0044CC] text-left"
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, LastName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* user name field */}
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="userName"
                  className="text-sm font-medium text-gray-700"
                >
                  user name
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="userName"
                    type="text"
                    placeholder="john_doe"
                    className="pl-10 pr-3 focus-visible:ring-[#0044CC] text-left"
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* email field */}
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative" dir="ltr">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 pr-3 focus-visible:ring-[#0044CC] text-left"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* password field */}
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    placeholder="********"
                    className="pl-10 pr-10 focus-visible:ring-[#0044CC]"
                    required
                    value={formData.password}
                    type={showPassword ? "text" : "password"}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 2. اللوحة التفاعلية لعرض الشروط لليوزر بالـ Clean UI */}
              {formData.password && (
                <div className="bg-gray-50 p-3 rounded-md space-y-1.5 text-xs text-gray-600 border border-gray-100">
                  <div
                    className={`flex items-center gap-1.5 ${passwordRules.length ? "text-green-600" : "text-red-500"}`}
                  >
                    {passwordRules.length ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    <span>At least 6 characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${passwordRules.hasLowerCase ? "text-green-600" : "text-red-500"}`}
                  >
                    {passwordRules.hasLowerCase ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    <span>At least one lowercase letter (a-z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${passwordRules.hasUpperCase ? "text-green-600" : "text-red-500"}`}
                  >
                    {passwordRules.hasUpperCase ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    <span>At least one uppercase letter (A-Z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${passwordRules.hasSpecialChar ? "text-green-600" : "text-red-500"}`}
                  >
                    {passwordRules.hasSpecialChar ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    <span>At least one special character (@, #, $, etc.)</span>
                  </div>
                </div>
              )}

              {/* 3. الزرار بيقفل (Disabled) لو الشروط متمتش */}
              <Button
                type="submit"
                disabled={!isPasswordValid}
                className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white py-2 rounded-md transition-colors font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account ←
              </Button>
            </form>

            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#0044CC] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
