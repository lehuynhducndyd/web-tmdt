import { Request, Response } from 'express';
import { Device, Variant, AccessoriesVariant, Accessory } from 'models/product';
import { Category } from 'models/category';
import User from 'models/user';
import Cart from 'models/cart';
import { getDeviceById } from 'services/admin/product.service';
import { getUserById } from 'services/admin/user.service';
import { ReviewDevice, ReviewAcc } from 'models/review';
import { ca } from 'zod/v4/locales';

// Helper function to process variants and assign prices
const processProductVariants = async (products: any[], variantModel: any, productIdField: string) => {
    const productIds = products.map(p => p._id);
    if (productIds.length === 0) return products;

    const allVariants = await variantModel.find({ [productIdField]: { $in: productIds } }).sort({ price: 1 }).lean();

    const variantsByProductId = allVariants.reduce((acc: Record<string, any[]>, variant: any) => {
        const id = variant[productIdField].toString();
        if (!acc[id]) acc[id] = [];
        acc[id].push(variant);
        return acc;
    }, {});

    products.forEach(p => {
        const productVariants = variantsByProductId[p._id.toString()] || [];
        if (productVariants.length > 0) {
            const lowestPriceVariant = productVariants[0];
            const discount = lowestPriceVariant.discount || 0;
            (p as any).originalPrice = lowestPriceVariant.price;
            (p as any).price = lowestPriceVariant.price * (1 - discount / 100);
            (p as any).hasDiscount = discount > 0;
        } else {
            (p as any).price = 0;
        }
    });
    return products;
};


