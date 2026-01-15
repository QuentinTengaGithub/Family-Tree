<template>
    <div>
        <div class="navbar" :class="{ dark: darkMode, 'no-user': !user }">
            <!-- overlay animation -->
            <div
                class="lightswitch-overlay"
                :class="{
                on: isThemeAnimating && !darkMode,
                off: isThemeAnimating && darkMode
                }"
            ></div>
            <div class="navbar-left">
                <!-- NAVBAR / LEFT ITEMS -->
                <template v-if="user">
                    <div @click="changeTab('Home')" class="navbar-items">
                        <img v-if="activeTab === 'Home' && darkMode" src="../assets/google_icons_home_fill_dark.png" />
                        <img v-else-if="activeTab === 'Home' && !darkMode" src="../assets/google_icons_home_fill.png" />
                        <img v-else-if="activeTab !== 'Home' && darkMode" src="../assets/google_icons_home_dark.png" />
                        <img v-else src="../assets/google_icons_home.png" />
                    </div>
                    <div @click="changeTab('Add-Member')" :class="{ active: activeTab === 'Accueil', dark: darkMode }" class="navbar-items">{{ $t("navbar.add_a_member") }}</div>
                    <div @click="changeTab('Tree')" :class="{ active: activeTab === 'Tree', dark: darkMode }" class="navbar-items">{{ $t("navbar.tree") }}</div>
                    <div @click="changeTab('Members')" :class="{ active: activeTab === 'Members', dark: darkMode }" class="navbar-items">{{ $t("navbar.members") }}</div>
                    <div v-if="user && (user.role === 'admin' || user.role === 'superadmin')" @click="changeTab('Admin')" :class="{ active: activeTab === 'Admin', dark: darkMode }" class="navbar-items">{{ $t("navbar.admin") }}</div>
                </template>
            </div>

            <!-- MOBILE HAMBURGER (only visible on small screens) -->
            <button
                v-if="user"
                class="hamburger"
                :class="{ dark: darkMode }"
                @click="toggleMobileMenu"
                aria-label="Open menu"
                :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
            >
                <!-- 3 horizontal lines icon -->
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" :fill="darkMode ? '#fff' : '#000'">
                    <path d="M120-680v-80h720v80H120Zm0 480v-80h720v80H120Zm0-240v-80h720v80H120Z"/>
                </svg>
            </button>

            <img class="navbar-logo" style="width:100px; height:30px; margin:0 auto" :src="require('../assets/app_logo.png')" alt="Relatly logo" />

            <!-- NAVBAR / RIGHT ITEMS -->
            <div class="navbar-right">
                <!-- Language toggle (always visible, even when logged out) -->
                <button
                  class="navbar-items lang-toggle"
                  :class="{ dark: darkMode }"
                  type="button"
                  :aria-label="locale === 'fr' ? 'Switch language to English' : 'Changer la langue en français'"
                  @click="toggleLocale"
                >
                  <img
                    class="lang-flag"
                    :src="locale === 'fr'
                      ? require('@/assets/flags/french.png')
                      : require('@/assets/flags/english.png')"
                    :alt="locale === 'fr' ? 'Français' : 'English'"
                  />
                  <span class="lang-label">{{ locale === 'fr' ? 'FR' : 'EN' }}</span>
                </button>

                <div @click="toggleDarkMode" class="navbar-items sun">
                  <img v-if="darkMode" src="../assets/moon.png" title="DARK MODE" />
                  <img v-else src="../assets/sun.png" title="LIGHT MODE" />
                </div>

                <template v-if="user">
                  <div @click="changeTab('Profile')" class="logout-container">
                    <img v-if="activeTab === 'Profile' && darkMode" src="../assets/google_icons_account_fill_dark.png" class="profile-icon" />
                    <img v-else-if="activeTab === 'Profile' && !darkMode" src="../assets/google_icons_account_fill.png" class="profile-icon" />
                    <img v-else-if="darkMode" src="../assets/google_icons_account_dark.png" class="profile-icon" />
                    <img v-else src="../assets/google_icons_account.png" class="profile-icon" />
                    <span class="logout-text" v-if="!darkMode">{{ $t("navbar.my_profile") }}</span>
                    <span class="logout-text" style="color:white" v-if="darkMode">{{ $t("navbar.my_profile") }}</span>
                  </div>
                  <div @click="logout" class="navbar-items logout-container">
                    <img :src="darkMode ? require('../assets/google_icons_logout_dark.png') : require('../assets/google_icons_logout.png')" alt="Logout Icon" class="logout-icon" />
                    <span class="logout-text" v-if="!darkMode">{{ $t("navbar.logout") }}</span>
                    <span class="logout-text" style="color:white" v-if="darkMode">{{ $t("navbar.logout") }}</span>
                  </div>
                </template>
            </div>
        </div>

        <!-- MOBILE MENU DROPDOWN -->
        <div
          v-if="user && mobileMenuOpen"
          class="mobile-menu"
          :class="{ dark: darkMode }"
        >
          <div class="mobile-menu-inner">
            <div @click="mobileNav('Home')" class="mobile-item">
              <img :src="darkMode ? require('../assets/google_icons_home_dark.png') : require('../assets/google_icons_home.png')" alt="Logout Icon" class="logout-icon" />
              {{ $t("navbar.home") }}
            </div>
            <div @click="mobileNav('Add-Member')" class="mobile-item">
              <img :src="darkMode ? require('../assets/google_icons_add_a_member_dark.png') : require('../assets/google_icons_add_a_member.png')" alt="Logout Icon" class="logout-icon" />
              {{ $t("navbar.add_a_member") }}
            </div>
            <div @click="mobileNav('Tree')" class="mobile-item">
              <img :src="darkMode ? require('../assets/google_icons_tree_dark.png') : require('../assets/google_icons_tree.png')" alt="Logout Icon" class="logout-icon" />
              {{ $t("navbar.tree") }}
            </div>
            <div @click="mobileNav('Members')" class="mobile-item">
              <img :src="darkMode ? require('../assets/google_icons_members_dark.png') : require('../assets/google_icons_members.png')" alt="Logout Icon" class="logout-icon" />
              {{ $t("navbar.members") }}
            </div>
            <div
              v-if="user && (user.role === 'admin' || user.role === 'superadmin')"
              @click="mobileNav('Admin')"
              class="mobile-item"
            >
            <img :src="darkMode ? require('../assets/google_icons_key_dark.png') : require('../assets/google_icons_key.png')" alt="Logout Icon" class="logout-icon" />
            {{ $t("navbar.admin") }}
            </div>
            <div class="mobile-sep" />
            <div @click="mobileNav('Profile')" class="mobile-item">
              <img :src="darkMode ? require('../assets/google_icons_account_dark.png') : require('../assets/google_icons_account.png')" alt="Logout Icon" class="logout-icon" />
              {{ $t("navbar.my_profile") }}
            </div>
            <div @click="mobileLogout" class="mobile-item">
              <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_logout_dark.png')" alt="" />
              <img v-else class="btn-icon" :src="require('@/assets/google_icons_logout.png')" alt="" />
              {{ $t("navbar.logout") }}
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";

