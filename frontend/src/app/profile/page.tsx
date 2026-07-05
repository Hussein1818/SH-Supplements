"use client";

import { useEffect, useState, useRef } from "react";
import {
  User, ShieldCheck, Pencil, Save, X,
  Phone, Scale, Ruler, Target, MapPin,
  Wallet, Activity, CheckCircle2, Leaf,
  Camera, Upload, Minus, Plus, RotateCcw, ZoomIn,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/components/store/authStore";
import { Badge } from "@/src/components/ui/badge";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { cn, formatPrice, normalizeImageUrl } from "@/src/lib/utils";

// ─── Types (unchanged) ─────────────────────────────────────────────────────
interface AddressData {
  id: string; street: string; city: string;
  state: string; zipCode: string; country: string; isDefault: boolean;
}

type UserData = {
  id: string; firstName: string; lastName: string;
  phoneNumber: string; age: number; weight: number;
  height: number; goal: number;
  medicalConditions: string | null;
  walletBalance: number; addresses: AddressData[];
  profileImageUrl?: string | null;
  ProfileImageUrl?: string | null;
};

type SimpleFieldKey = "firstName" | "lastName" | "phoneNumber" | "age" | "weight" | "height" | "goal";

// ─── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonProfile() {
  return (
    <div className="container-xl py-10 space-y-8" dir="ltr">
      <div className="skeleton h-8 w-40 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-10 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);

  const accessToken  = useAuthStore((state) => state.accessToken);
  const router       = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Cropper Modal State ──────────────────────────────────────────────────
  const [cropModalSrc, setCropModalSrc] = useState<string | null>(null);
  const [zoom, setZoom]                 = useState(1);
  const [offset, setOffset]             = useState({ x: 0, y: 0 });
  const isDraggingRef                   = useRef(false);
  const startPosRef                     = useRef({ x: 0, y: 0 });
  const previewCanvasRef                = useRef<HTMLCanvasElement>(null);
  const imgRef                          = useRef<HTMLImageElement | null>(null);
  const baseScaleRef                    = useRef(1);

  // ── Data fetch (logic unchanged) ──────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) { router.replace("/login"); return; }
    api.get("/User/profile")
      .then((res) => { setUserData(res.data); setEditForm(res.data); })
      .catch(() => toast.error("Failed to load profile data"));
  }, [accessToken, router]);

  // ── Canvas Cropper Logic ──────────────────────────────────────────────────
  useEffect(() => {
    if (!cropModalSrc) return;
    const img = new Image();
    img.src = cropModalSrc;
    img.onload = () => {
      imgRef.current = img;
      const scaleX = 256 / img.naturalWidth;
      const scaleY = 256 / img.naturalHeight;
      baseScaleRef.current = Math.max(scaleX, scaleY);
      drawPreview();
    };
  }, [cropModalSrc]);

  useEffect(() => {
    drawPreview();
  }, [zoom, offset]);

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 256, 256);
    ctx.save();
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.clip();

    const currentScale = baseScaleRef.current * zoom;
    const dw = img.naturalWidth * currentScale;
    const dh = img.naturalHeight * currentScale;
    const dx = (256 - dw) / 2 + offset.x;
    const dy = (256 - dh) / 2 + offset.y;

    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startPosRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setOffset({
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    isDraggingRef.current = true;
    startPosRef.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch || !isDraggingRef.current) return;
    setOffset({
      x: touch.clientX - startPosRef.current.x,
      y: touch.clientY - startPosRef.current.y,
    });
  };

  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const offscreen = document.createElement("canvas");
    offscreen.width = 400;
    offscreen.height = 400;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    const scaleOut = 400 / 256;
    const currentScale = baseScaleRef.current * zoom * scaleOut;
    const dw = img.naturalWidth * currentScale;
    const dh = img.naturalHeight * currentScale;
    const dx = ((400 - dw) / 2) + (offset.x * scaleOut);
    const dy = ((400 - dh) / 2) + (offset.y * scaleOut);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 400);
    ctx.drawImage(img, dx, dy, dw, dh);

    const croppedBase64 = offscreen.toDataURL("image/jpeg", 0.92);
    setEditForm((prev) => prev ? { ...prev, profileImageUrl: croppedBase64, ProfileImageUrl: croppedBase64 } : null);
    if (!isEditing) {
      setIsEditing(true);
      toast.info("Photo cropped! Click 'Save' to apply changes.");
    } else {
      toast.success("Photo cropped & updated!");
    }
    setCropModalSrc(null);
  };

  // ── Image handler ────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setCropModalSrc(base64Str);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editForm) return;
    setIsSaving(true);
    try {
      const activeImageUrl = editForm.profileImageUrl !== undefined
        ? editForm.profileImageUrl
        : (editForm.ProfileImageUrl || "");

      const payload = {
        userId:           userData?.id,
        firstName:        editForm.firstName,
        lastName:         editForm.lastName,
        phoneNumber:      editForm.phoneNumber || "",
        age:              Number(editForm.age),
        weight:           Number(editForm.weight),
        height:           Number(editForm.height),
        goal:             Number(editForm.goal),
        medicalConditions:editForm.medicalConditions || "",
        profileImageUrl:  activeImageUrl,
        ProfileImageUrl:  activeImageUrl,
      };
      await api.put("/User/profile", payload);
      try {
        const res = await api.get("/User/profile");
        setUserData(res.data);
        setEditForm(res.data);
      } catch {
        setUserData(editForm);
      }
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!userData || !editForm) return <SkeletonProfile />;

  const FIELDS: { label: string; key: SimpleFieldKey; icon: any; type?: string }[] = [
    { label: "First Name",   key: "firstName",   icon: User,    type: "text"   },
    { label: "Last Name",    key: "lastName",    icon: User,    type: "text"   },
    { label: "Phone",        key: "phoneNumber", icon: Phone,   type: "tel"    },
    { label: "Age",          key: "age",         icon: User,    type: "number" },
    { label: "Weight (kg)",  key: "weight",      icon: Scale,   type: "number" },
    { label: "Height (cm)",  key: "height",      icon: Ruler,   type: "number" },
    { label: "Goal (kg)",    key: "goal",        icon: Target,  type: "number" },
  ];

  return (
    <div className="min-h-screen bg-stone-50" dir="ltr">
      <div className="container-xl py-10 space-y-8">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">My Profile</h1>
            <p className="text-stone-500 text-sm mt-1">Manage your personal information and settings.</p>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-stone-500"
                onClick={() => { setIsEditing(false); setEditForm(userData); }}
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" aria-hidden="true" /> Cancel
              </Button>
            )}
            <Button
              variant={isEditing ? "primary" : "outline"}
              size="sm"
              loading={isSaving}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="rounded-xl font-semibold"
              aria-label={isEditing ? "Save profile changes" : "Edit profile"}
            >
              {!isSaving && (isEditing ? <><Save className="h-4 w-4" aria-hidden="true" /> Save</> : <><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</>)}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: Identity Card ────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Avatar card */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Emerald top bar */}
              <div className="h-24 sm:h-28 bg-gradient-to-r from-emerald-600 to-emerald-500 relative">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
                  aria-hidden="true"
                />
              </div>

              <div className="px-6 pb-6 -mt-14 sm:-mt-18 text-center">
                {/* Avatar with camera button */}
                <div className="relative inline-block mx-auto">
                  <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden mx-auto">
                    {(isEditing ? (editForm.profileImageUrl || editForm.ProfileImageUrl) : (userData.profileImageUrl || userData.ProfileImageUrl)) ? (
                      <img
                        src={normalizeImageUrl((isEditing ? (editForm.profileImageUrl || editForm.ProfileImageUrl) : (userData.profileImageUrl || userData.ProfileImageUrl)) || "")}
                        alt={`${userData.firstName} ${userData.lastName}`}
                        className="h-full w-full rounded-full object-cover aspect-square"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-emerald-50 flex items-center justify-center">
                        <User className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-600" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Camera edit button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 sm:p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-2 border-white transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                    aria-label="Upload profile photo"
                    title="Upload profile photo"
                  >
                    <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <h2 className="mt-3 text-lg font-black text-stone-900 flex items-center justify-center gap-1.5">
                  {userData.firstName} {userData.lastName}
                  <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                </h2>

                <Badge variant="emerald" className="mt-2 font-semibold">
                  Verified Member
                </Badge>

                {/* Wallet */}
                <div className="mt-5 pt-5 border-t border-stone-100">
                  <div className="bg-stone-50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Wallet className="h-4 w-4 text-orange-500" aria-hidden="true" />
                      <span className="text-xs font-semibold text-stone-500">Wallet Balance</span>
                    </div>
                    <span className="font-black text-orange-500 text-sm" aria-label={`Wallet balance: ${formatPrice(userData.walletBalance)}`}>
                      {formatPrice(userData.walletBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick nav */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-1 shadow-sm">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-2 mb-3">Quick Access</h3>
              {[
                { label: "My Orders",  href: "/orders",   icon: Target },
                { label: "Progress",   href: "/progress", icon: Activity },
                { label: "Settings",   href: "/settings", icon: MapPin },
              ].map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors group"
                >
                  <Icon className="h-4 w-4 text-stone-400 group-hover:text-emerald-600 transition-colors" aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Right: Forms ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Info */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                </div>
                <h2 className="font-bold text-stone-900">Personal Information</h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label
                        htmlFor={field.key}
                        className="text-xs font-bold text-stone-500 uppercase tracking-wider"
                      >
                        {field.label}
                      </Label>
                      {isEditing ? (
                        <div className="relative">
                          <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                          <Input
                            id={field.key}
                            type={field.type || "text"}
                            className="pl-9"
                            value={editForm[field.key]}
                            onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                            aria-label={field.label}
                          />
                        </div>
                      ) : (
                        <div
                          className="px-3 py-2.5 bg-stone-50 rounded-xl text-sm font-semibold text-stone-800 border border-stone-100"
                          role="text"
                          aria-label={`${field.label}: ${userData[field.key] || "Not set"}`}
                        >
                          {userData[field.key] || <span className="text-stone-300 font-normal">Not set</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Medical Conditions */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <Label
                    htmlFor="medicalConditions"
                    className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Activity className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
                    Medical Conditions / Allergies
                  </Label>
                  {isEditing ? (
                    <Input
                      id="medicalConditions"
                      type="text"
                      placeholder="e.g. Lactose intolerant, diabetes..."
                      value={editForm.medicalConditions || ""}
                      onChange={(e) => setEditForm({ ...editForm, medicalConditions: e.target.value })}
                      aria-label="Medical conditions and allergies"
                    />
                  ) : (
                    <div
                      className="px-3 py-3 bg-red-50/50 rounded-xl text-sm text-stone-600 border border-red-100/60 min-h-[56px]"
                      role="text"
                      aria-label={`Medical conditions: ${userData.medicalConditions || "None specified"}`}
                    >
                      {userData.medicalConditions || <span className="text-stone-400 text-sm">None specified.</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <h2 className="font-bold text-stone-900">Saved Addresses</h2>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  className="rounded-xl font-semibold"
                  onClick={() => router.push("/settings")}
                  aria-label="Manage saved addresses"
                >
                  Manage
                </Button>
              </div>

              <div className="p-6">
                {userData.addresses && userData.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="list" aria-label="Saved addresses">
                    {userData.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        role="listitem"
                        className={cn(
                          "relative p-4 rounded-xl border transition-colors",
                          addr.isDefault
                            ? "border-emerald-200 bg-emerald-50/40"
                            : "border-stone-200 bg-stone-50/40"
                        )}
                      >
                        {addr.isDefault && (
                          <div
                            className="absolute top-0 right-0 flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider"
                            aria-label="Default address"
                          >
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Default
                          </div>
                        )}
                        <p className="font-semibold text-stone-900 text-sm mb-1 pr-14">{addr.street}</p>
                        <p className="text-xs text-stone-500">
                          {[addr.city, addr.state, addr.country].filter(Boolean).join(", ")}
                        </p>
                        {addr.zipCode && (
                          <p className="text-xs text-stone-400 mt-0.5">ZIP: {addr.zipCode}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200"
                    role="status"
                    aria-label="No addresses saved"
                  >
                    <MapPin className="h-8 w-8 text-stone-300 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm font-medium text-stone-500">No addresses saved yet.</p>
                    <p className="text-xs text-stone-400 mt-1">Go to Settings to add an address.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Photo Cropping Modal ─────────────────────────────────────── */}
      {cropModalSrc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                <h3 className="font-black text-stone-900 text-lg">Crop & Position Photo</h3>
              </div>
              <Button variant="ghost" size="icon-sm" className="rounded-xl text-stone-400 hover:text-stone-700" onClick={() => setCropModalSrc(null)} aria-label="Close modal">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 flex flex-col items-center gap-6">
              <p className="text-xs text-stone-500 font-medium text-center">
                Drag photo to reposition inside the circle. Use slider to zoom.
              </p>

              {/* Circular Viewport Canvas */}
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-xl">
                <canvas
                  ref={previewCanvasRef}
                  width={256}
                  height={256}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  className="rounded-full bg-stone-900 shadow-inner cursor-move touch-none select-none"
                  style={{ width: "220px", height: "220px" }}
                />
              </div>

              {/* Controls */}
              <div className="w-full space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="flex items-center justify-between text-xs font-bold text-stone-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="h-3.5 w-3.5 text-emerald-600" /> Zoom Level
                  </span>
                  <span className="font-black text-emerald-600">{Math.round(zoom * 100)}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl bg-white flex-shrink-0"
                    onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                    aria-label="Zoom out"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
                    aria-label="Zoom slider"
                  />
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-xl bg-white flex-shrink-0"
                    onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                    aria-label="Zoom in"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-stone-500 hover:text-stone-800 text-xs font-semibold gap-1"
                    onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
                  >
                    <RotateCcw className="h-3 w-3" /> Reset Center & Zoom
                  </Button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 w-full pt-2 border-t border-stone-100">
                <Button
                  variant="outline"
                  className="rounded-xl font-semibold flex-1 sm:flex-initial"
                  onClick={() => setCropModalSrc(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="rounded-xl font-bold flex-1 sm:flex-initial shadow-md"
                  onClick={handleApplyCrop}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Apply Crop
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
