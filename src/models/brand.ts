import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    data: Buffer,
    contentType: String,
}, { _id: false });

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    logo: imageSchema
}, { timestamps: true });
const Brand = mongoose.model("Brand", brandSchema);

export { Brand };