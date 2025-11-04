import { Request, Response } from 'express';
import Cart from 'models/cart';
import { AccessoriesVariant, Variant } from 'models/product';
import Order from 'models/order';
import User from 'models/user';

const postUpdateCartAndCheckout = async (req: Request, res: Response) => {
    const currentUser = req.user as any;
    if (!currentUser) {
        return res.redirect('/login');
    }

    try {
        const { quantities } = req.body; // quantities sẽ là một object dạng { variantId: quantity, ... }
        const cart = await Cart.findOne({ user: currentUser._id });

        if (cart && quantities) {
            for (const item of cart.items) {
                const variantIdStr = item.variantId.toString();
                if (quantities[variantIdStr]) {
                    const newQuantity = parseInt(quantities[variantIdStr], 10);
                    if (newQuantity > 0) {
                        item.quantity = newQuantity;
                    }
                }
            }
            await cart.save();
        }
    } catch (error) {
        console.error("Error updating cart before checkout:", error);
        // Dù có lỗi vẫn có thể cho người dùng tới trang checkout với dữ liệu cũ
    }

    res.redirect('/checkout');
}


const getCheckoutPage = async (req: Request, res: Response) => {

    const currentUser = req.user as any;
    if (!currentUser) {
        return res.redirect('/login');
    }
    try {
        const userInfo = await User.findById(currentUser._id);
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
            cart = { items: [], subTotal: 0 } as any;
        }

        res.render('client/order/checkout.ejs', { cart, userInfo });
    } catch (error) {
        console.error("Error getting cart page:", error);
        res.status(500).send("Error loading cart page");
    }
}

const postPlaceOrder = async (req: Request, res: Response) => {
    const currentUser = req.user as any;
    if (!currentUser) {
        return res.redirect('/login');
    }

    try {
        const { name, phone, street, province, commune, paymentMethod } = req.body;

        // 1. Lấy thông tin giỏ hàng
        const cart = await Cart.findOne({ user: currentUser._id }).populate('items.product').lean();

        if (!cart || cart.items.length === 0) {
            // Hoặc hiển thị thông báo lỗi
            return res.redirect('/cart');
        }

        // 2. Lấy thông tin chi tiết các biến thể và tính tổng tiền
        const variantIds = cart.items.map(item => item.variantId);
        const deviceVariants = await Variant.find({ _id: { $in: variantIds } }).lean();
        const accVariants = await AccessoriesVariant.find({ _id: { $in: variantIds } }).lean();
        const allVariants = [...deviceVariants, ...accVariants];
        const variantsMap = new Map(allVariants.map(v => [v._id.toString(), v]));

        let totalAmount = 0;
        const orderItems = cart.items.map(item => {
            const variantDetail = variantsMap.get(item.variantId.toString());
            if (!variantDetail) {
                throw new Error(`Không tìm thấy biến thể sản phẩm với ID: ${item.variantId}`);
            }
            const finalPrice = variantDetail.price * (1 - (variantDetail.discount || 0) / 100);
            totalAmount += finalPrice * item.quantity;
            return {
                product: item.product,
                variantId: item.variantId,
                quantity: item.quantity,
                price: finalPrice,
            };
        });

        // 4. Chuẩn bị và thực thi cập nhật số lượng tồn kho
        const stockUpdateOperations = cart.items.map(item => {
            const variantDetail = variantsMap.get(item.variantId.toString());
            if (!variantDetail || variantDetail.stock < item.quantity) {
                throw new Error(`Sản phẩm không đủ số lượng tồn kho.`);
            }

            const model = item.productType === 'Device' ? Variant : AccessoriesVariant;
            return {
                updateOne: {
                    filter: { _id: item.variantId },
                    update: { $inc: { stock: -item.quantity } }
                }
            };
        });

        // Thực thi đồng thời cả hai loại cập nhật
        await Variant.bulkWrite(stockUpdateOperations.filter(op => op.updateOne.filter._id));
        await AccessoriesVariant.bulkWrite(stockUpdateOperations.filter(op => op.updateOne.filter._id));

        // 3. Tạo đơn hàng mới
        const newOrder = new Order({
            customer: currentUser._id,
            items: orderItems,
            totalAmount,
            paymentMethod,
            shippingAddress: {
                fullName: name,
                phone,
                street,
                province,
                commune,
            },
            status: 'pending',
        });

        await newOrder.save();
        await Cart.findByIdAndDelete(cart._id);
        res.render('status/thanks.ejs')
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).send("Lỗi khi đặt hàng.");
    }
};

export {
    getCheckoutPage, postUpdateCartAndCheckout, postPlaceOrder
}