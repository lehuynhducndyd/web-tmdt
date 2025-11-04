import { Request, Response } from "express";
import Order from "models/order";
import User from "models/user";

const getOrderPage = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({})
            .populate("customer", "name")
            .sort({ createdAt: -1 })
            .lean();
        res.render("admin/order/show.ejs", { orders });
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
                path: 'items.product',
            })
            .lean();

        if (!order) {
            return res.status(404).send("Đơn hàng không tồn tại");
        }

        res.render("admin/order/detail-order.ejs", { order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("Lỗi khi tải trang chi tiết đơn hàng.");
    }
}

const postUpdateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        await Order.updateOne({ _id: req.params.id }, { status: status });
        res.redirect(`/admin/order/${req.params.id}`);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send("Lỗi khi cập nhật trạng thái đơn hàng.");
    }
}

export { getOrderPage, getOrderDetailPage, postUpdateOrderStatus };
