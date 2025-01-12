import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());

app.use(express.json({limit: '16kb'}));

app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use(express.static('public'));

app.use(cookieParser()); //This is used to parse the cookies data



/**
 * IMPORT ROUTES
 */

import userRoutes from "./routes/user.routes.js";


//http://localhost:3000/api/v1/users
app.use('/api/v1/users', userRoutes);





export { app };