<template>
    <div class="content">
        <p class="title">Sign In</p>
        <form @submit.prevent="login">
            <div class="form_input_container">
                <p class="form_text" :class="{ dark: darkMode }">Email</p>
                <div class="form_input">
                    <input 
                        style="padding-left:10px" 
                        type="email" 
                        name="email" 
                        id="email" 
                        v-model="email" 
                        class="form_input"
                        placeholder="Enter email adress"
                        :class="{ dark: darkMode }"
                    >
                </div>
            </div>
            <div class="form_input_container">
                <p class="form_text" :class="{ dark: darkMode }">Password</p>
                <div class="form_input">
                    <input 
                        style="padding-left:10px" 
                        type="password" 
                        name="password" 
                        id="password" 
                        v-model="password" 
                        class="form_input"
                        placeholder="Enter password"
                        :class="{ dark: darkMode }"
                    >
                </div>
            </div>
            <p class="button-container"><input class="button" type="submit" value="Log In"></p>
            <p class="redirect-text" @click="changeTab('Sign-Up')">Don't have an account ?</p>
            <div class="error-container">
                <p :class="['error-message', { 'visible': errorMessage }]" v-if="errorMessage">{{ errorMessage }}</p>
            </div>
        </form>
    </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default {
    data() {
        return {
            email: '',
            password: '',
            errorMessage: '',
            errorTimeout: null
        }
    },
    methods: {
        async login() {
            this.errorMessage = '';
            if (this.errorTimeout) {
                clearTimeout(this.errorTimeout);
            }

            const auth = getAuth();
            try {
                const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;

                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    await signOut(auth);
                    this.showError("Unrecognized credentials");
                } else {
                    this.$store.dispatch('fetchMembers');
                    this.$router.push('/home');
                }
            } catch (error) {
                // For security, show a generic message for most login errors
                this.showError("Unrecognized credentials");
            }
        },
        showError(message) {
            this.errorMessage = message;
            this.errorTimeout = setTimeout(() => {
                this.errorMessage = '';
            }, 5000);
        },
        changeTab(tab) {
            this.$router.push('/' + tab.toLowerCase());
        }
    },
    computed: {
        darkMode() {
      return this.$store.state.darkMode;
    }
    }
}
</script>

<style>
.redirect-text {
    font-weight:bold;
    cursor:pointer;
    text-align:center;
}

.redirect-text:hover {
    text-decoration: underline;
}

.error-container {
    height: 20px; /* Reserve space to prevent layout shift */
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.error-message {
    color: red;
    font-weight: bold;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.5s ease, visibility 0s linear 0.5s;
}

.error-message.visible {
    opacity: 1;
    visibility: visible;
    transition: opacity 0.5s ease;
}

.button-container {
  text-align: center;
}

.form_input::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: black;
  opacity: 1; /* Firefox */
}

.form_input:-ms-input-placeholder { /* Internet Explorer 10-11 */
  color: black;
}

.form_input::-ms-input-placeholder { /* Microsoft Edge */
  color: black;
}

.form_input.dark::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: white;
  opacity: 1; /* Firefox */
}

.form_input.dark:-ms-input-placeholder { /* Internet Explorer 10-11 */
  color: white;
}

.form_input.dark::-ms-input-placeholder { /* Microsoft Edge */
  color: white;
}
</style>