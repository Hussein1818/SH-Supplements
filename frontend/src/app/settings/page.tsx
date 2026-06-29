"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  Save,
  Dumbbell,
  User,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";

const BASE_URL = "https://sh-supplements.runasp.net";

type User = {
  firstName: string;
  lastName: string;
  phoneNumber: number;
  age: number;
  weight: number;
  height: number;
  goal: number;
  medicalConditions: string | null;
};

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [userData, setUserData] = useState<User | null>(null);

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

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await api.post(`${BASE_URL}/api/Auth/change-password`, {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      toast.success(response.data?.Message || "Password changed successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.Message || "Failed to change password.",
      );
    }
  }

  async function handleProfileUpdate() {
    const response = await api.post("/User/profile", {
/*       userId: userData?.,
 */      firstName: userData?.firstName,
      lastName: userData?.lastName,
      phoneNumber: userData?.phoneNumber,
      age: userData?.age,
      weight: userData?.weight,
      height: userData?.height,
      goal: userData?.goal,
      medicalConditions: userData?.medicalConditions,
    });
  }

  async function handleLogOut() {
    try {
      await api.post("/Auth/revoke-token");
      useAuthStore.getState().logout();
      toast.success("Logged out successfully.");
      router.replace("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.Message || "Failed to log out");
    }
  }

  return (
    <div className="space-y-8 max-w-4xl" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#0044CC]" /> App Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your security preferences, notification triggers, and active
          system integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Navigation Quick Tabs View */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-bold bg-[#0044CC]/5 text-[#0044CC] text-left">
              <Shield className="h-4 w-4" /> Security & Password
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-left transition-colors">
              <Bell className="h-4 w-4" /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-left transition-colors">
              <Key className="h-4 w-4" /> API Integrations (.NET)
            </button>
          </div>
        </div>

        {/* Right Side: Settings Actions Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Password & Security Form */}
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Update Password
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your account is using a long, random password to stay
                secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="current-pass"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-pass"
                      type={showCurrent ? "text" : "password"}
                      placeholder="********"
                      value={password.currentPassword}
                      onChange={(e) =>
                        setPassword({
                          ...password,
                          currentPassword: e.target.value,
                        })
                      }
                      className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC] pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showCurrent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="new-pass"
                    className="text-xs font-semibold text-gray-700"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-pass"
                      type={showNew ? "text" : "password"}
                      placeholder="********"
                      value={password.newPassword}
                      onChange={(e) =>
                        setPassword({
                          ...password,
                          newPassword: e.target.value,
                        })
                      }
                      className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC] pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#0044CC] hover:bg-[#0033AA] text-white text-xs font-semibold px-5 h-9 rounded-md flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* profile data */}
          <form className="space-y-4">
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
                    value={userData?.firstName}
                    className="pl-10 bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fullname"
                  className="text-xs font-semibold text-gray-700"
                >
                  Last Name
                </Label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                  <Input
                    id="fullname"
                    type="text"
                    value={userData?.lastName}
                    className="pl-10 bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold text-gray-700"
                >
                  Phone Number
                </Label>

                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={userData?.phoneNumber}
                    className="pl-3 bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
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
                  value={userData?.age}
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
                  value={userData?.height}
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
                    value={userData?.weight}
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
                value={userData?.goal}
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
          <div className="pt-3 flex justify-end">
            <Button
              type="button"
              className="bg-[#cc0000] hover:bg-[#0033AA] text-white text-xs font-semibold px-5 h-9 rounded-md flex items-center gap-1.5 shadow-sm"
              onClick={handleLogOut}
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