export default {
    data() {
        return {
            isThemeAnimating: false,
            themeAnimTimer: null,
            mobileMenuOpen: false
        };
    },
    computed: {
        darkMode() {
            return this.$store.state.darkMode;
        },
        locale() {
            return this.$store.state.locale || this.$i18n?.locale || 'en';
        },
        user() {
            return this.$store.state.user;
        },
        activeTab() {
            const path = this.$route.path;
            if (path.startsWith('/home')) return 'Home';
            if (path.startsWith('/members')) return 'Members';
            if (path.startsWith('/tree')) return 'Tree';
            if (path.startsWith('/add-member')) return 'Accueil';
            if (path.startsWith('/admin')) return 'Admin';
            if (path.startsWith('/profile')) return 'Profile';
            if (path.startsWith('/sign-up')) return 'SignUp';
            if (path.startsWith('/sign-in')) return 'SignIn';
            return 'Home'; // Fallback
        }
    },
    methods: {
        toggleLocale() {
            const next = (this.locale === 'fr') ? 'en' : 'fr';
            if (this.$i18n) this.$i18n.locale = next;
            try { localStorage.setItem('locale', next); } catch (e) { /* ignore */ }
            this.$store.commit('setLocale', next);
        },
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        },
        mobileNav(tab) {
            this.mobileMenuOpen = false;
            this.changeTab(tab);
        },
        mobileLogout() {
            this.mobileMenuOpen = false;
            this.logout();
        },
        changeTab(tab) {
            this.$router.push('/' + tab.toLowerCase());
        },
        toggleDarkMode() {
      // relance propre si on spam click
      this.isThemeAnimating = false;
      clearTimeout(this.themeAnimTimer);

      // 1) on toggle d'abord le thème
      this.$store.commit('toggleDarkMode');

      // 2) on déclenche l'overlay
      this.isThemeAnimating = true;

      // 3) on stoppe l'anim après la durée CSS
      this.themeAnimTimer = setTimeout(() => {
        this.isThemeAnimating = false;
      }, 520);
    },
        logout() {
            const auth = getAuth();
            signOut(auth).then(() => {
                this.$router.push('/sign-in');
            });
        }
    },
    watch: {
        // close menu on navigation
        '$route.path'() {
            this.mobileMenuOpen = false;
        }
    }
}
</script>

