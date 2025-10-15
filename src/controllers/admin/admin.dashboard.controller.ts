import { Request, Response } from 'express';

const getAdminPage = async (req: Request, res: Response) => {
    res.render("admin/dashboard/show.ejs");
}

export { getAdminPage };