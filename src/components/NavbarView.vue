<template>
    <div>
        <div class="navbar" :class="{ dark: darkMode }">
            <div class="navbar-left">
                <!-- NAVBAR / LEFT ITEMS -->
                <template v-if="user">
                    <div @click="changeTab('Home')" class="navbar-items">
                        <img v-if="activeTab === 'Home' && darkMode" src="../assets/home_fill_dark.png" />
                        <img v-else-if="activeTab === 'Home' && !darkMode" src="../assets/home_fill.png" />
                        <img v-else-if="activeTab !== 'Home' && darkMode" src="../assets/home_dark.png" />
                        <img v-else src="../assets/home.png" />
                    </div>
                    <div @click="changeTab('Add-Member')" :class="{ active: activeTab === 'Accueil', dark: darkMode }" class="navbar-items">Home</div>
                    <div @click="changeTab('Tree')" :class="{ active: activeTab === 'Tree', dark: darkMode }" class="navbar-items">Tree</div>
                    <div @click="changeTab('Members')" :class="{ active: activeTab === 'Members', dark: darkMode }" class="navbar-items">Members</div>
                    <div v-if="user && user.role === 'admin'" @click="changeTab('Admin')" :class="{ active: activeTab === 'Admin', dark: darkMode }" class="navbar-items">Admin</div>
                </template>
            </div>

            <!-- NAVBAR / RIGHT ITEMS -->
            <div class="navbar-right">
                <div @click="toggleDarkMode" class="navbar-items sun">
                    <img v-if="darkMode" src="../assets/moon.png" title="DARK MODE" />
                    <img v-else src="../assets/sun.png" title="LIGHT MODE" />
                </div>
                
                <template v-if="user">
                    <div @click="changeTab('Profile')" class="logout-container">
                        <img v-if="activeTab === 'Profile' && darkMode" src="../assets/account_fill_dark.png" class="profile-icon" />
                        <img v-else-if="activeTab === 'Profile' && !darkMode" src="../assets/account_fill.png" class="profile-icon" />
                        <img v-else-if="darkMode" src="../assets/account_dark.png" class="profile-icon" />
                        <img v-else src="../assets/account.png" class="profile-icon" />
                        <span class="logout-text" v-if="!darkMode">My Profile</span>
                        <span class="logut-text" style="color:white" v-if="darkMode">My Profile</span>
                    </div>
                    <div @click="logout" class="navbar-items logout-container">
                        <img :src="darkMode ? require('../assets/logout_dark.png') : require('../assets/logout.png')" alt="Logout Icon" class="logout-icon" />
                        <span class="logout-text" v-if="!darkMode">Logout</span>
                        <span class="logout-text" style="color:white" v-if="darkMode">Logout</span>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";

export default {
    computed: {
        darkMode() {
            return this.$store.state.darkMode;
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
        changeTab(tab) {
            this.$router.push('/' + tab.toLowerCase());
        },
        toggleDarkMode() {
            this.$store.commit('toggleDarkMode');
        },
        logout() {
            const auth = getAuth();
            signOut(auth).then(() => {
                this.$router.push('/sign-in');
            });
        }
    }
}
</script>

<style>
.navbar {
    background-color: #fff; 
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
}

.navbar.dark {
    background-color:black;
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
</style>