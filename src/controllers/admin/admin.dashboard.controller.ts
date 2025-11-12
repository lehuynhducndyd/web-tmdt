import { Request, Response } from 'express';
import Order from 'models/order';
import { getBestSellingProducts, getOutOfStockProducts, getTodayCustomers, getTodayOrders, getTodayReviews } from 'services/admin/dashboard.service';

const getAdminPage = async (req: Request, res: Response) => {
    try {

        const todaysPendingOrders = await getTodayOrders();

        res.render("admin/dashboard/show.ejs", {
            todaysPendingOrders
        });
    } catch (error) {
        console.error("Error fetching today's pending orders:", error);
        res.status(500).send("Lỗi khi tải trang dashboard.");
    }
}

const getTodayReviewsPage = async (req: Request, res: Response) => {
    try {
        const reviews = await getTodayReviews();
        res.render("admin/dashboard/today-review.ejs", { reviews });
    } catch (error) {
        console.error("Error fetching today's reviews:", error);
        res.status(500).send("Lỗi khi tải đánh giá hôm nay.");
    }
}

const getTodayCustomersPage = async (req: Request, res: Response) => {
    try {
        const customers = await getTodayCustomers();
        res.render("admin/dashboard/today-customer.ejs", { customers });
    } catch (error) {
        console.error("Error fetching today's customers:", error);
        res.status(500).send("Lỗi khi tải khách hàng mới hôm nay.");
    }
}

const getProductStatPage = async (req: Request, res: Response) => {
    try {
        const bestSellingProducts = await getBestSellingProducts();
        const outOfStockProducts = await getOutOfStockProducts();

        console.log(outOfStockProducts);
        res.render("admin/dashboard/product-stat.ejs", { bestSellingProducts, outOfStockProducts });
    } catch (error) {
        console.error("Error loading product statistics page:", error);
        res.status(500).send("Lỗi khi tải trang thống kê sản phẩm.");
    }
}

export { getAdminPage, getTodayReviewsPage, getTodayCustomersPage, getProductStatPage };