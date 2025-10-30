
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  description: String
}, { timestamps: true });


const Category = mongoose.model("Category", categorySchema);


export { Category };