<style>
.mobile-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: block;
}

.navbar-logo {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 30px;
  object-fit: contain;
  pointer-events: none;
}

.lightswitch-overlay {
  position: absolute;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
  transform: translateX(-110%);
  opacity: 0;
}

/* "OFF" -> tu passes en dark: un voile sombre traverse */
.lightswitch-overlay.off {
  background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12), rgba(0,0,0,0.85) 70%);
  animation: lightsOff 520ms ease-in-out forwards;
}

/* "ON" -> tu passes en light: un voile clair traverse */
.lightswitch-overlay.on {
  background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.95), rgba(255,255,255,0.35) 70%);
  animation: lightsOn 520ms ease-in-out forwards;
}

@keyframes lightsOff {
  0%   { transform: translateX(-110%); opacity: 0; filter: blur(0px); }
  20%  { opacity: 1; }
  60%  { transform: translateX(0%); opacity: 1; filter: blur(0.5px); }
  100% { transform: translateX(110%); opacity: 0; filter: blur(0px); }
}

@keyframes lightsOn {
  0%   { transform: translateX(110%); opacity: 0; filter: blur(0px); }
  20%  { opacity: 1; }
  60%  { transform: translateX(0%); opacity: 1; filter: blur(0.5px); }
  100% { transform: translateX(-110%); opacity: 0; filter: blur(0px); }
}

.navbar {
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    flex-direction: horizontal;
    border-bottom:solid 1px var(--lightGrey);
    width: 100vw;
    position:fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    margin: 0 !important;
    padding: 4px;
    justify-content: space-between;
    overflow: hidden;
}
.navbar.dark {
    background-color:rgba(0, 0, 0, 0.7);
}

.navbar-items {
    display: flex;
    align-items: center;
    margin-right: 10px;
    color: black;
    cursor: pointer;
    padding:5px 15px;
    width:fit-content;
    border-radius: 10px;
}

/* Language toggle */
.lang-toggle {
    border: 1px solid rgba(0,0,0,0.18);
    background: rgba(255,255,255,0.6);
    font-weight: 700;
    font-size: 13px;
    padding: 5px 10px;
    gap: 8px;
}
.lang-toggle.dark {
    border: 1px solid rgba(255,255,255,0.22);
    background: rgba(0,0,0,0.25);
}

.lang-flag {
    width: 22px;
    height: 16px;
    border-radius: 3px;
    object-fit: cover;
    display: block;
    box-shadow: 0 1px 3px rgba(0,0,0,0.18);
}

.lang-label {
    line-height: 1;
}

.navbar-items.dark {
    color:white;
}

.navbar-items:hover {
    background-color: var(--lightGrey);
}

.navbar-items.active {
    font-weight: bold;
    color:black;
}

.navbar-items.dark.active {
    color:white;
}

.navbar-items:last-child {
    margin-left: auto;
    margin-right: 20px;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
}

