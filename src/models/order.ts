import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true }, // trỏ đến Product.variants._id
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // nhân viên xử lý đơn
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "canceled"],
    default: "pending"
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "Bank", "E-wallet"],
    required: true
  },

  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    province: String,
    village: String
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