const getHomePage = async (req: Request, res: Response) => {
    try {
        let latestDevices = await Device.find()
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất trước
            .limit(10) // Giới hạn 10 sản phẩm
            .populate('brand category') // Lấy thêm thông tin brand và category
            .lean();

        // Phân loại thiết bị: điện thoại và các thiết bị khác (máy tính bảng,...)
        const phones = latestDevices.filter(d => (d.category as any)?.name === 'Điện thoại');
        const otherDevices = latestDevices.filter(d => (d.category as any)?.name !== 'Điện thoại');

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
            (device as any).variants = variants; // Gán variants để có thể dùng ở nơi khác nếu cần
            if (variants.length > 0) {
                const lowestPriceVariant = variants[0];
                const discount = lowestPriceVariant.discount || 0;
                (device as any).originalPrice = lowestPriceVariant.price;
                (device as any).price = lowestPriceVariant.price * (1 - discount / 100);
                (device as any).hasDiscount = discount > 0;
            } else {
                (device as any).price = 0;
            }
        });

        // Lấy phụ kiện mới nhất
        let latestAccessories = await Accessory.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('brand category')
            .lean();

        // Lấy variants và giá thấp nhất cho phụ kiện
        const accessoryIds = latestAccessories.map(a => a._id);
        const allAccessoryVariants = await AccessoriesVariant.find({ accessoryId: { $in: accessoryIds } }).sort({ price: 1 }).lean();

        const variantsByAccessoryId = allAccessoryVariants.reduce((acc, variant) => {
            const accessoryId = variant.accessoryId.toString();
            if (!acc[accessoryId]) {
                acc[accessoryId] = [];
            }
            acc[accessoryId].push(variant);
            return acc;
        }, {} as Record<string, any[]>);

        latestAccessories.forEach(accessory => {
            const variants = variantsByAccessoryId[accessory._id.toString()] || [];
            if (variants.length > 0) {
                const lowestPriceVariant = variants[0];
                const discount = lowestPriceVariant.discount || 0;
                (accessory as any).originalPrice = lowestPriceVariant.price;
                (accessory as any).price = lowestPriceVariant.price * (1 - discount / 100);
                (accessory as any).hasDiscount = discount > 0;
            } else {
                (accessory as any).price = 0;
            }
        });

        return res.render("client/home/show.ejs", {
            products: phones, // Chỉ truyền điện thoại vào biến products
            accessories: latestAccessories,
            otherDevices: otherDevices // Truyền các thiết bị khác vào biến mới
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
            (product as any).variants = variants; // Gán variants để có thể dùng ở nơi khác nếu cần
            if (variants.length > 0) {
                const lowestPriceVariant = variants[0];
                const discount = lowestPriceVariant.discount || 0;
                (product as any).originalPrice = lowestPriceVariant.price;
                (product as any).price = lowestPriceVariant.price * (1 - discount / 100);
                (product as any).hasDiscount = discount > 0;
            } else {
                (product as any).price = 0;
            }
        });

        const pagination = {
            current: 1,
            pages: [1, 2, 3],
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
        let product: any = null;
        let variants: any[] = [];
        let reviews: any[] = [];
        let relatedProducts: any[] = [];
        let isDevice = false;

        // Try to find as Device
        product = await Device.findById(id).populate('brand category').lean();
        if (product) {
            isDevice = true;
        } else {
            // If not a Device, try to find as Accessory
            product = await Accessory.findById(id).populate('brand category').lean();
        }

        if (!product) {
            return res.status(404).send("Product not found");
        }

        if (isDevice) {
            variants = await Variant.find({ deviceId: id }).sort({ price: 1 }).lean();
            reviews = await ReviewDevice.find({ product: id })
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .lean();

            relatedProducts = await Device.find({
                brand: product.brand,
                _id: { $ne: id }
            }).limit(4).populate('brand category').lean({ virtuals: true });

            relatedProducts = await processProductVariants(relatedProducts, Variant, 'deviceId');

        } else { // It's an Accessory
            variants = await AccessoriesVariant.find({ accessoryId: id }).sort({ price: 1 }).lean();
            reviews = await ReviewAcc.find({ product: id })
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .lean();

            relatedProducts = await Accessory.find({
                brand: product.brand,
                _id: { $ne: id }
            }).limit(4).populate('brand category').lean({ virtuals: true });

            relatedProducts = await processProductVariants(relatedProducts, AccessoriesVariant, 'accessoryId');
        }

        // Tính giá ban đầu (sau giảm giá) để hiển thị
        if (variants.length > 0) {
            const firstVariant = variants[0];
            const discount = firstVariant.discount || 0;
            (product as any).originalPrice = firstVariant.price;
            (product as any).price = firstVariant.price * (1 - discount / 100);
            (product as any).hasDiscount = discount > 0;
        } else {
            (product as any).originalPrice = 0;
            (product as any).price = 0;
            (product as any).hasDiscount = false;
        }

        res.render("client/home/shop-detail.ejs", {
            product,
            variants,
            relatedProducts,
            reviews,
            isDevice
        });
    } catch (error) {
        console.error("Error getting shop detail page:", error);
        res.status(500).send("Error loading shop detail page");
    }
};

const postCreateReview = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const user = req.user as any;
        const { rating, comment } = req.body;

        if (!user) {
            return res.status(401).send("Bạn cần đăng nhập để bình luận.");
        }

        // Determine if it's a Device or an Accessory
        let product = await Device.findById(productId);
        let reviewModel;

        if (product) {
            reviewModel = ReviewDevice;
        } else {
            product = await Accessory.findById(productId);
            if (product) {
                reviewModel = ReviewAcc;
            } else {
                return res.status(404).send("Product not found for review.");
            }
        }

        const newReview = new reviewModel({
            product: productId,
            user: user._id,
            rating: Number(rating),
            comment: comment
        });

        await newReview.save();
        res.redirect(`/shop-detail/${productId}`);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).send("Lỗi khi tạo bình luận.");
    }
};


const getUserInfoPage = async (req: Request, res: Response) => {
    const currentUser = req.user as any;
    if (!currentUser) {
        return res.redirect('/login');
    }
    const user = await getUserById(currentUser._id);
    res.render('client/home/user-info.ejs', { userInfo: user });

}

