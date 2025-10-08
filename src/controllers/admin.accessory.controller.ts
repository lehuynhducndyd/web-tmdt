import { Request, Response } from 'express';

const getCreateCategoryPage = (req: Request, res: Response) => {
    res.render("admin/category/create.ejs");
}

export { getCreateCategoryPage };

