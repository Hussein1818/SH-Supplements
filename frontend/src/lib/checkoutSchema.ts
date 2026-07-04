import * as z from "zod";

export const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, { message: "Address is too short" }),
  paymentMethod: z.number().refine((val) => [1, 2, 3].includes(val), {
    message: "Please select a valid payment method",
  }),
  couponCode: z.string().optional(),
  affiliateCode: z.string().optional(),
  pointsToRedeem: z.number().int().nonnegative().default(0),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
