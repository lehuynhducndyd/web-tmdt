// init databse
// config/seed.ts
import { Category } from "models/category";
import { Brand } from "models/brand";
import User from "../models/user";
import { AccessoriesVariant, Accessory, Device, Variant } from "models/product";
import { ACCOUNT_TYPE, CATEGORY_TYPES } from "config/constant";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const seedUsers = async () => {
    const count = await User.countDocuments();
    if (count > 0) {
        return;
    }

    const usersToCreate = [
        { name: "Admin User", email: "admin@example.com", password: "123456", role: "admin", phone: "0123456789", street: "Đường 30/4", province: "Thành phố Cần Thơ", commune: "Ninh Kiều", accountType: ACCOUNT_TYPE.SYSTEM },
        { name: "Staff User", email: "staff@example.com", password: "123456", role: "staff", phone: "0987654321", street: "Đường 30/4", province: "Thành phố Cần Thơ", commune: "Ninh Kiều", accountType: ACCOUNT_TYPE.SYSTEM },
        { name: "Customer User", email: "customer@example.com", password: "123456", role: "customer", phone: "0911222333", street: "Đường 30/4", province: "Thành phố Cần Thơ", commune: "Ninh Kiều", accountType: ACCOUNT_TYPE.SYSTEM },
    ];

    const hashedUsers = await Promise.all(
        usersToCreate.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
            return { ...user, password: hashedPassword };
        })
    );

    await User.insertMany(hashedUsers);
    console.log(">>> Seeded users successfully");
};

const seedCategories = async () => {
    const count = await Category.countDocuments();
    if (count > 0) {
        return;
    }

    const categories = [
        { name: "Điện thoại", type: CATEGORY_TYPES.DEVICE.value, description: "Smartphone các hãng" },
        { name: "Máy tính bảng", type: CATEGORY_TYPES.DEVICE.value, description: "Tablet not iPad" },
        { name: "Tai nghe", type: CATEGORY_TYPES.ACCESSORY.value, description: "Tai nghe rất hay" },
        { name: "Cáp sạc", type: CATEGORY_TYPES.ACCESSORY.value, description: "Coi chừng cháy nhà" },
    ];

    await Category.insertMany(categories);
    console.log(">>> Seeded categories successfully");
};

const seedBrands = async () => {
    const count = await Brand.countDocuments();
    if (count > 0) {
        return;
    }

    const brands = [
        { name: "Apple", description: "Thương hiệu công nghệ hàng đầu của Mỹ." },
        { name: "Samsung", description: "Tập đoàn đa quốc gia từ Hàn Quốc." },
        { name: "Xiaomi", description: "Thương hiệu smartphone và đồ gia dụng thông minh từ Trung Quốc." },
    ];

    await Brand.insertMany(brands);
    console.log(">>> Seeded brands successfully");
};

const seedProducts = async (categories: any[], brands: any[]) => {
    const deviceCount = await Device.countDocuments();
    if (deviceCount > 0) return;

    const phoneCategory = categories.find(c => c.name === "Điện thoại");
    const appleBrand = brands.find(b => b.name === "Apple");
    const samsungBrand = brands.find(b => b.name === "Samsung");

    if (!phoneCategory) return;

    const devicesToCreate = [
        { name: "iPhone 15 Pro", brand: appleBrand?._id, description: "Flagship phone with A17 Pro chip and titanium frame.", category: phoneCategory._id, specs: { screen: "6.1 inch OLED", cpu: "Apple A17 Pro", battery: "3274 mAh", camera: "48MP + 12MP + 12MP", os: "iOS 17" } },
        { name: "Samsung Galaxy S24 Ultra", brand: samsungBrand?._id, description: "Top-tier Android phone with S Pen support.", category: phoneCategory._id, specs: { screen: "6.8 inch AMOLED 120Hz", cpu: "Snapdragon 8 Gen 3", battery: "5000 mAh", camera: "200MP + 12MP + 10MP + 10MP", os: "Android 14" } },
    ];
    const createdDevices = await Device.insertMany(devicesToCreate);
    console.log(">>> Seeded devices successfully");

    const variantsToCreate = [
        { deviceId: createdDevices[0]?._id, color: "Black Titanium", storage: "256GB", ram: "8GB", price: 28990000, stock: 12 },
        { deviceId: createdDevices[0]?._id, color: "White Titanium", storage: "512GB", ram: "8GB", price: 32990000, stock: 7 },
        { deviceId: createdDevices[1]?._id, color: "Phantom Black", storage: "512GB", ram: "12GB", price: 30990000, stock: 15 },
        { deviceId: createdDevices[1]?._id, color: "Titanium Gray", storage: "1TB", ram: "12GB", price: 35990000, stock: 5 },
    ];
    await Variant.insertMany(variantsToCreate);
    console.log(">>> Seeded variants successfully");
};

const seedAccessories = async (categories: any[], brands: any[]) => {
    const accessoryCount = await Accessory.countDocuments();
    if (accessoryCount > 0) return;

    const headphoneCategory = categories.find(c => c.name === "Tai nghe");
    const chargerCategory = categories.find(c => c.name === "Cáp sạc");
    const appleBrand = brands.find(b => b.name === "Apple");
    const samsungBrand = brands.find(b => b.name === "Samsung");

    const accessoriesToCreate = [
        { name: "Apple AirPods Pro 2", brand: appleBrand?._id, category: headphoneCategory?._id, description: "Wireless noise-canceling earbuds with MagSafe case." },
        { name: "Samsung 45W Charger", brand: samsungBrand?._id, category: chargerCategory?._id, description: "Super fast charging adapter with USB-C cable." },
    ];
    const createdAccessories = await Accessory.insertMany(accessoriesToCreate);
    console.log(">>> Seeded accessories successfully");

    const accessoryVariantsToCreate = [
        { accessoryId: createdAccessories[0]?._id, color: "White", price: 5990000, stock: 25, discount: 10 },
        { accessoryId: createdAccessories[1]?._id, color: "Black", price: 990000, stock: 40 },
        { accessoryId: createdAccessories[1]?._id, color: "White", price: 990000, stock: 30 },
    ];
    await AccessoriesVariant.insertMany(accessoryVariantsToCreate);
    console.log(">>> Seeded accessory variants successfully");
};

const initDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        const brandCount = await Brand.countDocuments();
        const categoryCount = await Category.countDocuments();

        if (userCount > 0 || brandCount > 0 || categoryCount > 0) {
            console.log(">>> Database has already been seeded. Skipping.");
            return;
        }

        console.log(">>> Starting database seed...");

        await Promise.all([
            seedUsers(),
            seedBrands(),
            seedCategories(),
        ]);

        // Lấy dữ liệu vừa tạo để dùng cho các bước sau
        const [categories, brands] = await Promise.all([
            Category.find().lean(),
            Brand.find().lean(),
        ]);

        await Promise.all([
            seedProducts(categories, brands),
            seedAccessories(categories, brands),
        ]);

        console.log(">>> Database seeding completed successfully!");
    } catch (error) {
        console.error(">>> Error seeding database:", error);
    }
};

export default initDatabase;
