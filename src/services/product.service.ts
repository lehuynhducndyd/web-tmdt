import { Accessory, Phone } from "models/product"

const getAllPhones = async () => {
    const phones = Phone.find();
    return phones;
}

const getAllAccessories = async () => {
    const accessories = await Accessory.find();
    return accessories;
}

const getPhoneById = async (id: string) => {
    const phone = await Phone.findById(id);
    return phone;
}
export { getAllPhones, getAllAccessories, getPhoneById }