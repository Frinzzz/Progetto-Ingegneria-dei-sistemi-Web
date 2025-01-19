<template>
  <div class="register-container">
    <div class="register-box">
      <h1 class="register-title">Registrati</h1>
      <form @submit.prevent="register">
        <div class="input-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="formData.username"
            required
            placeholder="Inserisci il tuo username"
          />
        </div>

        <div class="input-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            placeholder="Inserisci la tua email"
          />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            required
            placeholder="Inserisci la tua password"
          />
        </div>

        <div class="input-group">
          <label for="confirmPassword">Conferma Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="formData.confirmPassword"
            required
            placeholder="Conferma la tua password"
          />
        </div>

        <button class="register-button" type="submit">Registrati</button>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p class="login-link">
        Hai già un account?
        <router-link to="/login">Accedi</router-link>
      </p>
    </div>
  </div>
</template>

  
  <script lang="ts">
  import axios from 'axios';
  
  export default {
    name: 'Register',
    data() {
      return {
        formData: {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        },
        errorMessage: '',
        successMessage: '',
      };
    },
    methods: {
      async register() {
        this.errorMessage = '';
        this.successMessage = '';
  
        if (this.formData.password !== this.formData.confirmPassword) {
          this.errorMessage = 'Le password non coincidono!';
          return;
        }
  
        try {
          const response = await axios.post('http://localhost:3000/api/auth/register', {
            username: this.formData.username,
            email: this.formData.email,
            password: this.formData.password,
          });
  
          if (response.status === 201) {
            this.successMessage = 'Registrazione completata con successo!';
            this.formData.username = '';
            this.formData.email = '';
            this.formData.password = '';
            this.formData.confirmPassword = '';
          }
        } catch (error) {
          this.errorMessage =
            error.response?.data?.error || 'Errore nella registrazione. Riprova più tardi.';
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Container centrale */
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: black;
  }
  
  /* Riquadro di registrazione */
  .register-box {
    background-color: #333; 
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  }
  
  /* Titolo di registrazione */
  .register-title {
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
    background-color: #555; 
    color: white;
    font-size: 1rem;
  }
  
  .input-group input:focus {
    outline: none;
    background-color: #666;
  }
  
  /* Pulsante di registrazione */
  .register-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .register-button:hover {
    background-color: #0056b3;
  }
  
  /* Messaggio di errore */
  .error {
    color: #ff6b6b;
    text-align: center;
    margin-top: 1rem;
  }
  
  /* Messaggio di successo */
  .success {
    color: #28a745;
    text-align: center;
    margin-top: 1rem;
  }
  
  /* Link per il login */
  .login-link {
    color: white;
    text-align: center;
    margin-top: 1rem;
  }
  
  .login-link a {
    color: #17a2b8; 
    text-decoration: none;
    font-weight: bold;
  }
  
  .login-link a:hover {
    text-decoration: underline;
  }
  </style>
  
  