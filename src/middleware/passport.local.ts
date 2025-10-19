
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getUserWithoutPassword, handleLogin } from "services/client/auth.service";


const configPassportLocal = () => {
    passport.use(new LocalStrategy({ passReqToCallback: true },
        function verify(req, username, password, callback) {
            const { session } = req as any;
            if (session?.messages?.length) {
                session.messages = [];
            }
            console.log("check ", username, password);
            return handleLogin(username, password, callback);
        }));
    passport.serializeUser(function (user: any, callback) {
        callback(null, { id: user.id, username: user.username });
    });

    passport.deserializeUser(async function (user: any, callback) {
        const { id } = user;
        const userInDB = await getUserWithoutPassword(id);
        return callback(null, { ...userInDB });
    });
}

export default configPassportLocal;