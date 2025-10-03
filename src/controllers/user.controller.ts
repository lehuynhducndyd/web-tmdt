import { Request, Response } from 'express';
import User from 'models/user';

const getHomePage = async (req: Request, res: Response) => {
    const users = await User.find({}, 'name email city');
    return res.render("home.ejs", {
        users: users
    });
}
// const getCreateUserPage = (req: Request, res: Response) => {
//     return res.render("create-user.ejs");
// }

// const postCreateUser = async (req: Request, res: Response) => {
//     const { name, email, city } = req.body;
//     const avatar = req.file.buffer;
//     const avatarType = req.file.mimetype;
//     console.log(">> check file: ", req.file);
//     await User.create({ name, email, city, avatar, avatarType });
//     return res.redirect("/");
// };

// const getUpdateUserPage = async (req: Request, res: Response) => {
//     const id = req.params.id;
//     const user = await User.findById(id);
//     return res.render("view-user.ejs", {
//         user: user
//     });
// };
// const postUpdateUser = async (req: Request, res: Response) => {
//     const { id, name, email, city } = req.body;
//     if (req.file != undefined) {
//         const avatar = req.file.buffer;
//         const avatarType = req.file.mimetype;
//         await User.updateOne({ _id: id }, { name: name, email: email, city: city, avatar: avatar, avatarType: avatarType });
//     } else {
//         await User.updateOne({ _id: id }, { name: name, email: email, city: city });
//     }
//     console.log(">> check file: ", req.file);
//     console.log(">> check data: ", req.body);
//     return res.redirect("/");
// };

// const deleteUser = async (req: Request, res: Response) => {
//     const id = req.params.id;
//     await User.deleteOne({ _id: id });
//     return res.redirect("/");
// }
export { getHomePage };