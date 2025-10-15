import mongoose from "mongoose";
import { ACCOUNT_TYPE } from "../config/constant";

// Người dùng chung (Admin, Nhân viên, Khách hàng)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
  accountType: {
    type: String,
    enum: Object.values(ACCOUNT_TYPE),
    default: ACCOUNT_TYPE.SYSTEM,
  },
  phone: String,
  street: { type: String, required: true },
  province: String,
  commune: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model("user", userSchema);

export default User;