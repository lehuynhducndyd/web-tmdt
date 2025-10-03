// init databse
// config/seed.ts
import Category from "models/category";
import User from "../models/user";
import { Accessory, Phone } from "models/product";

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
                { name: "Laptop", description: "Các dòng laptop mới nhất" },
                { name: "Điện thoại", description: "Smartphone các hãng" },
                { name: "Phụ kiện", description: "Chuột, bàn phím, tai nghe..." },
            ];
            await Category.insertMany(categories);
            console.log(">>> Seeded categories successfully");
        } else {
            console.log(">>> Categories already exist, skipping seed.");
        }

        const phoneCount = await Phone.countDocuments();
        if (phoneCount === 0) {
            const phoneCategory = await Category.findOne({ name: "Điện thoại" });

            const phones = [
                {
                    name: "iPhone 15 Pro Max",
                    brand: "Apple",
                    category: phoneCategory?._id,
                    description: "Flagship mới nhất của Apple",
                    specs: {
                        screen: "6.7 inch OLED 120Hz",
                        cpu: "Apple A17 Pro",
                        ram: "8GB",
                        battery: "4500mAh",
                        camera: "48MP + 12MP",
                        os: "iOS 17"
                    },
                    variants: [
                        { color: "Black Titanium", storage: "256GB", price: 34990000, stock: 20 },
                        { color: "Natural Titanium", storage: "512GB", price: 39990000, stock: 10 }
                    ],
                    discount: 5
                },
                {
                    name: "Samsung Galaxy S24 Ultra",
                    brand: "Samsung",
                    category: phoneCategory?._id,
                    description: "Siêu phẩm flagship của Samsung",
                    specs: {
                        screen: "6.8 inch AMOLED 120Hz",
                        cpu: "Snapdragon 8 Gen 3",
                        ram: "12GB",
                        battery: "5000mAh",
                        camera: "200MP + 12MP",
                        os: "Android 14"
                    },
                    variants: [
                        { color: "Gray", storage: "256GB", price: 32990000, stock: 15 },
                        { color: "Violet", storage: "512GB", price: 37990000, stock: 8 }
                    ],
                    discount: 0
                }
            ];

            await Phone.insertMany(phones);
            console.log(">>> Seeded phones successfully");
        } else {
            console.log(">>> Phones already exist, skipping seed.");
        }

        // --- Seed Accessory ---
        const accessoryCount = await Accessory.countDocuments();
        if (accessoryCount === 0) {
            const accessoryCategory = await Category.findOne({ name: "Phụ kiện" });

            const accessories = [
                {
                    name: "Tai nghe Bluetooth Sony WH-1000XM5",
                    brand: "Sony",
                    category: accessoryCategory?._id,
                    description: "Tai nghe chống ồn cao cấp",
                    price: 7990000,
                    stock: 30,
                    discount: 10
                },
                {
                    name: "Sạc nhanh 65W Anker",
                    brand: "Anker",
                    category: accessoryCategory?._id,
                    description: "Sạc nhanh Power Delivery 65W hỗ trợ nhiều thiết bị",
                    price: 1290000,
                    stock: 50,
                    discount: 0
                }
            ];

            await Accessory.insertMany(accessories);
            console.log(">>> Seeded accessories successfully");
        } else {
            console.log(">>> Accessories already exist, skipping seed.");
        }

    } catch (error) {
        console.error(">>> Error seeding users:", error);
    }
};

export default initDatabase;
