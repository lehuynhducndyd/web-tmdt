import { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Brand } from 'models/brand';
import { Accessory, AccessoriesVariant, Device, Variant } from 'models/product';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calls the Gemini API with retry logic for transient errors.
 * @param prompt The prompt to send.
 * @param retries Number of retries.
 * @param delayMs Initial delay in ms.
 * @returns The generated content text.
 */
async function generateContentWithRetry(prompt: string, retries = 3, delayMs = 1000): Promise<string> {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            if (error.status === 503 && i < retries - 1) {
                console.warn(`Gemini API overloaded. Retrying in ${delayMs / 1000}s... (Attempt ${i + 1}/${retries})`);
                await delay(delayMs);
                delayMs *= 2; // Exponential backoff
            } else {
                throw error; // Re-throw if it's not a 503 or if retries are exhausted
            }
        }
    }
    throw new Error("Gemini API call failed after multiple retries."); // Should not be reached
}

/**
 * Gửi prompt đến Gemini API và nhận phản hồi.
 * @param prompt - Chuỗi prompt để gửi.
 * @returns Phản hồi từ bot.
 */
async function getGeminiReply(prompt: string): Promise<string> {
    try {
        return await generateContentWithRetry(prompt);
    } catch (error: any) {
        console.error("Lỗi khi gọi Gemini API:", error);
        if (error.status === 503) {
            return "Xin lỗi, dịch vụ AI hiện đang quá tải. Vui lòng thử lại sau ít phút.";
        }
        return "Xin lỗi, tôi gặp sự cố khi kết nối đến dịch vụ AI.";
    }
}

/**
 * Phân tích tin nhắn của người dùng để xác định ý định và trích xuất các thực thể.
 * @param message - Tin nhắn của người dùng.
 * @returns Một object chứa intent và các entities.
 */
async function analyzeUserIntent(message: string): Promise<{ intent: string; entities: any }> {
    const prompt = `
Phân tích câu hỏi của người dùng về sản phẩm điện thoại và phụ kiện, sau đó trả về một đối tượng JSON.
Câu hỏi: "${message}"

Các loại ý định (intent) có thể có:
- "SEARCH_PRODUCT": Người dùng đang tìm kiếm sản phẩm chung.
- "COMPARE": Người dùng muốn so sánh hai hoặc nhiều sản phẩm.
- "SEARCH_BY_SPECS": Người dùng tìm sản phẩm theo thông số kỹ thuật cụ thể (pin, RAM, camera...).
- "CHECK_PRICE": Người dùng hỏi về giá sản phẩm.
- "CHECK_STOCK": Người dùng hỏi về tình trạng còn hàng.
- "QUESTION": Người dùng hỏi một câu hỏi chung (ví dụ: "chính sách bảo hành?").
- "GREETING": Người dùng chào hỏi.

Các thực thể (entities) cần trích xuất:
- "products": (Mảng chuỗi) Tên các sản phẩm được đề cập.
- "brand": (Chuỗi) Tên thương hiệu.
- "attributes": (Mảng chuỗi) Các thuộc tính chung như màu sắc.
- "specs": (Object) Các thông số kỹ thuật như "ram", "storage", "battery", "camera".
- "price_range": (Object) Khoảng giá người dùng quan tâm, gồm "min" và "max".

Chỉ trả về đối tượng JSON, không thêm bất kỳ giải thích nào.

Ví dụ:
1. Câu hỏi: "tìm điện thoại samsung màu xanh"
   JSON: {"intent": "SEARCH_PRODUCT", "entities": {"products": ["điện thoại"], "brand": "Samsung", "attributes": ["màu xanh"]}}
2. Câu hỏi: "so sánh iphone 15 pro và samsung s24 ultra"
   JSON: {"intent": "COMPARE", "entities": {"products": ["iphone 15 pro", "samsung s24 ultra"], "brand": null, "attributes": []}}
3. Câu hỏi: "chào shop"
   JSON: {"intent": "GREETING", "entities": {}}
4. Câu hỏi: "Điện thoại nào có pin trên 5000mAh và RAM 8GB?"
   JSON: {"intent": "SEARCH_BY_SPECS", "entities": {"products": ["Điện thoại"], "specs": {"battery": "5000mAh", "ram": "8GB"}}}
5. Câu hỏi: "iPhone 15 Pro Max giá bao nhiêu?"
   JSON: {"intent": "CHECK_PRICE", "entities": {"products": ["iPhone 15 Pro Max"]}}
6. Câu hỏi: "Shop còn tai nghe không dây màu trắng không?"
   JSON: {"intent": "CHECK_STOCK", "entities": {"products": ["tai nghe không dây"], "attributes": ["màu trắng"]}}
7. Câu hỏi: "Shop có bán Samsung không?"
   JSON: {"intent": "SEARCH_PRODUCT", "entities": {"brand": "Samsung"}}
8. Câu hỏi: "Shop có những iPhone nào?"
   JSON: {"intent": "SEARCH_PRODUCT", "entities": {"products": ["iPhone"]}}
9. Câu hỏi: "shop có s10 không"
   JSON: {"intent": "SEARCH_PRODUCT", "entities": {"products": ["s10"]}}
10. Câu hỏi: "shop có samsung s21 không"
    JSON: {"intent": "SEARCH_PRODUCT", "entities": {"products": ["samsung s21"]}}
11. Câu hỏi: "shop có samsung nào"
    JSON: {"intent": "SEARCH_PRODUCT", "entities": {"brand": "Samsung"}}
`;
    try {
        const text = await generateContentWithRetry(prompt);
        // Trích xuất JSON từ văn bản trả về, có thể chứa các ký tự không mong muốn
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        // Fallback nếu không trích xuất được JSON
        return { intent: 'QUESTION', entities: {} };
    } catch (error) {
        console.error("Lỗi khi phân tích intent:", error);
        return { intent: 'QUESTION', entities: {} }; // Fallback
    }
}


