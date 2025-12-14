<template>
  <div class="content">
    <p class="title">Add a member</p>

    <form
  class="form"
  :class="{ 'form--behind-celebrate': showCelebrate }"
  @submit.prevent="createMember"
>
      <!-- NAME -->
      <div class="form_input_container">
        <p class="form_text" :class="{ dark: darkMode }">* Name</p>
        <div class="form_input">
          <input
            ref="nameInput"
            style="padding-left:10px"
            type="text"
            name="name"
            id="name"
            v-model.trim="name"
            class="form_input"
            placeholder="Enter name"
            :class="{
              invalid: errors.name,
              dark: darkMode,
              shake: errors.name && shakeInvalid
            }"
          />
        </div>
      </div>

      <!-- BIRTHDAY -->
      <div class="form_input_container">
        <p class="form_text" :class="{ dark: darkMode }">* Birthday</p>
        <div class="form_input">
          <input
            type="date"
            name="birthday"
            id="birthday"
            v-model="birthday"
            class="form_input"
            :class="{
              invalid: errors.birthday,
              dark: darkMode,
              shake: errors.birthday && shakeInvalid
            }"
          />
        </div>
      </div>

      <!-- GENDER -->
      <div class="form_input_container">
        <p class="form_text" :class="{ dark: darkMode }">* Gender</p>
        <div
          class="form_input gender-box"
          :class="{ invalidBox: errors.gender, shake: errors.gender && shakeInvalid }"
        >
          <label style="margin-right:10px">
            <input type="radio" name="gender" value="male" v-model="gender" />
            Male
          </label>
          <label>
            <input type="radio" name="gender" value="female" v-model="gender" />
            Female
          </label>
        </div>
      </div>

      <!-- PHOTO -->
      <div class="form_input_container">
        <p class="form_text" :class="{ dark: darkMode }">Photo</p>
        <div class="form_input photo-line">
          <label for="image" class="button">Choose a file</label>
          <input type="file" name="image" id="image" @change="handleImageUpload" style="display:none;" />

          <!-- preview -->
          <div v-if="previewImage" class="preview-wrap">
            <img :src="previewImage" class="preview-img" alt="preview" />
            <button type="button" class="preview-remove" @click="clearImage">×</button>
          </div>
        </div>
      </div>

      <div class="form-divider"></div>

      <!-- small toast -->
      <transition name="toast">
        <div v-if="showSuccessMessage" class="success-message">
          Member created ✨
        </div>
      </transition>

      <p class="button-container">
        <button ref="createBtn" class="button create-btn" type="submit" :disabled="isSaving">
          <span v-if="!isSaving">Create</span>
          <span v-else class="loading">
            Creating
            <span class="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </span>
        </button>
      </p>
    </form>

    <!-- 🎉 Premium celebration overlay -->
    <transition name="celebrate">
      <div v-if="showCelebrate" class="celebrate-overlay" @click="closeCelebrate">
        <div class="celebrate-card" @click.stop>
          <!-- subtle sparkles (premium) -->
          <div class="sparkles" aria-hidden="true">
            <span v-for="n in 10" :key="n" class="spark"></span>
          </div>

          <!-- confettis (subtle, premium) -->
          <div class="confetti confetti--soft" aria-hidden="true">
            <span v-for="n in 18" :key="n" class="confetti-piece"></span>
          </div>

          <div class="celebrate-header">
            <div class="badge">NEW MEMBER</div>
            <h2>Welcome {{ createdMember?.name }}!</h2>
            <p class="sub">Added to your family</p>
          </div>

          <div class="member-card">
            <div class="avatar" ref="celebrateAvatar">
              <img :src="createdMember?.image" alt="avatar" />
            </div>
            <div class="info">
              <div class="line"><strong>Name:</strong> {{ createdMember?.name }}</div>
              <div class="line"><strong>Age:</strong> {{ createdMember?.age }}</div>
              <div class="line"><strong>Gender:</strong> {{ createdMember?.gender }}</div>
              <div class="line"><strong>Birthday:</strong> {{ formatBirthday(createdMember?.birthday) }}</div>
            </div>
          </div>

          <div class="celebrate-actions">
            <button class="button" @click="closeCelebrate">Perfect ✨</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      birthday: "",
      gender: "",
      image: null,

      previewImage: null,

      isSaving: false,
      showSuccessMessage: false,

      showCelebrate: false,
      createdMember: null,

      shakeInvalid: false,
      errors: { name: false, birthday: false, gender: false },

      // prevent double animations
      isFlying: false,
    };
  },
  computed: {
    darkMode() {
      return this.$store.state.darkMode;
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.nameInput) this.$refs.nameInput.focus();
    });
  },
  methods: {
    formatBirthday(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = date.getDate();
      const year = date.getFullYear();
      const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
      const month = monthNames[date.getMonth()];
      return `${day} ${month} ${year}`;
    },

    triggerShake() {
      this.shakeInvalid = true;
      setTimeout(() => (this.shakeInvalid = false), 450);
    },

    clearImage() {
      this.image = null;
      this.previewImage = null;
      const input = document.getElementById("image");
      if (input) input.value = "";
    },

    // ⭐ 핵: avatar flies from button to overlay avatar
    async flyAvatarToCard(imageSrc) {
      if (this.isFlying) return;
      this.isFlying = true;

      try {
        const btn = this.$refs.createBtn;
        if (!btn) return;

        const btnRect = btn.getBoundingClientRect();

        // create flying element
        const fly = document.createElement("img");
        fly.src = imageSrc;
        fly.alt = "flying-avatar";
        fly.style.position = "fixed";
        fly.style.left = `${btnRect.left + btnRect.width / 2 - 18}px`;
        fly.style.top = `${btnRect.top + btnRect.height / 2 - 18}px`;
        fly.style.width = "36px";
        fly.style.height = "36px";
        fly.style.borderRadius = "12px";
        fly.style.objectFit = "cover";
        fly.style.zIndex = "99999";
        fly.style.boxShadow = "0 18px 45px rgba(0,0,0,.25)";
        fly.style.filter = "saturate(1.05) contrast(1.02)";
        fly.style.transform = "translateZ(0) scale(1)";
        fly.style.opacity = "0.95";
        fly.style.transition =
          "left 720ms cubic-bezier(.2,.95,.2,1), top 720ms cubic-bezier(.2,.95,.2,1), " +
          "transform 720ms cubic-bezier(.2,.95,.2,1), opacity 720ms ease, filter 720ms ease";

        document.body.appendChild(fly);

        // wait overlay render so we can measure target
        await this.$nextTick();
        await new Promise(r => setTimeout(r, 40));

        const target = this.$refs.celebrateAvatar;
        if (!target) {
          fly.remove();
          return;
        }

        const tRect = target.getBoundingClientRect();
        const targetX = tRect.left + 16; // align inside avatar box
        const targetY = tRect.top + 16;

        // launch
        requestAnimationFrame(() => {
          fly.style.left = `${targetX}px`;
          fly.style.top = `${targetY}px`;
          fly.style.transform = "translateZ(0) scale(1.7)";
          fly.style.filter = "blur(0px) saturate(1.1)";
          fly.style.opacity = "1";
        });

        // finish: fade + shrink into place, then remove
        await new Promise(r => setTimeout(r, 640));
        fly.style.transform = "translateZ(0) scale(0.95)";
        fly.style.opacity = "0";
        fly.style.filter = "blur(1px) saturate(1.05)";
        await new Promise(r => setTimeout(r, 160));
        fly.remove();
      } finally {
        this.isFlying = false;
      }
    },

    async createMember() {
      if (this.isSaving) return;

      this.errors = { name: false, birthday: false, gender: false };

      if (!this.name) this.errors.name = true;
      if (!this.birthday) this.errors.birthday = true;
      if (!this.gender) this.errors.gender = true;

      if (this.errors.name || this.errors.birthday || this.errors.gender) {
        this.triggerShake();
        return;
      }

      this.isSaving = true;

      try {
        const name = this.name;
        const gender = this.gender;
        const birthday = this.birthday;

        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        let image = this.image;
        if (!image) {
          image = gender === "male"
            ? require("../assets/avatar_male.png")
            : require("../assets/avatar_female.png");
        }

        const newMember = { name, age, image, gender, birthday, x: 0, y: 0 };

        await this.$store.dispatch("addMember", newMember);
        await this.$store.dispatch("fetchMembers");

        // toast
        this.showSuccessMessage = true;
        setTimeout(() => (this.showSuccessMessage = false), 1700);

        // show overlay first, then fly
        this.createdMember = newMember;
        this.showCelebrate = true;

        // fly animation
        this.flyAvatarToCard(newMember.image);

        // reset form
        this.name = "";
        this.birthday = "";
        this.gender = "";
        this.clearImage();

        this.$nextTick(() => {
          if (this.$refs.nameInput) this.$refs.nameInput.focus();
        });
      } catch (e) {
        alert(e.message || e);
      } finally {
        this.isSaving = false;
      }
    },

    closeCelebrate() {
      this.showCelebrate = false;
      this.createdMember = null;
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
          this.image = dataUrl;
          this.previewImage = dataUrl;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
};
</script>

<style>
/* -------- base -------- */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form_text {
  width: 80px;
  text-align: right;
  margin-right: 15px;
  padding-right: 15px;
  border-right: 1px solid black;
}
.form_text.dark { border-right: 1px solid white; }

.form--behind-celebrate {
  filter: blur(6px);
  opacity: 0.18;
  transform: scale(0.99);
  pointer-events: none; /* empêche clics derrière */
  user-select: none;
}

.form_input_container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  height: fit-content;
}

