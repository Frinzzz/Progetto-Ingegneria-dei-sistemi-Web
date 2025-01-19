"use strict";
const express = require("express");
const User = require("../models/User").default;
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email già in uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: false,
      avatar: "/avatars/blank.png",
    });


    await user.save();

    res.status(201).json({ message: "Registrazione completata con successo", user });
  } catch (error) {
    console.error("Errore durante la registrazione:", error.message);
    res.status(500).json({ error: "Errore durante la registrazione" });
  }
});



router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password non valida" });
    }


    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;

    res.json({ message: "Login riuscito", user });
  } catch (error) {
    console.error("Errore nel login:", error);
    res.status(500).json({ error: "Errore durante il loginn" });
  }
});


router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Errore durante il logout" });
    }
    res.json({ message: "Logout completato" });
  });
});


router.get("/status", (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      isLoggedIn: true,
      isAdmin: req.session.isAdmin || false,
    });
  }
  res.json({ isLoggedIn: false, isAdmin: false });
});






module.exports = router;
