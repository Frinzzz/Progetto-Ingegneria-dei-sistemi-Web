<template>
  <div class="admin-container">
    <h1 class="admin-title">Admin Panel</h1>
    <form class="admin-form" @submit.prevent="addMovie">
      <div class="form-group">
        <label for="title">Titolo:</label>
        <input type="text" id="title" v-model="newMovie.title" required />
      </div>
      <div class="form-group">
        <label for="description">Descrizione:</label>
        <textarea id="description" v-model="newMovie.description" required></textarea>
      </div>
      <div class="form-group">
        <label for="category">Categoria:</label>
        <input type="text" id="category" v-model="newMovie.category" required />
      </div>
      <div class="form-group">
        <label for="poster">Poster URL:</label>
        <input type="text" id="poster" v-model="newMovie.poster" required />
      </div>
      <div class="form-group">
        <label for="movieFile">Carica Film:</label>
        <input
          type="file"
          id="movieFile"
          @change="handleMovieUpload"
          accept="video/*"
          required
        />
      </div>
      <button class="admin-button" type="submit">Aggiungi Film</button>
    </form>
    <p v-if="message" class="admin-message">{{ message }}</p>
  </div>
</template>


<script lang="ts">
import axios from "axios";
import { ref } from "vue";

export default {
  name: "Admin",
  setup() {
    const newMovie = ref({
      title: "",
      description: "",
      category: "",
      poster: "",
    });
    const movieFile = ref<File | null>(null);
    const message = ref("");

    const handleMovieUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        movieFile.value = target.files[0];
      }
    };

    const addMovie = async () => {
      if (!movieFile.value) {
        message.value = "Carica il film.";
        return;
      }

      const formData = new FormData();
      formData.append("title", newMovie.value.title);
      formData.append("description", newMovie.value.description);
      formData.append("category", newMovie.value.category);
      formData.append("poster", newMovie.value.poster);
      formData.append("movie", movieFile.value);

      try {
        const response = await axios.post("http://localhost:3000/api/movies/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.value = response.data.message;
        newMovie.value = { title: "", description: "", category: "", poster: "" };
        movieFile.value = null;
      } catch (error) {
        console.error("Errore durante l'aggiunta del film:", error);
        message.value = "Errore durante l'aggiunta del film.";
      }
    };

    return {
      newMovie,
      movieFile,
      message,
      handleMovieUpload,
      addMovie,
    };
  },
};
</script>

<style scoped>
/* Contenitore principale */
.admin-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: black;
  color: white;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

/* Titolo della pagina */
.admin-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
}

/* Form */
.admin-form {
  background-color: #333; /* Grigio scuro */
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 600px;
}

/* Gruppo dei campi di input */
.form-group {
  margin-bottom: 1.5rem;
  margin-right: 22px;
}

.form-group label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #555; /* Grigio medio */
  color: white;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  background-color: #666; /* Grigio chiaro */
}

/* Pulsante */
.admin-button {
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

.admin-button:hover {
  background-color: #218838; /* Verde scuro */
}

/* Messaggio di conferma o errore */
.admin-message {
  margin-top: 1.5rem;
  font-size: 1.1rem;
  text-align: center;
  color: #17a2b8; /* Blu chiaro */
}
</style>
