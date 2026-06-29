"use client";

import { useEffect, useState } from "react";
import { User, ShieldCheck, Dumbbell, Target } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/components/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";

type User = {
  firstName: string;
  lastName: string;
  phoneNumber: number;
  age: number;
  weight: number;
  height: number;
  goal: number;
  medicalConditions: string | null;
  walletBalance: number;
  addresses: [];
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<User | null>(null);

  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("User/profile");
        setUserData(response.data);
      } catch (error) {
        toast.error("failed to load user's data");
      }
    };
    if (isClient) fetchUserData();
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken || !isClient) return null;

  return (
    <div className="space-y-8 max-w-4xl" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-[#0044CC]" /> Account Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View your identity, security credentials, and trackable personal
          fitness configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Brief Avatar Card & Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl text-center">
            <CardContent className="pt-6 pb-6 space-y-4 flex flex-col items-center">
              <div className="mb-4 text-center">
                <h2 className="text-sm font-black text-gray-900 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Wallet Balance: {userData?.walletBalance} EGP
                </p>
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
                fitness Goal
              </span>
              <p className="text-xs font-black text-gray-800">
                {userData?.goal}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Account & Onboarding Info Display */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Personal Profile & Physical Metrics
              </CardTitle>
              <CardDescription className="text-xs">
                Your core registry data and physical dimensions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 1. Basic Identity Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">
                      Full Name
                    </Label>
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.firstName} {userData?.lastName}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">
                      Phone Number
                    </Label>
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* 2. Onboarding Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">
                      Age
                    </Label>
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.age || "N/A"}{" "}
                      <span className="text-gray-400 text-xs">years</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">
                      Height
                    </Label>
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.height || "N/A"}{" "}
                      <span className="text-gray-400 text-xs">cm</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">
                      Weight
                    </Label>
                    <div className="flex items-center gap-1.5">
                      <Dumbbell className="h-3.5 w-3.5 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">
                        {userData?.weight || "N/A"}{" "}
                        <span className="text-gray-400 text-xs">kg</span>
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* 3. Dropdown/Text for Fitness Strategy */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-500">
                    Primary Goal Strategy
                  </Label>
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.goal || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
