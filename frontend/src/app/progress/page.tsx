"use client";

import {
  TrendingUp,
  Scale,
  Flame,
  Award,
  Calendar,
  Save,
  LineChartIcon,
  Loader2,
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
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";

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

  // States
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleRecords, setVisibleRecords] = useState(5);

  const [measurements, setMeasurements] = useState({
    weight: 0,
    bodyFatPercentage: 0,
    muscleMassPercentage: 0,
  });

  const fetchProgressData = async () => {
    try {
      const response = await api.get("/Health/progress-tracker");
      setProgress(response.data);
    } catch (error) {
      toast.error("Failed to load progress data");
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
      fetchProgressData();
    }
  }, [isClient, accessToken]);

  async function handleMeasurements(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await api.post("/Health/measurements", {
        weight: measurements.weight,
        bodyFatPercentage: measurements.bodyFatPercentage,
        muscleMassPercentage: measurements.muscleMassPercentage,
      });
      toast.success(response.data.message || "Measurements logged!");
      fetchProgressData();
      setMeasurements({
        weight: 0,
        bodyFatPercentage: 0,
        muscleMassPercentage: 0,
      });
    } catch (error) {
      toast.error("Failed to save measurements");
    }
  }

  if (!accessToken || !isClient) return null;

  const latestWeight =
    progress.length > 0 ? progress[progress.length - 1].weight : 0;

  const latestBodyFat =
    [...progress]
      .reverse()
      .find((p) => p.bodyFatPercentage != null && p.bodyFatPercentage > 0)
      ?.bodyFatPercentage || 0;

  const latestMuscle =
    [...progress]
      .reverse()
      .find((p) => p.muscleMassPercentage != null && p.muscleMassPercentage > 0)
      ?.muscleMassPercentage || 0;

  let lastValidBF = 0;
  let lastValidMuscle = 0;

  const cleanChartData = progress.map((item) => {
    if (item.bodyFatPercentage != null && item.bodyFatPercentage > 0)
      lastValidBF = item.bodyFatPercentage;
    if (item.muscleMassPercentage != null && item.muscleMassPercentage > 0)
      lastValidMuscle = item.muscleMassPercentage;

    return {
      ...item,
      cleanBodyFat: item.bodyFatPercentage || lastValidBF,
      cleanMuscle: item.muscleMassPercentage || lastValidMuscle,
    };
  });

  const chartData = {
    labels: cleanChartData.map((item) =>
      new Date(item.dateRecorded).toLocaleDateString(),
    ),
    datasets: [
      {
        label: "Weight (kg)",
        data: cleanChartData.map((item) => item.weight),
        borderColor: "#0044CC",
        backgroundColor: "rgba(0, 68, 204, 0.04)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#0044CC",
      },
      {
        label: "Body Fat (%)",
        data: cleanChartData.map((item) => item.cleanBodyFat),
        borderColor: "#FF6600",
        backgroundColor: "transparent",
        tension: 0.3,
        pointBackgroundColor: "#FF6600",
      },
      {
        label: "Muscle Mass (%)",
        data: cleanChartData.map((item) => item.cleanMuscle),
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Scale className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Weight
              </span>
            </div>
            <span className="text-xl font-black text-gray-900">
              {isLoading ? "..." : `${latestWeight} kg`}
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
              {isLoading ? "..." : `${latestBodyFat}%`}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm rounded-xl">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <Award className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Muscle Mass
              </span>
            </div>
            <span className="text-xl font-black text-gray-900">
              {isLoading ? "..." : `${latestMuscle}%`}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Analytics & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Input Form */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl lg:col-span-1 h-max">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Save className="h-4 w-4 text-[#0044CC]" /> Log Progress
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your metrics for today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMeasurements} className="space-y-4">
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
                  min={0}
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
                  min={0}
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
              Visualizing your physical progress over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Chart Container */}
            <div className="h-64 w-full relative mb-8">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                </div>
              ) : progress.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                  No data available to display chart.
                </div>
              )}
            </div>

            {/* Data Table */}
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
                      <th className="py-3 px-2">Body Fat</th>
                      <th className="py-3 px-2">Muscle Mass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto text-gray-300" />
                        </td>
                      </tr>
                    ) : (
                      [...progress]
                        .reverse()
                        .slice(0, visibleRecords)
                        .map((item, index) => (
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
                              {item.bodyFatPercentage || "-"}
                              {item.bodyFatPercentage ? "%" : ""}
                            </td>
                            <td className="py-3.5 px-2 font-semibold text-emerald-600">
                              {item.muscleMassPercentage || "-"}
                              {item.muscleMassPercentage ? "%" : ""}
                            </td>
                          </tr>
                        ))
                    )}
                    {!isLoading && progress.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-gray-500"
                        >
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Show All Button */}
              {!isLoading && progress.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-[#0044CC] hover:bg-blue-50 transition-colors"
                    onClick={() =>
                      setVisibleRecords(
                        visibleRecords === 5 ? progress.length : 5,
                      )
                    }
                  >
                    {visibleRecords === 5 ? "View All Records" : "Show Less"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
