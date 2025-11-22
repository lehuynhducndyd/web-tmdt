import { Request, Response } from 'express';
import { Device, Variant, AccessoriesVariant, Accessory } from 'models/product';
import { Brand } from 'models/brand';
import { Category } from 'models/category';
import User from 'models/user';
import Cart from 'models/cart';
import { getDeviceById } from 'services/admin/product.service';
import { getUserById } from 'services/admin/user.service';
import Order from 'models/order';
import { ReviewDevice, ReviewAcc } from 'models/review';

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
            .limit(10)
            .populate('brand category')
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
            products: phones,
            accessories: latestAccessories,
            otherDevices: otherDevices
        });

    } catch (error) {
        console.error("Error getting home page:", error);
        res.status(500).send("Error loading home page");
    }
}

const getShopPage = async (req: Request, res: Response) => {
    try {
        const { brands, categories: categoryNames, minPrice, maxPrice, ram, storage, battery } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = 12; // Số sản phẩm mỗi trang

        const deviceFilter: any = {};
        const variantFilter: any = {};

        if (ram) {

            const ramValues = (ram as string).split(',').map(r => r.trim().split(' ')[0]);
            variantFilter.ram = { $in: ramValues.map(r => new RegExp(`^${r}`)) };
        }
        if (storage) {

            const storageValues = (storage as string).split(',').map(s => s.trim().split(' ')[0]);
            variantFilter.storage = { $in: storageValues.map(s => new RegExp(`^${s}`)) };
        }

        if (minPrice || maxPrice) {
            variantFilter.price = {};
            if (minPrice) variantFilter.price.$gte = Number(minPrice);
            if (maxPrice) variantFilter.price.$lte = Number(maxPrice);
        }

        const hasDeviceVariantFilters = ram || storage;
        let matchingDeviceIds: any[] = [];
        if (hasDeviceVariantFilters || minPrice || maxPrice) {
            const matchingVariants = await Variant.find(variantFilter).select('deviceId').lean();
            matchingDeviceIds = [...new Set(matchingVariants.map(v => v.deviceId))];
        }

        // --- Accessory Filters ---
        const accFilter: any = {};
        const accVariantFilter: any = {};
        if (minPrice || maxPrice) {
            accVariantFilter.price = {};
            if (minPrice) accVariantFilter.price.$gte = Number(minPrice);
            if (maxPrice) accVariantFilter.price.$lte = Number(maxPrice);
        }

        let matchingAccessoryIds: any[] = [];
        if (minPrice || maxPrice) {
            const matchingAccVariants = await AccessoriesVariant.find(accVariantFilter).select('accessoryId').lean();
            matchingAccessoryIds = [...new Set(matchingAccVariants.map(v => v.accessoryId))];
        }

        // --- Common Filters (Brand, Category) ---
        if (brands && typeof brands === 'string') {
            const brandList = (brands as string).split(',').map(b => b.trim());
            const brandObjects = await Brand.find({ name: { $in: brandList } }).select('_id');
            if (brandObjects.length > 0) {
                const brandIds = brandObjects.map(b => b._id);
                deviceFilter.brand = { $in: brandIds };
                accFilter.brand = { $in: brandIds };
            } else {
                // Nếu không tìm thấy brand nào, không trả về sản phẩm nào
                deviceFilter._id = { $in: [] };
                accFilter._id = { $in: [] };
            }
        }

        if (categoryNames && typeof categoryNames === 'string') {
            const categoryList = categoryNames.split(',');
            const categoryObjects = await Category.find({ name: { $in: categoryList } }).select('_id');
            if (categoryObjects.length > 0) {
                const categoryIds = categoryObjects.map(c => c._id);
                deviceFilter.category = { $in: categoryIds };
                accFilter.category = { $in: categoryIds };
            } else {
                deviceFilter._id = { $in: [] };
                accFilter._id = { $in: [] };
            }
        }

        // --- Apply device-specific filters ---
        if (battery && typeof battery === 'string') {
            const batteryList = battery.split(',').map(b => b.trim().split(' ')[0]);
            if (batteryList.length > 0) {
                const batteryRegex = batteryList.map(b => new RegExp(b));
                deviceFilter['specs.battery'] = { $in: batteryRegex };
            }
        }

        if (hasDeviceVariantFilters || minPrice || maxPrice) {
            deviceFilter._id = { $in: deviceFilter._id?.$in ? deviceFilter._id.$in.filter((id: any) => matchingDeviceIds.some(mId => mId.equals(id))) : matchingDeviceIds };
        }

        if (minPrice || maxPrice) {
            accFilter._id = { $in: accFilter._id?.$in ? accFilter._id.$in.filter((id: any) => matchingAccessoryIds.some(mId => mId.equals(id))) : matchingAccessoryIds };
        }

        // --- Fetch Products ---
        const [devices, accessories] = await Promise.all([
            Device.find(deviceFilter).populate('brand category').lean(),
            Accessory.find(accFilter).populate('brand category').lean()
        ]);

        let allProducts = [...devices, ...accessories];

        // --- Process prices for all found products ---
        const processedDevices = await processProductVariants(devices, Variant, 'deviceId');
        const processedAccessories = await processProductVariants(accessories, AccessoriesVariant, 'accessoryId');

        allProducts = [...processedDevices, ...processedAccessories].sort((a, b) => b.createdAt - a.createdAt);

        // --- Pagination ---
        const totalProducts = allProducts.length;
        const totalPages = Math.ceil(totalProducts / limit);
        let paginatedProducts = allProducts.slice((page - 1) * limit, page * limit);

        // --- Data for Filters ---
        const categories = await Category.find().lean();
        const allBrands = await Brand.find({}).lean();

        // Filter products based on price range if minPrice or maxPrice is present
        if (minPrice || maxPrice) {
            paginatedProducts = paginatedProducts.filter(p => {
                const price = (p as any).price;
                if (minPrice && maxPrice) {
                    return price >= Number(minPrice) && price <= Number(maxPrice);
                }
                if (minPrice) {
                    return price >= Number(minPrice);
                }
                if (maxPrice) {
                    return price <= Number(maxPrice);
                }
                return true;
            });
        }

        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        const pagination = {
            current: page,
            pages: pages,
            next: page < totalPages ? page + 1 : null,
            prev: page > 1 ? page - 1 : null,
            total: totalPages
        };

        return res.render("client/home/shop.ejs", {
            products: paginatedProducts,
            categories,
            pagination,
            allBrands // Truyền danh sách thương hiệu ra view
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

            // Lấy danh sách user đã mua sản phẩm này
            if (reviews.length > 0) {
                const userIds = reviews.map(r => r.user._id);
                const purchasedOrders = await Order.find({
                    customer: { $in: userIds },
                    'items.product': id,
                    status: 'delivered'
                }).select('customer').lean();
                const purchasingUserIds = new Set(purchasedOrders.map(o => o.customer.toString()));

                reviews.forEach(review => {
                    (review as any).hasPurchased = purchasingUserIds.has((review.user as any)._id.toString());
                });
            }

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

            // Lấy danh sách user đã mua sản phẩm này
            if (reviews.length > 0) {
                const userIds = reviews.map(r => r.user._id);
                const purchasedOrders = await Order.find({
                    customer: { $in: userIds },
                    'items.product': id,
                    status: 'delivered'
                }).select('customer').lean();
                const purchasingUserIds = new Set(purchasedOrders.map(o => o.customer.toString()));

                reviews.forEach(review => {
                    (review as any).hasPurchased = purchasingUserIds.has((review.user as any)._id.toString());
                });
            }

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
        let cart = await Cart.findOne({ user: currentUser._id })
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
        } else {
            cart = { items: [], subTotal: 0 } as any; // Khởi tạo cart rỗng nếu không tìm thấy
        }

        res.render('client/home/cart.ejs', { cart });
    } catch (error) {
        console.error("Error getting cart page:", error);
        res.status(500).send("Error loading cart page");
    }
}

const postDeleteCartItem = async (req: Request, res: Response) => {
    const currentUser = req.user as any;
    if (!currentUser) {
        return res.redirect('/login');
    }
    try {
        const { variantId } = req.params;

        const cart = await Cart.findOne({ user: currentUser._id });

        if (cart) {
            // Sử dụng .pull() để xóa item khỏi DocumentArray của Mongoose
            cart.items.pull({ variantId: variantId });

            // Cập nhật lại số lượng sản phẩm trong giỏ hàng
            cart.sum = cart.sum - 1;
            await cart.save();

            // Cập nhật lại res.locals.sum để hiển thị đúng ở navbar sau khi redirect
            res.locals.sum = cart.sum;
        }
        res.redirect('/cart');
    } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).send("Error deleting item from cart");
    }
}

const getContactPage = async (req: Request, res: Response) => {
    res.render('client/home/contact.ejs');
}



export {
    getHomePage,
    getShopPage,
    getShopDetailPage,
    postCreateReview,
    getUserInfoPage, postUpdateUserInfo,
    postAddProductToCart,
    getCartPage,
    postDeleteCartItem,
    getContactPage
};