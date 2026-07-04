import { create } from "zustand";

// 1. ضفنا واجهة للمنتجات عشان تكون الـ Types سليمة
export interface CheckoutItem {
  id: string; // أو productId حسب الباك إند
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

interface CheckoutData {
  shippingAddress: string;
  paymentMethod: number;
  couponCode?: string;
  affiliateCode?: string;
  pointsToRedeem: number;
}

interface CheckoutStore {
  // بيانات الفورم
  checkoutData: CheckoutData;
  setShippingAddress: (address: string) => void;
  setPaymentMethod: (method: number) => void;
  setCoupon: (code: string) => void;
  setPoints: (points: number) => void;

  // بيانات ملخص الطلب (المنتجات والأسعار)
  items: CheckoutItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  setOrderSummary: (
    items: CheckoutItem[],
    subtotal: number,
    shippingFee: number,
    total: number,
  ) => void;

  // تفريغ الستور
  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  checkoutData: {
    shippingAddress: "",
    paymentMethod: 1,
    couponCode: "",
    affiliateCode: "",
    pointsToRedeem: 0,
  },

  // القيم الافتراضية للملخص
  items: [],
  subtotal: 0,
  shippingFee: 0,
  total: 0,

  setShippingAddress: (shippingAddress) =>
    set((state) => ({
      checkoutData: { ...state.checkoutData, shippingAddress },
    })),
  setPaymentMethod: (paymentMethod) =>
    set((state) => ({
      checkoutData: { ...state.checkoutData, paymentMethod },
    })),
  setCoupon: (couponCode) =>
    set((state) => ({ checkoutData: { ...state.checkoutData, couponCode } })),
  setPoints: (pointsToRedeem) =>
    set((state) => ({
      checkoutData: { ...state.checkoutData, pointsToRedeem },
    })),

  // دالة جديدة لحفظ السلة لما تجيبها من السيرفر
  setOrderSummary: (items, subtotal, shippingFee, total) =>
    set({ items, subtotal, shippingFee, total }),

  resetCheckout: () =>
    set({
      checkoutData: {
        shippingAddress: "",
        paymentMethod: 1,
        couponCode: "",
        affiliateCode: "",
        pointsToRedeem: 0,
      },
      items: [],
      subtotal: 0,
      shippingFee: 0,
      total: 0,
    }),
}));
