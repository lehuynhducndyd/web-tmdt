import { Request, Response } from 'express';
import { Accessory, Device } from 'models/product';


export const getSearchProducts = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ message: "Vui lòng cung cấp từ khóa tìm kiếm." });
        }

        // Tạo một biểu thức chính quy (regex) để tìm kiếm không phân biệt chữ hoa/thường
        const regex = new RegExp(query, 'i');

        // Tìm kiếm song song trong cả hai collection Device và Accessory
        // và chỉ lấy những trường cần thiết
        const [devices, accessories] = await Promise.all([
            Device.find({ name: regex }).select('name price productType thumbnail').limit(10),
            Accessory.find({ name: regex }).select('name price productType thumbnail').limit(10)
        ]);

        // Gộp kết quả từ hai collection
        const allResults = [...devices, ...accessories];

        // Sắp xếp kết quả theo tên (tùy chọn)
        allResults.sort((a, b) => a.name.localeCompare(b.name));

        // Trả về kết quả dưới dạng JSON
        res.json(allResults);

    } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};