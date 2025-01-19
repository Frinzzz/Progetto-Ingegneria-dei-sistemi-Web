import express, { Router, Request, Response } from 'express';
import reviewController from '../controllers/reviewController';

const router: Router = express.Router();

// Aggiungi una recensione a un film
router.post('/:movieId', (req: Request, res: Response) => reviewController.addReview(req, res));

// Ottieni tutte le recensioni di un film
router.get('/:movieId', (req: Request, res: Response) => reviewController.getMovieReviews(req, res));

// Ottieni tutte le recensioni di un utente
router.get('/user/:userId', (req: Request, res: Response) => reviewController.getUserReviews(req, res));

export default router;