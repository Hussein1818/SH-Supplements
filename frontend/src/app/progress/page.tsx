"use client";

import { TrendingUp, Scale, Flame, Award, Plus, Calendar } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";

export default function ProgressPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  return (
    <div className="space-y-8" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#0044CC]" /> Performance &
          Progress Tracker
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Log your body metrics periodically to monitor your transformation and
          optimize your stack.
        </p>
      </div>

      {/* 1. Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-[#0044CC]/5 text-[#0044CC] rounded-lg border border-[#0044CC]/10">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Current Weight
              </span>
              <span className="text-xl font-black text-gray-900">
                {/*                 {latestMetrics.weight || "--"}{" "}
                 */}{" "}
                <span className="text-xs font-normal text-gray-500">kg</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-[#FF6600]/5 text-[#FF6600] rounded-lg border border-[#FF6600]/10">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Body Fat
              </span>
              <span className="text-xl font-black text-gray-900">
                {/*                 {latestMetrics.bodyFat ? `${latestMetrics.bodyFat}%` : "--"}
                 */}{" "}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Muscle Mass
              </span>
              <span className="text-xl font-black text-gray-900">
                {/*  {latestMetrics.muscleMass
                  ? `${latestMetrics.muscleMass} kg`
                  : "--"} */}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Analytics & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Add New Metrics */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl lg:col-span-1 h-max">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-[#0044CC]" /> Log Today&apos;s Stats
            </CardTitle>
            <CardDescription className="text-xs">
              Keep your statistics accurate and fresh.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form /* onSubmit={handleAddLog} */ className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="weight"
                  className="text-xs font-semibold text-gray-700"
                >
                  Weight (kg) *
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 78.5"
                  /* value={weight}
                  onChange={(e) => setWeight(e.target.value)} */
                  className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fat"
                  className="text-xs font-semibold text-gray-700"
                >
                  Body Fat % (Optional)
                </Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 14.2"
                  /* value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)} */
                  className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="muscle"
                  className="text-xs font-semibold text-gray-700"
                >
                  Muscle Mass kg (Optional)
                </Label>
                <Input
                  id="muscle"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 38.5"
                  /* value={muscleMass}
                  onChange={(e) => setMuscleMass(e.target.value)} */
                  className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white font-medium text-sm py-2 rounded-md"
              >
                Save Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Table: Logs History */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-500" /> History Logs
            </CardTitle>
            <CardDescription className="text-xs">
              Your past logged transformations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-medium text-gray-500 border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Weight</th>
                    <th className="py-3 px-2">Body Fat</th>
                    <th className="py-3 px-2">Muscle Mass</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-2 font-bold text-gray-900">
                        {log.date}
                      </td>
                      <td className="py-3.5 px-2 font-black text-[#0044CC]">
                        {log.weight} kg
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-gray-700">
                        {log.bodyFat ? `${log.bodyFat}%` : "--"}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-emerald-600">
                        {log.muscleMass ? `${log.muscleMass} kg` : "--"}
                      </td>
                    </tr>
                  ))} */}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
