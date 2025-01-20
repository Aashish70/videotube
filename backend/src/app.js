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
import tweetRoutes from "./routes/tweet.routes.js";
import vidoeRoutes from "./routes/video.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import likeRoutes from "./routes/like.routes.js";


//http://localhost:3000/api/v1/users
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tweets', tweetRoutes);
app.use('/api/v1/videos', vidoeRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/likes', likeRoutes);





export { app };