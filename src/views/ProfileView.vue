<template>
  <div class="content" :class="{'dark-mode-bg': darkMode, 'light-mode-bg': !darkMode}">
    <p class="title">{{ $t("profile.title") }}</p>

    <!-- Name Section -->
    <div class="profile-section">
      <div 
        class="profile-item-row"
        :data-field="$t('common.name')"
        :class="{ 'is-editing': editMode.name }"
      >
        <h2 class="profile-label">{{ $t("common.name") }}</h2>
        <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
        <div v-if="!editMode.name" class="profile-value-display">
          <p>{{ name }}</p>
          <button class="edit_photo_button button_no_style" :class="{ dark:darkMode }" @click="startEdit('name')">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_edit_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_edit.png')" alt="" />
          </button>
        </div>
        <div v-else class="profile-value-edit">
          <div class="form_input_container">
            <input type="text" v-model="form.name" class="form_input" />
          </div>
          <button class="edit_photo_button" :class="{ dark:darkMode }" @click="updateName">
            <img :src="darkMode ? require('../assets/google_icons_save_dark.png') : require('../assets/google_icons_save.png')" alt="Logout Icon" class="logout-icon" />
            {{ $t("common.save") }}
          </button>
          <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit('name')">
            <img :src="darkMode ? require('../assets/google_icons_cancel_dark.png') : require('../assets/google_icons_cancel.png')" alt="Logout Icon" class="logout-icon" />
            {{ $t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Email Section -->
    <div class="profile-section">
      <div 
        class="profile-item-row" 
        data-field="Email" 
        :class="{ 'is-editing': editMode.email }"
      >
        <h2 class="profile-label">Email</h2>
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        <div v-if="!editMode.email" class="profile-value-display">
          <p>{{ email }}</p>
          <button class="edit_photo_button button_no_style" :class="{ dark:darkMode }" @click="startEdit('email')">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_edit_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_edit.png')" alt="" />
          </button>
        </div>
        <div v-else class="profile-value-edit">
          <div class="form_input_container">
            <input type="email" v-model="form.email" class="form_input" />
          </div>
          <button class="edit_photo_button" :class="{ dark:darkMode }" @click="updateUserEmail">
            <img :src="darkMode ? require('../assets/google_icons_save_dark.png') : require('../assets/google_icons_save.png')" alt="Logout Icon" class="logout-icon" />
            {{ $t("common.save") }}
          </button>
          <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit('email')">
            <img :src="darkMode ? require('../assets/google_icons_cancel_dark.png') : require('../assets/google_icons_cancel.png')" alt="Logout Icon" class="logout-icon" />
            {{ $t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Password Section -->
    <div class="profile-section">
      <div 
        class="profile-item-row profile-item-row--password"
        :data-field="$t('profile.password')" 
        :class="{ 'is-editing': editMode.password }"
      >
        <h2 class="profile-label">{{ $t("profile.password") }}</h2>
        <div class="profile-value-wrapper">
        <div v-if="!editMode.password" class="profile-value-display">
          <p>********</p>
          <button class="edit_photo_button button_no_style" :class="{ dark:darkMode }" @click="startEdit('password')">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_edit_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_edit.png')" alt="" />
          </button>
        </div>
        
        <div v-else class="profile-value-edit password-edit-mode">
          <div class="form_input_container">
            <p class="form_text">{{ $t("profile.current_password") }}</p>
            <input type="password" v-model="form.currentPassword" class="form_input" />
          </div>

          <div class="form_input_container">
            <p class="form_text">{{ $t("profile.new_password") }}</p>
            <input type="password" v-model="form.password" class="form_input" />
          </div>

          <div class="form_input_container">
            <p class="form_text">{{ $t("profile.confirm_new_password") }}</p>
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

          <div class="password-actions">
            <button class="edit_photo_button" :class="{ dark:darkMode }" @click="updateUserPassword">
              <img :src="darkMode ? require('../assets/google_icons_save_dark.png') : require('../assets/google_icons_save.png')" alt="Logout Icon" class="logout-icon" />
              {{ $t("profile.save_new_password") }}
            </button>
            <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit('password')">
              <img :src="darkMode ? require('../assets/google_icons_cancel_dark.png') : require('../assets/google_icons_cancel.png')" alt="Logout Icon" class="logout-icon" />
              {{ $t("common.cancel") }}
            </button>
            </div>
          </div>
        </div>
      </div>
      <!--<hr>
      <h2>Settings</h2>
      <h3>Language</h3>
      <img class="flags" src="../assets/flags/english.png" />
      <img class="flags" src="../assets/flags/french.png" />-->
      <hr>

<div class="settings-row">
  <div class="tutorial-toggle tutorial-toggle--inline">
    <span class="tutorial-toggle__label">{{ $t("profile.tutorial") }}</span>

    <button
      class="toggle-switch"
      :class="{ on: tutorialEnabled }"
      type="button"
      role="switch"
      :aria-checked="tutorialEnabled"
      @click="toggleTutorialSwitch"
    >
      <span class="toggle-thumb"></span>
    </button>
  </div>
</div>

<hr>

</div>
    <TutorialHints
      pageKey="tree"
      :hints="[
        { id: 'tutorials', title: this.$t('profile.show_or_hide'), text: this.$t('profile.you_can') },
      ]"
    />
  </div>
</template>

<script>
import { getAuth, updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import TutorialHints from "@/components/TutorialHints.vue";

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
  components: { TutorialHints },
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
        },
        tutorialEnabled() { 
          return this.$store.state.tutorialEnabled
        },
      }, 
      methods: {
        toggleTutorialSwitch() {
          this.$store.commit('setTutorialEnabled', !this.tutorialEnabled)
        },
        toggleTutorial(e) {
          const enabled = !!e.target.checked
          this.$store.commit('setTutorialEnabled', enabled)
        },
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
            this.errors.password = this.$t('profile.please_enter');
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
            this.errors.password = this.$t('profile.current_password_is_incorrect');
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
            this.errors.password = this.$t('profile.please_fill');
            return;
          }

          if (this.form.password !== this.form.confirmPassword) {
            this.errors.password = this.$t('profile.new_passwords_do_not_match');
            return;
          }

          if (this.form.password === this.form.currentPassword) {
            this.errors.password = this.$t('profile.new_password_must');
            return;
          }

          const ok = await this.reauthenticate();
          if (!ok) return;

          const auth = getAuth();

          try {
            await updatePassword(auth.currentUser, this.form.password);

            this.success.password = "Password successfully updated !";
            this.successTimeout = setTimeout(() => {
              this.success.password = '';
            }, 5000);

            this.form.currentPassword = '';
            this.form.password = '';
            this.form.confirmPassword = '';

            this.success.password = "Password successfully updated !";

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
        },
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

.button_no_style {
  background-color: transparent;
  border:none;
}

.button_no_style:hover {
  background-color: rgb(256, 256, 256, 0.8);
}

input.form_input {
  margin-left: 20px;
  width: 100%;
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
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("~@/assets/wallpaper_night.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  border-radius: inherit;
}

.form-error {
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

.flags {
  width: 50px;
  margin-right: 10px;
  cursor: pointer;
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
  margin-left: 12px;
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
  border: none;
  flex: 0;
}

.form-success {
  color: #2ecc71;
  font-size: 14px;
  margin-top: 6px;
  text-align: right;
  font-weight: 600;
}

.msg-fade-enter-active,
.msg-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.msg-fade-enter,
.msg-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.msg-pop-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.msg-pop-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.msg-pop-enter {
  opacity: 0;
  transform: scale(0.96) translateY(-3px);
}
.msg-pop-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(2px);
}

/* ===== Tutorial Toggle ===== */
.tutorial-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 20px;
}

.tutorial-toggle__label {
  font-weight: 700;
  font-size: 15px;
}

/* ===== Water effect on toggle ===== */
.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  padding: 0;
  background: rgba(180, 180, 180, 0.4);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
}

.toggle-switch.on::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.55), transparent 55%);
  opacity: 0;
  animation: toggleRipple 550ms ease-out;
  pointer-events: none;
}

