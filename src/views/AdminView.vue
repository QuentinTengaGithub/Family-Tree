<template>
  <div class="content">
    <p class="title">{{ $t("admin.admin_panel") }}</p>
    <p>{{ $t("admin.welcome") }}</p>

    <h2>{{ $t("admin.all_users") }}</h2>
    <div v-if="users.length">
      <ul>
        <div v-for="user in users" :key="user.uid">
          <button class="edit_photo_button" :class="{ dark:darkMode }" @click="selectUser(user)">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_eye_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_eye.png')" alt="" />
            {{ $t("admin.view") }}
          </button>
          {{ user.name }} ({{ user.email }}) - Role: {{ user.role }}
        </div>
      </ul>
    </div>
    <p v-else>No users found.</p>
  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default {
  name: 'AdminView',
  data() {
    return {
      users: [],
      selectedUser: null
    }
  },
  async created() {
    await this.fetchAllUsers();
  },
  methods: {
    async fetchAllUsers() {
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      this.users = userSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
    },
    selectUser(user) {
      this.selectedUser = user;
      this.$router.push({ path: '/members', query: { viewAs: user.uid, viewAsName: user.name } });
    }
  },
  computed: {
    darkMode() {
      return this.$store.state.darkMode;
    }
  },
}
</script>

<style>

</style>
