import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import webRoutes from './routes/web';
import connection from './config/database';
import initDatabase from './config/seed';


const app = express();
const port = process.env.PORT || 8080;

//template engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//public file
app.use(express.static('public'));

//request req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//seeding data

initDatabase();

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

