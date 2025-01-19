
<template>
  <div class="movie-details-container">
    <div class="movie-details">
      <!-- Locandina e Pulsanti -->
      <div class="movie-poster">
        <img :src="movie.poster" alt="Movie Poster" />
        <div class="movie-actions">
          <button class="favorites-button" @click="addToFavorites">
            Aggiungi ai Preferiti
          </button>
          <button class="watch-button" @click="playMovie">
            Guarda il Film
          </button>
          <!-- Pulsante Elimina visibile solo agli admin -->
          <button v-if="isAdmin" class="delete-button" @click="deleteMovie">
            Elimina Film
          </button>
        </div>
      </div>

      <!-- Info del Film -->
      <div class="movie-info">
        <h1 class="movie-title">{{ movie.title }}</h1>
        <p class="movie-description">{{ movie.description }}</p>
        <p class="movie-rating">
          Valutazione media: {{ averageRating.toFixed(1) }} / 5
        </p>
      </div>
    </div>

 <!-- Recensioni -->
 <div class="movie-reviews">
      <h2 class="reviews-title">Recensioni degli Utenti</h2>
      <form class="review-form" @submit.prevent="submitReview">
        <label for="rating">Valutazione:</label>
        <input
          type="number"
          id="rating"
          v-model="newReview.rating"
          min="1"
          max="5"
          required
        />
      
        <label for="comment">Commento:</label>
        <textarea id="comment" v-model="newReview.comment" required></textarea>

        <button class="submit-review-button" type="submit">Aggiungi Recensione</button>
      </form>

      <ul class="reviews-list">
        <li v-for="review in reviews" :key="review._id" class="review-item">
          <strong>{{ review.username }}</strong>
          <p>Valutazione: {{ review.rating }} / 5</p>
          <p>{{ review.comment }}</p>
          <button
            v-if="review.canDelete"
            class="delete-review-button"
            @click="deleteReview(review._id)"
          >
            Elimina
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>



<script lang="ts">
import axios from "axios";
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import eventBus from "../eventBus";

export default {
  setup() {
    const isAdmin = computed(() => eventBus.isAdmin);
    const user = ref(null);
    const route = useRoute();
    const router = useRouter();
    const movie = ref({
      title: "",
      description: "",
      poster: "",
    });
    const reviews = ref([]);
    const averageRating = ref(0);
    const newReview = ref({
      rating: 0,
      comment: "",
    });

    const userResponse = async () => {
        const userR = await axios.get('http://localhost:3000/api/users/profile', { withCredentials: true });
        user.value = userR.data; 
   };




    const loadMovieDetails = async () => {
    try {
        const movieResponse = await axios.get(`http://localhost:3000/api/movies/${route.params.id}`);
        const movieData = movieResponse.data;
        console.log("Dati del film:", movieData.movie);
        // Popola i dettagli del film
        movie.value = {
            title: movieData.movie.title || "Titolo non disponibile",
            description: movieData.movie.description || "Descrizione non disponibile",
            poster: movieData.movie.poster || "",
        };
        // Richiesta per le recensioni del film
        const reviewsResponse = await axios.get(`http://localhost:3000/api/movies/${route.params.id}/reviews`);
        reviews.value = reviewsResponse.data.map((review) => ({
            _id: review._id,
            username: review.user?.username || "Anonimo",
            rating: review.rating,
            comment: review.comment,
            canDelete: user.value ? review.user?.username === user.value.username : false,
        }));

        calculateAverageRating(reviews.value);
    } catch (error) {
        console.error("Errore nel caricamento dei dettagli del film:", error);
        alert("Errore durante il caricamento del film. Riprova più tardi.");
    }
};

    const playMovie = () => {
      const titleSlug = movie.value.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      router.push(`/movies/${titleSlug}/player`);
    };

    // Calcola la valutazione media
    const calculateAverageRating = (reviewsData) => {
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        averageRating.value = totalRating / reviewsData.length;
      } else {
        averageRating.value = 0;
      }
    };

    const submitReview = async () => {
    if (!newReview.value.rating || !newReview.value.comment) {
        alert("Per favore, compila tutti i campi!");
        return;
    }

    try {
        const response = await axios.post(
            `http://localhost:3000/api/movies/${route.params.id}/rating`,
            {
                rating: newReview.value.rating,
                comment: newReview.value.comment,
            },
            { withCredentials: true }
        );

        reviews.value.push({
            _id: response.data._id,
            username: response.data.username || "Anonimo", 
            rating: response.data.rating,
            comment: response.data.comment,
        });

        calculateAverageRating(reviews.value);
        newReview.value = { rating: 0, comment: "" };
        alert("Recensione aggiunta con successo!");
        loadMovieDetails();
    } catch (error) {
        console.error("Errore nell'aggiungere la recensione:", error);
        alert("Errore durante l'invio della recensione.");
    }
};


    const addToFavorites = async () => {
      try {
        await axios.post(
          `http://localhost:3000/api/users/favorites/${route.params.id}`
        );
        alert("Film aggiunto ai preferiti!");
      } catch (error) {
        console.error("Errore nell'aggiungere ai preferiti:", error);
        alert("Errore durante l'aggiunta ai preferiti.");
      }
    };


    const deleteMovie = async () => {
      try {
        const isAdmin = user.value.isAdmin;
        await axios.delete(`http://localhost:3000/api/movies/${route.params.id}`, { data: { isAdmin }, });
        alert("Film eliminato con successo!");
        router.push("/");
      } catch (error) {
        console.error("Errore nell'eliminare il film:", error);
        alert("Errore durante l'eliminazione del film.");
      }
    };

    const deleteReview = async (reviewId) => {
      try {
        const username = user.value.username;
        await axios.delete(`http://localhost:3000/api/movies/${route.params.id}/reviews/${reviewId}`, { withCredentials: true, data: {username}, });
        reviews.value = reviews.value.filter((review) => review._id !== reviewId);
        calculateAverageRating(reviews.value);
        alert("Recensione eliminata con successo!");
      } catch (error) {
        console.error("Errore durante l'eliminazione della recensione:", error);
        alert("Errore durante l'eliminazione della recensione.");
      }
    };


    onMounted(async () => {
  try {
    // Tenta di caricare il profilo utente
    await userResponse();
  } catch (error) {
    console.warn("Utente non autenticato:", error);
    user.value = null; 
  }
  // Carica i dettagli del film
  loadMovieDetails();
});

    return {
      userResponse,
      movie,
      reviews,
      averageRating,
      newReview,
      addToFavorites,
      playMovie,
      submitReview,
      deleteMovie,
      deleteReview,
      isAdmin,
    };
  },
};
</script>

