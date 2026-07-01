"use client";

import {
  Package,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  Truck,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";

interface OrderItem {
  productName: string;
  quantity: number;
}

interface Order {
  id: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: string;
  trackingNumber?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingReturn, setProcessingReturn] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/Orders/my-orders");
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed loading your orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && accessToken) {
      fetchOrders();
    }
  }, [isClient, accessToken]);

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  const handleRequestReturn = async (orderId: string) => {
    setProcessingReturn(orderId);
    try {
      const response = await api.post(`/Orders/returns/${orderId}/process`);
      toast.success(response.data.message || "Return requested successfully!");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.Message || "Failed to process return");
    } finally {
      setProcessingReturn(null);
    }
  };

  // ألوان حالة الطلب
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "delivered") return "bg-green-50 text-green-700 border-green-100";
    if (s === "pending")
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    if (s === "cancelled") return "bg-red-50 text-red-700 border-red-100";
    if (s === "returned") return "bg-gray-100 text-gray-700 border-gray-200";
    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  // ألوان حالة الدفع
  const getPaymentStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "paid" || s === "completed") return "text-green-600";
    if (s === "failed") return "text-red-600";
    return "text-yellow-600";
  };

  if (!accessToken || !isClient) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8" dir="ltr">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-500 mt-1">
            View your order history, tracking, and process returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search orders..." className="pl-9 w-64" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/**
 * 
 *  <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0044CC]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Package className="h-10 w-10 mx-auto text-gray-400 mb-3 opacity-50" />
            <p>No orders found.</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              className="border border-gray-100 shadow-sm rounded-xl overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
                  <div className="flex flex-wrap gap-4 md:gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Order ID
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                          <Truck className="h-3 w-3" /> Tracking
                        </p>
                        <p className="text-sm font-semibold text-[#0044CC] cursor-pointer hover:underline">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  <div className="md:col-span-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {order.items?.length || 0} Items
                        </p>
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          {order.items?.length > 0 ? (
                            order.items.map((item, idx) => (
                              <p key={idx} className="line-clamp-1">
                                <span className="font-semibold text-gray-700">{item.quantity}x</span> {item.productName}
                              </p>
                            ))
                          ) : (
                            <p>No items details</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3" /> Shipping Address
                      </p>
                      <p className="text-xs text-gray-700 font-medium line-clamp-2">
                        {order.shippingAddress || "No address provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                        <CreditCard className="h-3 w-3" /> Payment details
                      </p>
                      <p className="text-xs text-gray-700 font-medium">
                        {order.paymentMethod || "N/A"} • <span className={`font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus || "Unknown"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Subtotal</span>
                        <span>${order.totalAmount?.toFixed(2)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600 font-medium">
                          <span>Discount</span>
                          <span>-${order.discountAmount?.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-50 mt-2">
                        <span>Total</span>
                        <span>${order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>

                     إخفاء زرار الإرجاع لو الطلب لسه موصلش أو تم إرجاعه فعلاً 
                    {order.status?.toLowerCase() === "delivered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestReturn(order.id)
                        disabled={processingReturn === order.id
                        className="w-full text-xs text-red-600 border-red-100 hover:text-red-700 hover:bg-red-50"
                      >
                        {processingReturn === order.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        Request Return
                      </Button>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
 
 */}
    </div>
  );
}
