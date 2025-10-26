import { Request, Response } from 'express';
import { get } from 'http'; 
import { Device, Variant } from 'models/product';

const getHomePage = async (req: Request, res: Response) => {
    const user = req.user as any;
    console.log(user);
    try {
        let latestDevices = await Device.find()
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất trước
            .limit(10) // Giới hạn 10 sản phẩm
            .populate('brand category') // Lấy thêm thông tin brand và category
            .lean(); // Sử dụng lean() để có object JS thuần, dễ dàng chỉnh sửa

        // Lấy variant cho mỗi device
        for (let i = 0; i < latestDevices.length; i++) {
            const variants = await Variant.find({ deviceId: latestDevices[i]._id }).sort({ price: 1 }).lean();
            // Gán mảng variants và giá thấp nhất vào device
            (latestDevices[i] as any).variants = variants;
            (latestDevices[i] as any).price = variants.length > 0 ? variants[0].price : 0;
        }

        return res.render("client/home/show.ejs", {
            products: latestDevices
        });

    } catch (error) {
        console.error("Error getting home page:", error);
        res.status(500).send("Error loading home page");
    }
}

export { getHomePage };

const getShopPage = async (req: Request, res: Response) => {
  try {
    const products = await   Device.find(); // hoặc logic phân trang/lọc
    const categories = ["Apples","Oranges","Strawberry","Banana","Pumpkin"]; 
    const pagination = {
      current: 1,
      pages: [1,2,3],
      next: 2,
      prev: null
    };

    return res.render("client/home/shop.ejs", {
      products,
      categories,
      pagination
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

export { getShopPage };

const getShopDetailPage = async (req: Request, res: Response) => {
try {
        // 1. Lấy ID sản phẩm từ URL
        const productId = req.params.id;
        const device = await Device.findById(productId)
            .populate('brand category')
            .lean();

        if (!device) {
            return res.status(404).send("No product found in database to display static detail page.");
        }

        // 2. Tìm kiếm tất cả các biến thể (Variant) của thiết bị mẫu đó
        const variants = await Variant.find({ deviceId: device._id })
            .sort({ price: 1 })
            .lean();

        // 3. Gán variants vào device object và xác định giá thấp nhất
        (device as any).variants = variants;
        (device as any).price = variants.length > 0 ? variants[0].price : 0;

        // 4. Lấy một số thiết bị liên quan (ví dụ: cùng Category)
        const relatedDevices = await Device.find({
            category: device.category,
            _id: { $ne: device._id } // Loại trừ sản phẩm hiện tại
        })
            .limit(4) // Giới hạn 4 sản phẩm liên quan
            .populate('brand category')
            .lean();

        // 5. Lấy variants và giá cho các thiết bị liên quan
        for (const relatedDevice of relatedDevices) {
            const relatedVariants = await Variant.find({ deviceId: relatedDevice._id }).sort({ price: 1 }).lean();
            (relatedDevice as any).variants = relatedVariants;
            (relatedDevice as any).price = relatedVariants.length > 0 ? relatedVariants[0].price : 0;
        }

        // 6. Render trang chi tiết sản phẩm tĩnh
        return res.render("client/home/shop_detail.ejs", {
            product: device, // Truyền sản phẩm mẫu
            relatedProducts: relatedDevices
        });

    } catch (error) {
        console.error("Error getting static shop detail page:", error);
        res.status(500).send("Error loading static product detail page");
    }
}

export { getShopDetailPage };

const getCartPage = async (req: Request, res: Response) => {
    try {
        // --- Logic Controller cho Trang Giỏ Hàng ---

        // 1. Dữ liệu giỏ hàng mẫu (Mô phỏng dữ liệu thực tế từ Session/DB)
        const cartItems = [
            {
                // Giả định: các trường cơ bản cần thiết cho giỏ hàng
                image: 'img/vegetable-item-3.png',
                name: 'Big Banana',
                price: 2.99,
                quantity: 1,
                total: 2.99,
            },
            {
                image: 'img/vegetable-item-5.jpg',
                name: 'Potatoes',
                price: 2.99,
                quantity: 1,
                total: 2.99,
            },
            {
                image: 'img/vegetable-item-2.jpg',
                name: 'Awesome Brocoli',
                price: 2.99,
                quantity: 1,
                total: 2.99,
            },
        ];

        // 2. Tính toán tổng phụ (Subtotal)
        const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);

        // 3. Định nghĩa các phí khác
        const shippingFee = 3.00; // Phí vận chuyển mẫu
        const total = subtotal + shippingFee;

        // 4. Render View
        return res.render("client/home/cart.ejs", {
            cartItems: cartItems,
            subtotal: subtotal.toFixed(2), // Làm tròn 2 chữ số
            shippingFee: shippingFee.toFixed(2),
            total: total.toFixed(2),
            // Bạn có thể thêm các biến khác như mã giảm giá, v.v.
        });
    } catch (error) {
        console.error("Error getting cart page:", error);
        res.status(500).send("Error loading cart page");
    }
}

export { getCartPage }; // Thêm vào dòng export cuối cùng