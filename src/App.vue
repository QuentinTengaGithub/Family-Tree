<template>
  <div id="app-container" :class="{'dark-mode-bg': darkMode, 'light-mode-bg': !darkMode}">
    <NavbarView />
    <div v-if="isSuperAdmin && viewingAsName" class="view-as-banner">
      <span>On {{ viewingAsName }}'s profile</span>
      <a class="leave" @click="leaveViewAs">leave {{ viewingAsName }}'s profile</a>
    </div>
    <div :style="contentContainerStyle">
      <router-view id="main-content"></router-view>
    </div>
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
          ...mapState(['userRole', 'viewingAsName', 'darkMode']),
          isSuperAdmin() {
              return ['admin', 'superadmin'].includes(this.userRole);
          },
          contentContainerStyle() {
      if (this.$route.path === '/home') {
        return {
          width: '100%',
          height: '100%',
          padding: '0',
          margin: '0',
        };
      }
      return {
        margin: '0', // Remove margin
        width: '100%', // Take full width
        flex: 1, // Let it grow to fill available space
        boxSizing: 'border-box', // Ensure padding and border are included in the width
        padding: '40px 0', // Remove horizontal padding
      };
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  max-width: 100%;
  overflow-x: hidden;
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

.title {
  margin-top:20px;
  font-size: 30px;
  font-weight: bold;
  color: var(--blue);
}

.leave {
  padding: 10px 20px;
  border:solid 1px blue;
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
  --content-bg: rgba(255, 255, 255, 0.7);
  --divider-color: black;
  --input-border-color: black;
}

body.dark {
  --blue: #0d84b5;
  --lightBlue: #5a9db8;
  --pink: #c95673;
  --title: #a9a9a9;
  --lightGrey: #2a2a2a;
  background-color: #1a1a1a; /* Old background */
  color: #fff;
  --divider-color: white;
  --input-border-color: white;
  --content-bg: rgba(0, 0, 0, 0.7);
}

.content {
  background-color: var(--content-bg);
  padding: 20px 0;
  border-radius: 12px;
  margin: 30px 50px 0; /* 60px top, 50px sides, 0 bottom */
}

.view-as-banner {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #f5c6cb;
  margin-top:40px;
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

#app-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/wallpaper_night.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  z-index: -1; /* Ensure it stays behind content */
}

.light-mode-bg::before {
  filter: invert(100%);
}

.dark-mode-bg::before {
  filter: none;
}
</style>