import { Request, Response } from 'express';
import { RegisterSchema } from 'src/validation/register.schema';


const getLoginPage = (req: Request, res: Response) => {
    return res.render("client/auth/login.ejs", {
    });
}

const getRegisterPage = (req: Request, res: Response) => {
    const errors = [];
    const oldData = {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    };
    return res.render("client/auth/register.ejs", {
        errors: errors,
        oldData: oldData
    });

}

const postRegisterPage = async (req: Request, res: Response) => {
    const { fullName, email, password, confirmPassword } = req.body;
    const validate = await RegisterSchema.safeParseAsync(req.body);
    if (!validate.success) {
        const errorsZod = validate.error.issues;
        const errors = errorsZod.map(item => `${item.message} (${item.path[0]})`);
        const oldData = {
            fullName, email, password, confirmPassword
        };
        return res.render("client/auth/register.ejs", {
            errors: errors,
            oldData: oldData
        });

    }
    await registerNewUser(fullName, email, password);
    return res.redirect("/login");
}

export {
    getLoginPage,
    getRegisterPage,
    postRegisterPage,
}