import { Request, Response } from 'express';
import Review from '../models/Review';
import Movie from '../models/Movie';

interface AddReviewRequest extends Request {
    body: {
        userId: string;
        rating: number;
        comment: string;
    };
    params: {
        movieId: string;
    };
}

interface GetMovieReviewsRequest extends Request {
    params: {
        movieId: string;
    };
}

interface GetUserReviewsRequest extends Request {
    params: {
        userId: string;
    };
}

// Aggiungi una recensione
export const addReview = async (req: AddReviewRequest, res: Response): Promise<void> => {
    try {
        const { userId, rating, comment } = req.body;

        if (!userId || !rating || !comment) {
            res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
            return;
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
export const getMovieReviews = async (req: GetMovieReviewsRequest, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find({ movie: req.params.movieId }).populate('user', 'username');
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero delle recensioni' });
    }
};

// Ottieni tutte le recensioni di un utente
export const getUserReviews = async (req: GetUserReviewsRequest, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find({ user: req.params.userId }).populate('movie', 'title');
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore nel recupero delle recensioni utente' });
    }
};