<template>
  <div class="content" :style="contentBackgroundStyle">
    <p class="title">My Profile</p>

    <!-- Name Section -->
    <div class="profile-section" :style="sectionBackgroundStyle">
      <h2>Name</h2>
      <div v-if="!editMode.name">
        <p>{{ name }}</p>
        <button class="button" @click="startEdit('name')">Edit Name</button>
      </div>
      <div v-else>
        <div class="form_input_container">
          <input type="text" v-model="form.name" class="form_input" />
        </div>
        <button class="button" @click="updateName">Save</button>
        <button class="button-secondary" @click="cancelEdit('name')">Cancel</button>
      </div>
    </div>

    <!-- Email Section -->
    <div class="profile-section" :style="sectionBackgroundStyle">
      <h2>Email</h2>
      <div v-if="!editMode.email">
        <p>{{ email }}</p>
        <button class="button" @click="startEdit('email')">Edit Email</button>
      </div>
      <div v-else>
        <div class="form_input_container">
          <input type="email" v-model="form.email" class="form_input" />
        </div>
        <button class="button" @click="updateUserEmail">Save</button>
        <button class="button-secondary" @click="cancelEdit('email')">Cancel</button>
      </div>
    </div>

    <!-- Password Section -->
    <div class="profile-section" :style="sectionBackgroundStyle">
      <h2>Password</h2>
      <div v-if="!editMode.password">
        <p>********</p>
        <button class="button" @click="startEdit('password')">Change Password</button>
      </div>
      <div v-else>
        <div class="form_input_container">
          <p class="form_text">New Password</p>
          <input type="password" v-model="form.password" class="form_input" />
        </div>
        <div class="form_input_container">
          <p class="form_text">Confirm New Password</p>
          <input type="password" v-model="form.confirmPassword" class="form_input" />
        </div>
        <button class="button" @click="updateUserPassword">Save New Password</button>
        <button class="button-secondary" @click="cancelEdit('password')">Cancel</button>
      </div>
    </div>

  </div>
</template>

<script>
import { getAuth, updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default {
  name: 'ProfileView',
  data() {
    return {
      name: '',
      email: '',
      editMode: {
        name: false,
        email: false,
        password: false,
      },
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      }
    };
  },
      computed: {
        user() {
            return this.$store.state.user;
        },
        darkMode() {
            return this.$store.state.darkMode;
        },
        contentBackgroundStyle() {
            const imageUrl = this.darkMode
                ? require('@/assets/wallpaper_night.jpg')
                : require('@/assets/wallpaper_day.jpg');
            return {
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '40px',
                borderRadius: '12px',
            };
        },
        sectionBackgroundStyle() {
            return {
                backgroundColor: this.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                padding: '20px',
                borderRadius: '8px',
            };
        }
    },  methods: {
    fetchUserData() {
      if (this.user) {
        this.name = this.user.name;
        this.email = this.user.email;
      }
    },
    startEdit(field) {
      this.editMode[field] = true;
      // Pre-fill form with current data
      this.form.name = this.name;
      this.form.email = this.email;
      this.form.password = '';
      this.form.confirmPassword = '';
    },
    cancelEdit(field) {
      this.editMode[field] = false;
    },
    async reauthenticate() {
      const currentPassword = prompt("To save changes, please enter your current password:");
      if (!currentPassword) {
        return false;
      }
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(this.user.email, currentPassword);
      try {
        await reauthenticateWithCredential(auth.currentUser, credential);
        return true;
      } catch (error) {
        alert(`Authentication failed. Please check your password. Error: ${error.message}`);
        return false;
      }
    },
    async updateName() {
      if (!this.form.name || this.form.name === this.name) {
        alert("No new name entered.");
        this.editMode.name = false;
        return;
      }
      
      const userDocRef = doc(db, "users", this.user.uid);
      try {
        await updateDoc(userDocRef, { name: this.form.name });
        this.name = this.form.name;
        this.$store.commit('setUser', { ...this.user, name: this.form.name });
        alert("Name updated successfully!");
        this.editMode.name = false;
      } catch (error) {
        alert(`Failed to update name. Error: ${error.message}`);
      }
    },
    async updateUserEmail() {
       if (!this.form.email || this.form.email === this.email) {
        alert("No new email entered.");
        this.editMode.email = false;
        return;
      }
      
      const isAuthenticated = await this.reauthenticate();
      if (!isAuthenticated) return;

      const auth = getAuth();
      try {
        // Update auth first
        await updateEmail(auth.currentUser, this.form.email);
        
        // Then update Firestore
        const userDocRef = doc(db, "users", this.user.uid);
        await updateDoc(userDocRef, { email: this.form.email });

        this.email = this.form.email;
        this.$store.commit('setUser', { ...this.user, email: this.form.email });
        alert("Email updated successfully!");
        this.editMode.email = false;
      } catch (error) {
        alert(`Failed to update email. Error: ${error.message}`);
      }
    },
    async updateUserPassword() {
      if (!this.form.password || !this.form.confirmPassword) {
        alert("Please fill in both password fields.");
        return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        alert("New passwords do not match.");
        return;
      }

      const isAuthenticated = await this.reauthenticate();
      if (!isAuthenticated) return;

      const auth = getAuth();
      try {
        await updatePassword(auth.currentUser, this.form.password);
        alert("Password updated successfully!");
        this.editMode.password = false;
      } catch (error) {
        alert(`Failed to update password. Error: ${error.message}`);
      }
    }
  },
  created() {
    this.fetchUserData();
  },
  watch: {
    user(newUser) {
      if (newUser) {
        this.name = newUser.name;
        this.email = newUser.email;
      } else {
        // Handle logout: clear fields or redirect
        this.name = '';
        this.email = '';
      }
    }
  }
}
</script>

<style scoped>
.profile-section h2 {
  margin-top: 0;
}
.form_input_container {
  margin-bottom: 15px;
}
.button-secondary {
    background-color: #6c757d;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 10px;
}
.button-secondary:hover {
    background-color: #5a6268;
}
</style>
