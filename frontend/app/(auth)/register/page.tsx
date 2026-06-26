"use client";

import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Check, X } from "lucide-react";
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
import { useState } from "react";
import axios from "axios";

const BASE_URL = "https://sh-supplements.runasp.net";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    LastName: "",
    userName: "",
    email: "",
    password: "",
  });

  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(formData);
    const response = await axios.post(`${BASE_URL}/api/register`, formData);
    console.log(response.data);
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
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  first Name
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
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
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  last Name
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
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
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  user name
                </Label>
                <div className="relative" dir="ltr">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Doe"
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
                  className="text-sm text-left font-medium text-gray-700"
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
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* password field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    placeholder="********"
                    className="pr-10 pl-10 focus-visible:ring-[#0044CC]"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                  />
                  <button
                    title="Toggle password visibility"
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                  ></button>
                </div>
              </div>

              {/* <div className="bg-[#F4F4F5] p-3 rounded-md space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>8 characters at least</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Contains numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>One uppercase letter at least</span>
                </div>
              </div> */}

              {/* Create Account button */}
              <Button
                type="submit"
                className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white py-2 rounded-md transition-colors font-medium mt-2"
              >
                Create Account ←
              </Button>
            </form>

            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
              Already have an account?
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
