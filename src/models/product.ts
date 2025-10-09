import mongoose from "mongoose";

/** Schema chung cho ảnh */
const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
}, { _id: false });

/** Specs cho thiết bị */
const deviceSpecSchema = new mongoose.Schema({
  screen: String,
  cpu: String,
  battery: String,
  camera: String,
  os: String,
}, { _id: false });

/** Schema thiết bị */
const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  thumbnail: imageSchema,
  images: [imageSchema],
  description: String,
  specs: deviceSpecSchema,
}, { timestamps: true });

/** Schema Variant (đối tượng riêng, có deviceId) */
const variantSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
  color: String,
  discount: { type: Number, default: 0 },
  model3d: String,
  storage: String,
  ram: String,
  price: Number,
  stock: Number,
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
  discount: { type: Number, default: 0 },
}, { timestamps: true });

/** Models */
const Device = mongoose.model("Device", deviceSchema);
const Variant = mongoose.model("Variant", variantSchema);
const Accessory = mongoose.model("Accessory", accessorySchema);

export { Device, Variant, Accessory };