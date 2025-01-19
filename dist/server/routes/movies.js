"use strict";


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Movie_1 = __importDefault(require("../models/Movie"));
const Movie = Movie_1.default; 
const User_1 = __importDefault(require("../models/User")); 
const router = (0, express_1.Router)();
const Review = __importDefault(require('../models/Review')).default; 
const path = require('path');
const fs = require('fs');
const multer = require("multer");



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const moviesPath = path.resolve(__dirname, "../Movies/");
    console.log("Salvataggio film in:", moviesPath);
    cb(null, moviesPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log("Nome file generato:", uniqueName);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Middleware per servire gli avatar
router.use("/Movies", express_1.static(path.join(__dirname, "../Movies")));


// Endpoint per aggiungere un nuovo film
router.post('/add', upload.single('movie'), async (req, res) => {
  try {
      const { title, description, category, poster } = req.body;
      const movieFileName = req.file.filename; 
     
      const newMovie = new Movie({
          title,
          description,
          category,
          poster,
          fileName: movieFileName, 
      });

      await newMovie.save();
      res.status(201).json({ message: 'Film aggiunto con successo!' });
  } catch (error) {
      console.error('Errore durante l\'aggiunta del film:', error);
      res.status(500).json({ error: 'Errore durante l\'aggiunta del film' });
  }
});




// Ottieni tutti i film
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield Movie_1.default.find();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero dei film' });
    }
}));


// Ottieni film in evidenza 
router.get('/featured', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {

        const featuredMovies = yield Movie_1.default.find();
        res.json(featuredMovies);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero dei film in evidenza' });
    }
}));

// Endpoint per cercare i film in base al titolo
router.get('/search', async (req, res) => {
    try {
      const { title } = req.query;
      if (!title) {
        return res.status(400).json({ error: "Titolo non fornito." });
      }
  
      // Cerca film con titoli simili utilizzando una regex
      const movies = await Movie.find({ title: { $regex: title, $options: 'i' } });
      res.status(200).json(movies);
    } catch (error) {
      console.error('Errore durante la ricerca dei film:', error);
      res.status(500).json({ error: 'Errore durante la ricerca dei film.' });
    }
  });

router.get("/:id", async (req, res) => {
    try {
        const movie = await Movie_1.default.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: "Film non trovato" });
        }
        res.json({
            movie: {
                _id: movie._id,
                title: movie.title,
                description: movie.description,
                poster: movie.poster,
                fileName: movie.fileName, 
            },
        });
    } catch (error) {
        console.error("Errore nel recupero del film:", error);
        res.status(500).json({ error: "Errore durante il recupero del film." });
    }
});


// Elimina un film
router.delete("/:id", async (req, res) => {
  try {

    if (!req.body.isAdmin) {
      return res.status(403).json({ error: "Non autorizzato" });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: "Film non trovato" });
    }

    
    const moviePath = path.join(__dirname, "../Movies", movie.fileName);
    if (fs.existsSync(moviePath)) {
      fs.unlinkSync(moviePath);
    }

    
    await Review.deleteMany({ movie: req.params.id });


    await Movie.findByIdAndDelete(req.params.id);

    res.json({ message: "Film e recensioni eliminati con successo" });
  } catch (error) {
    console.error("Errore durante l'eliminazione del film:", error);
    res.status(500).json({ error: "Errore durante l'eliminazione del film" });
  }
});





router.post('/:id/rating', async (req, res) => {
    try {
      const { rating, comment } = req.body;
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Utente non autenticato." });
      }
  
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Il voto deve essere tra 1 e 5." });
      }
      const movie = await Movie_1.default.findById(req.params.id);
      if (!movie) {
        return res.status(404).json({ error: "Film non trovato." });
      }
      const existingReview = await Review.findOne({ user: userId, movie: movie._id });
      if (existingReview) {
        existingReview.rating = rating;
        existingReview.comment = comment || existingReview.comment;
        await existingReview.save();
      } else {
        const newReview = new Review({
          user: userId,
          movie: movie._id,
          rating,
          comment,
        });
        await newReview.save();
      }
      const reviews = await Review.find({ movie: movie._id });
      const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
      movie.rating = totalRatings / reviews.length;
      await movie.save();
  
      res.json({
        message: "Recensione aggiunta o aggiornata con successo!",
        rating: movie.rating,
        reviews,
        user: userId,
      });
    } catch (error) {
      console.error("Errore nell'aggiungere la recensione:", error);
      res.status(500).json({ error: "Errore nell'aggiungere la recensione." });
    }
  });
  



