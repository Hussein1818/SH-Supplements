"use client";

import { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  Pencil,
  Save,
  X,
  Phone,
  Scale,
  Ruler,
  Target,
  MapPin,
  Wallet,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/components/store/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";

interface AddressData {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: number;
  weight: number;
  height: number;
  goal: number;
  medicalConditions: string | null;
  walletBalance: number;
  addresses: AddressData[];
};

type SimpleFieldKey =
  | "firstName"
  | "lastName"
  | "phoneNumber"
  | "age"
  | "weight"
  | "height"
  | "goal";

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    api
      .get("/User/profile")
      .then((res) => {
        setUserData(res.data);
        setEditForm(res.data);
      })
      .catch(() => {
        toast.error("Failed to load profile data");
      });
  }, [accessToken, router]);

  const handleSave = async () => {
    if (!editForm) return;
    try {
      const payload = {
        userId: userData?.id,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber || "",
        age: Number(editForm.age),
        weight: Number(editForm.weight),
        height: Number(editForm.height),
        goal: Number(editForm.goal),
        medicalConditions: editForm.medicalConditions || "",
      };

      await api.put("/User/profile", payload);
      setUserData(editForm);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!userData || !editForm)
    return (
      <div className="p-10 text-center font-bold text-gray-500">
        Loading Profile...
      </div>
    );

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4" dir="ltr">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-[#0044CC]" /> My Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information and addresses.
          </p>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={
            !isEditing
              ? "bg-[#0044CC] hover:bg-[#0033AA] text-white"
              : "border-[#0044CC] text-[#0044CC] hover:bg-blue-50"
          }
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" /> Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar (Summary Card) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl text-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#0044CC]"></div>
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-[#0044CC]" />
            </div>
            <h2 className="text-lg font-black text-gray-900 flex items-center justify-center gap-1">
              {userData.firstName} {userData.lastName}
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </h2>
            <Badge className="mt-2 bg-[#0044CC]/10 text-[#0044CC] border-none hover:bg-[#0044CC]/20">
              Verified User
            </Badge>

            <div className="mt-6 pt-6 border-t border-gray-50">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600">
                  <Wallet className="h-4 w-4 text-[#FF6600]" />
                  <span className="text-xs font-bold uppercase">
                    Wallet Balance
                  </span>
                </div>
                <span className="font-black text-[#FF6600]">
                  {userData.walletBalance.toFixed(2)} EGP
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-[#0044CC]" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Dynamic Grid for basic fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name", key: "firstName", icon: User },
                  { label: "Last Name", key: "lastName", icon: User },
                  { label: "Phone Number", key: "phoneNumber", icon: Phone },
                  { label: "Age", key: "age", icon: User },
                  { label: "Weight (kg)", key: "weight", icon: Scale },
                  { label: "Height (cm)", key: "height", icon: Ruler },
                  { label: "Goal (kg)", key: "goal", icon: Target },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </Label>
                    {isEditing ? (
                      <Input
                        type={
                          ["age", "weight", "height", "goal"].includes(
                            field.key,
                          )
                            ? "number"
                            : "text"
                        }
                        className="bg-gray-50 border-gray-200 focus:bg-white"
                        value={editForm[field.key as SimpleFieldKey]}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            [field.key]: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="p-2.5 bg-gray-50 rounded-lg text-sm font-semibold text-gray-900 border border-gray-100">
                        {userData[field.key as SimpleFieldKey] || "-"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Medical Conditions (Full Width) */}
              <div className="space-y-1.5 pt-2 border-t border-gray-50">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-rose-500" /> Medical
                  Conditions / Allergies
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    className="bg-gray-50 border-gray-200 focus:bg-white"
                    placeholder="E.g., Lactose intolerant, diabetes..."
                    value={editForm.medicalConditions || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        medicalConditions: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="p-3 bg-rose-50/50 rounded-lg text-sm text-gray-700 border border-rose-100/50 min-h-[60px]">
                    {userData.medicalConditions || "None specified."}
                  </p>
                )}
              </div>

              {/* Edit Mode Cancel Button */}
              {isEditing && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(userData);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" /> Cancel Editing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Addresses Card (Read Only in Profile) */}
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
            <CardHeader className="border-b border-gray-50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0044CC]" /> Saved Addresses
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-bold"
                onClick={() => router.push("/settings")} 
              >
                Manage
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {userData.addresses && userData.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-xl border relative ${
                        addr.isDefault
                          ? "border-[#0044CC] bg-blue-50/30"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {addr.isDefault && (
                        <div className="absolute top-0 right-0 bg-[#0044CC] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle2 className="h-3 w-3" /> Default
                        </div>
                      )}
                      <p className="font-bold text-gray-900 text-sm mb-1 pr-16">
                        {addr.street}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {addr.city && `${addr.city}, `}
                        {addr.state && `${addr.state}, `}
                        {addr.country}
                      </p>
                      {addr.zipCode && (
                        <p className="text-xs text-gray-400 mt-1">
                          ZIP: {addr.zipCode}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No addresses saved yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
