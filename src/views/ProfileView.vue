<template>
  <div class="content" :class="{'dark-mode-bg': darkMode, 'light-mode-bg': !darkMode}">
    <p class="title">My Profile</p>

    <!-- Name Section -->
    <div class="profile-section">
      <div class="profile-item-row">
        <h2 class="profile-label">Name</h2>
        <div v-if="!editMode.name" class="profile-value-display">
          <p>{{ name }}</p>
          <button class="button" @click="startEdit('name')">Edit Name</button>
        </div>
        <div v-else class="profile-value-edit">
          <div class="form_input_container">
            <input type="text" v-model="form.name" class="form_input" />
          </div>
          <button class="button" @click="updateName">Save</button>
          <button class="button-secondary" @click="cancelEdit('name')">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Email Section -->
    <div class="profile-section">
      <div class="profile-item-row">
        <h2 class="profile-label">Email</h2>
        <div v-if="!editMode.email" class="profile-value-display">
          <p>{{ email }}</p>
          <button class="button" @click="startEdit('email')">Edit Email</button>
        </div>
        <div v-else class="profile-value-edit">
          <div class="form_input_container">
            <input type="email" v-model="form.email" class="form_input" />
          </div>
          <button class="button" @click="updateUserEmail">Save</button>
          <button class="button-secondary" @click="cancelEdit('email')">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Password Section -->
    <div class="profile-section">
      <div class="profile-item-row">
        <h2 class="profile-label">Password</h2>
        <div v-if="!editMode.password" class="profile-value-display">
          <p>********</p>
          <button class="button" @click="startEdit('password')">Change Password</button>
        </div>
        <div v-else class="profile-value-edit password-edit-mode">
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

.content {
  position: relative; /* Ensure pseudo-element is positioned correctly */
  padding: 40px; /* Add padding to content div */
  border-radius: 12px; /* Add border-radius to content div */
}

.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/wallpaper_night.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1; /* Ensure it stays behind content */
  border-radius: inherit; /* Inherit border-radius from parent .content */
}

.light-mode-bg .content::before {
  filter: invert(100%);
}

.dark-mode-bg .content::before {
  filter: none;
}

.profile-item-row {
  display: flex; /* Revert to flexbox */
  align-items: center; /* Vertically center items */
  justify-content: space-between; /* Push content to the right */
  flex-wrap: wrap; /* Allow items to wrap on smaller screens */
  margin-bottom: 15px; /* Space between different profile items */
  border: none; /* Remove debugging border */
}

.profile-label {
  margin: 0; /* Remove default h2 margin */
  width: 120px; /* Fixed width for labels, like in AddMember.vue */
  text-align: right; /* Align text to the right before the divider */
  padding-right: 15px; /* Space between text and divider */
  border-right: 1px solid var(--divider-color); /* The actual divider */
  background-color: transparent; /* Remove debugging background */
  flex-shrink: 0; /* Prevent label from shrinking */
  height: 100%; /* Ensure it fills parent's height */
  display: flex; /* Make it a flex container */
  justify-content: flex-end; /* Align text to the right within its width */
  align-items: center; /* Vertically center the text */
}

.profile-value-display,
.profile-value-edit {
  display: flex;
  align-items: center;
  /* flex-grow: 1; Removed as it's within a 1fr grid column */
  justify-content: flex-end; /* Push content/buttons to the right */
  gap: 10px; /* Space between value/input and buttons */
  /* flex-wrap: wrap; Removed to prevent unexpected wrapping within grid cell */
  background-color: transparent; /* Remove debugging background */
  overflow: visible; /* Revert overflow */
}

.profile-value-display p {
  margin: 0; /* Remove default paragraph margin */
  /* margin-right removed, gap handles spacing */
}

.profile-value-edit .form_input_container {
  margin-bottom: 0; /* Remove vertical margin */
  flex-grow: 0; /* Don't let input container grow excessively */
  max-width: 200px; /* Limit input width for consistency */
  /* margin-right removed, gap handles spacing */
}

.profile-value-edit .form_input {
  width: 100%; /* Ensure input fills its container */
}

/* Specific adjustments for password edit mode to handle two inputs */
.password-edit-mode {
  flex-direction: column; /* Stack password inputs vertically */
  align-items: flex-end; /* Align inputs to the right */
  flex-grow: 1; /* Allow to take available space */
}

.password-edit-mode .form_input_container {
  margin-bottom: 10px; /* Space between password input fields */
  width: auto; /* Allow input container to size naturally */
  max-width: 200px; /* Consistent input width */
  margin-right: 0; /* No external margin */
}

.password-edit-mode .form_input_container:last-of-type {
  margin-bottom: 15px; /* Adjust margin for last input before buttons */
}

.password-edit-mode button {
  margin-left: 0; /* Gap handles spacing, reset margin-left */
}

.form_input_container p.form_text {
  margin: 0 0 5px 0; /* Adjust margin for labels above inputs */
  width: 100%;
  text-align: left;
}
</style>
