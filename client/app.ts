"use strict";
import { createApp } from "vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import axios from "axios";

import Home from "./components/Home.vue";
import Login from "./components/Login.vue";
import Profile from "./components/Profile.vue";
import Admin from "./components/Admin.vue";
import Register from "./components/Register.vue";
import Navbar from "./components/Navbar.vue"; 
import MovieDetails from "./components/MovieDetails.vue";
import Player from "./components/Player.vue";

import "./style.css"; 

import eventBus from './eventBus';

axios.defaults.withCredentials = true;

const requireAuth = (to: RouteRecordRaw, from: RouteRecordRaw, next: Function): void => {
  console.log("Stato EventBus al middleware:", {
    isLoggedIn: eventBus.isLoggedIn,
    isAdmin: eventBus.isAdmin,
  });

  if (eventBus.isLoggedIn) {
    next();
  } else {
    console.warn("Utente non autenticato, reindirizzamento al login");
    next("/login"); 
  }
};

const requireAdmin = (to: RouteRecordRaw, from: RouteRecordRaw, next: Function): void => {
  if (eventBus.isLoggedIn && eventBus.isAdmin) {
    console.log("Admin autenticato, accesso consentito");
    next();
  } else {
    console.log("Accesso negato, reindirizzamento");
    next(eventBus.isLoggedIn ? "/" : "/login");
  }
};

const routes: Array<RouteRecordRaw> = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/profile", component: Profile, beforeEnter: requireAuth },
  { path: "/admin", component: Admin, beforeEnter: requireAdmin },
  { path: "/movies/:id", component: MovieDetails },
  { path: '/movies/:title/player', component: Player },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp({
  components: {
    Navbar,
  },
});

app.use(router);

app.mount("#app");