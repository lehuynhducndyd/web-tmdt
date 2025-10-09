import { Accessory, Device, Variant } from "models/product"

const getAllDevices = async () => {
    const devices = Device.find();
    return devices;
}

const getVariantByDeviceId = async (deviceId: string) => {
    const variants = await Variant.find({ deviceId }).lean();
    return variants;
};

const getAllAccessories = async () => {
    const accessories = await Accessory.find();
    return accessories;
}

const getDeviceById = async (id: string) => {
    const device = await Device.findById(id);
    return device;
}
const getAccessoryById = async (id: string) => {
    const accessory = await Accessory.findById(id);
    return accessory;
}
export { getAllDevices, getAllAccessories, getDeviceById, getVariantByDeviceId, getAccessoryById }