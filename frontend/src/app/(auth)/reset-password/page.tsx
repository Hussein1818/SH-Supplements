"use client";

import Link from "next/link";
import { Eye, EyeOff, Lock, User, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { api } from "@/components/auth/axiosInstance";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
const BASE_URL = "https://sh-supplements.runasp.net";

export default function ResetPassword() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await api.post(`${BASE_URL}/api/Auth/reset-password`, {
        email: email,
        token: token,
        newPassword: formData.newPassword,
      });
      toast.success(
        response.data?.Message || "Password changed successfully! 🎉",
      );
    } catch (error: any) {
      toast.error(error.response?.data?.Message || "Failed to reset password.");
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F9F9F9] flex flex-col justify-between font-sans antialiased"
      dir="ltr"
    >
      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-md">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-base font-medium text-gray-500">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-xl font-bold text-gray-900">
              Enter new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleResetPassword}>
              {/* email field */}
              <div className="space-y-2 text-left">
                {/* <Label
                  htmlFor="Email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="pl-10 pr-3 focus-visible:ring-[#0044CC] text-left"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                    }}
                  /> 
                </div>*/}

                {/*new password field */}
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    placeholder="********"
                    className="pl-10 pr-10 focus-visible:ring-[#0044CC]"
                    required
                    value={formData.newPassword}
                    type={showPassword ? "text" : "password"}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
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

              <Button
                type="submit"
                className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white py-2 rounded-md transition-colors font-medium mt-2"
              >
                Reset Password ←
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
