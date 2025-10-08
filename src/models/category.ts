import { CATEGORY_TYPES } from "config/constant";
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: CATEGORY_TYPES, default: CATEGORY_TYPES[0] },
  description: String
}, { timestamps: true });

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
const Brand = mongoose.model("Brand", brandSchema);

export { Category, Brand };
