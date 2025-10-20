
import { isEmailExist } from "services/client/auth.service";
import * as z from "zod";
const passwordSchema = z.string()
    .min(3, "Mật khẩu tối thiểu 3 ký tự")
    .max(20, "Mật khẩu tối đa 20 ký tự")

const emailSchema =
    z.string().email("Email không hợp lệ")
        .refine(async (email) => {
            const existingUser = await isEmailExist(email);
            return !existingUser;
        }, {
            message: "Email đã tồn tại, hãy thử email khác hoặc đăng nhập bằng google",
            path: ["email"],
        });

const RegisterSchema = z.object({
    name: z.string().trim().min(1, { message: "Tên không được để trống" }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords không khớp",
    path: ["confirmPassword"],
});

type TRegisterSchema = z.infer<typeof RegisterSchema>;

export { RegisterSchema, TRegisterSchema };