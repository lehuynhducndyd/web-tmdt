import Order from "models/order";
import { ReviewAcc, ReviewDevice } from "models/review";
import User from "models/user";
import { Accessory, Device, Variant, AccessoriesVariant } from "models/product";

const getTodayOrders = async () => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const todaysPendingOrders = await Order.find({
            createdAt: {
                $gte: startOfToday,
                $lte: endOfToday
            },
            status: "pending"
        }).populate("customer", "name").sort({ createdAt: -1 }).lean();

        return todaysPendingOrders;
    } catch (error) {
        console.error("Error fetching today's pending orders:", error);
        throw new Error("Lỗi khi lấy đơn hàng hôm nay.");
    }
}

const getTodayReviews = async () => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const query = {
            createdAt: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        };

        const deviceReviews = await ReviewDevice.find(query)
            .populate('user', 'name')
            .populate('product', 'name')
            .lean();

        const accessoryReviews = await ReviewAcc.find(query)
            .populate('user', 'name')
            .populate('product', 'name')
            .lean();

        const allReviews = [...deviceReviews, ...accessoryReviews];

        allReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return allReviews;
    } catch (error) {
        console.error("Error fetching today's reviews:", error);
        throw new Error("Lỗi khi lấy đánh giá hôm nay.");
    }
}

const getTodayCustomers = async () => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const todaysCustomers = await User.find({
            createdAt: {
                $gte: startOfToday,
                $lte: endOfToday
            },
            role: 'customer'
        }).sort({ createdAt: -1 }).lean();
        console.log(todaysCustomers);
        return todaysCustomers;

    } catch (error) {
        console.error("Error fetching today's new customers:", error);
        throw new Error("Lỗi khi lấy khách hàng mới hôm nay.");
    }
}

const getBestSellingProducts = async () => {
    try {
        // 1. Aggregate để tính tổng số lượng bán ra của mỗi sản phẩm
        const bestSellers = await Order.aggregate([
            // Chỉ xem xét các đơn hàng đã hoàn thành
            { $match: { status: 'delivered' } },
            // Tách mỗi sản phẩm trong một đơn hàng ra thành một document riêng
            { $unwind: '$items' },
            // Nhóm theo ID sản phẩm và tính tổng số lượng bán ra
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    // Lấy productType để biết sản phẩm thuộc collection nào
                    productType: { $first: '$items.productType' }
                }
            },
            // Sắp xếp theo số lượng bán ra giảm dần
            { $sort: { totalQuantity: -1 } },
            // Giới hạn ở top 5
            { $limit: 5 }
        ]);

        // 2. Tách ID sản phẩm ra thành 2 nhóm: Device và Accessory
        const deviceIds = bestSellers.filter(p => p.productType === 'Device').map(p => p._id);
        const accessoryIds = bestSellers.filter(p => p.productType === 'Accessory').map(p => p._id);

        // 3. Lấy thông tin chi tiết của các sản phẩm từ 2 collection tương ứng
        const devices = await Device.find({ '_id': { $in: deviceIds } }).lean();
        const accessories = await Accessory.find({ '_id': { $in: accessoryIds } }).lean();

        const allProducts = [...devices, ...accessories];

        // 4. Gắn thông tin số lượng đã bán vào từng sản phẩm
        const result = allProducts.map(product => {
            const sellingInfo = bestSellers.find(p => p._id.toString() === product._id.toString());
            return {
                ...product,
                totalQuantity: sellingInfo ? sellingInfo.totalQuantity : 0
            };
        }).sort((a, b) => b.totalQuantity - a.totalQuantity); // Sắp xếp lại lần cuối

        return result;
    } catch (error) {
        console.error("Error fetching best selling products:", error);
        throw new Error("Lỗi khi lấy danh sách sản phẩm bán chạy.");
    }
}

const getOutOfStockProducts = async () => {
    try {
        // 1. Tìm các biến thể của Device sắp hết hàng (stock < 1)
        const outOfStockDeviceVariants = await Variant.find({ stock: { $lt: 2 } })
            .populate({
                path: 'deviceId',
                select: 'name thumbnail', // Chỉ lấy tên và ảnh thumbnail của sản phẩm cha
            })
            .lean();

        // 2. Tìm các biến thể của Accessory sắp hết hàng (stock < 1)
        const outOfStockAccessoryVariants = await AccessoriesVariant.find({ stock: { $lt: 1 } })
            .populate({
                path: 'accessoryId',
                select: 'name thumbnail', // Chỉ lấy tên và ảnh thumbnail của sản phẩm cha
            })
            .lean();

        // 3. Gộp kết quả và chuẩn hóa dữ liệu để dễ sử dụng
        const allOutOfStockProducts = [
            // Gán product là deviceId và thêm productType
            ...outOfStockDeviceVariants.map(v => ({ ...v, product: v.deviceId, productType: 'Device' })),
            // Gán product là accessoryId và thêm productType
            ...outOfStockAccessoryVariants.map(v => ({ ...v, product: v.accessoryId, productType: 'Accessory' }))
        ];

        // 4. Sắp xếp theo số lượng tồn kho tăng dần
        allOutOfStockProducts.sort((a, b) => a.stock - b.stock);

        return allOutOfStockProducts;

    } catch (error) {
        console.error("Error fetching out of stock products:", error);
        throw new Error("Lỗi khi lấy danh sách sản phẩm sắp hết hàng.");
    }
}

export { getTodayOrders, getTodayReviews, getTodayCustomers, getBestSellingProducts, getOutOfStockProducts };