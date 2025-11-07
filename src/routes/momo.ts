import { createMoMoPayment } from "config/momo";
import express from "express";
import cart from "models/cart";
import Order from "models/order";


const router = express.Router();

router.get("/pay/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send("Không tìm thấy đơn hàng");
        }

        const amount = order.totalAmount;
        const orderInfo = `Thanh toan don hang ${order._id}`;

        const result = await createMoMoPayment(orderId, amount, orderInfo);

        res.redirect(result.payUrl);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi tạo thanh toán MoMo");
    }
});

// kết quả sau khi thanh toán (redirect URL)
router.get("/result", async (req, res) => { // Đã đổi thành async
    const resultCode = req.query.resultCode;
    const message = req.query.message;
    const orderId = req.query.orderId;

    // Dựa vào resultCode để xác định trạng thái thanh toán
    if (resultCode === '0') {
        try {
            // Cập nhật trạng thái thanh toán của đơn hàng thành 'paid'
            await Order.updateOne({ _id: orderId }, { paymentStatus: 'paid' });

            // Xóa giỏ hàng của người dùng hiện tại
            const currentUser = req.user as any;
            await cart.deleteMany({ user: currentUser?._id });
            res.render('status/thanks.ejs');
        } catch (error) {
            console.error("Lỗi khi cập nhật đơn hàng hoặc xóa giỏ hàng:", error);
            res.status(500).send("Đã có lỗi xảy ra.");
        }
    } else {
        // Thanh toán thất bại hoặc bị hủy
        // Hiển thị trang thông báo lỗi cho người dùng.
        res.render('status/fail.ejs', { message: message || "Giao dịch không thành công." });
    }
});

// IPN (notify URL)
router.post("/ipn", (req, res) => {
    console.log("IPN MoMo:", req.body);
    res.status(204).send();
});

export default router;
