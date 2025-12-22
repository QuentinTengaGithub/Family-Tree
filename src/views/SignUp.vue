<template>
  <div class="content lightning">
    <div class="side side-left" aria-hidden="true">
      <div
        class="shot-card intro intro-tl"
        :class="{ dark: darkMode }"
        :style="shotStyleLeft"
        @mousemove="onMouseMove($event, 'left')"
        @mouseleave="resetMouse('left')"
        @click="nextShot"
        title="Clique pour voir l'écran suivant"
      >
        <transition name="shot" mode="out-in">
          <img
            :key="(darkMode ? 'dark-' : 'light-') + currentShotLeft.alt"
            class="shot-img"
            :src="getShotSrc(currentShotLeft)"
            :alt="currentShotLeft.alt"
            loading="lazy"
          />
        </transition>

        <div class="shot-badge" :class="{ dark: darkMode }">{{ currentShotLeft.badge }}</div>
      </div>
      <div class="couple-demo" aria-hidden="true">
        <div class="couple-stage intro intro-bl" :class="{ dark: darkMode }">
          <div class="couple-frame"></div>
          <img class="avatar avatar-f" :src="avatarFemale" alt="" />
          <img class="avatar avatar-m" :src="avatarMale" alt="" />
          <div class="heart" aria-hidden="true">❤</div>
          <div class="demo-overlay" :class="{ dark: darkMode }">Create a married couple</div>
        </div>
      </div>
    </div>

    <div class="form-card intro intro-form" :class="{ dark: darkMode }">
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
              placeholder="Enter email address"
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

        <p class="button-container">
          <input class="button cta" type="submit" value="Create Account">
        </p>

        <p class="redirect-text" @click="changeTab('Sign-In')">
          Already have an account ?
        </p>
      </form>
    </div>

    <div class="side side-right" aria-hidden="true">
      <div
        class="shot-card intro intro-tr"
        :class="{ dark: darkMode }"
        :style="shotStyleRight"
        @mousemove="onMouseMove($event, 'right')"
        @mouseleave="resetMouse('right')"
        @click="nextShot"
        title="Clique pour voir l'écran suivant"
      >
        <transition name="shot" mode="out-in">
          <img
            :key="(darkMode ? 'dark-' : 'light-') + currentShotRight.alt"
            class="shot-img"
            :src="getShotSrc(currentShotRight)"
            :alt="currentShotRight.alt"
            loading="lazy"
          />
        </transition>
        <div class="shot-badge" :class="{ dark: darkMode }">{{ currentShotRight.badge }}</div>
      </div>
      <div class="group-demo">
        <div class="group-stage intro intro-br" :class="{ dark: darkMode }">
          <div class="group-frame"></div>
          <img class="g-avatar m1" :src="avatarMale" />
          <img class="g-avatar f"  :src="avatarFemale" />
          <img class="g-avatar m2" :src="avatarMale" />
          <svg class="links" viewBox="0 0 300 120">
            <line x1="60" y1="60" x2="150" y2="60" />
            <line x1="240" y1="60" x2="150" y2="60" />
          </svg>
          <div class="demo-overlay" :class="{ dark: darkMode }">
          Create a siblings group
        </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

import screenshot1 from "@/assets/screenshot1.png";
import screenshot1_dark from "@/assets/screenshot1_dark.png";
import screenshot2 from "@/assets/screenshot2.png";
import screenshot2_dark from "@/assets/screenshot2_dark.png";
import avatarFemale from "@/assets/avatar_female.png";
import avatarMale from "@/assets/avatar_male.png";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatarFemale,
      avatarMale,
      shots: [
        { light: screenshot1, dark: screenshot1_dark, alt: "Application preview – screen 1", badge: "Discover the interface"},
        { light: screenshot2, dark: screenshot2_dark, alt: "Application preview – screen 2", badge: "Key functions"},
      ],
      shotIndex: 0,
      timer: null,

      mouse: {
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 },
      },
    };
  },

  computed: {
    darkMode() {
      return this.$store.state.darkMode;
    },

    currentShotLeft() {
      return this.shots[this.shotIndex % this.shots.length];
    },
    currentShotRight() {
      return this.shots[(this.shotIndex + 1) % this.shots.length];
    },

    shotStyleLeft() {
      const { x, y } = this.mouse.left;
      return {
        transform: `translate3d(0,0,0) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`,
      };
    },
    shotStyleRight() {
      const { x, y } = this.mouse.right;
      return {
        transform: `translate3d(0,0,0) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`,
      };
    },
  },

  mounted() {
    this.timer = setInterval(() => {
      this.nextShot();
    }, 4500);
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },

  methods: {
    getShotSrc(shot) {
      return this.darkMode ? shot.dark : shot.light;
    },
    nextShot() {
      this.shotIndex = (this.shotIndex + 1) % this.shots.length;
    },

    onMouseMove(e, side) {
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      this.mouse[side].x = px - 0.5;
      this.mouse[side].y = py - 0.5;
    },
    resetMouse(side) {
      this.mouse[side].x = 0;
      this.mouse[side].y = 0;
    },

    async createAccount() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      const q = query(collection(db, "users"), where("name", "==", this.name));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("This name is already taken. Please choose another one.");
        return;
      }

      try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: this.name,
          role: user.email === "quentinritt94@gmail.com" ? "superadmin" : "user",
        });

        this.$router.push("/sign-in");
      } catch (error) {
        alert(error.message);
      }
    },

    changeTab(tab) {
      this.$router.push("/" + tab.toLowerCase());
    },
  },
};
</script>

