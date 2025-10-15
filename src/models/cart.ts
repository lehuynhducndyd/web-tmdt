import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
  accessory: { type: mongoose.Schema.Types.ObjectId, ref: "Accessory" },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true }, // trỏ đến Product.variants._id
  quantity: { type: Number, default: 1, min: 1 },
  priceAtAdd: { type: Number, required: true } // giá tại thời điểm thêm
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [cartItemSchema]
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
