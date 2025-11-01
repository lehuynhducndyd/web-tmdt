import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  // Xác định loại sản phẩm là 'Device' hay 'Accessory'
  productType: {
    type: String,
    required: true,
    enum: ['Device', 'Accessory']
  },
  // Tham chiếu động đến collection 'Device' hoặc 'Accessory' dựa trên productType
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'items.productType'
  },
  variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, default: 1, min: 1 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [cartItemSchema],
  sum: { type: Number, default: 0 },
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
