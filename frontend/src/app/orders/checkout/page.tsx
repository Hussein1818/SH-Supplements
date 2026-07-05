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
import { Loader2, MapPin, Tag } from "lucide-react";
import { useAuthStore } from "@/src/components/store/authStore";

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

  const formatAddress = (addr: Address) =>
    `${addr.street}, ${addr.city}, ${addr.state}, ${addr.zipCode}, ${addr.country}`;

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
          id: item.productId,
          name: item.productName,
          imageUrl: item.productImageUrl,
          quantity: item.quantity,
          price: item.unitPrice,
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
        const fetchedAddresses: Address[] = response.data || [];
        const sortedAddresses = fetchedAddresses.sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
        );

        setAddresses(sortedAddresses);
        const defaultAddress = sortedAddresses.find((a) => a.isDefault);
        if (defaultAddress && !form.getValues("shippingAddress")) {
          form.setValue("shippingAddress", formatAddress(defaultAddress));
        }
      } catch (error) {
        toast.error("Failed to load addresses.");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [form]);

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
          window.location.href = paymentResponse.data.paymentUrl;
          return;
        } else {
          toast.error("Payment initiation failed. No URL returned.");
          return;
        }
      }
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
            <label className="font-bold text-lg text-gray-700">
              Shipping Address
            </label>

            {isLoadingAddresses ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-emerald-600" />
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
                      onClick={() =>
                        form.setValue("shippingAddress", addrString)
                      }
                      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 mt-0.5 ${
                          isSelected ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-sm text-gray-900">
                            {addr.city}
                          </p>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addrString}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <input
                {...form.register("shippingAddress")}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                placeholder="Enter your full address manually"
              />
            )}

            {form.formState.errors.shippingAddress && (
              <p className="text-red-500 text-sm">
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
