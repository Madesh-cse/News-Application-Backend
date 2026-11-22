import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must not exceed 72 UTF-8 bytes"
  )
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Validate a user schema
export const registerUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    password: passwordSchema,
  })
  .strict();

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

// Login validation
export const loginUserSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),

    password: z
      .string()
      .min(1, "Password is required"),
  })
  .strict();


export type LoginUserInput = z.infer<typeof loginUserSchema>;


export const updateUserProfileSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  profileImage: z.string()
    .url("Please provide a valid profile image URL")
    .optional()
    .nullable(),
})
.strict()
.refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required"
);

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;


// Validate the password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),

  newPassword: passwordSchema,

  confirmPassword: z.string().min(1, "Confirm password is required"),
})
.strict()
.refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  }
)
.refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: "New password must be different from current password",
    path: ["newPassword"],
  }
);

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;