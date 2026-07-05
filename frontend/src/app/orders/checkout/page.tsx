"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormValues } from "@/src/lib/checkoutSchema";
import { useCheckoutStore } from "@/src/components/store/checkoutStore";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/src/components/auth/axiosInstance";
import { OrderSummary } from "@/src/components/checkout/OrderSummary";
import { Loader2, MapPin, Tag, CheckCircle2, Plus, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/src/components/store/authStore";
import { useCartStore } from "@/src/components/store/cartStore";
import { normalizeImageUrl } from "@/src/lib/utils";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  const { checkoutData, setShippingAddress, setPaymentMethod, resetCheckout } =
    useCheckoutStore();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutData,
  });

  const formatAddress = (addr: Address) => {
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.zipCode,
      addr.country,
    ].filter((p) => p && typeof p === "string" && p.trim() !== "");
    return parts.join(", ");
  };

  const { setOrderSummary } = useCheckoutStore();

  useEffect(() => {
    const fetchCartSummary = async () => {
      try {
        const response = await api.get("carts/my-cart");
        const cart = response.data;

        if (!cart || !cart.items || cart.items.length === 0) {
          toast.error("Your cart is empty. Please add items first.");
          router.replace("/cart");
          return;
        }

        const formattedItems = cart.items.map((item: any) => ({
          productId: item.productId || item.id || "",
          productName: item.productName || item.name || "Product",
          productImageUrl: normalizeImageUrl(item.productImageUrl || item.imageUrl || ""),
          quantity: item.quantity || 1,
          unitPrice:
            item.unitPrice !== undefined ? item.unitPrice : item.price || 0,
          totalPrice:
            item.totalPrice !== undefined
              ? item.totalPrice
              : (item.unitPrice || item.price || 0) * (item.quantity || 1),
        }));

        const subtotal = cart.grandTotal;
        const shippingFee = cart.isFreeShippingEligible ? 0 : 50;
        const total = subtotal + shippingFee;

        setOrderSummary(formattedItems, subtotal, shippingFee, total);
      } catch (error) {
        console.error("Failed to load cart summary");
        toast.error("Something went wrong with your cart.");
        router.replace("/cart");
      }
    };

    if (router) {
      fetchCartSummary();
    }
  }, [setOrderSummary, router]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get("/User/addresses");
        const fetchedAddresses: Address[] = Array.isArray(response.data)
          ? response.data
          : response.data?.addresses || [];
        const sortedAddresses = [...fetchedAddresses].sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
        );

        setAddresses(sortedAddresses);

        const currentShipping = form.getValues("shippingAddress");
        const defaultAddress =
          sortedAddresses.find((a) => a.isDefault) || sortedAddresses[0];
        if (
          defaultAddress &&
          (!currentShipping ||
            !sortedAddresses.some((a) => formatAddress(a) === currentShipping))
        ) {
          const defaultStr = formatAddress(defaultAddress);
          form.setValue("shippingAddress", defaultStr, {
            shouldValidate: true,
          });
          setShippingAddress(defaultStr);
        }
      } catch (error) {
        toast.error("Failed to load addresses.");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (accessToken) {
      fetchAddresses();
    }
  }, [form, accessToken, setShippingAddress]);

  const onSubmit = async (values: CheckoutFormValues) => {
    try {
      setIsSubmitting(true);
      setShippingAddress(values.shippingAddress);
      setPaymentMethod(values.paymentMethod);

      const orderResponse = await api.post("/Orders/checkout", values);

      const orderId = orderResponse.data?.orderId;
      if (!orderId) {
        toast.error(
          "Order created but failed to retrieve Order ID for payment.",
        );
        console.error("Missing Order ID in response:", orderResponse.data);
        return;
      }

      if (values.paymentMethod === 1 || values.paymentMethod === 2) {
        const paymentResponse = await api.post("/Payment/initiate", {
          orderId: orderId,
          gatewayName: "paymob",
        });

        if (paymentResponse.data?.paymentUrl) {
          useCartStore.getState().clearCart();
          window.location.href = paymentResponse.data.paymentUrl;
          return;
        } else {
          toast.error("Payment initiation failed. No URL returned.");
          return;
        }
      }
      useCartStore.getState().clearCart();
      toast.success("Order placed successfully!");
      resetCheckout();
      router.push("/orders");
    } catch (error: any) {
      console.error("Checkout Error:", error.response?.data || error);
      toast.error(
        error.response?.data?.Message || "Failed to process checkout.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    const code = form.getValues("couponCode");

    if (!code) {
      toast.error("Please enter a promo code first.");
      return;
    }

    try {
      setIsApplyingCoupon(true);
      const response = await api.get(`/Coupons/validate/${code}`);
      toast.success("Promo code applied successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.Message || "Invalid or expired promo code.",
      );
      form.setValue("couponCode", "");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12"
      dir="ltr"
    >
      <div className="space-y-8">
        <h1 className="text-3xl font-black text-gray-900">Checkout</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Shipping Address */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-bold text-lg text-gray-800">
                Shipping Address
              </label>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => router.push("/settings")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add / Manage Addresses
                </button>
              )}
            </div>

            {isLoadingAddresses ? (
              <div className="flex justify-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="animate-spin text-emerald-600 w-6 h-6" />
              </div>
            ) : addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const addrString = formatAddress(addr);
                  const isSelected =
                    form.watch("shippingAddress") === addrString;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        form.setValue("shippingAddress", addrString, {
                          shouldValidate: true,
                        });
                        setShippingAddress(addrString);
                      }}
                      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <p className="font-bold text-sm text-gray-900 truncate">
                            {addr.city || "Saved Address"}
                          </p>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed break-words">
                          {addrString}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Custom address override */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-gray-600 mb-1.5">
                    Or deliver to a custom address for this order:
                  </p>
                  <input
                    {...form.register("shippingAddress")}
                    onChange={(e) => {
                      form.setValue("shippingAddress", e.target.value, {
                        shouldValidate: true,
                      });
                      setShippingAddress(e.target.value);
                    }}
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    placeholder="Enter full custom delivery address..."
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-base">
                    No Saved Addresses Found
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    You don&apos;t have any delivery addresses saved yet. You can save one in your settings or enter it manually below.
                  </p>
                </div>
                <div className="pt-1 flex justify-center">
                  <Button
                    type="button"
                    onClick={() => router.push("/settings")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Address in Settings
                  </Button>
                </div>
                <div className="pt-4 border-t border-gray-100 text-left space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Or enter address manually for this order:
                  </label>
                  <input
                    {...form.register("shippingAddress")}
                    onChange={(e) => {
                      form.setValue("shippingAddress", e.target.value, {
                        shouldValidate: true,
                      });
                      setShippingAddress(e.target.value);
                    }}
                    className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                    placeholder="Enter full delivery address (Street, City, State, Country, Zip)"
                  />
                </div>
              </div>
            )}

            {form.formState.errors.shippingAddress && (
              <p className="text-red-500 text-sm font-semibold flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {form.formState.errors.shippingAddress.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <label className="font-bold text-lg text-gray-700">
              Select Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 1, label: "Credit Card", icon: "💳" },
                { id: 2, label: "Wallet", icon: "💰" },
                { id: 3, label: "Cash on Delivery", icon: "🚚" },
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => form.setValue("paymentMethod", method.id)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    form.watch("paymentMethod") === method.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">{method.icon}</div>
                  <div className="font-bold text-sm">{method.label}</div>
                </div>
              ))}
            </div>
            {form.formState.errors.paymentMethod && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* Promo Code Section */}
          <div className="space-y-4">
            <label className="font-bold text-lg text-gray-700 flex items-center gap-2">
              <Tag className="w-5 h-5" /> Promo Code
              <span className="text-sm font-normal text-gray-400 ml-1">
                (Optional)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                {...form.register("couponCode")}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 uppercase"
                placeholder="e.g. SAVE20"
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !form.watch("couponCode")}
                className="h-[50px] px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold"
              >
                {isApplyingCoupon ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            {form.formState.errors.couponCode && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.couponCode.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
              </>
            ) : (
              "Confirm Order"
            )}
          </Button>
        </form>
      </div>

      <div className="md:pt-16">
        <OrderSummary />
      </div>
    </div>
  );
}
