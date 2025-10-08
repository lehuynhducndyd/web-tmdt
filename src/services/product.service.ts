import { Accessory, Phone, Variant } from "models/product"

const getAllPhones = async () => {
    const phones = Phone.find();
    return phones;
}

const getVariantByPhoneId = async (phoneId: string) => {
    const variants = await Variant.find({ phoneId }).lean();
    return variants;
};

const getAllAccessories = async () => {
    const accessories = await Accessory.find();
    return accessories;
}

const getPhoneById = async (id: string) => {
    const phone = await Phone.findById(id);
    return phone;
}
export { getAllPhones, getAllAccessories, getPhoneById, getVariantByPhoneId }