"use strict";
const express = require("express");
const path = require("path");
const multer = require("multer");
const User = require("../models/User").default; 
const Movie = require("../models/Movie").default; 
const router = express.Router();
const fs = require('fs').default;
const Review = require('../models/Review').default; 



// Middleware per verificare se l'utente è autenticato
const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Accesso non autorizzato. Effettua il login." });
  }
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarsPath = path.resolve(__dirname, "../avatars/");
    console.log("Salvataggio avatar in:", avatarsPath);
    cb(null, avatarsPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log("Nome file generato:", uniqueName);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Middleware per servire gli avatar
router.use("/avatars", express.static(path.join(__dirname, "../avatars")));

// Endpoint per recuperare il profilo
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato." });
    }
    const avatarUrl = user.avatar
      ? `${req.protocol}://${req.get("host")}${user.avatar}` 
      : null;

    res.status(200).json({
      avatar: avatarUrl,
      username: user.username,
      bio: user.bio,
      email: user.email,
      favorites: user.favorites,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Errore nel recupero del profilo utente:", error);
    res.status(500).json({ error: "Errore nel recupero del profilo utente." });
  }
});



// Endpoint per aggiornare il profilo
router.put("/profile", isAuthenticated, upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.session.userId;
    const { bio } = req.body;
    const avatarPath = req.file ? `/avatars/${req.file.filename}` : null;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato." });
    }

    // Aggiorna i campi
    if (bio) user.bio = bio;
    if (avatarPath) user.avatar = avatarPath;
    await user.save();

    res.status(200).json({
      message: "Profilo aggiornato con successo.",
      user: {
        avatar: `${req.protocol}://${req.get("host")}${user.avatar}`,
        username: user.username,
        bio: user.bio,
        email: user.email,
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error("Errore durante l'aggiornamento del profilo:", error);
    res.status(500).json({ error: "Errore durante l'aggiornamento del profilo." });
  }
});

// Ottieni i film preferiti
router.get("/favorites", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).populate("favorites"); 
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato." });
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error("Errore durante il recupero dei preferiti:", error);
    res.status(500).json({ error: "Errore durante il recupero dei preferiti." });
  }
});

// Aggiungi un film ai preferiti
router.post("/favorites/:movieId", isAuthenticated, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato." });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Film non trovato." });
    }

    if (user.favorites.includes(movieId)) {
      return res.status(400).json({ error: "Film già presente nei preferiti." });
    }

    user.favorites.push(movieId);
    await user.save();

    res.status(200).json({ message: "Film aggiunto ai preferiti", favorites: user.favorites });
  } catch (error) {
    console.error("Errore nell'aggiunta del film ai preferiti:", error);
    res.status(500).json({ error: "Errore nell'aggiunta del film ai preferiti." });
  }
});


// Endpoint per eliminare l'account
router.delete("/account", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato." });
    }
    
    await Review.deleteMany({ user: userId });
   
    req.session.destroy((err) => {
      if (err) {
        console.error("Errore durante la distruzione della sessione:", err);
      }
    });

    res.status(200).json({ message: "Account eliminato con successo." });
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'account:", error);
    res.status(500).json({ error: "Errore durante l'eliminazione dell'account." });
  }
});


module.exports = router;