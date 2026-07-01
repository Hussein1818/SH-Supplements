"use client";

import { useEffect, useState } from "react";
import {
  Calculator,
  Scale,
  Ruler,
  User,
  Zap,
  Activity,
  Flame,
  History,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/components/store/authStore";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";

type HistoryData = {
  id: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  bmiValue: number;
  bmiCategory: string;
  bmrValue: number;
  tdeeValue: number;
  recordedAt: string;
};

export default function BmiCalculatorPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // States
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsProcessing] = useState(false);

  const [metrics, setMetrics] = useState({
    weight: 0,
    height: 0,
    age: 0,
    gender: 1, 
    activityLevel: 1, 
  });

  const fetchMetricsHistory = async () => {
    try {
      const response = await api.get("/Health/metrics/history");
      setHistory(response.data);
    } catch (error) {
      toast.error("Failed to load metrics history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  useEffect(() => {
    if (isClient && accessToken) {
      fetchMetricsHistory();
    }
  }, [isClient, accessToken]);

  async function handleCalculateMetrics(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (metrics.weight <= 0 || metrics.height <= 0 || metrics.age <= 0) {
      toast.error("Please enter valid metrics values.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post("/Health/metrics/calculate-and-save", {
        weight: metrics.weight,
        height: metrics.height,
        age: metrics.age,
        gender: metrics.gender,
        activityLevel: metrics.activityLevel,
      });
      toast.success(
        response.data.message || "Metrics calculated and saved successfully!",
      );
      fetchMetricsHistory(); 
    } catch (error) {
      toast.error("Failed to calculate metabolic metrics.");
    } finally {
      setIsProcessing(false);
    }
  }

  const latestMetrics = history.length > 0 ? history[0] : null;

  const getBmiCategoryStyle = (category: string) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("normal"))
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (cat.includes("overweight"))
      return "text-amber-600 bg-amber-50 border-amber-100";
    if (cat.includes("obese"))
      return "text-rose-600 bg-rose-50 border-rose-100";
    return "text-blue-600 bg-blue-50 border-blue-100";
  };

  if (!accessToken || !isClient) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Calculator className="h-6 w-6 text-[#0044CC]" /> Metabolic & BMI
          Calculator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Calculate your Body Mass Index (BMI), Basal Metabolic Rate (BMR), and
          Total Daily Energy Expenditure (TDEE) to align with your fitness
          goals.
        </p>
      </div>

      {/* 1. Quick Stats Highlights (Latest calculated results) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-gray-400">
              <Activity className="h-4 w-4 text-[#0044CC]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                BMI Score
              </span>
            </div>
            <span className="text-2xl font-black text-gray-900">
              {latestMetrics?.bmiValue
                ? latestMetrics.bmiValue.toFixed(2)
                : "0.00"}
            </span>
            {latestMetrics?.bmiCategory && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border w-max uppercase ${getBmiCategoryStyle(latestMetrics.bmiCategory)}`}
              >
                {latestMetrics.bmiCategory}
              </span>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                BMR (Basal Metabolism)
              </span>
            </div>
            <span className="text-2xl font-black text-gray-900">
              {latestMetrics?.bmrValue
                ? `${latestMetrics.bmrValue.toLocaleString()} kcal`
                : "0 kcal"}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              Energy burned at complete rest.
            </span>
          </CardContent>
        </Card>

        <Card className="bg-[#FAF6F0] border-[#FF6600]/10 shadow-sm rounded-xl">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="h-4 w-4 text-[#FF6600]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                TDEE (Maintenance Calories)
              </span>
            </div>
            <span className="text-2xl font-black text-gray-900 text-[#FF6600]">
              {latestMetrics?.tdeeValue
                ? `${Math.round(latestMetrics.tdeeValue).toLocaleString()} kcal`
                : "0 kcal"}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              Total calories needed based on activity.
            </span>
          </CardContent>
        </Card>
      </div>

      {/* 2. Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form Card */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl lg:col-span-1 h-max">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-[#0044CC]" /> Calculate
              Metrics
            </CardTitle>
            <CardDescription className="text-xs">
              Input your current body data below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculateMetrics} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Scale className="h-3 w-3 text-gray-400" /> Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 85"
                    className="bg-gray-50 border-none"
                    required
                    value={metrics.weight || ""}
                    onChange={(e) =>
                      setMetrics({ ...metrics, weight: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Ruler className="h-3 w-3 text-gray-400" /> Height (cm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 180"
                    className="bg-gray-50 border-none"
                    required
                    value={metrics.height || ""}
                    onChange={(e) =>
                      setMetrics({ ...metrics, height: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    Age
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 24"
                    className="bg-gray-50 border-none"
                    required
                    min={12}
                    max={100}
                    value={metrics.age || ""}
                    onChange={(e) =>
                      setMetrics({ ...metrics, age: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-400" /> Gender
                  </Label>
                  <select
                    className="flex h-10 w-full rounded-md bg-gray-50 px-3 py-2 text-sm focus:outline-none border border-transparent focus:border-gray-200"
                    value={metrics.gender}
                    onChange={(e) =>
                      setMetrics({ ...metrics, gender: Number(e.target.value) })
                    }
                  >
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">
                  Activity Level
                </Label>
                <select
                  className="flex h-10 w-full rounded-md bg-gray-50 px-3 py-2 text-sm focus:outline-none border border-transparent focus:border-gray-200"
                  value={metrics.activityLevel}
                  onChange={(e) =>
                    setMetrics({
                      ...metrics,
                      activityLevel: Number(e.target.value),
                    })
                  }
                >
                  <option value="1">Sedentary (Little or no exercise)</option>
                  <option value="2">
                    Lightly Active (Exercise 1-3 days/week)
                  </option>
                  <option value="3">
                    Moderately Active (Exercise 3-5 days/week)
                  </option>
                  <option value="4">
                    Very Active (Hard exercise 6-7 days/week)
                  </option>
                  <option value="5">
                    Extra Active (Intense daily training/physical job)
                  </option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white font-bold text-sm py-2 rounded-md"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <>Calculate & Save</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Calculations History Table */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <History className="h-4 w-4 text-[#0044CC]" /> Metabolic Log
              History
            </CardTitle>
            <CardDescription className="text-xs">
              Review your historical data changes to track physical
              transformation efficiency.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-medium text-gray-500 border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Weight</th>
                    <th className="py-3 px-2">BMI Value</th>
                    <th className="py-3 px-2">BMR</th>
                    <th className="py-3 px-2">TDEE</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-400"
                      >
                        No computational logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    history.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-2 font-bold text-gray-900">
                          {new Date(log.recordedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-gray-800">
                          {log.weight} kg
                        </td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getBmiCategoryStyle(log.bmiCategory)}`}
                          >
                            {log.bmiValue.toFixed(2)} ({log.bmiCategory})
                          </span>
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-gray-700">
                          {log.bmrValue} kcal
                        </td>
                        <td className="py-3.5 px-2 font-black text-[#FF6600]">
                          {Math.round(log.tdeeValue)} kcal
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
