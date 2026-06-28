"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawUserId = searchParams.get("userId");
  const rawToken = searchParams.get("token");

  const userId = rawUserId ? decodeURIComponent(rawUserId) : null;
  const token = rawToken ? decodeURIComponent(rawToken) : null;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Confirming Your Account...");

  useEffect(() => {
    if (!userId || !token) {
      setStatus("error");
      setMessage("Error");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await axios.get(
          `https://sh-supplements.runasp.net/api/Auth/confirm-email`,
          {
            params: { userId, token },
          },
        );

        setStatus("success");
        setMessage(
          response.data?.Message || "Your Account was confirmed successfully",
        );
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.Message || "Confirm Failed");
      }
    }

    verifyEmail();
  }, [userId, token]);
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-md border border-gray-100 shadow-sm max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-12 w-12 text-[#0044CC] animate-spin" />
            <p className="text-gray-600 font-medium">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h1 className="text-xl font-bold text-gray-900">Done!</h1>
            <p className="text-gray-600">{message}</p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-[#0044CC] hover:bg-[#0033AA] mt-2"
            >
              Log in
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-3">
            <XCircle className="h-12 w-12 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900">Error!</h1>
            <p className="text-red-500 text-sm">{message}</p>
            <Button
              onClick={() => router.push("/resend-confirm-email")}
              variant="outline"
              className="w-full mt-2"
            >
              resend Email Confirm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
