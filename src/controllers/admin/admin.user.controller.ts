import { Request, Response } from 'express';
import { createUser, deleteUser, getAllUserAdmin, getAllUserCustomer, getAllUserStaff, getUserById, updateUser } from 'services/admin/user.service';

const getUserPage = async (req: Request, res: Response) => {
    const admins = await getAllUserAdmin();
    const staffs = await getAllUserStaff();
    const customers = await getAllUserCustomer();
    res.render("admin/user/show.ejs",
        { admins, staffs, customers }
    );
}
const getCreateUserPage = async (req: Request, res: Response) => {
    res.render("admin/user/create.ejs");
}

const postCreateUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, phone, province, commune, street, isActive } = req.body;
        await createUser(name, email, password, role, phone, province, commune, street, isActive === 'on');
        res.redirect('/admin/user');
    } catch (error) {
        res.status(500).send("Error creating user");
    }
}
const postDeleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await deleteUser(id);
        res.redirect('/admin/user');
    } catch (error) {
        res.status(500).send("Error deleting user");
    }
}

const getViewUserPage = async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await getUserById(id);
    return res.render("admin/user/detail.ejs", {
        user: user
    });
}

const postUpdateUser = async (req: Request, res: Response) => {
    try {

        const { id, name, email, password, role, phone, province, commune, street, isActive } = req.body;
        let newPassword = password;
        const user = await getUserById(id);
        if (password && password.trim() !== '') {
            newPassword = user.password;
        }
        await updateUser(id, name, email, newPassword, role, phone, province, commune, street, isActive === 'on');
        res.redirect('/admin/user');
    } catch (error) {
        res.status(500).send("Error updating user");

    }
}
export { getUserPage, getCreateUserPage, postCreateUser, postDeleteUser, getViewUserPage, postUpdateUser };