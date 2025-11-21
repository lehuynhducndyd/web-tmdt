import { name } from "ejs";
import mongoose from "mongoose";
import { StringDecoder } from "string_decoder";

const orderItemSchema = new mongoose.Schema({
  productType: {
    type: String,
    required: true,
    enum: ['Device', 'Accessory']
  },
  // Tham chiếu động đến collection 'Device' hoặc 'Accessory' dựa trên productType
  product: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'productType' },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true }, // trỏ đến Product.variants._id
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  name: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "canceled"],
    default: "pending"
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "Bank", "MOMO"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    province: String,
    commune: String
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
