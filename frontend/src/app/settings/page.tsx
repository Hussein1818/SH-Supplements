"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  MapPin,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Save,
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

export default function SettingsPage() {
  // state للتحكم في أي قسم ظاهر
  const [activeTab, setActiveTab] = useState("security");

  // state للعناصر
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
  });

  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  // --- Functions ---
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/api/Auth/change-password`, password);
      toast.success("Password changed successfully!");
    } catch {
      toast.error("Failed to change password.");
    }
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Address saved successfully!");
  }

  async function handleLogOut() {
    await api.post("/Auth/revoke-token");
    useAuthStore.getState().logout();
    router.replace("/");
  }

  return (
    <div className="space-y-8 max-w-4xl" dir="ltr">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-[#0044CC]" /> App Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-bold text-left transition-colors ${activeTab === "security" ? "bg-[#0044CC]/5 text-[#0044CC]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <Shield className="h-4 w-4" /> Security & Password
            </button>
            <button
              onClick={() => setActiveTab("address")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-bold text-left transition-colors ${activeTab === "address" ? "bg-[#0044CC]/5 text-[#0044CC]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <MapPin className="h-4 w-4" /> Shipping Address
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="lg:col-span-2">
          {activeTab === "security" ? (
            <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        value={password.currentPassword}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            currentPassword: e.target.value,
                          })
                        }
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showCurrent ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">New Password</Label>
                    <Input
                      type={showNew ? "text" : "password"}
                      value={password.newPassword}
                      onChange={(e) =>
                        setPassword({
                          ...password,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#0044CC] hover:bg-[#0033AA]"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Reset Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Street</Label>
                      <Input
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">City</Label>
                      <Input
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="h-4 w-4 mr-2" /> Save Address
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="pt-6 text-amber-50">
            <Button
              onClick={handleLogOut}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" /> Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
