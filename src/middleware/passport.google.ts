import passport from "passport";
var GoogleStrategy = require('passport-google-oauth20').Strategy;
import User from "models/user";
import { ACCOUNT_TYPE } from "config/constant";


const configPassportGoogle = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
    },
        async function (accessToken, refreshToken, profile, cb) {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

            if (!email) {
                return cb("Không tìm thấy email từ tài khoản Google.", null);
            }

            try {
                // Tìm người dùng bằng email
                let user = await User.findOne({ email: email });

                if (!user) {
                    // Nếu người dùng chưa tồn tại, tạo người dùng mới
                    user = await User.create({
                        name: profile.displayName,
                        email: email,
                        googleId: profile.id,
                        accountType: ACCOUNT_TYPE.GOOGLE,
                    });
                } else if (!user.googleId) {
                    // Nếu người dùng tồn tại nhưng chưa có googleId, liên kết tài khoản
                    // Điều này xảy ra khi người dùng đã đăng ký bằng email/password trước đó
                    user.googleId = profile.id;
                    user.accountType = ACCOUNT_TYPE.GOOGLE; // Cập nhật loại tài khoản
                    await user.save();
                }
                return cb(null, user);
            } catch (err) {
                return cb(err, null);
            }
        }
    ));
}

export default configPassportGoogle;