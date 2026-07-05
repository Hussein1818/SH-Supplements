"use client";

import {
  ShieldCheck,
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/src/components/auth/axiosInstance";

export default function VerifyPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [serialNumber, setSerialNumber] = useState("");
  const [verifyState, setVerifyState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [productDetails, setProductDetails] = useState<any>(null);

  async function handleVerifySerial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!serialNumber.trim()) {
      toast.error("Please enter a serial number first.");
      return;
    }

    setVerifyState("loading");

    try {
      const response = await api.get(`/Products/verify-serial/${serialNumber}`);
      const data = response.data;

      setProductDetails(data);

      if (data.isAuthentic) {
        setVerifyState("success");
        toast.success("Product verified successfully!");
      } else {
        setVerifyState("error");
        toast.error("Invalid or counterfeit serial number!");
      }
    } catch (error) {
      setVerifyState("error");
      toast.error("Failed to verify product. Please try again.");
    }
  }

  const handleReset = () => {
    setVerifyState("idle");
    setSerialNumber("");
    setProductDetails(null);
  };

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken || !isClient) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8" dir="ltr">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full mb-2">
          <ShieldCheck className="h-8 w-8 text-[#059669]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Verify Product Authenticity
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Enter your 12-digit serial number or scan the QR code on your product
          packaging to ensure you have a genuine supplement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Verification Portal & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Default State: Input Portal */}
          {(verifyState === "idle" || verifyState === "loading") && (
            <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Serial Number
                  </label>
                  <div className="flex gap-2">
                    <form
                      onSubmit={handleVerifySerial}
                      className="flex gap-2 w-full"
                    >
                      <div className="relative flex-1">
                        <Input
                          placeholder="e.g. A1B2-C3D4-E5F6"
                          className="pl-4 h-12 text-lg uppercase bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          disabled={verifyState === "loading"}
                        />
                      </div>
                      <Button
                        className="h-12 px-8 bg-[#059669] hover:bg-[#047857] text-white font-bold min-w-[140px]"
                        type="submit"
                        disabled={verifyState === "loading"}
                      >
                        {verifyState === "loading" ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Verify Now"
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <Info className="h-4 w-4 text-[#059669] shrink-0" />
                  <p>
                    You can find the serial number scratched under the silver
                    foil on the cap.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. Success State: Authenticated */}
          {verifyState === "success" && (
            <Card className="border-emerald-100 shadow-sm rounded-2xl overflow-hidden bg-emerald-50/50 animate-in fade-in zoom-in duration-300">
              <CardContent className="p-6 md:p-8 text-center space-y-6">
                <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-emerald-900">
                    100% Authentic Product
                  </h2>
                  <p className="text-emerald-700 mt-1 font-medium">
                    {productDetails?.message ||
                      "This serial number is registered in our secure database."}
                  </p>
                </div>

                {/* Verification Stats */}
                <div
                  className={`rounded-xl p-4 text-sm font-medium flex items-center justify-center gap-2 ${
                    productDetails?.verificationCount > 1
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  <History className="h-5 w-5" />
                  <span>
                    This code has been verified{" "}
                    <strong>{productDetails?.verificationCount || 1}</strong>{" "}
                    time(s).
                    {productDetails?.firstVerifiedAt && (
                      <span className="block text-xs mt-1 opacity-80">
                        First verified on:{" "}
                        {new Date(
                          productDetails.firstVerifiedAt,
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={handleReset}
                >
                  Verify Another Product
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 3. Error State: Counterfeit Warning */}
          {verifyState === "error" && (
            <Card className="border-rose-100 shadow-sm rounded-2xl overflow-hidden bg-rose-50/50 animate-in fade-in zoom-in duration-300">
              <CardContent className="p-6 md:p-8 text-center space-y-6">
                <div className="inline-flex items-center justify-center p-4 bg-rose-100 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-rose-900">
                    Warning: Invalid Serial!
                  </h2>
                  <p className="text-rose-700 mt-1 font-medium">
                    Authentication Failed.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 text-center border border-rose-100 shadow-sm">
                  <p className="text-sm text-gray-800 leading-relaxed font-semibold">
                    {productDetails?.message ||
                      "This serial number does not exist in our database. The product might be counterfeit."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                    Report Counterfeit
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-700"
                    onClick={handleReset}
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
