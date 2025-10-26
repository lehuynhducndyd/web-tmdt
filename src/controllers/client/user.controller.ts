import { Request, Response } from 'express';
import { Device, Variant, AccessoriesVariant, Accessory } from 'models/product';
import { Category } from 'models/category';
import Cart from 'models/cart';
import { getDeviceById } from 'services/admin/product.service';

const getHomePage = async (req: Request, res: Response) => {
    try {
        let latestDevices = await Device.find()
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất trước
            .limit(10) // Giới hạn 10 sản phẩm
            .populate('brand category') // Lấy thêm thông tin brand và category
            .lean();

        // Tối ưu: Lấy tất cả variants cho các devices trên bằng một query duy nhất
        const deviceIds = latestDevices.map(d => d._id);
        const allVariants = await Variant.find({ deviceId: { $in: deviceIds } }).sort({ price: 1 }).lean();

        // Nhóm các variants theo deviceId
        const variantsByDeviceId = allVariants.reduce((acc, variant) => {
            const deviceId = variant.deviceId.toString();
            if (!acc[deviceId]) {
                acc[deviceId] = [];
            }
            acc[deviceId].push(variant);
            return acc;
        }, {} as Record<string, any[]>);

        // Gán variants và giá vào mỗi device
        latestDevices.forEach(device => {
            const deviceId = device._id.toString();
            const variants = variantsByDeviceId[deviceId] || [];
            (device as any).variants = variants;
            (device as any).price = variants.length > 0 ? variants[0].price : 0;
        });

        return res.render("client/home/show.ejs", {
            products: latestDevices
        });

    } catch (error) {
        console.error("Error getting home page:", error);
        res.status(500).send("Error loading home page");
    }
}

const getShopPage = async (req: Request, res: Response) => {
  try {
    let products = await Device.find().populate('brand category').lean();
    const categories = await Category.find().lean();

    // Lấy variant và giá thấp nhất cho mỗi sản phẩm (tương tự getHomePage)
    const deviceIds = products.map(p => p._id);
    const allVariants = await Variant.find({ deviceId: { $in: deviceIds } }).sort({ price: 1 }).lean();
    const variantsByDeviceId = allVariants.reduce((acc, variant) => {
        const deviceId = variant.deviceId.toString();
        if (!acc[deviceId]) acc[deviceId] = [];
        acc[deviceId].push(variant);
        return acc;
    }, {} as Record<string, any[]>);

    products.forEach(product => {
        const variants = variantsByDeviceId[product._id.toString()] || [];
        (product as any).variants = variants;
        (product as any).price = variants.length > 0 ? variants[0].price : 0;
    });

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

const getShopDetailPage = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const product = await Device.findById(id).populate('brand category').lean();

        if (!product) {
            return res.status(404).send("Product not found");
        }

        const variants = await Variant.find({ deviceId: id }).sort({ price: 1 }).lean();

        // Lấy sản phẩm cùng hãng
        const relatedProducts = await Device.find({
            brand: product.brand,
            _id: { $ne: id } // Loại trừ sản phẩm hiện tại
        }).limit(4).populate('brand category').lean({ virtuals: true });

        // Lấy variants cho các sản phẩm liên quan
        const relatedProductIds = relatedProducts.map(p => p._id);
        const allRelatedVariants = await Variant.find({ deviceId: { $in: relatedProductIds } }).sort({ price: 1 }).lean();
        const variantsByRelatedDeviceId = allRelatedVariants.reduce((acc, variant) => {
            const deviceId = variant.deviceId.toString();
            if (!acc[deviceId]) acc[deviceId] = [];
            acc[deviceId].push(variant);
            return acc;
        }, {} as Record<string, any[]>);

        relatedProducts.forEach(p => {
            const variants = variantsByRelatedDeviceId[p._id.toString()] || [];
            (p as any).price = variants.length > 0 ? variants[0].price : 0;
        });

        res.render("client/home/shop-detail.ejs", {
            product,
            variants,
            relatedProducts
        });
    } catch (error) {
        console.error("Error getting shop detail page:", error);
        res.status(500).send("Error loading shop detail page");
    }
};

// const getCartPage = async (req: Request, res: Response) => {
//     try {
//         const user = req.user as any;
//         if (!user) {
//             // Nếu người dùng chưa đăng nhập, có thể chuyển hướng đến trang đăng nhập
//             // hoặc hiển thị giỏ hàng trống/giỏ hàng từ session
//             return res.render("client/home/cart.ejs", {
//                 cartItems: [],
//                 subtotal: (0).toFixed(2),
//                 shippingFee: (0).toFixed(2),
//                 total: (0).toFixed(2),
//             });
//         }

//         // 1. Lấy giỏ hàng của người dùng từ DB
//         const cart = await Cart.findOne({ user: user._id })
//             .populate({
//                 path: 'items.device',
//                 model: 'Device'
//             })
//             .populate({
//                 path: 'items.accessory',
//                 model: 'Accessory'
//             })
//             .lean();

//         const cartItems = cart ? cart.items : [];
//         const subtotal = cartItems.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);

//         // 3. Định nghĩa các phí khác (có thể thay đổi dựa trên logic nghiệp vụ)
//         const shippingFee = subtotal > 0 ? 3.00 : 0;
//         const total = subtotal + shippingFee;

//         return res.render("client/home/cart.ejs", {
//             cartItems: cartItems,
//             subtotal: subtotal.toFixed(2), // Làm tròn 2 chữ số
//             shippingFee: shippingFee.toFixed(2),
//             total: total.toFixed(2),
//             // Bạn có thể thêm các biến khác như mã giảm giá, v.v.
//         });
//     } catch (error) {
//         console.error("Error getting cart page:", error);
//         res.status(500).send("Error loading cart page");
//     }
// }

export {
    getHomePage,
    getShopPage,
    getShopDetailPage,
    // getCartPage
};