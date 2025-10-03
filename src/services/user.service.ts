import User from "models/user";

const getAllUsers = async () => {
    const users = await User.find();
    return users;
};
const getAllUserAdmin = async () => {
    const users = await User.find({ role: 'admin' });
    return users;
};
const getAllUserStaff = async () => {
    const users = await User.find({ role: 'staff' });
    return users;
};
const getAllUserCustomer = async () => {
    const users = await User.find({ role: 'customer' });
    return users;
};
const createUser = async (
    name: string,
    email: string,
    password: string,
    role: string,
    phone: string,
    province: string,
    commune: string,
    street: string,
    isActive: boolean
) => {
    await User.create({ name, email, password, role, phone, province, commune, street, isActive });
    return;
}
const deleteUser = async (id: string) => {
    await User.deleteOne({ _id: id });
    return;
}
const getUserById = async (id: string) => {
    const user = await User.findById(id);
    return user;
}

const updateUser = async (
    id: string,
    name: string,
    email: string,
    password: string,
    role: string,
    phone: string,
    province: string,
    commune: string,
    street: string,
    isActive: boolean
) => {
    await User.updateOne({ _id: id }, { name, email, password, role, phone, province, commune, street, isActive });
}
export { getAllUsers, getAllUserAdmin, getAllUserStaff, getAllUserCustomer, createUser, deleteUser, updateUser, getUserById };


