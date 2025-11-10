import { Request, Response } from "express";
import Order from "models/order";
import { Variant, AccessoriesVariant } from "models/product";

const getOrderPage = async (req: Request, res: Response) => {
    try {
        const allOrders = await Order.find({})
            .populate("customer", "name")
            .sort({ createdAt: -1 })
            .lean();

        const ordersByStatus = {
            all: allOrders,
            pending: [] as any[],
            processing: [] as any[],
            shipped: [] as any[],
            delivered: [] as any[],
            cancelled: [] as any[],
        };

        for (const order of allOrders) {
            if (ordersByStatus[order.status]) {
                ordersByStatus[order.status].push(order);
            }
        }

        res.render("admin/order/show.ejs", { ordersByStatus });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Lỗi khi tải trang quản lý đơn hàng.");
    }
}

const getOrderDetailPage = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer')
            .populate({
                path: 'items.product'

            }) // Mongoose sẽ tự động tham chiếu đến 'Device' hoặc 'Accessory'
            .lean();

        if (!order) {
            return res.status(404).send("Đơn hàng không tồn tại");
        }

        // Lấy thông tin chi tiết cho từng variant trong đơn hàng
        const variantIds = order.items.map(item => item.variantId);
        const deviceVariants = await Variant.find({ _id: { $in: variantIds } }).populate('deviceId').lean();
        const accVariants = await AccessoriesVariant.find({ _id: { $in: variantIds } }).populate('accessoryId').lean();

        const allVariants = [...deviceVariants, ...accVariants];
        const variantsMap = new Map(allVariants.map(v => [v._id.toString(), v]));

        // Gán thông tin variant vào từng item trong đơn hàng
        order.items.forEach(item => {
            const variantDetail = variantsMap.get(item.variantId.toString());
            if (variantDetail) {
                (item as any).variant = variantDetail;
                // Gán thông tin product từ variant đã populate
                (item as any).product = (variantDetail as any).deviceId || (variantDetail as any).accessoryId;
            }
        });

        res.render("admin/order/detail-order.ejs", { order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("Lỗi khi tải trang chi tiết đơn hàng.");
    }
}

const getPrintPreviewPage = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer')
            .populate({
                path: 'items.product'

            }) // Mongoose sẽ tự động tham chiếu đến 'Device' hoặc 'Accessory'
            .lean();

        if (!order) {
            return res.status(404).send("Đơn hàng không tồn tại");
        }

        // Lấy thông tin chi tiết cho từng variant trong đơn hàng
        const variantIds = order.items.map(item => item.variantId);
        const deviceVariants = await Variant.find({ _id: { $in: variantIds } }).populate('deviceId').lean();
        const accVariants = await AccessoriesVariant.find({ _id: { $in: variantIds } }).populate('accessoryId').lean();

        const allVariants = [...deviceVariants, ...accVariants];
        const variantsMap = new Map(allVariants.map(v => [v._id.toString(), v]));

        // Gán thông tin variant vào từng item trong đơn hàng
        order.items.forEach(item => {
            const variantDetail = variantsMap.get(item.variantId.toString());
            if (variantDetail) {
                (item as any).variant = variantDetail;
                // Gán thông tin product từ variant đã populate
                (item as any).product = (variantDetail as any).deviceId || (variantDetail as any).accessoryId;
            }
        });

        res.render("admin/order/print.ejs", { order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("Lỗi khi tải trang chi tiết đơn hàng.");
    }
}

const postUpdateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status, paymentStatus } = req.body;
        await Order.updateOne({ _id: req.params.id }, { status: status, paymentStatus: paymentStatus });
        res.redirect(`/admin/order/${req.params.id}`);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send("Lỗi khi cập nhật trạng thái đơn hàng.");
    }
}

export { getOrderPage, getOrderDetailPage, postUpdateOrderStatus, getPrintPreviewPage };
