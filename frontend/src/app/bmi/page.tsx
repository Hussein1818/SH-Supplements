"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, Activity, Dumbbell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function BMIPage() {
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState<{ label: string; color: string; advice: string } | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // تحويل الطول لمتر

    if (w > 0 && h > 0) {
      const bmiValue = w / (h * h);
      setBmi(parseFloat(bmiValue.toFixed(1)));

      // تحديد الحالة والنصيحة بناءً على النتيجة
      if (bmiValue < 18.5) {
        setStatus({
          label: "Underweight (نحافة)",
          color: "text-blue-600 bg-blue-50 border-blue-200",
          advice: "Your focus should be Lean Mass Gain (Bulking). We recommend high-calorie protein formulations like Mass Gainers and Creatine.",
        });
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        setStatus({
          label: "Normal Weight (وزن مثالي)",
          color: "text-green-600 bg-green-50 border-green-200",
          advice: "Excellent composition! Maintain performance and build premium quality muscle with Whey Protein Isolate and Pre-Workouts.",
        });
      } else if (bmiValue >= 25 && bmiValue < 30) {
        setStatus({
          label: "Overweight (زيادة وزن)",
          color: "text-orange-600 bg-orange-50 border-orange-200",
          advice: "Ideal for a Body Recomposition or Cutting phase. Focus on Whey Isolate, Fat Burners (L-Carnitine), and a high-protein calorie deficit.",
        });
      } else {
        setStatus({
          label: "Obesity (سمنة)",
          color: "text-red-600 bg-red-50 border-red-200",
          advice: "Focus on cardiovascular health and active fat loss. High-purity Whey Isolate, Omega-3, and strictly controlled calorie intake are advised.",
        });
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Calculator className="h-6 w-6 text-[#0044CC]" /> BMI & Fitness Calculator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Calculate your Body Mass Index to unlock tailored supplement stacks and precise nutritional advice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Inputs Form */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Your Metrics</CardTitle>
            <CardDescription className="text-xs">Enter your current physical stats.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculateBMI} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-xs font-semibold text-gray-700">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g. 75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-xs font-semibold text-gray-700">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="e.g. 178"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-[#F4F4F5] border-none focus-visible:ring-1 focus-visible:ring-[#0044CC]"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white font-medium text-sm py-2 rounded-md mt-2">
                Calculate Now
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Side: Dynamic Results View */}
        <Card className="bg-white border-gray-100 shadow-sm rounded-xl md:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold">Analysis & Report</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {bmi ? (
              <div className="space-y-6">
                {/* Result Score */}
                <div className="flex items-center gap-4">
                  <div className="bg-[#0044CC]/5 text-[#0044CC] h-16 w-16 rounded-xl flex flex-col items-center justify-center border border-[#0044CC]/10 shadow-inner">
                    <span className="text-2xl font-black">{bmi}</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold">BMI</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${status?.color}`}>
                    {status?.label}
                  </div>
                </div>

                {/* Target Strategy/Advice Box */}
                <div className="bg-[#FAF6F0] border border-[#FF6600]/10 p-4 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-[#FF6600] flex items-center gap-1.5">
                    <Dumbbell className="h-4 w-4" /> Targeted Strategy Recommendation
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {status?.advice}
                  </p>
                </div>

                {/* Action CTA to shop */}
                <Button className="w-full sm:w-max bg-[#FF6600] hover:bg-[#E05500] text-white text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-md transition-all">
                  Explore Recommended Stacks <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2 text-gray-400">
                <Activity className="h-10 w-10 mx-auto stroke-[1.5] animate-pulse text-gray-300" />
                <p className="text-xs font-medium max-w-xs mx-auto">
                  Submit your stats on the left to see your comprehensive body composition analysis and product alignment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}