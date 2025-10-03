// models/product.ts
import mongoose from "mongoose";

/** Schema chung cho ảnh */
const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String
}, { _id: false });

/** Schema cho variant (dành cho điện thoại) */
const variantSchema = new mongoose.Schema({
  color: String,
  storage: String,
  price: Number,
  stock: Number
}, { _id: false });

/** Specs cho điện thoại */
const phoneSpecSchema = new mongoose.Schema({
  screen: String,
  cpu: String,
  ram: String,
  battery: String,
  camera: String,
  os: String
}, { _id: false });

/** Schema điện thoại */
const phoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  thumbnail: imageSchema,
  images: [imageSchema],
  model3d: String,

  description: String,
  specs: phoneSpecSchema,
  variants: [variantSchema],

  discount: { type: Number, default: 0 }
}, { timestamps: true });

/** Schema phụ kiện */
const accessorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  thumbnail: imageSchema,
  images: [imageSchema],

  description: String,
  price: Number,
  stock: Number,
  discount: { type: Number, default: 0 }
}, { timestamps: true });

/** Models */
const Phone = mongoose.model("Phone", phoneSchema);
const Accessory = mongoose.model("Accessory", accessorySchema);

export { Phone, Accessory };
