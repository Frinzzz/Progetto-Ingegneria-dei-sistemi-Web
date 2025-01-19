import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import cors from 'cors'; 
import moviesRouter from './routes/movies';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import reviewsRouter from './routes/reviews';

const app: express.Express = express();
const PORT: number = 3000;

const session = require('express-session');
app.use(session({
    secret: '426800', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/streaming')
    .then(() => {
        console.log('Connessione al database MongoDB riuscita');
    })
    .catch((error: Error) => {
        console.error('Errore di connessione a MongoDB:', error);
    });

app.use('/api/movies', moviesRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter); 
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/Movies', express.static(path.join(__dirname, 'Movies')));

app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});