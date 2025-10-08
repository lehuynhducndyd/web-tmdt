// init databse
// config/seed.ts
import { Category } from "models/category";
import User from "../models/user";
import { Accessory, Phone, Variant } from "models/product";
import { CATEGORY_TYPES } from "config/constant";

const initDatabase = async () => {
    try {
        const count = await User.countDocuments();
        if (count > 0) {
            console.log(">>> Users already exist, skipping seed.");
        } else {
            const users = [
                {
                    name: "Admin User",
                    email: "admin@example.com",
                    password: "123456",
                    role: "admin",
                    phone: "0123456789",
                    street: "Đường 30/4",
                    province: "Thành phố Cần Thơ",
                    commune: "Ninh Kiều",
                },
                {
                    name: "Staff User",
                    email: "staff@example.com",
                    password: "123456",
                    role: "staff",
                    phone: "0987654321",
                    street: "Đường 30/4",
                    province: "Thành phố Cần Thơ",
                    commune: "Ninh Kiều",
                },
                {
                    name: "Customer User",
                    email: "customer@example.com",
                    password: "123456",
                    role: "customer",
                    phone: "0911222333",
                    street: "Đường 30/4",
                    province: "Thành phố Cần Thơ",
                    commune: "Ninh Kiều",
                },
            ];
            await User.insertMany(users);
            console.log(">>> Seeded users successfully");
        }


        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const categories = [
                { name: "Điện thoại", type: CATEGORY_TYPES[0], description: "Smartphone các hãng" },
                { name: "Tai nghe", type: CATEGORY_TYPES[1], description: "Tai nghe rất hay" },
                { name: "Cáp sạc", type: CATEGORY_TYPES[1], description: "Coi chừng cháy nhà" },
                { name: "Máy tính bảng", type: CATEGORY_TYPES[1], description: "Tablet not iPad" },
            ];
            await Category.insertMany(categories);
            console.log(">>> Seeded categories successfully");
        } else {
            console.log(">>> Categories already exist, skipping seed.");
        }
        let phones: any[] = [];
        const phoneCount = await Phone.countDocuments();
        if (phoneCount === 0) {
            const phoneCategory = await Category.findOne({ name: "Điện thoại" });

            phones = await Phone.insertMany([
                {
                    name: "iPhone 15 Pro",
                    brand: "Apple",
                    description: "Flagship phone with A17 Pro chip and titanium frame.",
                    category: phoneCategory._id,
                    specs: {
                        screen: "6.1 inch OLED",
                        cpu: "Apple A17 Pro",
                        battery: "3274 mAh",
                        camera: "48MP + 12MP + 12MP",
                        os: "iOS 17",
                    },
                    discount: 5,
                },
                {
                    name: "Samsung Galaxy S24 Ultra",
                    brand: "Samsung",
                    description: "Top-tier Android phone with S Pen support.",
                    category: phoneCategory._id,
                    specs: {
                        screen: "6.8 inch AMOLED 120Hz",
                        cpu: "Snapdragon 8 Gen 3",
                        battery: "5000 mAh",
                        camera: "200MP + 12MP + 10MP + 10MP",
                        os: "Android 14",
                    },
                    discount: 10,
                },
            ]);

            console.log(">>> Seeded phones successfully");
        } else {
            console.log(">>> Phones already exist, skipping seed.");
        }


        const variantCount = await Variant.countDocuments();
        if (variantCount === 0 && phones.length > 0) {
            const variants = [
                {
                    phoneId: phones[0]._id,
                    color: "Black Titanium",
                    storage: "256GB",
                    ram: "8GB",
                    price: 28990000,
                    stock: 12,
                    model3d: "",
                },
                {
                    phoneId: phones[0]._id,
                    color: "White Titanium",
                    storage: "512GB",
                    ram: "8GB",
                    price: 32990000,
                    stock: 7,
                    model3d: "",
                },
                {
                    phoneId: phones[1]._id,
                    color: "Phantom Black",
                    storage: "512GB",
                    ram: "12GB",
                    price: 30990000,
                    stock: 15,
                    model3d: "",
                },
                {
                    phoneId: phones[1]._id,
                    color: "Titanium Gray",
                    storage: "1TB",
                    ram: "12GB",
                    price: 35990000,
                    stock: 5,
                    model3d: "",
                },
            ];
            await Variant.insertMany(variants);
            console.log(">>> Seeded variants successfully");
        } else {
            console.log(">>> Variants already exist, skipping seed.");
        }

        // =====================================================
        // SEED ACCESSORIES
        // =====================================================
        const accessoryCount = await Accessory.countDocuments();
        if (accessoryCount === 0) {
            const accessoryCategory = await Category.findOne({ name: "Phụ kiện" });
            await Accessory.insertMany([
                {
                    name: "Apple AirPods Pro 2",
                    brand: "Apple",
                    category: accessoryCategory?._id,
                    description: "Wireless noise-canceling earbuds with MagSafe case.",
                    price: 5990000,
                    stock: 25,
                    discount: 10,
                },

                {
                    name: "Samsung 45W Charger",
                    brand: "Samsung",
                    category: accessoryCategory?._id,
                    description: "Super fast charging adapter with USB-C cable.",
                    price: 990000,
                    stock: 40,
                },
                {
                    name: "iPhone 15 Pro Case - Leather",
                    brand: "Apple",
                    category: accessoryCategory?._id,
                    description: "Premium leather case designed for iPhone 15 Pro.",
                    price: 1590000,
                    stock: 20,
                },
            ]);
            console.log(">>> Seeded accessories successfully");
        } else {
            console.log(">>> Accessories already exist, skipping seed.");
        }


    } catch (error) {
        console.error(">>> Error seeding users:", error);
    }
};

export default initDatabase;
