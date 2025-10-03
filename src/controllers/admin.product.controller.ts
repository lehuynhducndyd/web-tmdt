import { Request, Response } from 'express';
import { getAllAccessories, getAllPhones } from 'services/product.service';

const getProductPage = async (req: Request, res: Response) => {
    const phones = await getAllPhones();
    const accessories = await getAllAccessories();
    res.render("admin/product/show.ejs", { phones, accessories });
}

export { getProductPage };