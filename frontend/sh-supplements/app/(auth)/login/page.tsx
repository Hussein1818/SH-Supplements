//"use client";

import Link from "next/link";
import { Eye, Lock, User, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
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
              Start Your Journey
            </CardTitle>
            <CardDescription className="text-xl font-bold text-gray-900">
              sign in to access personalized nutrition and supplement
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              /* onSubmit={(e) => e.preventDefault()}  */ className="space-y-4"
            >
              {/* username or email field */}
              <div className="space-y-2 text-left">
                <Label
                  htmlFor="usernameOrEmail"
                  className="text-sm font-medium text-gray-700"
                >
                  Username or Email
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="username or email"
                    className="pl-10 pr-3 focus-visible:ring-[#0044CC] text-left"
                    required
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
                <div className="relative" dir="ltr">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                  <Input
                    id="password"
                    /*                     type={showPassword ? "text" : "password"} // لو عامل State لإظهار الباسورد
                     */
                    type="password"
                    placeholder="********"
                    className="pl-10 pr-10 focus-visible:ring-[#0044CC] text-left"
                    required
                  />

                  <button
                    title="Toggle password visibility"
                    type="button"
                    /*                     onClick={() => setShowPassword(!showPassword)}
                     */ className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {/* {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )} */}
                  </button>
                </div>
              </div>

              {/* log in button */}
              <Button
                type="submit"
                className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white py-2 rounded-md transition-colors font-medium mt-2"
              >
                log in ←
              </Button>
            </form>

            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              Don&apos;t have an account?
              <Link
                href="/register"
                className="text-[#0044CC] font-semibold hover:underline"
              >
                Sign up
              </Link>
            </div>
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              Forgot Your Password?
              <Link
                href="/forgot-password"
                className="text-[#0044CC] font-semibold hover:underline"
              >
                Reset Password
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
