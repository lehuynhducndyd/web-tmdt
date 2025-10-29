import { Request, Response } from 'express';
import { Accessory, Device } from 'models/product';
import { ReviewAcc, ReviewDevice } from 'models/review';

const getProductReviewPage = async (req: Request, res: Response) => {
    const id = req.params.id;
    let product = await Device.findById(id);
    let reviews = await ReviewDevice.find({ product: id })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    if (!product) {
        product = await Accessory.findById(id);
        reviews = await ReviewAcc.find({ product: id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean();
    }
    res.render("admin/review/show.ejs", {
        reviews, product
    })

}

const postDeleteReview = async (req: Request, res: Response) => {
    const id = req.params.id;
    const pid = req.params.pid;
    let review = await ReviewDevice.findById(id);
    if (!review) {
        review = await ReviewAcc.findById(id);
    }
    await ReviewDevice.deleteOne({ _id: id });
    res.redirect(`/admin/review/${pid}`);
}

export { getProductReviewPage, postDeleteReview };