"use client";

import {
  TrendingUp,
  Scale,
  Flame,
  Award,
  Calendar,
  Save,
  Calculator,
  Zap,
  LineChartIcon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Activity, useEffect, useState } from "react";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";

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

interface ProgressData {
  dateRecorded: string;
  weight: number;
  bmiValue: number;
  bodyFatPercentage: number;
  muscleMassPercentage: number;
}

export default function ProgressPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<"measurements" | "calculator">(
    "measurements",
  );

  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [userHistory, setUserHistory] = useState<HistoryData[]>([]);

  // دوال جلب البيانات مفصولة عشان نقدر نستدعيها تاني بعد الـ POST
  const fetchProgressData = async () => {
    try {
      const response = await api.get("/Health/progress-tracker");
      setProgress(response.data);
    } catch (error) {
      toast.error("Failed to load progress data");
    }
  };

  const fetchUserHistory = async () => {
    try {
      const response = await api.get("/Health/metrics/history");
      setUserHistory(response.data);
    } catch (error) {
      toast.error("Failed to get history data");
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
      fetchProgressData();
      fetchUserHistory();
    }
  }, [isClient, accessToken]);

  // post endpoint Health/measurements
  const [measurements, setMeasurements] = useState({
    weight: 0,
    bodyFatPercentage: 0,
    muscleMassPercentage: 0,
  });

  async function handleMeasurements(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await api.post("/Health/measurements", {
        weight: measurements.weight,
        bodyFatPercentage: measurements.bodyFatPercentage,
        muscleMassPercentage: measurements.muscleMassPercentage,
      });
      toast.success(response.data.message || "Measurements logged!");
      // تحديث الداتا بعد الحفظ مباشرة
      fetchProgressData();
    } catch (error) {
      toast.error("Failed to save measurements");
    }
  }

  // post endpoint health/metrics/calculate-and-save
  const [metrics, setMetrics] = useState({
    weight: 0,
    height: 0,
    age: 0,
    gender: 1,
    activityLevel: 1, // تم تعديل القيمة المبدئية لتطابق الخيارات
  });

  async function handleMetrics(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await api.post("/Health/metrics/calculate-and-save", {
        weight: metrics.weight,
        height: metrics.height,
        age: metrics.age,
        gender: metrics.gender,
        activityLevel: metrics.activityLevel,
      });
      toast.success(response.data.message || "Metrics calculated!");
      // تحديث الداتا بعد الحفظ مباشرة
      fetchUserHistory();
    } catch (error) {
      toast.error("Failed to calculate metrics");
    }
  }

  if (!accessToken || !isClient) return null;

  // --- استخراج أحدث البيانات للكروت العلوية ---
  const latestProgress =
    progress.length > 0 ? progress[progress.length - 1] : null;
  const latestHistory = userHistory.length > 0 ? userHistory[0] : null; // لو راجعة من الأحدث للأقدم، استخدم 0، لو العكس استخدم [userHistory.length - 1]

  // --- إعداد بيانات الرسم البياني دايناميكياً ---
  const chartData = {
    labels: progress.map((item) =>
      new Date(item.dateRecorded).toLocaleDateString(),
    ),
    datasets: [
      {
        label: "Weight (kg)",
        data: progress.map((item) => item.weight),
        borderColor: "#0044CC",
        backgroundColor: "rgba(0, 68, 204, 0.04)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#0044CC",
      },
      {
        label: "Body Fat (%)",
        data: progress.map((item) => item.bodyFatPercentage),
        borderColor: "#FF6600",
        backgroundColor: "transparent",
        tension: 0.3,
        pointBackgroundColor: "#FF6600",
      },
      {
        label: "Muscle Mass (%)",
        data: progress.map((item) => item.muscleMassPercentage),
        borderColor: "#10b981",
        backgroundColor: "transparent",
        tension: 0.3,
        pointBackgroundColor: "#10b981",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { boxWidth: 12, font: { size: 11, weight: "bold" as any } },
      },
      tooltip: {
        padding: 12,
        backgroundColor: "#1e293b",
        titleFont: { size: 12, weight: "bold" as any },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f1f5f9" } },
    },
  };

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

      {/* 1. Quick Stat Cards (Highlights) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Scale className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Weight
              </span>
            </div>
            <span className="text-xl font-black text-gray-900">
              {latestProgress?.weight || "0"} kg
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#FF6600]">
              <Flame className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Body Fat
              </span>
            </div>
            <span className="text-xl font-black text-gray-900">
              {latestProgress?.bodyFatPercentage || "0"}%
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <Award className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Muscle
              </span>
            </div>
            <span className="text-xl font-black text-gray-900">
              {latestProgress?.muscleMassPercentage || "0"}%
            </span>
          </CardContent>
        </Card>

        <Card className="bg-[#FAF6F0] border-[#FF6600]/10 shadow-sm rounded-xl">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="h-4 w-4 text-[#FF6600]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                TDEE (Calories)
              </span>
            </div>
            <span className="text-xl font-black text-gray-900">
              {latestHistory?.tdeeValue || "0"}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100 shadow-sm rounded-xl">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Activity className="h-4 w-4 text-[#0044CC]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                BMI Status
              </span>
            </div>
            <span className="text-xl font-black text-gray-900">
              {latestHistory?.bmiValue || "0"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Analytics & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Input Forms (Tabs) */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl lg:col-span-1 h-max">
          <CardHeader className="pb-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("measurements")}
                className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${
                  activeTab === "measurements"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Measurements
              </button>
              <button
                onClick={() => setActiveTab("calculator")}
                className={`flex-1 text-xs font-bold py-2 rounded-md transition-colors ${
                  activeTab === "calculator"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Metabolic Calc
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* TAB 1: Measurements */}
            {activeTab === "measurements" && (
              <form
                onSubmit={handleMeasurements}
                className="space-y-4 animate-in fade-in duration-300"
              >
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    Weight (kg) *
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    min={20}
                    max={300}
                    className="bg-[#F4F4F5] border-none"
                    required
                    value={measurements.weight || ""}
                    onChange={(e) =>
                      setMeasurements({
                        ...measurements,
                        weight: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    Body Fat %
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    min={5}
                    max={70}
                    className="bg-[#F4F4F5] border-none"
                    value={measurements.bodyFatPercentage || ""}
                    onChange={(e) =>
                      setMeasurements({
                        ...measurements,
                        bodyFatPercentage: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">
                    Muscle Mass %
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={15}
                    max={70}
                    className="bg-[#F4F4F5] border-none"
                    value={measurements.muscleMassPercentage || ""}
                    onChange={(e) =>
                      setMeasurements({
                        ...measurements,
                        muscleMassPercentage: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white font-medium text-sm py-2 rounded-md"
                >
                  <Save className="h-4 w-4 mr-1.5" /> Log Measurements
                </Button>
              </form>
            )}

            {/* TAB 2: Calculator */}
            {activeTab === "calculator" && (
              <form
                onSubmit={handleMetrics}
                className="space-y-4 animate-in fade-in duration-300"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700">
                      Weight (kg)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="80.5"
                      className="bg-[#F4F4F5] border-none"
                      required
                      value={metrics.weight || ""}
                      onChange={(e) =>
                        setMetrics({
                          ...metrics,
                          weight: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700">
                      Height (cm)
                    </Label>
                    <Input
                      type="number"
                      placeholder="182"
                      className="bg-[#F4F4F5] border-none"
                      required
                      value={metrics.height || ""}
                      onChange={(e) =>
                        setMetrics({
                          ...metrics,
                          height: Number(e.target.value),
                        })
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
                      placeholder="25"
                      className="bg-[#F4F4F5] border-none"
                      required
                      value={metrics.age || ""}
                      onChange={(e) =>
                        setMetrics({
                          ...metrics,
                          age: Number(e.target.value),
                        })
                      }
                      min={12}
                      max={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-700">
                      Gender
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-md bg-[#F4F4F5] px-3 py-2 text-sm focus:outline-none"
                      value={metrics.gender}
                      onChange={(e) =>
                        setMetrics({
                          ...metrics,
                          gender: Number(e.target.value),
                        })
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
                    className="flex h-10 w-full rounded-md bg-[#F4F4F5] px-3 py-2 text-sm focus:outline-none"
                    value={metrics.activityLevel}
                    onChange={(e) =>
                      setMetrics({
                        ...metrics,
                        activityLevel: Number(e.target.value),
                      })
                    }
                  >
                    <option value="1">Sedentary</option>
                    <option value="2">Lightly Active</option>
                    <option value="3">Moderately Active</option>
                    <option value="4">Very Active</option>
                    <option value="5">Extra Active</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-medium text-sm py-2 rounded-md"
                >
                  <Calculator className="h-4 w-4 mr-1.5" /> Calculate & Save
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Right Section: Chart & Table */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <LineChartIcon className="h-4 w-4 text-[#0044CC]" />{" "}
              Transformation Overview
            </CardTitle>
            <CardDescription className="text-xs">
              Visualizing your progress over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* 1. الحاوية الخاصة بـ Chart.js */}
            <div className="h-64 w-full relative mb-8">
              {progress.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                  No data available to display chart.
                </div>
              )}
            </div>

            {/* 2. Data Table */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" /> Data Log
              </h3>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs font-medium text-gray-500 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Weight</th>
                      <th className="py-3 px-2">BMI</th>
                      <th className="py-3 px-2">Body Fat</th>
                      <th className="py-3 px-2">Muscle Mass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* عرض البيانات معكوسة (الأحدث فوق) */}
                    {[...progress].reverse().map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-50/50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-2 font-bold text-gray-900">
                          {new Date(item.dateRecorded).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-2 font-black text-[#0044CC]">
                          {item.weight} kg
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-gray-700">
                          {item.bmiValue}
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-gray-700">
                          {item.bodyFatPercentage}%
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-emerald-600">
                          {item.muscleMassPercentage}%
                        </td>
                      </tr>
                    ))}
                    {progress.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 text-center text-gray-500"
                        >
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
