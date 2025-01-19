<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">Login</h1>
      <form @submit.prevent="loginUser">
        <div class="input-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="text" required />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required />
        </div>

        <button class="login-button" type="submit">Accedi</button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p class="register-link">
        Non hai un account?
        <router-link to="/register">Registrati</router-link>
      </p>
    </div>
  </div>
</template>




<script lang="ts">
import axios from "axios";
import eventBus from "../eventBus";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async loginUser() {
      try {
        const response = await axios.post("http://localhost:3000/api/auth/login", {
          email: this.email,
          password: this.password,
        }, { withCredentials: true });

        console.log("Login riuscito:", response.data);

        // Controlla immediatamente lo stato utente
        const statusResponse = await axios.get("http://localhost:3000/api/auth/status", {
          withCredentials: true,
        });
        console.log("Stato utente aggiornato dopo login:", statusResponse.data);

        // Aggiorna l'EventBus
        eventBus.isLoggedIn = statusResponse.data.isLoggedIn;
        eventBus.isAdmin = statusResponse.data.isAdmin;

        console.log("EventBus aggiornato dopo login:", eventBus);

        // Reindirizza alla pagina profilo
        this.$router.push("/profile");
      } catch (error) {
        console.error("Errore durante il login:", error.response?.data || error.message);
        this.errorMessage = error.response?.data?.error || "Errore imprevisto. Riprova.";
      }
    },
  },
};
</script>

<style scoped>

/* Container centrale */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: black;
}

/* Riquadro di login */
.login-box {
  background-color: #333; /* Colore grigio scuro */
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

/* Titolo di login */
.login-title {
  color: white;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}

/* Gruppo di input */
.input-group {
  margin-bottom: 1.5rem;
  margin-right: 22px;
}

.input-group label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

/* Campi di input */
.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #555; /* Grigio più chiaro */
  color: white;
  font-size: 1rem;
}

.input-group input:focus {
  outline: none;
  background-color: #666;
}

/* Pulsante di login */
.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745; /* Verde */
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #218838; /* Verde scuro */
}

/* Messaggio di errore */
.error {
  color: #ff6b6b;
  text-align: center;
  margin-top: 1rem;
}

/* Link per registrarsi */
.register-link {
  color: white;
  text-align: center;
  margin-top: 1rem;
}

.register-link a {
  color: #17a2b8; /* Blu chiaro */
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>



