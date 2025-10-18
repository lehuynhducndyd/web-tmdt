import User from "models/user";

const isEmailExist = async (email: string) => {
    const user = await User.findOne({ email });
    return user ? true : false;
}

export {
    isEmailExist,
}