const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Aggiungi una recensione a un film
router.post('/:movieId', reviewController.addReview);

// Ottieni tutte le recensioni di un film
router.get('/:movieId', reviewController.getMovieReviews);

// Ottieni tutte le recensioni di un utente
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;