<template>
  <div class="content" :class="{'dark-mode-bg': darkMode, 'light-mode-bg': !darkMode}">
    <p class="title">My Profile</p>

    <!-- Name Section -->
    <div class="profile-section">
      <div class="profile-item-row">
        <h2 class="profile-label">Name</h2>
        <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
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
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
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
        <div class="profile-value-wrapper">
        <div v-if="!editMode.password" class="profile-value-display">
          <p>********</p>
          <button class="button" @click="startEdit('password')">
            Change Password
          </button>
        </div>
        
        <div v-else class="profile-value-edit password-edit-mode">
          <div class="form_input_container">
            <p class="form_text">Current Password</p>
            <input type="password" v-model="form.currentPassword" class="form_input" />
          </div>

          <div class="form_input_container">
            <p class="form_text">New Password</p>
            <input type="password" v-model="form.password" class="form_input" />
          </div>

          <div class="form_input_container">
            <p class="form_text">Confirm New Password</p>
            <input type="password" v-model="form.confirmPassword" class="form_input" />
          </div>

          <transition name="msg-fade">
            <p v-if="errors.password" class="form-error">
              {{ errors.password }}
            </p>
          </transition>

          <transition name="msg-pop">
            <p v-if="success.password" class="form-success">
              {{ success.password }}
            </p>
          </transition>

          <button class="button" @click="updateUserPassword">
            Save New Password
          </button>
          <button class="button-secondary" @click="cancelEdit('password')">
            Cancel
          </button>
        </div></div>
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
        currentPassword: '',
        password: '',
        confirmPassword: '',
      },
      errors: {
        password: '',
        email: '',
        name: '',
        auth: ''
      },
      success: {
        password: ''
      },
      successTimeout: null,
      closePasswordTimeout: null,
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
      this.form.name = this.name;
      this.form.email = this.email;
      this.form.password = '';
      this.form.confirmPassword = '';
      this.form.currentPassword = '';
      this.errors.password = '';
      this.success.password = '';
      if (this.successTimeout) clearTimeout(this.successTimeout);
      if (this.closePasswordTimeout) clearTimeout(this.closePasswordTimeout);
    },
    cancelEdit(field) {
      this.editMode[field] = false;
      this.errors.password = '';
      this.success.password = '';
      if (this.successTimeout) clearTimeout(this.successTimeout);
      if (this.closePasswordTimeout) clearTimeout(this.closePasswordTimeout);
    },
    async reauthenticate() {
      const auth = getAuth();

      if (!this.form.currentPassword) {
        this.errors.password = "Please enter your current password.";
        return false;
      }

      try {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          this.form.currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        return true;
      } catch (error) {
        this.errors.password = "Current password is incorrect.";
        return false;
      }
    },

    async updateName() {
      if (!this.form.name || this.form.name === this.name) {
        this.editMode.name = false;
        return;
      }
      
      const userDocRef = doc(db, "users", this.user.uid);
      try {
        await updateDoc(userDocRef, { name: this.form.name });
        this.name = this.form.name;
        this.$store.commit('setUser', { ...this.user, name: this.form.name });
        this.editMode.name = false;
      } catch (error) {
        this.errors.email = error.message;
      }
    },
    async updateUserEmail() {
       if (!this.form.email || this.form.email === this.email) {
        this.editMode.email = false;
        return;
      }

      const auth = getAuth();
      try {
        await updateEmail(auth.currentUser, this.form.email);
        const userDocRef = doc(db, "users", this.user.uid);
        await updateDoc(userDocRef, { email: this.form.email });

        this.email = this.form.email;
        this.$store.commit('setUser', { ...this.user, email: this.form.email });
        this.editMode.email = false;
      } catch (error) {
        this.errors.name = error.message;
      }
    },
    async updateUserPassword() {
      this.success.password = '';
      if (this.successTimeout) clearTimeout(this.successTimeout);
      this.errors.password = '';

      if (!this.form.password || !this.form.confirmPassword) {
        this.errors.password = "Please fill in both password fields.";
        return;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.errors.password = "New passwords do not match.";
        return;
      }

      if (this.form.password === this.form.currentPassword) {
        this.errors.password = "New password must be different from current password.";
        return;
      }

      const ok = await this.reauthenticate();
      if (!ok) return;

      const auth = getAuth();

      try {
        await updatePassword(auth.currentUser, this.form.password);

        this.success.password = "Password successfully created !";
        this.successTimeout = setTimeout(() => {
          this.success.password = '';
        }, 5000);

        this.form.currentPassword = '';
        this.form.password = '';
        this.form.confirmPassword = '';

        this.success.password = "Password successfully created !";

        this.successTimeout = setTimeout(() => {
          this.success.password = '';

          this.closePasswordTimeout = setTimeout(() => {
            this.editMode.password = false;
          }, 400);
        }, 5000);
      } catch (error) {
        this.success.password = '';
        switch (error.code) {
          case "auth/weak-password":
            this.errors.password = "Password must be at least 6 characters.";
            break;
          case "auth/requires-recent-login":
            this.errors.password = "Please re-enter your current password.";
            break;
          case "auth/wrong-password":
            this.errors.password = "Current password is incorrect.";
            break;
          default:
            this.errors.password = "An error occurred. Please try again.";
        }
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

.profile-value-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
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
  position: relative;
  padding: 40px;
  border-radius: 12px;
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
  z-index: -1;
  border-radius: inherit;
}

.form-error{
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 6px;
  text-align: right;
  font-weight: bold;
}

.light-mode-bg .content::before {
  filter: invert(100%);
}

.dark-mode-bg .content::before {
  filter: none;
}

.profile-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 15px;
  border: none;
}

.profile-label {
  margin: 0;
  width: 120px;
  text-align: right;
  padding-right: 15px;
  border-right: 1px solid var(--divider-color);
  background-color: transparent;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.profile-value-display,
.profile-value-edit {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  background-color: transparent;
  margin-left:12px;
}

.profile-value-display p {
  margin: 0;
}

.profile-value-edit .form_input_container {
  margin-bottom: 0;
  flex-grow: 0;
  max-width: 200px;
}

.profile-value-edit .form_input {
  width: 100%;
}

.password-edit-mode {
  flex-direction: column;
  align-items: flex-end;
  flex-grow: 1;
}

.password-edit-mode .form_input_container {
  margin-bottom: 10px;
  width: auto;
  max-width: 200px;
  margin-right: 0;
}

.password-edit-mode .form_input_container:last-of-type {
  margin-bottom: 15px;
}

.password-edit-mode button {
  margin-left: 0;
}

.form_input_container p.form_text {
  margin: 0 0 5px 0;
  width: 100%;
  text-align: left;
}

.form-success{
  color: #2ecc71;
  font-size: 14px;
  margin-top: 6px;
  text-align: right;
  font-weight: 600;
}

.msg-fade-enter-active,
.msg-fade-leave-active{
  transition: opacity .25s ease, transform .25s ease;
}
.msg-fade-enter,
.msg-fade-leave-to{
  opacity: 0;
  transform: translateY(-4px);
}

.msg-pop-enter-active{
  transition: opacity .25s ease, transform .25s ease;
}
.msg-pop-leave-active{
  transition: opacity .35s ease, transform .35s ease;
}
.msg-pop-enter{
  opacity: 0;
  transform: scale(.96) translateY(-3px);
}
.msg-pop-leave-to{
  opacity: 0;
  transform: scale(.98) translateY(2px);
}

</style>
