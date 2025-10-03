import { Request, Response } from 'express';
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from 'services/category.service';

const getCategoryPage = async (req: Request, res: Response) => {
    const categories = await getAllCategories();
    res.render("admin/category/show.ejs", { categories });
}

const getCreateCategoryPage = async (req: Request, res: Response) => {
    res.render("admin/category/create.ejs");
}

const getViewCategoryPage = async (req: Request, res: Response) => {
    const id = req.params.id;
    const category = await getCategoryById(id);
    res.render("admin/category/detail.ejs", { category });
}

const postCreateCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        await createCategory(name, description);
        res.redirect('/admin/category');
    } catch (error) {
        res.status(500).send("Error creating category");
    }
}

const postDeleteCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await deleteCategory(id);
        res.redirect('/admin/category');
    } catch (error) {
        res.status(500).send("Error deleting category");
    }
}

const postUpdateCategory = async (req: Request, res: Response) => {
    const { id, name, description } = req.body;
    await updateCategory(id, name, description);
    res.redirect('/admin/category');
}

export { getCategoryPage, getCreateCategoryPage, postCreateCategory, postDeleteCategory, getViewCategoryPage, postUpdateCategory };