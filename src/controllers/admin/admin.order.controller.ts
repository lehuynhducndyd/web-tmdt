import { Request, Response } from "express";

const getOrderPage = (req: Request, res: Response) => {
    res.render("admin/order/show.ejs");
}

export { getOrderPage };
