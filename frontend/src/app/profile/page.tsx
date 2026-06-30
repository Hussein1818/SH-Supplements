"use client";

import { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  Dumbbell,
  Pencil,
  Save,
  X,
  Phone,
  Scale,
  Ruler,
  HeartPulse,
  Target,
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
};

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
    api.get("User/profile").then((res) => {
      setUserData(res.data);
      setEditForm(res.data);
    });
  }, [accessToken, router]);

  const handleSave = async () => {
    if (!editForm) return;
    try {
      const payload = {
        userId: userData?.id, // الربط المطلوب
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

  if (!userData) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl" dir="ltr">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 text-[#0044CC]" /> My Account
        </h1>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={!isEditing ? "bg-[#0044CC] hover:bg-[#0033AA]" : ""}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" /> Save
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" /> Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl text-center p-6">
            <h2 className="text-sm font-black text-gray-900 flex items-center justify-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />{" "}
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="text-xs text-gray-400 mt-2">
              Balance: {userData.walletBalance} EGP
            </p>
            <Badge className="mt-4 bg-[#0044CC]/5 text-[#0044CC] border-none">
              Tier 1 Athlete
            </Badge>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name", key: "firstName", icon: User },
                  { label: "Last Name", key: "lastName", icon: User },
                  { label: "Phone", key: "phoneNumber", icon: Phone },
                  { label: "Age", key: "age", icon: User },
                  { label: "Weight (kg)", key: "weight", icon: Scale },
                  { label: "Height (cm)", key: "height", icon: Ruler },
                  { label: "Goal", key: "goal", icon: Target },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs text-gray-500">
                      {field.label}
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editForm![field.key as keyof UserData]}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            [field.key]: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-lg text-sm">
                        {userData[field.key as keyof UserData]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <Button
                  variant="ghost"
                  className="w-full text-red-500"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(userData);
                  }}
                >
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
