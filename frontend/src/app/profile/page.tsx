"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  ShieldCheck,
  Dumbbell,
  Target,
  Save,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/components/auth/authStore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [name, setName] = useState("Mohamed Ibrahim");
  const [email, setEmail] = useState("mohamed.ibrahim@example.com");
  const [age, setAge] = useState("22");
  const [height, setHeight] = useState("178");
  const [weight, setWeight] = useState("75");
  const [goal, setGoal] = useState("Lean Mass Gain (Bulking)");

  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken || !isClient) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا مستقبلاً هيتم استدعاء الـ API لحفظ البيانات في الـ .NET
    alert("Profile updated successfully!");
  };

  return (
    <div className="space-y-8 max-w-4xl" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-[#0044CC]" /> Account Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your identity, security credentials, and trackable personal
          fitness configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Brief Avatar Card & Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl text-center">
            <CardContent className="pt-6 pb-6 space-y-4 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden border-2 border-[#0044CC]/20 relative">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"
                  alt="Profile Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900 flex items-center justify-center gap-1">
                  {name}{" "}
                  <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{email}</p>
              </div>
              <Badge
                variant="secondary"
                className="bg-[#0044CC]/5 text-[#0044CC] hover:bg-[#0044CC]/5 border border-[#0044CC]/10 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              >
                Tier 1 Athlete
              </Badge>
            </CardContent>
          </Card>

          {/* Fitness Goal Quick Box */}
          <Card className="bg-[#FAF6F0] border border-[#FF6600]/10 rounded-xl">
            <CardContent className="p-4 space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-[#FF6600]" /> Active Fitness
                Strategy
              </span>
              <p className="text-xs font-black text-gray-800">{goal}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Account & Onboarding Info Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Personal Profile & Physical Metrics
              </CardTitle>
              <CardDescription className="text-xs">
                Update your core registry data and physical dimensions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* 1. Basic Identity Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullname"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullname"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="pl-10 bg-[#F4F4F5] border-none opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Onboarding Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="age"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Age (years)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="height"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="weight"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Weight (kg)
                    </Label>
                    <div className="relative">
                      <Dumbbell className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400/60" />
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC] pr-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Dropdown/Text for Fitness Strategy */}
                <div className="space-y-2 pt-2">
                  <Label
                    htmlFor="strategy"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Primary Goal Strategy
                  </Label>
                  <Input
                    id="strategy"
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                    required
                  />
                </div>

                {/* Action CTA Button */}
                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#0044CC] hover:bg-[#0033AA] text-white text-xs font-semibold px-5 h-9 rounded-md flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