<style scoped>
.content{
  display: grid;
  grid-template-columns: minmax(360px, 1.2fr) minmax(380px, 460px) minmax(360px, 1.2fr);
  align-items: center;
  gap: 36px;
  position: relative;
  background: transparent;
}

.form-card{
  position: relative;
  z-index: 2;
  padding: 26px 28px;
  border-radius: 18px;
  background: rgba(255,255,255,.7);
  box-shadow: 0 30px 120px rgba(0,0,0,.8);
  animation: formIn .7s ease both;
}

.form-card.dark{
  background-color: black;
  box-shadow: 0 30px 120px rgba(0,0,0,10);
}

@keyframes formIn{
  from{ transform: translateY(10px); opacity: 0; }
  to{ transform: translateY(0); opacity: 1; }
}

.title{
  font-size: 38px;
  font-weight: 800;
  letter-spacing: .5px;
  margin-bottom: 18px;
  color: var(--blue);
  text-align:center;
}

.micro-hint{
  margin-top: 10px;
  font-size: 12px;
  opacity: .75;
  text-align: center;
}

.cta{
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.cta:hover{
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(26,163,255,.25);
  filter: saturate(1.05);
}
.cta:active{
  transform: translateY(0px) scale(.99);
}

.side{
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.side-left{ justify-content: flex-end; }
.side-right{
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.group-demo{
  margin-top: 14px;
  width: min(420px, 34vw);
  display: flex;
  justify-content: flex-start;
}

.group-stage{
  width: 500px !important;
  height: 220px;   
}

.demo-overlay{
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  line-height: 1;
  font-size: 18px;
  font-weight: 500;
  color: #111;
  z-index: 5;
  pointer-events: none;
}

.demo-overlay.dark{
  color: #fff;
}

.shot-card{
  width: min(420px, 34vw);
  max-height: 560px;
  padding: 12px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 55px rgba(0,0,0,.12);
  overflow: visible;
  cursor: pointer;
  text-align:center;
  animation:
  introFade .8s ease forwards,
  floaty 4.6s ease-in-out infinite;
  transition: transform .2s ease, box-shadow .2s ease;
}

.shot-card.dark {
  background-color: black;
}

.shot-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  min-height: 34px;
  font-weight:500;
  font-size: 18px;
}

.shot-badge.dark{
  background-color: black;
}
.side-right .shot-card{ animation-delay: .6s; }

@keyframes floaty{
  0%,100%{ transform: translateY(0px); }
  50%{ transform: translateY(-10px); }
}

.shot-card:hover{
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 24px 75px rgba(0,0,0,.18);
}

.shot-img{
  width: 100%;
  height: auto;
  max-height: 496px;
  object-fit: contain;
  display: block;
  border-radius: 12px;
}

.shot-enter-active, .shot-leave-active{
  transition: opacity .35s ease, transform .35s ease;
}
.shot-enter-from{
  opacity: 0;
  transform: translateY(8px);
}
.shot-leave-to{
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 980px){
  .content{ grid-template-columns: 1fr; }
  .side{ display: none; }
  .form-card{ max-width: 520px; margin: 0 auto; }
}

.couple-demo{
  margin-top: 14px;
  width: min(420px, 34vw);
}

.couple-demo.dark {
  background-color: black;
}

.couple-stage{
  position: relative;
  height: 220px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0,0,0,.10);
  overflow: hidden;
}

.couple-stage.dark {
  background-color: black;
}

.avatar{
  position: absolute;
  top: 50%;
  width: 100px;
  height: 100px;
  transform: translateY(-30%);
  filter: drop-shadow(0 6px 10px rgba(0,0,0,.18));
  opacity: 0;
  will-change: transform, opacity;
}

.avatar-f{
  left: 14px;
  animation: avatarLeftTimeline 6s ease-in-out infinite;
}
.avatar-m{
  right: 14px;
  animation: avatarRightTimeline 6s ease-in-out infinite;
}

.heart{
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 48px;
  line-height: 1;
  color: #ff3b5c;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  animation: heartTimeline 6s ease-in-out infinite;
}

.couple-frame{
  position: absolute;
  inset: 12px;
  border-radius: 14px;
  pointer-events: none;
  border: 2px solid rgba(26,163,255,0);
  opacity: 0;
  animation: frameTimeline 6s ease-in-out infinite;
}

.group-frame{
  position: absolute;
  inset: 12px;
  border-radius: 14px;
  pointer-events: none;
  border: 2px solid rgba(46, 204, 113, 0);
  opacity: 0;
  animation: groupFrameTimeline 6s ease-in-out infinite;
  z-index: 0;
}

@keyframes avatarLeftTimeline{
  0%   { opacity: 0; transform: translateY(-50%) translateX(0) scale(.95); }
  10%  { opacity: 1; transform: translateY(-50%) translateX(0) scale(1); }
  20%  { opacity: 1; transform: translateY(-50%) translateX(70px) scale(1); }
  62%  { opacity: 1; transform: translateY(-50%) translateX(70px) scale(1); }
  75%  { opacity: 0; transform: translateY(-50%) translateX(0) scale(.9); }
  100% { opacity: 0; transform: translateY(-50%) translateX(0) scale(.95); }
}

@keyframes avatarRightTimeline{
  0%   { opacity: 0; transform: translateY(-50%) translateX(0) scale(.95); }
  10%  { opacity: 1; transform: translateY(-50%) translateX(0) scale(1); }
  20%  { opacity: 1; transform: translateY(-50%) translateX(-70px) scale(1); }
  62%  { opacity: 1; transform: translateY(-50%) translateX(-70px) scale(1); }
  75%  { opacity: 0; transform: translateY(-50%) translateX(0) scale(.9); }
  100% { opacity: 0; transform: translateY(-50%) translateX(0) scale(.95); }
}

@keyframes heartTimeline{
  0%,18% { opacity: 0; transform: translate(-50%,-50%) scale(0); }
  22%    { opacity: 1; transform: translate(-50%,-50%) scale(1.15); }
  26%    { transform: translate(-50%,-50%) scale(1); }
  30%    { transform: translate(-50%,-50%) scale(1.12); }
  34%    { transform: translate(-50%,-50%) scale(1); }
  38%    { transform: translate(-50%,-50%) scale(1.10); }
  42%    { transform: translate(-50%,-50%) scale(1); }
  46%    { transform: translate(-50%,-50%) scale(1.12); }
  50%    { transform: translate(-50%,-50%) scale(1); }
  54%    { transform: translate(-50%,-50%) scale(1.10); }
  58%    { transform: translate(-50%,-50%) scale(1); }
  62%    { opacity: 1; transform: translate(-50%,-50%) scale(1.15); }
  66%    { opacity: 1; transform: translate(-50%,-50%) scale(1.25); }
  70%    { opacity: 0; transform: translate(-50%,-50%) scale(.2); }
  100%   { opacity: 0; transform: translate(-50%,-50%) scale(0); }
}

@keyframes frameTimeline{
  0%,3% { opacity: 0; border-color: rgba(26,163,255,0); transform: scale(.98); }
  4% { opacity: 1; border-color: red; transform: scale(1.2); }
  20% { opacity: 1; border-color: red; transform: scale(1); }
  80% { opacity: 1; border-color: red; transform: scale(1); }
  90% { opacity: 0; border-color: rgba(26,163,255,0); transform: scale(.98); }
  100% { opacity: 0; border-color: rgba(26,163,255,0); transform: scale(.98); }
}

@keyframes groupFrameTimeline{
  0%,3% { opacity: 0; border-color: rgba(46, 204, 113, 0); transform: scale(.98);}
  4% { opacity: 1; border-color: #2ecc71; transform: scale(1.2);}
  20% { opacity: 1; border-color: #2ecc71; transform: scale(1); }
  80% { opacity: 1; border-color: #2ecc71; transform: scale(1); }
  90% { opacity: 0; border-color: #2ecc71; transform: scale(.98); }
  100% { opacity: 0; border-color: rgba(46, 204, 113, 0); transform: scale(.98); }
}

.side-left{
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.group-stage{
  position: relative;
  width: 300px;
  height: 220px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.1);
  overflow: hidden;
}

.group-stage.dark {
  background-color: black;
}

.g-avatar{
  position: absolute;
  top: 50%;
  width: 120px;
  transform: translateY(-50%);
  opacity: 0;
  z-index: 2;
}

.m1{ left: 10px; animation: groupLeft 7s infinite ease-in-out; }
.f{
  left: 50%;
  transform: translate(-50%, -50%);
  animation: groupCenter 7s infinite ease-in-out;
}
.m2{ right: 10px; animation: groupRight 7s infinite ease-in-out; }

@keyframes groupLeft{
  0%,15%{ opacity:0; transform:translateY(-50%) translateX(0); }
  25%,80%{ opacity:1; transform:translateY(-50%) translateX(40px); }
  100%{ opacity:0; transform:translateY(-50%) translateX(0); }
}

@keyframes groupCenter{
  0%,15%{ opacity:0; }
  25%,80%{ opacity:1; }
  100%{ opacity:0; }
}

@keyframes groupRight{
  0%,15%{ opacity:0; transform:translateY(-50%) translateX(0); }
  25%,80%{ opacity:1; transform:translateY(-50%) translateX(-40px); }
  100%{ opacity:0; transform:translateY(-50%) translateX(0); }
}

.links{
  position: absolute;
  inset: 0;
  stroke: #2ecc71;
  stroke-width: 3;
  fill: none;
  opacity: 0;
  animation: linksCycle 7s infinite ease-in-out;
  z-index: 1;
}

.links .link{
  stroke: #2ecc71;
  stroke-width: 3;
  stroke-linecap: round;
}

@keyframes linksCycle{
  0%,25%{ opacity:0; stroke-dashoffset:100; }
  30%,80%{ opacity:1; stroke-dashoffset:0; }
  100%{ opacity:0; }
}

.intro{
  opacity: 0;
  transform: translateY(10px) scale(.98);
  animation: introFade .8s ease forwards;
  will-change: opacity, transform;
}

.intro-tl{ animation-delay: 0.5s; }
.intro-tr{ animation-delay: 1s; }
.intro-br{ animation-delay: 1.5s; }
.intro-bl{ animation-delay: 2s; }

.intro-form{
  animation: formImpact 1.1s ease forwards;
  animation-delay: 4s;
  transform-origin: center;
}

@keyframes introFade{
  to{
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes formImpact{
  0%{
    opacity: 0;
    transform: scale(.92);
  }
  20%{
    opacity: 1;
    transform: scale(1.05);    
    box-shadow: 0 40px 160px rgba(0,0,0,.9);
  }

  30%{ transform: translateX(-12px) rotate(-1deg); }
  40%{ transform: translateX(12px) rotate(1deg); }
  50%{ transform: translateX(-8px) rotate(-0.6deg); }
  60%{ transform: translateX(8px) rotate(0.6deg); }
  70%{ transform: translateX(-4px); }

  100%{
    opacity: 1;
    transform: translateX(0) scale(1);
    box-shadow: 0 30px 120px rgba(0,0,0,.8);
  }
}

.lightning::before{
  content: "";
  position: fixed;
  inset: 0;
  background: #eaf4ff;
  opacity: 0;
  pointer-events: none;
  z-index: 9999;
  animation: lightningFlash 0.45s ease-out forwards;
  animation-delay: 4s;
}

@keyframes lightningFlash{
  0%   { opacity: 0; }
  10%  { opacity: 0.95; }
  18%  { opacity: 0.15; }
  26%  { opacity: 0.85; }
  40%  { opacity: 0.2; }
  100% { opacity: 0; }
}

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

.form_input::placeholder {
  color: black;
  opacity: 1;
}

.form_input:-ms-input-placeholder {
  color: black;
}

.form_input::-ms-input-placeholder {
  color: black;
}

.form_input.dark::placeholder {
  color: white;
  opacity: 1;
}

.form_input.dark:-ms-input-placeholder {
  color: white;
}

.form_input.dark::-ms-input-placeholder {
  color: white;
}
</style>