<template>
  <div id="app-container">
    <NavbarView />
    <div v-if="isSuperAdmin && viewingAsName" class="view-as-banner">
      <span>On {{ viewingAsName }}'s profile</span>
      <button @click="leaveViewAs">leave {{ viewingAsName }} profile</button>
    </div>
    <router-view id="main-content"></router-view>
    <FooterView />
  </div>
</template>

<script>
import NavbarView from "./components/NavbarView.vue";
import FooterView from "./components/FooterView.vue";
import { mapState } from "vuex";

export default {
  name: 'App',
  components: {
    NavbarView,
    FooterView,
  },
  computed: {
    ...mapState(['userRole', 'viewingAsName']),
    isSuperAdmin() {
      return ['admin', 'superadmin'].includes(this.userRole);
    }
  },
  watch: {
    '$route.query.viewAs': {
      immediate: true,
      handler(viewAs) {
        if (viewAs && this.isSuperAdmin) {
          const viewAsName = this.$route.query.viewAsName;
          this.$store.commit('setViewingAs', { userId: viewAs, userName: viewAsName });
          this.$store.dispatch('fetchMembers', viewAs);
        }
      }
    }
  },
  methods: {
    leaveViewAs() {
      const ownUserId = this.$store.state.user.uid;
      this.$store.commit('setViewingAs', { userId: null, userName: null });
      this.$store.dispatch('fetchMembers', ownUserId);
      this.$router.push('/profile');
    }
  },
  created() {
    const { viewAs, viewAsName } = this.$route.query;
    if (viewAs && this.isSuperAdmin) {
      this.$store.commit('setViewingAs', { userId: viewAs, userName: viewAsName });
      this.$store.dispatch('fetchMembers', viewAs);
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin: 0 !important;
  padding: 0 !important;
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#main-content {
  flex: 1;
  padding-top: 40px; /* Add some space below the navbar */
}

.title {
  margin-top:40px;
  font-size: 30px;
  font-weight: bold;
  color: var(--blue);
}

.button {
  background-color: var(--blue);
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 15px;
  border-radius: 10px;
  cursor: pointer;
}

.button:hover {
  background-color: var(--lightBlue);
}

:root {
  --blue: #12B4FF;
  --lightBlue: #7CD5FF;
  --pink: #fb6b90;
  --title: #6A6A6A;
  --lightGrey: #f1f1f1;
}

body.dark {
  --blue: #0d84b5;
  --lightBlue: #5a9db8;
  --pink: #c95673;
  --title: #a9a9a9;
  --lightGrey: #2a2a2a;
  background-color: #1a1a1a;
  color: #fff;
}

.content {
  margin-top: -30px !important;
  margin-left: 0 !important;
}

.view-as-banner {
  background-color: #f8d7da;
  margin-top: 40px;
  color: #721c24;
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #f5c6cb;
}

.view-as-banner button {
  margin-left: 15px;
  background-color: #721c24;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
</style>