// Aggiungi un film alla lista dei preferiti di un utente
router.post('/:id/favorite', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: 'L\'ID utente è obbligatorio' });
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        if (!user.favorites.includes(req.params.id)) {
            user.favorites.push(req.params.id);
            yield user.save();
        }

        res.status(200).json({ message: 'Film aggiunto ai preferiti' });
    } catch (error) {
        res.status(500).json({ error: 'Errore nell\'aggiunta del film ai preferiti' });
    }
}));

router.delete('/:id/favorite', async (req, res) => {
    try {
      console.log('Sessione utente:', req.session); 
  
      const userId = req.session.userId; 
      console.log('UserID ricevuto:', userId);
  
      if (!userId) {
        return res.status(400).json({ error: "L'ID utente è obbligatorio" });
      }
      const user = await User_1.default.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' });
      }
  
      user.favorites = user.favorites.filter(favoriteId => favoriteId.toString() !== req.params.id);
      await user.save();
  
      res.status(200).json({ message: 'Film rimosso dai preferiti', favorites: user.favorites });
    } catch (error) {
      console.error("Errore nella rimozione del film dai preferiti:", error);
      res.status(500).json({ error: "Errore nella rimozione del film dai preferiti" });
    }
  });
  



// Ottieni la media dei voti per un film
router.get('/:id/average-rating', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movie = yield Movie_1.default.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Film non trovato' });
        }

        const averageRating = movie.reviews.length > 0
            ? movie.reviews.reduce((a, b) => a + b.rating, 0) / movie.reviews.length
            : 0;

        res.json({ averageRating });
    } catch (error) {
        res.status(500).json({ error: 'Errore nel calcolo della media dei voti' });
    }
}));


// Endpoint per ottenere il file del film per la riproduzione
router.get('/:title/player', async (req, res) => {
  try {
      const movieTitle = req.params.title;
      
      const movie = await Movie.findOne({ fileName: movieTitle });
      if (!movie) {
          return res.status(404).json({ error: 'Film non trovato' });
      }
      const moviePath = path.join(__dirname, '../Movies', movie.fileName); 

      if (!fs.existsSync(moviePath)) {
          return res.status(404).json({ error: 'File video non trovato' });
      }
      
      res.sendFile(moviePath);
  } catch (error) {
      console.error('Errore durante il recupero del file video:', error);
      res.status(500).json({ error: 'Errore nella riproduzione del film' });
  }
});



// Ottieni le recensioni per un film specifico
router.get("/:movieId/reviews", async (req, res) => {
  try {
      const reviews = await Review.find({ movie: req.params.movieId }).populate("user", "username");
      res.json(reviews);
  } catch (error) {
      console.error("Errore nel recupero delle recensioni:", error);
      res.status(500).json({ error: "Errore durante il recupero delle recensioni." });
  }
});





router.get("/slug/:titleSlug", async (req, res) => {
  try {
      const titleSlug = req.params.titleSlug.replace(/-/g, " ");
      const movie = await Movie.findOne({ title: { $regex: new RegExp(`^${titleSlug}$`, "i") } });
      if (!movie) {
          return res.status(404).json({ error: "Film non trovato" });
      }
      res.json({ movie });
  } catch (error) {
      console.error("Errore nel recupero del film:", error);
      res.status(500).json({ error: "Errore durante il recupero del film." });
  }
});


// Endpoint per eliminare una recensione
router.delete("/:movieId/reviews/:reviewId", async (req, res) => {
  try {
    console.log("Inizio eliminazione recensione");
    const loggedUsername = req.body.username; 
    const { movieId, reviewId } = req.params;

    // Trova la recensione specifica con il suo ID
    const review = await Review.findById(reviewId).populate("user", "username");
    if (!review) {
      return res.status(404).json({ error: "Recensione non trovata." });
    }

   
    if (review.movie.toString() !== movieId) {
      return res.status(400).json({ error: "Recensione non associata al film specificato." });
    }

   
    if (review.user.username !== loggedUsername) {
      return res.status(403).json({ error: "Non autorizzato a eliminare questa recensione." });
    }


    await review.deleteOne();

    res.status(200).json({ message: "Recensione eliminata con successo." });
  } catch (error) {
    console.error("Errore durante l'eliminazione della recensione:", error);
    res.status(500).json({ error: "Errore durante l'eliminazione della recensione." });
  }
});






exports.default = router;