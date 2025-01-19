<template>
  <div class="player-container">
    <h1 class="player-title">Stai guardando: {{ movieTitle }}</h1>
    <div class="video-wrapper">
      <video v-if="videoUrl" controls autoplay>
        <source :src="videoUrl" type="video/mp4" />
        Il tuo browser non supporta il tag video.
      </video>
      <p v-else class="loading-message">Caricamento del film...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

export default {
  name: "Player",
  setup() {
    const route = useRoute();
    const movieTitle = ref(""); // Titolo del film
    const videoUrl = ref(""); // URL del video
    const errorMessage = ref(""); // Messaggio di errore, se necessario

    onMounted(async () => {
  try {
    console.log("Parametri della route:", route.params);

    // Ottieni il titolo slug dalla route
    const titleSlug = route.params.title as string;
    if (!titleSlug) {
      errorMessage.value = "Titolo non trovato nei parametri della route.";
      console.error(errorMessage.value);
      return;
    }

    // Richiedi i dettagli del film usando lo slug
    const response = await axios.get(`http://localhost:3000/api/movies/slug/${titleSlug}`);
    const movie = response.data.movie;

    if (movie) {
      movieTitle.value = movie.title;
      videoUrl.value = `http://localhost:3000/api/movies/${encodeURIComponent(movie.fileName)}/player`;
      console.log("Film caricato con successo:", movie);
    } else {
      errorMessage.value = "Film non trovato.";
      console.error(errorMessage.value);
    }
  } catch (error) {
    errorMessage.value = "Errore durante il caricamento del film.";
    console.error(errorMessage.value, error);
  }
});


    return {
      movieTitle,
      videoUrl,
      errorMessage, // Restituisci l'errore per eventuale visualizzazione
    };
  },
};
</script>



<style scoped>
/* Contenitore principale */
.player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: black;
  color: white;
  padding: 2rem;
  text-align: center;
  font-family: Arial, sans-serif;
}

/* Titolo del film */
.player-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
}

/* Wrapper per il video */
.video-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.8);
}

/* Stile del video */
video {
  width: 100%;
  height: auto;
  background-color: #000;
  border: none;
  outline: none;
}

/* Messaggio di caricamento */
.loading-message {
  font-size: 1.5rem;
  color: #ff6b6b;
  text-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
}
</style>
