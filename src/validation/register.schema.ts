
import { isEmailExist } from "services/client/auth.service";
import * as z from "zod";
const passwordSchema = z.string()
    .min(3, "Password must be at least 3 characters long")
    .max(20, "Password must be at most 20 characters long")

const emailSchema =
    z.string().email("Invalid email address")
        .refine(async (email) => {
            const existingUser = await isEmailExist(email);
            return !existingUser;
        }, {
            message: "Email already in use",
            path: ["email"],
        });

const RegisterSchema = z.object({
    fullName: z.string().trim().min(1, { message: "Full name is required" }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type TRegisterSchema = z.infer<typeof RegisterSchema>;

export { RegisterSchema, TRegisterSchema };