.form_input {
  height: 30px;
  display: flex;
  align-items: center;
}

input.form_input {
  width: 150px;
  border: 1px solid var(--input-border-color);
  border-radius: 8px;
}

input.form_input.dark {
  background-color: black !important;
  color: white;
}

.form_input.invalid {
  border: 2px solid red !important;
}

.gender-box {
  padding: 2px 10px;
  border-radius: 10px;
}
.invalidBox {
  outline: 2px solid red;
}

/* shake invalid */
.shake { animation: shake 420ms ease; }
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}

.form-divider {
  width: 100%;
  max-width: 300px;
  height: 1px;
  background-color: var(--divider-color);
  margin: 20px 0;
}

.button-container { text-align: center; }

/* loading dots */
.loading .dots span {
  display: inline-block;
  animation: dot 900ms infinite;
}
.loading .dots span:nth-child(2) { animation-delay: 150ms; }
.loading .dots span:nth-child(3) { animation-delay: 300ms; }
@keyframes dot {
  0%, 20% { transform: translateY(0); opacity: .4; }
  50% { transform: translateY(-2px); opacity: 1; }
  100% { transform: translateY(0); opacity: .4; }
}

.create-btn[disabled] {
  opacity: 0.78;
  cursor: not-allowed;
}

/* -------- preview photo -------- */
.photo-line { gap: 12px; }
.preview-wrap {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(0,0,0,.14);
  transform: translateY(-1px);
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #000;
  color: #fff;
  font-weight: bold;
  line-height: 18px;
  padding: 0;
}

