<template>
  <div class="content">
    <p class="title">Admin Panel</p>
    <p>Welcome, admin!</p>

    <h2>All Users</h2>
    <div v-if="users.length">
      <ul>
        <li v-for="user in users" :key="user.uid">
          {{ user.name }} ({{ user.email }}) - Role: {{ user.role }}
          <button @click="selectUser(user)">View Tree</button>
        </li>
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
  }
}
</script>
