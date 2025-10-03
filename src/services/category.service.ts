import Category from "models/category";

const getAllCategories = async () => {
    const categories = await Category.find();
    return categories;
}

const createCategory = async (name: string, description: string) => {
    await Category.create({ name, description });
    return;
}

const deleteCategory = async (id: string) => {
    await Category.deleteOne({ _id: id });
    return;
}

const getCategoryById = async (id: string) => {
    const category = await Category.findById(id);
    return category;
}
const updateCategory = async (id: string, name: string, description: string) => {
    await Category.updateOne({ _id: id }, { name, description });
    return;
}

export { getAllCategories, createCategory, deleteCategory, getCategoryById, updateCategory };