/* Hamburger hidden on desktop */
.hamburger {
  display: none;
  border: none;
  background: transparent;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.hamburger:hover {
  background-color: var(--lightGrey);
}

.mobile-menu {
  display: none;
}

@media (max-width: 780px) {

/* Mobile: hamburger left, theme icon right (also works on SignIn/SignUp where user is null) */
.navbar{
  justify-content: flex-start;
}
.navbar-right{
  margin-left: auto;
}
.hamburger{
  order: -1;
}

  /* reduce navbar content for mobile */
  .navbar-left {
    display: none;
  }

  .navbar-right .logout-container,
  .navbar-right .sun {
    display: none;
  }

  /* Keep theme switch visible on mobile */
  .navbar-right .sun{
    display: inline-flex;
  }

  /* But still hide profile/logout icons on the right */
  .navbar-right .logout-container{
    display: none;
  }

  .hamburger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-menu {
    display: block;
    position: fixed;
    top: 48px; /* below navbar */
    left: 0;
    width: 100vw;
    z-index: 1001;
    background: rgba(255, 255, 255, 0.95);
    border-bottom: solid 1px var(--lightGrey);
    box-shadow: 0 14px 40px rgba(0,0,0,.25);
  }

  .mobile-menu.dark {
    background: rgba(0, 0, 0, 0.95);
  }

  .mobile-menu-inner {
    padding: 10px 12px;
    display: grid;
    gap: 8px;
  }

  .mobile-item {
    padding: 12px 14px;
    border-radius: 12px;
    cursor: pointer;
    color: black;
    background: rgba(255,255,255,.6);
    text-align: left;
    font-weight: 600;
  }

  .mobile-menu.dark .mobile-item {
    color: white;
    background: rgba(255,255,255,.08);
  }

  .mobile-item:active {
    transform: scale(0.99);
  }

  .mobile-sep {
    height: 1px;
    background: rgba(0,0,0,.15);
    margin: 6px 0;
  }

  .mobile-menu.dark .mobile-sep {
    background: rgba(255,255,255,.15);
  }
}

.profile-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 15px;
    border-radius: 10px;
    margin-right: 10px;
    transition: background-color 0.3s ease;
}

.profile-container:hover {
    background-color: var(--lightGrey);
}

.profile-icon {
    width: 20px;
    height: 20px;
    margin-right: 5px; /* Space between icon and text */
}

.profile-text {
    max-width: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: max-width 0.3s ease-in-out, opacity 0.3s ease-in-out;
    opacity: 0;
    color: black; /* Default color */
}

.profile-container.dark .profile-text {
    color: white;
}

.logout-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 15px;
    border-radius: 10px;
    margin-right: 10px;
    transition: background-color 0.3s ease;
}

.logout-container:hover {
    background-color: var(--lightGrey);
}

.logout-icon {
    width: 20px;
    height: 20px;
    margin-right: 5px; /* Space between icon and text */
}

.logout-text {
    max-width: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: max-width 0.3s ease-in-out, opacity 0.3s ease-in-out;
    opacity: 0;
    color: black; /* Default color */
}

.logout-container:hover .logout-text {
    max-width: 100px; /* Adjust as needed */
    opacity: 1;
}

.logout-container.dark .logout-text {
    color: white;
}

@media (max-width: 780px) {
  .navbar {
    justify-content: flex-start;
  }

  .navbar-right{
    margin-left: auto;
    display: flex;
    justify-content: flex-end; /* pousse au max à droite */
    align-items: center;
    gap: 6px; /* espace entre langue et soleil */
    padding-right: 6px; /* colle un peu plus au bord */
  }

  /* enlève la marge générale en mobile (sinon ça décale vers la gauche) */
  .navbar-right .navbar-items{
    margin-right: 0;
  }

  /* s'assure que le soleil est vraiment au bord droit */
  .navbar-right .sun{
    margin-right: 0 !important;
  }

  /* optionnel : compacter un peu le bouton langue en mobile */
  .navbar-right .lang-toggle{
    margin-right: 0;
    padding: 4px 8px;
  }
}

</style>