/* -------- toast success -------- */
.success-message {
  background: rgba(18, 18, 18, 0.92);
  color: white;
  padding: 10px 14px;
  border-radius: 999px;
  margin-bottom: 12px;
  font-weight: 800;
  letter-spacing: .2px;
  box-shadow: 0 14px 40px rgba(0,0,0,0.22);
}

.toast-enter-active { transition: all .22s ease; }
.toast-leave-active { transition: all .22s ease; }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* -------- premium celebration overlay -------- */
.celebrate-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(10,10,12,.62);
  backdrop-filter: blur(10px);
}

.celebrate-card {
  width: min(560px, 95vw);
  background: #ffffff; /* opaque */
  border-radius: 22px;
  padding: 18px 18px 16px 18px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.5);
  box-shadow: 0 40px 120px rgba(0,0,0,.38);
  animation: popCard 420ms cubic-bezier(.2,.9,.2,1.1);
}

@keyframes popCard {
  0% { transform: scale(.90) translateY(10px); opacity: 0; }
  70% { transform: scale(1.03) translateY(0); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.celebrate-header {
  text-align: center;
  padding: 6px 0 10px 0;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 900;
  letter-spacing: 1px;
  font-size: 12px;
  background: rgba(0,0,0,.92);
  color: #fff;
  margin-bottom: 10px;
}

.celebrate-header h2 {
  margin: 2px 0 4px 0;
  font-family: 'Arial Black', Gadget, Impact, sans-serif;
}

.sub {
  margin: 0;
  opacity: .72;
  font-weight: 700;
}

.member-card {
  display: flex;
  gap: 14px;
  background: #f5f5f6;
  border-radius: 18px;
  padding: 12px;
  align-items: center;
  border: 1px solid rgba(0,0,0,.05);
}

.avatar {
  width: 92px;
  height: 92px;
  border-radius: 18px;
  overflow: hidden;
  flex: 0 0 auto;
  box-shadow: 0 18px 55px rgba(0,0,0,.18);
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info .line { margin: 4px 0; }

.celebrate-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

/* sparkles */
.sparkles { position:absolute; inset:0; pointer-events:none; }
.spark {
  position:absolute;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,.9);
  box-shadow: 0 0 18px rgba(255,255,255,.65);
  opacity: .0;
  animation: sparkle 1600ms ease-in-out infinite;
}
.spark:nth-child(1) { left: 12%; top: 18%; animation-delay: 0ms; }
.spark:nth-child(2) { left: 28%; top: 12%; animation-delay: 250ms; }
.spark:nth-child(3) { left: 48%; top: 20%; animation-delay: 500ms; }
.spark:nth-child(4) { left: 70%; top: 16%; animation-delay: 750ms; }
.spark:nth-child(5) { left: 86%; top: 24%; animation-delay: 1000ms; }
.spark:nth-child(6) { left: 18%; top: 70%; animation-delay: 300ms; }
.spark:nth-child(7) { left: 36%; top: 78%; animation-delay: 650ms; }
.spark:nth-child(8) { left: 56%; top: 72%; animation-delay: 900ms; }
.spark:nth-child(9) { left: 76%; top: 80%; animation-delay: 1200ms; }
.spark:nth-child(10){ left: 90%; top: 72%; animation-delay: 1400ms; }

@keyframes sparkle {
  0%, 100% { transform: scale(.6); opacity: 0; }
  40% { transform: scale(1.2); opacity: .85; }
  60% { transform: scale(.9); opacity: .35; }
}

/* subtle confetti */
.confetti { position:absolute; inset:0; pointer-events:none; }
.confetti-piece {
  position:absolute;
  top: -10%;
  width: 10px;
  height: 14px;
  border-radius: 3px;
  opacity: 0.85;
  animation: confettiFall 1100ms linear infinite;
  background: rgba(255,255,255,.85);
  filter: blur(.1px);
}
.confetti-piece:nth-child(1) { left: 10%; animation-delay: 0ms; }
.confetti-piece:nth-child(2) { left: 18%; animation-delay: 120ms; }
.confetti-piece:nth-child(3) { left: 26%; animation-delay: 40ms; }
.confetti-piece:nth-child(4) { left: 34%; animation-delay: 180ms; }
.confetti-piece:nth-child(5) { left: 42%; animation-delay: 70ms; }
.confetti-piece:nth-child(6) { left: 50%; animation-delay: 210ms; }
.confetti-piece:nth-child(7) { left: 58%; animation-delay: 90ms; }
.confetti-piece:nth-child(8) { left: 66%; animation-delay: 240ms; }
.confetti-piece:nth-child(9) { left: 74%; animation-delay: 110ms; }
.confetti-piece:nth-child(10){ left: 82%; animation-delay: 260ms; }
.confetti-piece:nth-child(11){ left: 90%; animation-delay: 140ms; }
.confetti-piece:nth-child(12){ left: 14%; animation-delay: 300ms; }
.confetti-piece:nth-child(13){ left: 30%; animation-delay: 320ms; }
.confetti-piece:nth-child(14){ left: 46%; animation-delay: 340ms; }
.confetti-piece:nth-child(15){ left: 62%; animation-delay: 360ms; }
.confetti-piece:nth-child(16){ left: 78%; animation-delay: 380ms; }
.confetti-piece:nth-child(17){ left: 86%; animation-delay: 400ms; }
.confetti-piece:nth-child(18){ left: 22%; animation-delay: 420ms; }

@keyframes confettiFall {
  0%   { top: -10%; opacity: 0; transform: translateY(0) rotate(0deg); }
  10%  { opacity: 1; }
  100% { top: 115%; opacity: 0; transform: translateY(0) rotate(220deg); }
}

/* transition overlay */
.celebrate-enter-active { transition: opacity .18s ease; }
.celebrate-leave-active { transition: opacity .18s ease; }
.celebrate-enter, .celebrate-leave-to { opacity: 0; }
</style>
