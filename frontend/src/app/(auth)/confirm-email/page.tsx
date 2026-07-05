"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2, Leaf, ArrowRight, RefreshCw, Home } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawUserId = searchParams.get("userId");
  const rawToken = searchParams.get("token");

  const userId = rawUserId ? decodeURIComponent(rawUserId) : null;
  const token = rawToken ? decodeURIComponent(rawToken) : null;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!userId || !token) {
      setStatus("error");
      setMessage("Invalid or missing verification link. Please check your email and try again.");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await axios.get(
          `https://sh-supplements.runasp.net/api/Auth/confirm-email`,
          {
            params: { userId, token },
          }
        );

        setStatus("success");
        setMessage(
          response.data?.Message || "Your email address has been confirmed successfully!"
        );
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.Message || "We were unable to confirm your email address. The link may have expired."
        );
      }
    }

    verifyEmail();
  }, [userId, token]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 md:p-8 font-sans antialiased" dir="ltr">
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #059669 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        aria-hidden="true"
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <Card className="w-full max-w-md bg-white border border-stone-200 shadow-xl rounded-3xl overflow-hidden relative z-10 animate-fade-up">
        {/* Top gradient banner */}
        <div className="h-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />

        <CardContent className="p-8 md:p-10 text-center space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <Image
              src="/logo.png"
              alt="SH Supplements Logo"
              width={36}
              height={36}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
            <span className="font-extrabold text-stone-900 text-base sm:text-lg tracking-tight">
              SH<span className="text-emerald-600">Supplements</span>
            </span>
          </div>

          {status === "loading" && (
            <div className="py-6 space-y-4">
              <div className="relative inline-flex items-center justify-center mx-auto">
                <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center animate-pulse">
                  <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-stone-900">Confirming Account</h1>
                <p className="text-stone-500 text-sm">{message}</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="py-4 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="relative inline-flex items-center justify-center mx-auto">
                <div className="h-20 w-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Email Confirmed!</h1>
                <p className="text-stone-600 text-sm leading-relaxed">{message}</p>
              </div>
              <div className="space-y-2 pt-2">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Link href="/login">
                    Sign In Now <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="py-4 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="relative inline-flex items-center justify-center mx-auto">
                <div className="h-20 w-20 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-500" aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Verification Failed</h1>
                <p className="text-red-600 font-medium text-sm leading-relaxed">{message}</p>
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full rounded-xl font-bold"
                >
                  <Link href="/resend-confirm-email">
                    <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" /> Resend Confirmation Email
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl font-bold border-stone-200 text-stone-700"
                >
                  <Link href="/">
                    <Home className="h-4 w-4 mr-1.5 text-stone-400" aria-hidden="true" /> Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
