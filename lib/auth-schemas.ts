import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userType: z.enum(["customer", "business_owner"]),
  phone: z.string().optional(),
  intendedBusinessName: z.string().optional(),
})

export const customerSignUpSchema = signUpSchema.extend({
  userType: z.literal("customer"),
  phone: z.string().optional(),
})

export const businessOwnerSignUpSchema = signUpSchema.extend({
  userType: z.literal("business_owner"),
  phone: z
    .string()
    .min(1, "Phone number is required for business owners")
    .regex(/^\+65\s?\d{4}\s?\d{4}$/, "Please enter a valid Singapore phone number (+65 XXXX XXXX)"),
  intendedBusinessName: z.string().optional(),
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type CustomerSignUpData = z.infer<typeof customerSignUpSchema>
export type BusinessOwnerSignUpData = z.infer<typeof businessOwnerSignUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
