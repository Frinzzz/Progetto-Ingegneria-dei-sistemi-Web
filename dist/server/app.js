"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs = require('fs');
const path = require('path');
const cors_1 = __importDefault(require("cors"));
const movies_1 = __importDefault(require("./routes/movies"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const reviews_1 = __importDefault(require("./routes/reviews")); 

const app = (0, express_1.default)();
const PORT = 3000;


const session = require('express-session');
app.use(session({
    secret: '426800', // Cambialo con una stringa sicura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Abilita il middleware CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Consenti solo richieste da questa origine
    credentials: true, // Permetti l'invio di cookie e credenziali
}));

// Middleware per il parsing JSON
app.use(express_1.default.json());

// Connetti a MongoDB
mongoose_1.default.connect('mongodb://localhost:27017/streaming')
    .then(() => {
        console.log('Connessione al database MongoDB riuscita');
    })
    .catch((error) => {
        console.error('Errore di connessione a MongoDB:', error);
    });

// Rotte API
app.use('/api/movies', movies_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/reviews', reviews_1.default); 
app.use('/avatars', express_1.default.static(path.join(__dirname, 'avatars')));
app.use('/images', express_1.default.static(path.join(__dirname, 'images')));



// Serve i file statici
app.use(express_1.default.static(path.join(__dirname, '../client')));

// Gestisci il fallback per Vue Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});


// Servire file statici dalla cartella Movies
app.use('/Movies', express_1.default.static(path.join(__dirname, 'Movies')));


// Avvia il server
app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
