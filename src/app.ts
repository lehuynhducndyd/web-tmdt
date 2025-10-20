import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import webRoutes from './routes/web';
import connection from './config/database';
import initDatabase from './config/seed';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import configPassportLocal from './middleware/passport.local';


const app = express();
const port = process.env.PORT || 8080;
//template engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//public file
app.use(express.static('public'));



//session
app.use(session({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: process.env.SESSION_SECRET || 'a-very-secret-key',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL })
}))
//passport
import passport from 'passport';
import configPassportGoogle from './middleware/passport.google';
app.use(passport.session());

//config passport local
configPassportLocal();
configPassportGoogle();
//request req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//seeding data

initDatabase();
app.use((req, res, next) => {
    res.locals.user = req.user || null; // Pass user object to all views
    next();
});

webRoutes(app);


//test database connection and start server
(
    async () => {
        try {
            await connection();
            app.listen(port, () => {
                console.log(`Example app listening at http://localhost:${port}`);
            });
        } catch (error) {
            console.log('>>> Failed to connect to database', error);
        }
    }
)()
