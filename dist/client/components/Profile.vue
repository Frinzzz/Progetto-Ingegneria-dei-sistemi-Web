<template>
  <div v-if="isLoggedIn" class="profile-container">
    <h1 class="profile-header">Profilo Utente</h1>
    <div class="user-info">
      <!-- Avatar -->
      <img
        v-if="user.avatar"
        :src="user.avatar"
        alt="Avatar"
        class="user-avatar"
      />
      <div class="user-details">
        <h2>{{ user.username }}</h2>
        <button @click="editProfile" class="edit-profile-button">Modifica Profilo</button>
      </div>
    </div>
    <div>
      <h3>{{ user.bio }}</h3>
    </div>

    <div v-if="isEditing" class="edit-section">
      <form @submit.prevent="updateProfile">
        <label for="bio">Modifica Descrizione:</label>
        <textarea v-model="editableBio" id="bio" rows="4"></textarea>

        <label for="avatar">Modifica Avatar:</label>
        <input
          type="file"
          id="avatar"
          @change="handleFileUpload"
          accept="image/*"
        />

        <div class="form-buttons">
          <button type="submit" class="save-button">Salva Modifiche</button>
          <button type="button" @click="cancelEdit" class="cancel-button">Annulla</button>
        </div>
      </form>
    </div>

    <!-- Film Preferiti -->
    <h3 class="favorites-header">Film Preferiti</h3>
    <div class="favorites-carousel">
      <button @click="scrollLeft" class="carousel-button left">&lt;</button>
      <ul class="favorites-list">
        <li v-for="movie in favorites" :key="movie._id" class="favorite-item">
          <router-link :to="'/movies/' + movie._id">
            <img
              :src="movie.poster"
              alt="Poster del film"
              class="favorite-poster"
            />
          </router-link>
          <button @click="removeFavorite(movie._id)" class="remove-button">
            Rimuovi dai Preferiti
          </button>
        </li>
      </ul>
      <button @click="scrollRight" class="carousel-button right">&gt;</button>
    </div>

    <!-- Pulsante per eliminare l'account -->
    <button
      @click="deleteAccount"
      class="delete-account-button"
    >
      Elimina Account
    </button>
  </div>
  <div v-else>
    <p>Devi effettuare l'accesso per vedere il profilo.</p>
  </div>
</template>


<script lang="ts">
import axios from 'axios';
import { computed, ref, watch } from 'vue';
import eventBus from '../eventBus';
import { useRouter } from 'vue-router'; 

export default {
  setup() {
    const isLoggedIn = computed(() => eventBus.isLoggedIn);
    const user = ref(null);
    const favorites = ref([]);
    const isEditing = ref(false);
    const editableBio = ref('');
    const avatarFile = ref(null);

    const router = useRouter(); 

    const loadUserProfile = async () => {
      try {
        if (isLoggedIn.value) {
          const userResponse = await axios.get('http://localhost:3000/api/users/profile', { withCredentials: true });
          user.value = userResponse.data;
          editableBio.value = user.value.bio;
          const favoritesResponse = await axios.get('http://localhost:3000/api/users/favorites', { withCredentials: true });
          favorites.value = favoritesResponse.data.favorites;
        } else {
          user.value = null;
          favorites.value = [];
        }
      } catch (error) {
        console.error('Errore durante il caricamento del profilo utente:', error);
        user.value = null;
        favorites.value = [];
      }
    };

    const editProfile = () => {
      isEditing.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
      editableBio.value = user.value.bio;
    };

    const handleFileUpload = (event) => {
      avatarFile.value = event.target.files[0];
      console.log("avatarFile:");
      console.log(avatarFile.value);
    };

    const deleteAccount = async () => {
      try {
        await axios.delete('http://localhost:3000/api/users/account', { withCredentials: true });
        alert('Account eliminato con successo!');
        eventBus.isLoggedIn = false; 
        router.push('/login'); 
      } catch (error) {
        console.error('Errore durante l\'eliminazione dell\'account:', error);
        alert('Errore durante l\'eliminazione dell\'account.');
      }
    };

    const updateProfile = async () => {
      try {
        const formData = new FormData();
        formData.append('bio', editableBio.value);
        if (avatarFile.value) {
          formData.append('avatar', avatarFile.value);
        }
        const response = await axios.put(
          'http://localhost:3000/api/users/profile',
          formData,
          { withCredentials: true }
        );

        user.value = response.data.user; 
        isEditing.value = false;
        alert('Profilo aggiornato con successo!');
      } catch (error) {
        console.error('Errore durante l\'aggiornamento del profilo:', error);
        alert('Errore durante l\'aggiornamento del profilo.');
      }
    };

    const removeFavorite = async (movieId) => {
      try {
        await axios.delete(`http://localhost:3000/api/movies/${movieId}/favorite`, {
          withCredentials: true, 
        });
        // Aggiorna la lista localmente
        favorites.value = favorites.value.filter(movie => movie._id !== movieId);
      } catch (error) {
        console.error('Errore durante la rimozione del film dai preferiti:', error);
      }
    };

    // Aggiunta delle funzioni per scorrere i film preferiti
    const scrollLeft = () => {
      const list = document.querySelector('.favorites-list');
      if (list) {
        list.scrollBy({ left: -200, behavior: 'smooth' });
      }
    };

    const scrollRight = () => {
      const list = document.querySelector('.favorites-list');
      if (list) {
        list.scrollBy({ left: 200, behavior: 'smooth' });
      }
    };

    watch(isLoggedIn, (newVal) => {
      if (newVal) {
        loadUserProfile();
      }
    });

    loadUserProfile();

    return {
      isLoggedIn,
      user,
      favorites,
      isEditing,
      editableBio,
      avatarFile,
      editProfile,
      cancelEdit,
      updateProfile,
      handleFileUpload,
      removeFavorite,
      deleteAccount,
      scrollLeft, 
      scrollRight, 
    };
  },
};
</script>


<style scoped>


.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: white;
  background-color: #1d1c1c;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.profile-header {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.user-details {
  flex: 1;
}

.user-details h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.edit-profile-button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
}

.edit-profile-button:hover {
  background-color: #218838;
}

.edit-section {
  margin-bottom: 20px;
}

.edit-section textarea,
.edit-section input[type="file"] {
  width: 100%;
  margin-bottom: 10px;
}

.form-buttons {
  display: flex;
  gap: 10px;
}

.save-button,
.cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-button {
  background-color: #007bff;
  color: white;
}

.cancel-button {
  background-color: #dc3545;
  color: white;
}

.favorites-header {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.favorites-carousel {
  position: relative;
}

.favorites-list {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  overflow: hidden; /* Nasconde la barra di scorrimento */
}

.favorite-item {
  text-align: center;
  flex-shrink: 0;
  width: 100px; /* Assicura che tutti gli elementi abbiano la stessa larghezza */
}

.favorite-poster {
  width: 100px;
  height: 150px;
  border-radius: 5px;
  object-fit: cover;
}

.remove-button {
  margin-top: 5px;
  padding: 5px 10px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 10;
}

.carousel-button.left {
  left: 0;
}

.carousel-button.right {
  right: 0;
}

.delete-account-button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.delete-account-button:hover {
  background-color: #c82333;
}
</style>


