"use client";

import React from "react";
import { ShoppingBag, Clock, CheckCircle2, Truck, ArrowRight, Package } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

// Mock Data للطلبات السابقة والحالية
const MOCK_ORDERS = [
  {
    id: "ORD-9821-X4",
    date: "June 24, 2026",
    status: "In Transit",
    statusColor: "bg-orange-50 text-orange-600 border-orange-100",
    icon: Truck,
    total: 71.99,
    itemsCount: 3,
    itemsSummary: "Whey Protein Isolate, Liquid BCAA (+1 other item)",
  },
  {
    id: "ORD-4412-M1",
    date: "June 10, 2026",
    status: "Delivered",
    statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: CheckCircle2,
    total: 34.50,
    itemsCount: 1,
    itemsSummary: "Focus Capsules (90ct)",
  },
  {
    id: "ORD-2109-L9",
    date: "May 28, 2026",
    status: "Processing",
    statusColor: "bg-blue-50 text-blue-600 border-blue-100",
    icon: Clock,
    total: 12.00,
    itemsCount: 1,
    itemsSummary: "Creatine Monohydrate (500g)",
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-8" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-[#0044CC]" /> Order History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your live shipments and review detailed invoices of your premium supplement purchases.
        </p>
      </div>

      {/* Main Content Area */}
      {MOCK_ORDERS.length > 0 ? (
        <div className="space-y-4 max-w-4xl">
          {MOCK_ORDERS.map((order) => {
            const StatusIcon = order.icon;

            return (
              <Card key={order.id} className="bg-white border-gray-100 shadow-sm rounded-xl overflow-hidden group hover:border-gray-200 transition-colors">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left Side: Order Identifiers & Main Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 shrink-0 hidden sm:block">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-black text-gray-900 tracking-wide">{order.id}</span>
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.statusColor}`}>
                          <StatusIcon className="h-3 w-3 mr-1 inline-block shrink-0" /> {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-gray-700 line-clamp-1 pt-1">
                        {order.itemsSummary}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium block pt-1">
                        Placed on {order.date} · {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Total Price & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Paid</span>
                      <span className="text-sm font-black text-[#0044CC]">${order.total.toFixed(2)}</span>
                    </div>
                    
                    <Button variant="outline" className="border-gray-200 text-gray-700 hover:text-[#0044CC] hover:bg-blue-50/30 text-xs font-semibold px-4 h-9 flex items-center gap-1 bg-white rounded-md transition-all">
                      Details <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl space-y-3 max-w-4xl">
          <span className="text-4xl">📦</span>
          <h3 className="text-sm font-bold text-gray-900 pt-2">No Orders Found</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            You haven&apos;t placed any orders yet. Start shopping to fuel your ultimate stack performance.
          </p>
        </div>
      )}
    </div>
  );
}