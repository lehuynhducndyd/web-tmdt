import User from "models/user";
import bcrypt from "bcrypt";
import { ACCOUNT_TYPE } from "config/constant";

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
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({ name, email, password: hashedPassword, role, phone, province, commune, street, isActive });
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
    let hashedPassword = password;
    // Check if the provided password is a new one (not a bcrypt hash)
    // A simple check is to see if it starts with '$2a$', '$2b$', etc.
    // A more robust check would be to try/catch a compare, but this is generally sufficient.
    if (!password.startsWith('$2a$') && !password.startsWith('$2b$')) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    await User.updateOne({ _id: id }, { name, email, password: hashedPassword, role, phone, province, commune, street, isActive });
}
const registerNewUser = async (name: string, email: string, password: string) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, email, password: hashedPassword, role: 'customer', isActive: true, accountType: ACCOUNT_TYPE.SYSTEM });
    return user;
}

const comparePassword = async (password: string, hashedPassword: string) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}


export {
    getAllUsers, getAllUserAdmin, getAllUserStaff,
    registerNewUser, getAllUserCustomer, createUser, deleteUser, updateUser, getUserById, comparePassword
};
