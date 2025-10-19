import { error } from 'console';
import { Request, Response } from 'express';
import { registerNewUser } from 'services/admin/user.service';
import { RegisterSchema } from 'src/validation/register.schema';


const getLoginPage = (req: Request, res: Response) => {
    const { session } = req as any;
    const messages = session?.messages ?? [];
    return res.render("client/auth/login.ejs", {
        messages: messages
    });
}

const getRegisterPage = (req: Request, res: Response) => {
    const errors = [];
    const oldData = {
        name: '',
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
    const { name, email, password, confirmPassword } = req.body;
    const validate = await RegisterSchema.safeParseAsync(req.body);
    if (!validate.success) {
        const errorsZod = validate.error.issues;
        const errors = errorsZod.map(item => `${item.message} (${String(item.path[0])})`);
        const oldData = {
            name, email, password, confirmPassword
        };
        return res.render("client/auth/register.ejs", {
            errors: errors,
            oldData: oldData
        });

    }
    await registerNewUser(name, email, password);
    return res.redirect("/login");
}

export {
    getLoginPage,
    getRegisterPage,
    postRegisterPage,
}