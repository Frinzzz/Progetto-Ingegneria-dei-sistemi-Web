const Review = require('../models/Review');
const Movie = require('../models/Movie');

// Aggiungi una recensione
exports.addReview = async (req, res) => {
    try {
        const { userId, rating, comment } = req.body;

        if (!userId || !rating || !comment) {
            return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
        }

        const review = new Review({
            movie: req.params.movieId,
            user: userId,
            rating,
            comment,
        });

        await review.save();

        // Aggiorna il contatore delle recensioni del film (opzionale)
        await Movie.findByIdAndUpdate(req.params.movieId, { $inc: { reviewCount: 1 } });

        res.status(201).json({ message: 'Recensione aggiunta con successo', review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nell\'aggiunta della recensione' });
    }
};

// Ottieni tutte le recensioni di un film
exports.getMovieReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ movie: req.params.movieId }).populate('user', 'username');
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero delle recensioni' });
    }
};

// Ottieni tutte le recensioni di un utente
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId }).populate('movie', 'title');
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero delle recensioni utente' });
    }
};