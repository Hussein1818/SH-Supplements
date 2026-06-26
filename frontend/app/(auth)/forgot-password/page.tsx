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

export default function ForgotPassword() {
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
              Enter your email address and we&apos;ll send you a link to reset
              your password.
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
                  Email
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="Email"
                    className="pl-10 pr-3 focus-visible:ring-[#0044CC] text-left"
                    required
                  />
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
