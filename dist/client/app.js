"use strict";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";

import Home from "./components/Home.vue";
import Login from "./components/Login.vue";
import Profile from "./components/Profile.vue";
import Admin from "./components/Admin.vue";
import Register from "./components/Register.vue";
import Navbar from "./components/Navbar.vue"; // Importa il componente Navbar
import MovieDetails from "./components/MovieDetails.vue";
import Player from "./components/Player.vue";

import "./style.css"; // Importa lo stile se necessario

import eventBus from './eventBus';

// Configura Axios per includere le credenziali (es. cookie di sessione)
axios.defaults.withCredentials = true;


// Protezione delle route
const requireAuth = (to, from, next) => {
  console.log("Stato EventBus al middleware:", {
    isLoggedIn: eventBus.isLoggedIn,
    isAdmin: eventBus.isAdmin,
  });

  if (eventBus.isLoggedIn) {
    next();
  } else {
    console.warn("Utente non autenticato, reindirizzamento al login");
    next("/login"); // Reindirizza alla pagina di login se non autenticato
  }
};



// Protezione per route admin
const requireAdmin = (to, from, next) => {
  if (eventBus.isLoggedIn && eventBus.isAdmin) {
    console.log("Admin autenticato, accesso consentito");
    next();
  } else {
    console.log("Accesso negato, reindirizzamento");
    next(eventBus.isLoggedIn ? "/" : "/login");
  }
};

// Definizione delle route
const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/profile", component: Profile, beforeEnter: requireAuth },
  { path: "/admin", component: Admin, beforeEnter: requireAdmin },
  { path: "/movies/:id", component: MovieDetails },
  { path: '/movies/:title/player', component: Player },
];

const router = createRouter({
  history: createWebHistory(), // Modalità SPA
  routes,
});

// Creazione dell'app Vue
const app = createApp({
  components: {
    Navbar, // Registra la Navbar come componente globale
  },
});

// Usa il router
app.use(router);

// Monta l'app
app.mount("#app");