const postChatMessage = async (req: Request, res: Response) => {
    const message = req.body.message;

    if (!message) {
        return res.status(400).json({ reply: "Vui lòng cung cấp tin nhắn." });
    }
    try {
        const { intent, entities } = await analyzeUserIntent(message);

        let prompt = "";

        if (intent === 'SEARCH_PRODUCT' || intent === 'SEARCH_BY_SPECS') {
            const searchConditions: any = { $and: [] };
            if (entities.products && entities.products.length > 0) {
                const regexQueries = entities.products.map((p: string) => ({ name: { $regex: p, $options: "i" } }));
                searchConditions.$and.push({ $or: regexQueries });
            }
            if (entities.brand) {
                const brand = await Brand.findOne({ name: { $regex: entities.brand, $options: "i" } });
                if (brand) {
                    searchConditions.$and.push({ brand: brand._id });
                }
            }
            // Note: Searching by attributes might require querying variants, which adds complexity.
            // This example keeps it simple by searching the main product name/description.
            if (entities.attributes && entities.attributes.length > 0) {
                const regexQueries = entities.attributes.map((attr: string) => ({ name: { $regex: attr, $options: "i" } }));
                searchConditions.$and.push({ $or: regexQueries });
            }

            const finalQuery = searchConditions.$and.length > 0 ? searchConditions : { name: { $regex: message, $options: "i" } };

            const [devices, accessories] = await Promise.all([
                Device.find(finalQuery).populate('brand').limit(3).lean(),
                Accessory.find(finalQuery).populate('brand').limit(3).lean()
            ]);
            const relatedProducts = [...devices, ...accessories];

            let context = "";
            let productsForClient: any[] = [];

            // Lấy variants cho tất cả sản phẩm tìm được
            const deviceIds = devices.map(d => d._id);
            const accessoryIds = accessories.map(a => a._id);
            const [deviceVariants, accVariants] = await Promise.all([
                Variant.find({ deviceId: { $in: deviceIds } }).sort({ price: 1 }).lean(),
                AccessoriesVariant.find({ accessoryId: { $in: accessoryIds } }).sort({ price: 1 }).lean()
            ]);

            if (relatedProducts.length > 0) {
                // Gán variants vào sản phẩm tương ứng
                devices.forEach(d => (d as any).variants = deviceVariants.filter(v => v.deviceId.toString() === d._id.toString()));
                accessories.forEach(a => (a as any).variants = accVariants.filter(v => v.accessoryId.toString() === a._id.toString()));

                productsForClient = relatedProducts.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    image: p.thumbnail?.data ? `data:${p.thumbnail.contentType};base64,${p.thumbnail.data.toString('base64')}` : '/images/placeholder.png',
                    price: (p as any).variants?.[0]?.price || 0
                }));

                context = `Dữ liệu sản phẩm liên quan (bao gồm ID):\n${relatedProducts.map(p => `- ID: ${p._id}, Tên: ${p.name} (Hãng: ${(p.brand as any)?.name || 'Không rõ'}): ${p.description || 'Không có mô tả.'}`).join("\n")}`;
                prompt = `Bạn là một trợ lý bán hàng AI. Người dùng đang tìm kiếm sản phẩm.
Người dùng hỏi: "${message}"
${context}
Dựa vào thông tin trên, hãy giới thiệu các sản phẩm phù hợp. Luôn nhắc người dùng rằng giá và các phiên bản chi tiết (màu sắc, dung lượng) có thể thay đổi và họ nên hỏi thêm để biết chi tiết.`;
                const botReply = await getGeminiReply(prompt);
                return res.json({ reply: botReply, products: productsForClient });
            } else {
                context = "Không tìm thấy sản phẩm nào khớp với tìm kiếm trong cơ sở dữ liệu.";
                prompt = `Bạn là một trợ lý bán hàng AI. Người dùng hỏi: "${message}". ${context} Hãy lịch sự thông báo và thử hỏi thêm thông tin hoặc gợi ý các dòng sản phẩm phổ biến khác.`;
            }
        } else if (intent === 'COMPARE' && entities.products?.length >= 2) {
            const productNames = entities.products.map((p: string) => new RegExp(p, 'i'));
            const productsToCompare = await Device.find({ name: { $in: productNames } }).populate('brand').limit(entities.products.length).lean();
            let productsForClient: any[] = [];

            if (productsToCompare.length >= 2) {
                // Lấy variants cho các sản phẩm cần so sánh
                const productIds = productsToCompare.map(p => p._id);
                const variants = await Variant.find({ deviceId: { $in: productIds } }).sort({ price: 1 }).lean();

                // Gán variants vào sản phẩm
                productsToCompare.forEach((p: any) => p.variants = variants.filter(v => v.deviceId.toString() === p._id.toString()));

                productsForClient = productsToCompare.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    image: p.thumbnail?.data ? `data:${p.thumbnail.contentType};base64,${p.thumbnail.data.toString('base64')}` : '/images/placeholder.png',
                    price: (p as any).variants?.[0]?.price || 0
                }));

                const context = `Dữ liệu để so sánh:\n${productsToCompare.map(p =>
                    `Sản phẩm: ${p.name}\n- Hãng: ${(p.brand as any)?.name}\n- Mô tả: ${p.description}\n- Thông số kỹ thuật: ${JSON.stringify((p as any).specifications)}\n`
                ).join("\n")}`;
                prompt = `Bạn là một chuyên gia đánh giá sản phẩm. Người dùng muốn so sánh các sản phẩm sau: "${entities.products.join(' và ')}".
${context}
Dựa vào dữ liệu trên, hãy tạo một bảng so sánh các thông số kỹ thuật chính và đưa ra nhận xét tổng quan về ưu, nhược điểm của mỗi sản phẩm để giúp người dùng lựa chọn.`;
                const botReply = await getGeminiReply(prompt);
                return res.json({ reply: botReply, products: productsForClient });
            } else {
                prompt = `Tôi không tìm đủ thông tin về các sản phẩm bạn muốn so sánh. Bạn có thể cung cấp tên chính xác hơn không?`;
            }
        } else {
            // Handles GREETING, QUESTION, or fallback
            prompt = `Bạn là một trợ lý bán hàng AI thân thiện và chuyên nghiệp của một cửa hàng điện thoại.
Người dùng nói: "${message}"
Hãy trả lời một cách tự nhiên và hữu ích. Nếu là lời chào, hãy chào lại. Nếu là câu hỏi chung, hãy trả lời dựa trên kiến thức của bạn về một cửa hàng bán lẻ điện thoại.`;
        }

        const botReply = await getGeminiReply(prompt);
        res.json({ reply: botReply, products: [] });
    } catch (err) {
        console.error("Lỗi xử lý tin nhắn:", err);
        res.status(500).json({ reply: "Đã xảy ra lỗi trên máy chủ." });
    }
}

export { postChatMessage };