const postUpdateUserInfo = async (req: Request, res: Response) => {
    try {
        let { id, name, email, password, phone, province, commune, street } = req.body;
        console.log(req.body);

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }
        if (!email) {
            email = user.email;
        }

        // Chỉ cập nhật mật khẩu nếu người dùng nhập mật khẩu mới
        if (password && password.trim() !== '') {
            user.password = password; // This was a typo `sword`
        }

        // Cập nhật các trường khác
        user.email = email;
        user.name = name;
        user.phone = phone;
        user.province = province;
        user.commune = commune;
        user.street = street;

        await user.save(); // Using save() without options will validate all required fields.
        res.redirect('/user-info');
    } catch (error) {
        console.error("Error updating user info:", error);
        res.status(500).send("Error updating user information.");
    }
}

const postAddProductToCart = async (req: Request, res: Response) => {
    try {
        let message = '';
        const user = req.user as any;
        if (!user) {
            return res.redirect('/login');
        }
        // 1. Tìm giỏ hàng của người dùng, nếu chưa có thì tạo mới
        let cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            cart = new Cart({ user: user._id, items: [] });
        }

        const { productId, variantId, quantity, productType } = req.body;

        if (!productId || !variantId || !quantity || !productType) {
            message = "Lỗi nội bộ!"
            return res.render("status/500.ejs")
        }

        // 2. Tìm biến thể và giá sản phẩm
        let variant;
        if (productType === 'Device') {
            variant = await Variant.findById(variantId);
        } else if (productType === 'Accessory') {
            variant = await AccessoriesVariant.findById(variantId);
        }

        if (!variant) {
            message = "Không tồn tại sản phẩm!"
            return res.render("status/404.ejs")
        }



        // 3. Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cart.items.find(item =>
            item.product.toString() === productId && item.variantId.toString() === variantId
        );

        if (existingItem) {
            // Nếu có, cập nhật số lượng
            existingItem.quantity += Number(quantity);
        } else {
            // Nếu chưa, thêm sản phẩm mới vào giỏ
            cart.items.push({ productType, product: productId, variantId, quantity: Number(quantity) });
            cart.sum += 1;
        }

        await cart.save();
        message = "Thêm vào giỏ hàng thành công!"
        return res.redirect(`/shop-detail/${productId}`)
    } catch (error) {
        console.error("Error adding product to cart:", error);
        return res.render("status/500.ejs")
    }
}


const getCartPage = async (req: Request, res: Response) => {
    const currentUser = req.user as any;
    if (!currentUser) {
        return res.redirect('/login');
    }
    try {
        const cart = await Cart.findOne({ user: currentUser._id })
            .populate({
                path: 'items.product' // Mongoose sẽ tự động sử dụng refPath 'items.productType'
            })
            .lean();

        if (cart) {
            // Lấy thông tin chi tiết cho từng variant
            const variantIds = cart.items.map(item => item.variantId);
            const deviceVariants = await Variant.find({ _id: { $in: variantIds } }).lean();
            const accVariants = await AccessoriesVariant.find({ _id: { $in: variantIds } }).lean();

            const allVariants = [...deviceVariants, ...accVariants];
            const variantsMap = new Map(allVariants.map(v => [v._id.toString(), v]));

            let subTotal = 0;

            // Gán thông tin variant vào từng item trong giỏ hàng
            cart.items.forEach(item => {
                const variantDetail = variantsMap.get(item.variantId.toString());
                if (variantDetail) {
                    (item as any).variant = variantDetail;

                    // Tính giá cuối cùng cho mỗi sản phẩm và cộng vào tổng tiền
                    const finalPrice = variantDetail.price * (1 - (variantDetail.discount || 0) / 100);
                    subTotal += finalPrice * item.quantity;
                }
            });

            (cart as any).subTotal = subTotal;
        }

        res.render('client/home/cart.ejs', { cart });
    } catch (error) {
        console.error("Error getting cart page:", error);
        res.status(500).send("Error loading cart page");
    }
}


export {
    getHomePage,
    getShopPage,
    getShopDetailPage,
    postCreateReview,
    getUserInfoPage, postUpdateUserInfo,
    postAddProductToCart,
    getCartPage
};