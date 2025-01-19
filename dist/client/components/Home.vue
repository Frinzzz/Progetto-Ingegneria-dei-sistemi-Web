<template>
  <div class="home-container">
    <!-- Logo -->
    <img
      src="http://localhost:3000/images/logo.png"
      alt="Logo"
      class="logo"
    />
    <!-- Titolo -->
    <h1 class="main-title">Benvenuto su Dragoming</h1>
    <h2 class="subtitle">Il tuo cinema a portata di click</h2>

    <!-- Messaggi e contenuto -->
    <div v-if="groupedMovies.length === 0 && !loading">
      <p>Nessun film disponibile al momento.</p>
    </div>
    <div v-else-if="loading">
      <p>Caricamento in corso...</p>
    </div>
    <div v-else>
      <div
        v-for="(movies, category) in groupedMovies"
        :key="category"
        class="category-section"
      >
        <h2>{{ category }}</h2>
        <div class="carousel-container">
          <button class="carousel-button left" @click="scrollLeft(category)">
            &#9664;
          </button>
          <div class="carousel" ref="carousels" :data-category="category">
            <div class="movie-card" v-for="movie in movies" :key="movie._id">
              <h3>{{ movie.title }}</h3>
              <router-link :to="`/movies/${movie._id}`">
                <img
                  :src="movie.poster"
                  :alt="movie.title"
                  v-if="movie.poster"
                />
              </router-link>
              <p>Rating: {{ movie.rating }}</p>
            </div>
          </div>
          <button class="carousel-button right" @click="scrollRight(category)">
            &#9654;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import eventBus from "../eventBus";

// Interfaccia per definire il tipo di film
interface Movie {
  _id: string;
  title: string;
  description: string;
  poster: string;
  rating: number;
  category: string;
}

export default {
  name: "Home",
  data() {
    return {
      featuredMovies: [] as Movie[], // Array completo dei film
      loading: true, // Stato del caricamento
    };
  },
  computed: {
    // Raggruppa i film per categoria
    groupedMovies() {
      return this.featuredMovies.reduce((groups, movie) => {
        if (!groups[movie.category]) {
          groups[movie.category] = [];
        }
        groups[movie.category].push(movie);
        return groups;
      }, {} as Record<string, Movie[]>);
    },
  },
  methods: {
    async fetchFeaturedMovies() {
      this.loading = true;
      try {
        const response = await axios.get<Movie[]>(
          "http://localhost:3000/api/movies/featured"
        );
        this.featuredMovies = response.data;
      } catch (error) {
        console.error("Errore nel recupero dei film:", error);
      } finally {
        this.loading = false;
      }
    },
    scrollLeft(category: string) {
      const carousel = this.$refs.carousels.find(
        (el: HTMLDivElement) => el.dataset.category === category
      ) as HTMLDivElement;
      if (carousel) {
        carousel.scrollBy({ left: -300, behavior: "smooth" });
      }
    },
    scrollRight(category: string) {
      const carousel = this.$refs.carousels.find(
        (el: HTMLDivElement) => el.dataset.category === category
      ) as HTMLDivElement;
      if (carousel) {
        carousel.scrollBy({ left: 300, behavior: "smooth" });
      }
    },
    updateMoviesList(movies: Movie[]) {
      this.featuredMovies = movies;
    },
  },
  mounted() {
    // Caricamento iniziale dei film
    this.fetchFeaturedMovies();

    // Ascolto degli eventi di aggiornamento lista film
    eventBus.on("updateMovieList", this.updateMoviesList);
  },
  beforeUnmount() {
    // Rimuove il listener per evitare memory leaks
    eventBus.off("updateMovieList", this.updateMoviesList);
  },
};
</script>

<style scoped>
.home-container {
  text-align: center;
  color: white;
  background-color: black;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.logo {
  width: 200px;
  height: auto;
  margin-bottom: 1rem;
}

.main-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.subtitle {
  font-size: 1.2rem;
  margin: 0.5rem 0 2rem 0;
  color: #aaa;
}

/* Categoria */
.category-section {
  margin-bottom: 2rem;
}

.carousel-container {
  display: flex;
  align-items: center;
  position: relative;
}

.carousel {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 1rem;
  padding: 0.5rem;
  overflow: hidden;
}

.movie-card {
  min-width: 200px;
  flex: 0 0 auto;
  text-align: center;
  border-radius: 4px;
  padding: 1rem;
  background: black;
}

.movie-card img {
  width: 150px; /* Larghezza predefinita */
  height: 225px; /* Altezza predefinita */
  object-fit: cover; /* Mantiene le proporzioni ritagliando il contenuto */
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.carousel-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 1rem;
  color: white;
}

.carousel-button.left {
  position: absolute;
  left: 0;
}

.carousel-button.right {
  position: absolute;
  right: 0;
}



/* Stili per dispositivi mobili */
@media (max-width: 768px) {
  .logo {
    width: 150px;
    margin-bottom: 1rem;
  }

  .main-title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .carousel {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .movie-card {
    min-width: 150px;
    padding: 0.5rem;
  }

  .movie-card img {
    width: 120px; /* Riduce la dimensione delle immagini */
    height: 180px; /* Altezza proporzionale */
  }

  .carousel-button {
    font-size: 1.5rem;
    padding: 0 0.5rem;
  }
}
</style>
