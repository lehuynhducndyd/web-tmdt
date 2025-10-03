import mongoose from "mongoose";

// Người dùng chung (Admin, Nhân viên, Khách hàng)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
  phone: String,
  street: { type: String, required: true },
  province: String,
  commune: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model("user", userSchema);

export default User;