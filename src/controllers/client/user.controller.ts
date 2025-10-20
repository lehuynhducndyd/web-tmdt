import { Request, Response } from 'express';
import { get } from 'http'; 
import { Device, Variant } from 'models/product';

const getHomePage = async (req: Request, res: Response) => {
    const user = req.user as any;
    console.log(user);
    try {
        let latestDevices = await Device.find()
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất trước
            .limit(10) // Giới hạn 10 sản phẩm
            .populate('brand category') // Lấy thêm thông tin brand và category
            .lean(); // Sử dụng lean() để có object JS thuần, dễ dàng chỉnh sửa

        // Lấy variant cho mỗi device
        for (let i = 0; i < latestDevices.length; i++) {
            const variants = await Variant.find({ deviceId: latestDevices[i]._id }).sort({ price: 1 }).lean();
            // Gán mảng variants và giá thấp nhất vào device
            (latestDevices[i] as any).variants = variants;
            (latestDevices[i] as any).price = variants.length > 0 ? variants[0].price : 0;
        }

        return res.render("client/home/show.ejs", {
            products: latestDevices
        });

    } catch (error) {
        console.error("Error getting home page:", error);
        res.status(500).send("Error loading home page");
    }
}

export { getHomePage };

const getShopPage = async (req: Request, res: Response) => {
  try {
    const products = await   Device.find(); // hoặc logic phân trang/lọc
    const categories = ["Apples","Oranges","Strawberry","Banana","Pumpkin"]; 
    const pagination = {
      current: 1,
      pages: [1,2,3],
      next: 2,
      prev: null
    };

    return res.render("client/home/shop.ejs", {
      products,
      categories,
      pagination
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

export { getShopPage };
