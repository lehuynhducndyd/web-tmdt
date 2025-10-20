import User from "models/user";
import { comparePassword } from "services/admin/user.service";

const isEmailExist = async (email: string) => {
    const user = await User.findOne({ email });
    return user ? true : false;
}

const handleLogin = async (email: string, password: string, callback: any) => {
    const user = await User.findOne({ email });

    if (!user) {
        return callback(null, false, { message: `Email/password is incorrect` });
    }

    if (!user.password) { // Kiểm tra cả null, undefined và chuỗi rỗng
        return callback(null, false, { message: `Email đã tồn tại, hãy thử email khác hoặc đăng nhập bằng google` });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return callback(null, false, { message: "Email/password is incorrect" });
    }

    return callback(null, user);
}

const getUserWithoutPassword = async (id: string) => {
    const user = await User.findById(id).select('-password').lean();
    return user;
}

export {
    isEmailExist, handleLogin, getUserWithoutPassword
}