<style scoped>
/* Container generale */
.movie-details-container {
  padding: 2rem;
  background-color: black;
  color: white;
  font-family: Arial, sans-serif;
}

/* Sezione principale: Locandina e Informazioni */
.movie-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Locandina del film */
.movie-poster {
  width: 300px;
  flex-shrink: 0;
}

.movie-poster img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}

/* Azioni sotto la locandina */
.movie-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.favorites-button,
.watch-button,
.delete-button,
.delete-review-button {
  padding: 0.75rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.favorites-button {
  background-color: #28a745; /* Verde */
  color: white;
}

.favorites-button:hover {
  background-color: #218838; /* Verde scuro */
}

.watch-button {
  background-color: #007bff; /* Blu */
  color: white;
}

.watch-button:hover {
  background-color: #0056b3; /* Blu scuro */
}

.delete-button,
.delete-review-button {
  background-color: #a72828; /* Verde */
  color: white;
}

.delete-button:hover
.delete-review-button:hover {
  background-color: #882121; /* Verde scuro */
}

/* Informazioni del film */
.movie-info {
  flex: 1;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.movie-description {
  font-size: 1.2rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.movie-rating {
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1rem;
}

/* Sezione Recensioni */
.movie-reviews {
  margin-top: 2rem;
}

.reviews-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}

/* Form di recensione */
.review-form {
  background-color: #333;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  margin: 0 auto 2rem; /* Centra il form e aggiunge margine inferiore */
  max-width: 600px; /* Limita la larghezza del form */
  box-sizing: border-box;
}

.review-form label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
}

.review-form input,
.review-form textarea {
  width: calc(100% - 1.5rem); /* Riduce larghezza per rispettare il padding */
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #555;
  color: white;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.review-form input:focus,
.review-form textarea:focus {
  outline: none;
  background-color: #666;
}

.review-form textarea {
  resize: vertical; 
  min-height: 100px; /* Altezza minima per il commento */
}

.submit-review-button {
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

.submit-review-button:hover {
  background-color: #218838;
}


.submit-review-button {
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

.submit-review-button:hover {
  background-color: #218838;
}

/* Lista delle recensioni */
.reviews-list {
  list-style: none;
  padding: 0;
}

.review-item {
  background-color: #333;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.review-item strong {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.review-item p {
  margin: 0.5rem 0;
}

#rating {
  margin-right: 40px;
}


/* Layout mobile: elementi in colonna */
@media (max-width: 768px) {
  .movie-details {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .movie-poster {
    width: 100%; /* Adatta la larghezza */
    margin-bottom: 1.5rem;
  }

  .movie-info {
    text-align: center; /* Allinea al centro per migliorare l'aspetto su mobile */
  }

  .movie-actions {
    width: 100%; /* Adatta la larghezza */
    align-items: center; /* Centra i pulsanti */
  }

  .movie-actions button {
    width: 80%; /* Pulsanti più larghi su dispositivi mobili */
  }

  .movie-reviews {
    padding: 1rem; /* Margini interni per uno stile uniforme */
  }

  .review-form {
    width: 100%; /* Adatta la larghezza del form */
    padding: 1rem;
  }

  .reviews-list {
    width: 100%; /* Adatta la larghezza della lista */
  }
}

</style>


