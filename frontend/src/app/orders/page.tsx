"use client";

import {
  Package,
  RefreshCw,
  Loader2,
  CreditCard,
  Banknote,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/components/store/authStore";
import { useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderDate: string;
  status: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: string;
  trackingNumber?: string | null;
  paymentMethod: number;
  paymentStatus: number;
  items: OrderItem[];
}

export default function OrdersPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingReturn, setProcessingReturn] = useState<string | null>(null);
  const [processingCancel, setProcessingCancel] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/Orders/my-orders");
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error("Failed loading your orders");
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
      fetchOrders();
    }
  }, [isClient, accessToken]);

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

  const handleCancelOrder = async (orderId: string) => {
    setProcessingCancel(orderId);
    try {
      const response = await api.post(`/Orders/${orderId}/cancel`);
      toast.success(response.data.message || "Order cancelled successfully!");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.Message || "Failed to cancel order");
    } finally {
      setProcessingCancel(null);
    }
  };

  const getStatusText = (status: number) => {
    const map: Record<number, string> = {
      1: "Pending",
      2: "Processing",
      3: "Shipped",
      4: "Delivered",
      5: "Cancelled",
      6: "Refunded",
    };
    return map[status] || "Unknown";
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case 2:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 3:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case 4:
        return "bg-green-50 text-green-700 border-green-200";
      case 5:
        return "bg-red-50 text-red-700 border-red-200";
      case 6:
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentMethodInfo = (method: number) => {
    switch (method) {
      case 1:
        return {
          text: "Credit Card",
          icon: <CreditCard className="w-3 h-3 mr-1 inline" />,
        };
      case 2:
        return {
          text: "Wallet",
          icon: <Wallet className="w-3 h-3 mr-1 inline" />,
        };
      case 3:
        return {
          text: "Cash on Delivery",
          icon: <Banknote className="w-3 h-3 mr-1 inline" />,
        };
      default:
        return {
          text: "Unknown",
          icon: <CreditCard className="w-3 h-3 mr-1 inline" />,
        };
    }
  };

  const getPaymentStatusDisplay = (status: number) => {
    switch (status) {
      case 1:
        return { text: "⏳ Unpaid", color: "text-yellow-600" };
      case 2:
        return { text: "✔ Paid", color: "text-green-600" };
      case 3:
        return { text: "✖ Failed", color: "text-red-600" };
      case 4:
        return { text: "↩ Refunded", color: "text-gray-600" };
      default:
        return { text: "Unknown", color: "text-gray-500" };
    }
  };
const handleRetryPayment = async (orderId: string) => {
    try {
      const response = await api.post("/Payment/initiate", {
        orderId: orderId,
        gatewayName: "paymob",
      });
      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      toast.error("Failed to initiate payment");
    }
  };
  if (!isClient) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8" dir="ltr">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          My Orders
        </h1>
        <p className="text-gray-500 mt-1">
          View your order history and process returns.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
            <Package className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <p>No orders found.</p>
          </div>
        ) : (
          orders.map((order) => {
            const paymentStatusDisplay = getPaymentStatusDisplay(
              order.paymentStatus,
            );

            return (
              <Card
                key={order.id}
                className="border border-gray-100 shadow-sm rounded-xl overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
                    <div className="flex flex-wrap gap-6 md:gap-12">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Order ID
                        </p>
                        <p className="text-sm font-semibold">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Date
                        </p>
                        <p className="text-sm font-semibold">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Payment
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          {getPaymentMethodInfo(order.paymentMethod).icon}
                          {getPaymentMethodInfo(order.paymentMethod).text}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(order.status)}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-6 space-y-3">
                      <p className="text-sm font-bold text-gray-400 uppercase border-b pb-2">
                        Items
                      </p>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded-md border"
                          />
                          <div>
                            <p className="text-sm font-semibold">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} | $
                              {item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="md:col-span-3 md:border-l md:pl-6">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                        Shipping Address
                      </p>
                      <p className="text-sm text-gray-700 break-words">
                        {order.shippingAddress}
                      </p>
                    </div>

                    <div className="md:col-span-3 md:border-l md:pl-6 flex flex-col justify-between items-start md:items-end">
                      <div className="text-left md:text-right w-full">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                          Order Total
                        </p>
                        <p className="text-2xl font-black text-emerald-600">
                          ${order.finalAmount.toFixed(2)}
                        </p>
                        <p
                          className={`text-xs font-bold mt-1 ${paymentStatusDisplay.color}`}
                        >
                          {paymentStatusDisplay.text}
                        </p>
                      </div>
                      {order.paymentStatus === 1 &&
                        (order.paymentMethod === 1 ||
                          order.paymentMethod === 2) &&
                        order.status !== 5 && (
                          <Button
                            size="sm"
                            onClick={() => handleRetryPayment(order.id)}
                            className="mt-4 w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            Pay Now
                          </Button>
                        )}

                      {order.status === 4 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestReturn(order.id)}
                          disabled={processingReturn === order.id}
                          className="mt-4 w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {processingReturn === order.id ? (
                            <Loader2 className="animate-spin h-3 w-3 mr-1" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          Request Return
                        </Button>
                      )}

                      {(order.status === 1 || order.status === 2) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={processingCancel === order.id}
                          className="mt-4 w-full text-xs text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-red-600 hover:border-red-200"
                        >
                          {processingCancel === order.id ? (
                            <Loader2 className="animate-spin h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