@keyframes toggleRipple {
  0% {
    opacity: 0.7;
    transform: scale(0.7);
  }
  60% {
    opacity: 0.45;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}

.toggle-switch.on {
  background: linear-gradient(
    135deg,
    rgba(120, 200, 255, 0.95),
    rgba(0, 160, 255, 0.95)
  );
  box-shadow: 0 6px 18px rgba(0, 160, 255, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.toggle-switch:not(.on) {
  background: rgba(150, 150, 150, 0.35);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  transition: transform 0.25s ease;
}

.toggle-switch.on .toggle-thumb {
  transform: translateX(24px);
}

.dark-mode-bg .toggle-switch:not(.on) {
  background: rgba(255, 255, 255, 0.25);
}

/* ===== Flag switch ===== */
.flag-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(140, 140, 140, 0.18);
  border: 1px solid rgba(120, 120, 120, 0.25);
  overflow: hidden;
}

.flag-indicator {
  position: absolute;
  top: 6px;
  bottom: 6px;
  width: calc(50% - 7px);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  transform: translateX(0);
  transition: transform 260ms ease, background 260ms ease;
  z-index: 0;
}

.flag-indicator.is-fr {
  transform: translateX(calc(100% + 8px));
}

.dark-mode-bg .flag-switch {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}
.dark-mode-bg .flag-indicator {
  background: rgba(0, 0, 0, 0.35);
}

.flag-btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  transition: transform 120ms ease, opacity 180ms ease;
  opacity: 0.78;
}

.flag-btn:hover {
  opacity: 1;
}

.flag-btn:active {
  transform: scale(0.96);
}

.flag-btn.active {
  opacity: 1;
}

.flag-img {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  transition: transform 180ms ease;
}

.flag-btn.active .flag-img {
  transform: scale(1.06);
}

.flag-code {
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dark.flag-code {
  color: white;
}

.flag-btn:focus-visible {
  outline: 2px solid rgba(0, 160, 255, 0.8);
  outline-offset: 2px;
}

/* ===== Desktop / tablette : colonne fixe => border-right aligné ===== */
@media (min-width: 481px) {
  .profile-item-row {
    flex-wrap: nowrap;
    justify-content: flex-start;
    column-gap: 12px;
  }

  .profile-label {
    width: 160px;
    flex: 0 0 160px;
    box-sizing: border-box;
    white-space: nowrap;
  }

  .profile-value-display,
  .profile-value-edit {
    flex: 1 1 auto;
    min-width: 0;
  }
}

/* ===== Mobile ===== */
.btn-short {
  display: none;
}

@media (max-width: 480px) {
  .content {
    padding: 16px;
    border-radius: 0;
  }

  .profile-item-row {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    column-gap: 10px;
    margin-bottom: 14px;
    width: 100%;
    justify-items: start;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    align-self: center;
  }

  .profile-section {
    width: 100%;
  }

  .profile-value-wrapper {
    display: contents;
  }

  .profile-label {
    display: none;
  }

  .profile-item-row::before {
    content: attr(data-field) " |";
    grid-column: 2;
    grid-row: 1;
    font-weight: 800;
    display: block;
    align-self: center;
    white-space: nowrap;
    justify-self: start;
  }

  .profile-value-display {
    display: contents;
  }

  .profile-value-display p {
    grid-column: 3;
    grid-row: 1;
    justify-self: start;
    text-align: left;
    margin: 0;
    font-size: 14px;
    overflow-wrap: anywhere;
    min-width: 0;
    word-break: break-word;
  }

  .btn-long {
    display: none;
  }
  .btn-short {
    display: inline;
  }

  .profile-item-row.is-editing {
    grid-template-columns: auto 1fr auto auto;
  }

  .profile-item-row.is-editing::before {
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
  }

  .profile-item-row.is-editing .profile-value-edit {
    display: contents;
  }

  .profile-item-row.is-editing .profile-value-edit .form_input_container {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
    max-width: none;
    margin: 0;
  }

  .profile-item-row.is-editing .profile-value-edit .form_input {
    margin-left: 0 !important;
    width: 100%;
  }

  .profile-item-row.is-editing .profile-value-edit > button:nth-of-type(1) {
    grid-column: 3;
    grid-row: 1;
    justify-self: start;
    white-space: nowrap;
  }
  .profile-item-row.is-editing .profile-value-edit > button:nth-of-type(2) {
    grid-column: 4;
    grid-row: 1;
    justify-self: start;
    white-space: nowrap;
  }

  /* ===== Password edit mode (mobile) ===== */
  .profile-item-row--password.is-editing {
    grid-template-columns: 1fr;
    row-gap: 6px;
    margin-bottom: 10px;
  }

  .profile-item-row--password.is-editing::before {
    grid-column: 1;
    grid-row: 1;
    margin: 0 0 2px 0;
  }

  .profile-item-row--password.is-editing .profile-value-wrapper {
    display: block !important;
    grid-column: 1;
    grid-row: 2;
    width: 100%;
  }

  .profile-item-row--password.is-editing .profile-value-edit.password-edit-mode {
    display: flex !important;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: 100%;
  }

  /* LABEL AU-DESSUS + ALIGNÉ À GAUCHE DE L’INPUT */
  .profile-item-row--password.is-editing .password-edit-mode .form_input_container {
    width: 86% !important;      /* ajuste: 80% / 85% / 90% */
    margin: 0 auto !important;  /* centre le bloc */
    max-width: none !important;

    display: flex !important;
    flex-direction: column !important;
    gap: 4px;
    align-items: flex-start;    /* label à gauche */
  }

  .profile-item-row--password.is-editing .password-edit-mode .form_text {
    width: 100% !important;
    margin: 0 !important;
    text-align: left !important;
    line-height: 1.15;
  }

  .profile-item-row--password.is-editing .password-edit-mode .form_input {
    width: 100% !important;
    margin-left: 0 !important;
    height: 36px;
    box-sizing: border-box;
  }

  .profile-item-row--password.is-editing .password-actions {
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch;
  gap: 10px;
  width: 86% !important;            /* même largeur que les champs */
  margin: 10px auto 0 !important;
}

/* Base : les 2 boutons restent sur une ligne et le texte s’adapte */
.profile-item-row--password.is-editing .password-actions > button {
  min-width: 0;
  width: auto !important;
  justify-content: center;
  padding: 10px 8px;               /* un peu plus compact */
  white-space: nowrap;              /* pas de retour à la ligne */
  font-size: clamp(11px, 3.1vw, 13px); /* s’adapte (FR plus long) */
  line-height: 1.1;
}

/* Donne plus de place au bouton "Save / Enregistrer..." (1er bouton) */
.profile-item-row--password.is-editing .password-actions > button:first-child {
  flex: 1.45 1 0;
}

/* Bouton "Cancel / Annuler" un peu plus petit */
.profile-item-row--password.is-editing .password-actions > button:last-child {
  flex: 1 1 0;
}

  .profile-item-row .flag-switch {
    grid-column: 3;
    grid-row: 1;
    justify-self: start;
    margin-left: 12px;
  }

  .profile-item-row--password.is-editing .password-edit-mode .form-error {
  width: 86% !important;         /* même largeur que les inputs */
  margin: 6px auto 0 !important; /* centré comme les inputs */
  text-align: right !important;  /* le texte finit au même niveau que l'input */
  box-sizing: border-box;
}
}

/* ===== Desktop: Password edit mode -> labels au-dessus des inputs ===== */
@media (min-width: 481px) {
  /* on garde le layout général, mais le bloc édition mdp devient "stack" */
  .profile-item-row--password.is-editing .profile-value-edit.password-edit-mode {
    align-items: flex-end; /* tu peux mettre center si tu veux centrer le bloc */
  }

  .profile-item-row--password.is-editing .password-edit-mode .form_input_container {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important; /* label aligné à gauche */
    width: 360px;                       /* ajuste (320/360/420) */
    max-width: 100%;
    margin: 0 0 12px 0;
  }

  .profile-item-row--password.is-editing .password-edit-mode .form_text {
    width: 100% !important;
    margin: 0 0 6px 0 !important;
    text-align: left !important;
    line-height: 1.15;
  }

  .profile-item-row--password.is-editing .password-edit-mode .form_input {
    width: 100% !important;
    margin-left: 0 !important; /* important: sinon ça décale l’input */
    box-sizing: border-box;
  }

  /* (optionnel) message d'erreur aligné sur la fin des inputs */
  .profile-item-row--password.is-editing .password-edit-mode .form-error {
    width: 360px;
    max-width: 100%;
    text-align: right !important;
    box-sizing: border-box;
    margin-top: 6px;
  }
}

/* === Settings row: Tutorial + Language on same line (desktop) === */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 12px;
}

/* on enlève la marge-top qui était prévue pour une ligne seule */
.tutorial-toggle--inline {
  margin-top: 0 !important;
}

/* Mobile: tutorial + langue sur la même ligne */
@media (max-width: 480px) {
  .settings-row {
    flex-direction: row;          /* au lieu de column */
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: nowrap;            /* force sur une ligne */
    width: 100%;
  }

  .tutorial-toggle--inline {
    flex: 1 1 auto;               /* prend l’espace restant */
    width: auto;
    justify-content: flex-start;  /* label + switch collés */
    gap: 10px;
  }

  .flag-switch {
    flex: 0 0 auto;               /* garde sa taille */
  }
}

</style>
