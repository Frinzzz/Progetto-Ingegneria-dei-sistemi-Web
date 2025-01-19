<template>
  <nav>
    <!-- Logo -->
    <img
      src="http://localhost:3000/images/logo.png"
      alt="Logo"
      class="logo"
    />

    <!-- Hamburger menu (solo su mobile) -->
    <button class="hamburger" @click="toggleMenu">
      <span class="line"></span>
      <span class="line"></span>
      <span class="line"></span>
    </button>


     <!-- Menu di navigazione -->
    <div class="menu" :class="{ 'menu-open': isMenuOpen }">
    <router-link to="/" style="text-decoration: none;"><h3>Home</h3></router-link>
    <router-link to="/login" v-if="!isLoggedIn" style="text-decoration: none;"><h3>Login</h3></router-link>
    <router-link to="/profile" v-if="isLoggedIn" style="text-decoration: none;"><h3>Profilo</h3></router-link>
    <router-link to="/admin" v-if="isAdmin" style="text-decoration: none;"><h3>Admin</h3></router-link>
    <button v-if="isLoggedIn" @click="logout" style="text-decoration: none;" class="logout-button"><h3>Logout</h3></button>
  </div>
  <!-- Lente di ingrandimento e barra di ricerca -->
  <div class="search-container">
      <button @click="toggleSearchBar" class="search-button">
        <img
          src="http://localhost:3000/images/search.png"
          alt="Search"
          class="search-icon"
        />
      </button>
      <input
        v-if="isSearchBarVisible"
        type="text"
        placeholder="Cerca un film..."
        v-model="searchQuery"
        @keydown.enter="searchMovies"
      />
    </div>
  </nav>
</template>

<script lang="ts">
import axios from "axios";
import { computed, ref } from "vue";
import eventBus from "../eventBus";
import { useRouter } from "vue-router";

export default {
  setup() {
    const isLoggedIn = computed(() => eventBus.isLoggedIn);
    const isAdmin = computed(() => eventBus.isAdmin);
    const searchQuery = ref("");
    const isSearchBarVisible = ref(false);
    const isMenuOpen = ref(false); // Stato del menu hamburger
    const router = useRouter();

    const toggleSearchBar = () => {
      isSearchBarVisible.value = !isSearchBarVisible.value;
    };

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const closeMenu = () => {
      isMenuOpen.value = false;
    };

    const logout = async () => {
      try {
        await axios.post(
          "http://localhost:3000/api/auth/logout",
          {},
          { withCredentials: true }
        );
        eventBus.isLoggedIn = false;
        eventBus.isAdmin = false;
        router.push("/login");
        closeMenu(); // Chiude il menu se aperto
      } catch (error) {
        console.error("Errore durante il logout:", error);
      }
    };

    const searchMovies = async () => {
      if (!searchQuery.value.trim()) {
        eventBus.emit("updateMovieList", []);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/api/movies/search",
          {
            params: { title: searchQuery.value },
          }
        );
        eventBus.emit("updateMovieList", response.data);
        closeMenu(); // Chiude il menu se aperto
      } catch (error) {
        console.error("Errore durante la ricerca dei film:", error);
      }
    };

    return {
      isLoggedIn,
      isAdmin,
      logout,
      searchQuery,
      isSearchBarVisible,
      isMenuOpen,
      toggleSearchBar,
      toggleMenu,
      closeMenu,
      searchMovies,
    };
  },
};
</script>


<style scoped>
/* Stile generale */
nav {
  display: flex;
  align-items: center;
  background-color: #333;
  color: #fff;
  padding: 1rem;
  position: relative;
}

h3 {
  font-weight: bold;
  color: white;
  text-decoration: none;
  margin: 0;
}

a {
  text-decoration: none;
  color: white;
}

a:hover {
  color: #00bfff;
}

/* Logo */
.logo {
  width: 100px;
  height: auto;
}

/* Hamburger menu */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 25px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
}

.hamburger .line {
  width: 100%;
  height: 3px;
  background-color: white;
}

/* Menu */
.menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.menu-open {
  display: flex;
}

.search-container {
  margin-left: auto;
  position: relative;
  display: flex;
  align-items: center; /* Allinea l'icona e l'input verticalmente */
  width: 200px; /* Limita la larghezza del contenitore */
}

.search-container input {
  flex: 1; 
  background-color: #fff;
  color: #333;
  border: none;
  padding: 0.4rem 0.8rem; 
  font-size: 0.9rem; 
  border-radius: 4px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1); /* Ombra leggera */
  transition: box-shadow 0.3s ease;
}

.search-container input::placeholder {
  color: #aaa;
  font-size: 0.85rem;
}

.search-container input:focus {
  outline: none;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

/* Stile dell'icona della lente */
.search-icon {
  position: absolute;
  right: 10px; 
  width: 18px; 
  height: 18px; 
  cursor: pointer; 
  color: #333; 
}

.search-button {
  background: none; 
  border: none; 
  padding: 0; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  width: 30px; 
  height: 30px; 
}

/* Stile dell'immagine della lente */
.search-button .search-icon {
  width: 20px; 
  height: 20px; 
  object-fit: contain; 
}


.logout-button {
  background: none; 
  border: none; 
  padding: 0; 
  margin: 0; 
  color: inherit; 
  font: inherit; 
  cursor: pointer; 
  text-decoration: none; 
}


/* Mobile specific styles */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .menu {
    display: none; /* Nasconde il menu di default */
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    background-color: #333;
    padding: 1rem;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
  }

  .menu-open {
    display: flex;
  }

  h3 {
    font-size: 1rem; /* Dimensione più piccola per i link */
  }

  .search-container {
    width: 100%;
  }
}
</style>
