<template>
    <div class="content">
        <p class="title">Sign Up</p>
        <form @submit.prevent="createAccount">
            <div class="form_input_container">
                <p class="form_text" :class="{ dark: darkMode }">Name</p>
                <div class="form_input">
                    <input 
                        style="padding-left:10px" 
                        type="text" 
                        name="name" 
                        id="name" 
                        v-model="name" 
                        class="form_input"
                        placeholder="Enter name"
                        :class="{ dark: darkMode }"
                    >
                </div>
            </div>
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
            <div class="form_input_container">
                <p class="form_text" :class="{ dark: darkMode }">Confirm password</p>
                <div class="form_input">
                    <input 
                        style="padding-left:10px" 
                        type="password" 
                        name="confirmPassword" 
                        id="confirmPassword" 
                        v-model="confirmPassword" 
                        class="form_input"
                        placeholder="Confirm password"
                        :class="{ dark: darkMode }"
                    >
                </div>
            </div>
            <p><input class="button" type="submit" value="Create Account"></p>
            <p class="redirect-text" @click="changeTab('Sign-In')">Already have an account ?</p>
        </form>
    </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default {
    data() {
        return {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    },
    methods: {
        async createAccount() {
            if (this.password !== this.confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            // Check for name uniqueness with a query
            const q = query(collection(db, "users"), where("name", "==", this.name));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                alert("This name is already taken. Please choose another one.");
                return;
            }

            const auth = getAuth();
            createUserWithEmailAndPassword(auth, this.email, this.password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    // Revert to using user.uid as the document ID
                    const userRef = doc(db, "users", user.uid);
                    setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        name: this.name,
                        role: user.email === 'quentinritt94@gmail.com' ? 'superadmin' : 'user'
                    });
                    this.$router.push('/sign-in');
                })
                .catch(error => {
                    alert(error.message);
                });
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
</style>