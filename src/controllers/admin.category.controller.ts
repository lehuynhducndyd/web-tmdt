import { Request, Response } from 'express';
import { CATEGORY_TYPES } from "config/constant";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, getTypeAccessories, getTypeDevices, updateCategory } from 'services/category.service';

const getCategoryPage = async (req: Request, res: Response) => {
    const categoriesDevices = await getTypeDevices();
    console.log(categoriesDevices);
    const categoriesAccessories = await getTypeAccessories();
    res.render("admin/category/show.ejs", { categoriesDevices, categoriesAccessories });
}

const getCreateCategoryPage = async (req: Request, res: Response) => {
    res.render("admin/category/create.ejs", { CATEGORY_TYPES });
}

const getViewCategoryPage = async (req: Request, res: Response) => {
    const id = req.params.id;
    const category = await getCategoryById(id);
    res.render("admin/category/detail.ejs", { category, CATEGORY_TYPES });
}

const postCreateCategory = async (req: Request, res: Response) => {
    try {
        const { name, type, description } = req.body;
        await createCategory(name, type, description);
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
    const { id, name, type, description } = req.body;
    await updateCategory(id, name, type, description);
    res.redirect('/admin/category');
}

export { getCategoryPage, getCreateCategoryPage, postCreateCategory, postDeleteCategory, getViewCategoryPage, postUpdateCategory };