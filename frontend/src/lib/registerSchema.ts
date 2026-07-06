import * as z from "zod";

export interface RegisterFormValues {
  fullName: string;
  userName: string;
  email: string;
  password: string;
}

export const registerSchema = z.object({
  fullName: z.string().superRefine((val, ctx) => {
    if (!val || val.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Full name is required.",
      });
      return;
    }
    if (val.length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Full name must not exceed 100 characters.",
      });
      return;
    }
  }),
  userName: z.string().superRefine((val, ctx) => {
    if (!val || val.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username is required.",
      });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username can only contain letters, numbers, and underscores (_).",
      });
      return;
    }
    if (val.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username must be at least 5 characters.",
      });
      return;
    }
    if (val.length > 35) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username must not exceed 35 characters.",
      });
      return;
    }
  }),
  email: z.string().superRefine((val, ctx) => {
    if (!val || val.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email address is required.",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address.",
      });
      return;
    }
  }),
  password: z.string().superRefine((val, ctx) => {
    if (!val || val === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required.",
      });
      return;
    }
    if (val.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 6 characters.",
      });
      return;
    }
    const hasLowerCase = /[a-z]/.test(val);
    const hasUpperCase = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(val);
    if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
      return;
    }
  }),
});
