import { Request, Response } from 'express';
import Order from 'models/order';
import { getBestSellingProducts, getOutOfStockProducts, getRevenueByDate, getRevenueForMonth, getThisMonthRevenue, getTodayCustomers, getTodayOrders, getTodayRevenue, getTodayReviews, getYearlyRevenue, } from 'services/admin/dashboard.service';

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

        res.render("admin/dashboard/product-stat.ejs", { bestSellingProducts, outOfStockProducts });
    } catch (error) {
        console.error("Error loading product statistics page:", error);
        res.status(500).send("Lỗi khi tải trang thống kê sản phẩm.");
    }
}

const getRevenueStatPage = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        // Lấy tháng và năm từ query params, nếu không có thì dùng tháng/năm hiện tại
        const selectedMonth = Number(req.query.month) || now.getMonth() + 1;
        const selectedYear = Number(req.query.year) || now.getFullYear();

        const todayRevenue = await getTodayRevenue();
        const thisMonthRevenue = await getThisMonthRevenue();

        // Lấy dữ liệu doanh thu cho tháng/năm đã chọn
        const monthlyData = await getRevenueForMonth(selectedYear, selectedMonth);

        // Lấy dữ liệu doanh thu cho cả năm đã chọn
        const yearlyData = await getYearlyRevenue(selectedYear);
        console.log("Yearly Data:", yearlyData);
        console.log("Monthly Data:", monthlyData);

        res.render("admin/dashboard/revenue-stat.ejs", {
            todayRevenue,
            thisMonthRevenue,
            monthlyData, // Dữ liệu doanh thu chi tiết của tháng được chọn
            yearlyData, // Dữ liệu doanh thu của cả năm
            selectedMonth,
            selectedYear,
        });
    } catch (error) {
        console.error("Error loading revenue statistics page:", error);
        res.status(500).send("Lỗi khi tải trang thống kê doanh thu.");
    }
}

export { getAdminPage, getTodayReviewsPage, getTodayCustomersPage, getProductStatPage, getRevenueStatPage };