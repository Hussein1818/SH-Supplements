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

export default function SettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });

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
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success(response.data?.Message || "Password changed successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.Message || "Failed to change password.",
      );
    }
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
                {/* Current Password */}
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
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
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

          {/* 2. Notifications Toggle Section (Static Clean UI representation) */}
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Preferences</CardTitle>
              <CardDescription className="text-xs">
                Manage system-wide alerts and synchronization triggers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100/50">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    Order Updates
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Receive immediate dashboard alerts for shipping state
                    triggers.
                  </p>
                </div>
                <input
                  type="checkbox"
                  /*                   checked={notifyOrders} 
                  onChange={() => setNotifyOrders(!notifyOrders)}*/
                  className="h-4 w-4 rounded text-[#0044CC] focus:ring-[#0044CC] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100/50">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    Clearance Threshold Triggers
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Notify when products with active near-expiry hit maximal
                    clearance discount drops.
                  </p>
                </div>
                <input
                  type="checkbox"
                  /*  checked={notifyClearance} 
                  onChange={() => setNotifyClearance(!notifyClearance)} */
                  className="h-4 w-4 rounded text-[#0044CC] focus:ring-[#0044CC] cursor-pointer"
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  className="bg-[#cc0000] hover:bg-[#0033AA] text-white text-xs font-semibold px-5 h-9 rounded-md flex items-center gap-1.5 shadow-sm"
                  onClick={handleLogOut}
                >
                  <LogOut className="h-3.5 w-3.5" /> Log Out
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
