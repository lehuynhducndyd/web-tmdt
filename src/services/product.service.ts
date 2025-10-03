import { Accessory, Phone } from "models/product"

const getAllPhones = async () => {
    const phones = Phone.find();
    return phones;
}

const getAllAccessories = async () => {
    const accessories = await Accessory.find();
    return accessories;
}

export { getAllPhones, getAllAccessories }