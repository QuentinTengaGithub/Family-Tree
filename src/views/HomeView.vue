<template>
    <div class="home-content" :class="{ 'section-hovered': hoveringSection && !darkMode }">
      <div
        class="left-panel"
        :class="{
          'no-background': !hasMembers,
          'light-mode-border-right': !darkMode,
          'dark-mode-border-right': darkMode
        }"
      >
        <!-- BACKGROUND SLIDESHOW -->
        <div class="background-slider" v-if="hasMembers">
          <div
            v-for="(img, index) in slideshowImages"
            :key="index"
            class="slide"
            :style="{
              backgroundImage: 'url(' + img + ')',
              animationDelay: (index * slideDuration) + 's',
              animationDuration: totalDuration + 's'
            }"
          />
        </div>
  
        <div class="overlay" v-if="hasMembers"></div>
  
        <h1
          class="welcome-title"
          :class="{ 'dark-mode-text': darkMode, 'light-mode-text': !darkMode }"
          style="font-size: clamp(2rem, 5vw, 6rem); position: relative; z-index: 2;"
        >
          <span class="animated-text">{{ animatedWelcomeText }}</span
          ><span class="cursor" v-if="textIndex < fullWelcomeText.length">|</span>
        </h1>
      </div>
  
      <div class="right-panel">
        <section
          class="home-section"
          :class="{ dark: darkMode, 'light-mode-border-bottom': !darkMode }"
          @click="changeTab('Add-Member')"
          @mouseenter="setHovering(true)"
          @mouseleave="setHovering(false)"
        >
          <div class="home-section-content">
            <div class="home-section-title-row">
              <img :src="arrowRightImage" alt="Arrow Right" class="click-indicator" />
              <h2>Create your own family tree</h2>
            </div>
            <p>Add new members and grow your family.</p>
          </div>
        </section>
  
        <section
          class="home-section"
          :class="{ dark: darkMode, 'light-mode-border-bottom': !darkMode }"
          @click="changeTab('Tree')"
          @mouseenter="setHovering(true)"
          @mouseleave="setHovering(false)"
        >
          <div class="home-section-content">
            <div class="home-section-title-row">
              <img :src="arrowRightImage" alt="Arrow Right" class="click-indicator" />
              <h2>View your family tree</h2>
            </div>
            <p>Explore your family's history in an interactive tree.</p>
          </div>
        </section>
  
        <section
          class="home-section"
          :class="{ dark: darkMode, 'light-mode-border-bottom': !darkMode }"
          @click="changeTab('Members')"
          @mouseenter="setHovering(true)"
          @mouseleave="setHovering(false)"
        >
          <div class="home-section-content">
            <div class="home-section-title-row">
              <img :src="arrowRightImage" alt="Arrow Right" class="click-indicator" />
              <h2>Consult the member list</h2>
            </div>
            <p>See all the members of your family.</p>
          </div>
        </section>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex'
  
  export default {
    data() {
      return {
        hoveringSection: false,
        animatedWelcomeText: '',
        fullWelcomeText: 'Welcome to the family !!',
        textIndex: 0,
        typingSpeed: 100,
        arrowRightImage: require('@/assets/arrow_right.png'),
  
        // 🔥 slideshow : plus rapide
        slideDuration: 2.2, // durée d’affichage “utile” d’une slide (s)
        minSlidesForLoop: 3 // si peu d’images, on duplique pour que l’anim reste jolie
      }
    },
    mounted() {
      this.startTyping()
    },
    methods: {
      changeTab(tab) {
        this.$router.push('/' + tab.toLowerCase())
      },
      setHovering(isHovering) {
        this.hoveringSection = isHovering
      },
      startTyping() {
        if (this.textIndex < this.fullWelcomeText.length) {
          this.animatedWelcomeText += this.fullWelcomeText.charAt(this.textIndex)
          this.textIndex++
          setTimeout(this.startTyping, this.typingSpeed)
        }
      },
  
      // ✅ exclure les avatars
      isAvatarImage(url) {
        if (!url) return true
        const s = String(url).toLowerCase()
  
        // tu as écrit avatar_male.ong -> je couvre png/jpg/webp + possibles typos
        return (
          s.includes('avatar_male') ||
          s.includes('avatar_female') ||
          s.includes('avatar-male') ||
          s.includes('avatar-female')
        )
      }
    },
    computed: {
      ...mapState(['members', 'darkMode']),
  
      // ✅ images “valides” = non-avatar
      memberImages() {
        if (!this.members) return []
        return this.members
          .map(m => m.image)
          .filter(img => !!img && !this.isAvatarImage(img))
      },
  
      // ✅ assure un minimum d’images pour une boucle fluide
      slideshowImages() {
        const imgs = this.memberImages
  
        if (imgs.length === 0) return []
  
        // si 1 ou 2 images, on duplique pour éviter un slideshow “moche”
        let out = [...imgs]
        while (out.length < this.minSlidesForLoop) {
          out = out.concat(imgs)
        }
  
        // optionnel : limite pour éviter trop d’éléments
        return out.slice(0, 12)
      },
  
      hasMembers() {
        return this.slideshowImages.length > 0
      },
  
      // animation totale = nbSlides * slideDuration
      totalDuration() {
        return this.slideshowImages.length * this.slideDuration
      }
    }
  }
  </script>
  
  <style>
  .home-content {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: rgba(128, 128, 128, 0.5);
  }
  
  .left-panel {
    width: 33vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    border-right: 1px solid transparent;
    transition: border-right-color 0.3s ease;
  }
  
  .left-panel.no-background {
    background-color: transparent;
  }
  
  .left-panel.light-mode-border-right {
    border-right: 1px solid black;
  }
  
  .left-panel.dark-mode-border-right {
    border-right: 1px solid white;
  }
  
  .home-content.section-hovered .left-panel.light-mode-border-right {
    border-right: 1px solid white;
  }
  
  .background-slider {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  
  /* 🔥 Plus vivant: crossfade + zoom/pan + léger blur -> focus */
  .slide {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0;
    will-change: transform, opacity, filter;
    animation-name: imageAnimationVivid;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    transform: scale(1.05);
    filter: blur(2px) saturate(1.1) contrast(1.05);
  }
  
  /* 🧠 Le % est calculé pour une slideDuration “utile”
     Vu qu’on duplique les slides, l’illusion est fluide. */
  @keyframes imageAnimationVivid {
    0% {
      opacity: 0;
      transform: scale(1.03) translate3d(-1.5%, 0, 0);
      filter: blur(3px) saturate(1.05) contrast(1.0);
    }
    10% {
      opacity: 1;
      filter: blur(0px) saturate(1.2) contrast(1.08);
    }
    55% {
      opacity: 1;
      transform: scale(1.12) translate3d(1.5%, -1%, 0);
      filter: blur(0px) saturate(1.25) contrast(1.1);
    }
    80% {
      opacity: 0;
      transform: scale(1.14) translate3d(2.5%, -1.5%, 0);
      filter: blur(2px) saturate(1.15) contrast(1.05);
    }
    100% {
      opacity: 0;
    }
  }
  
  .overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.6));
    z-index: 1;
  }
  
  .right-panel {
    display: flex;
    flex-direction: column;
    width: 67vw;
    height: 100vh;
  }
  
  /* ---- le reste de ton style inchangé ---- */
  .home-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid transparent;
    padding: 20px;
    box-sizing: border-box;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .home-section-content{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    width: 100%;
  }

  .home-section-title-row{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    width: 100%;
  }
  
  .click-indicator {
    display: block;
    width: 100px;
    height: 60px;
    transition: all 0.3s ease;
    opacity: 0.7;
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    animation: pulse 1.2s infinite; /* un peu + rapide */
    filter: invert(100%);
  }
  
  @keyframes pulse {
    0% { transform: translateY(-50%) scale(0.9); opacity: 0.7; }
    50% { transform: translateY(-50%) scale(1.12); opacity: 1; }
    100% { transform: translateY(-50%) scale(0.9); opacity: 0.7; }
  }
  
  .home-section:hover .click-indicator {
    left: 30px;
    opacity: 1;
  }
  
  .home-section.dark .click-indicator {
    filter: invert(0%);
  }
  
  .home-section.dark:hover .click-indicator {
    filter: invert(100%);
  }
  
  .home-section:last-child {
    border-bottom: none !important;
  }
  
  .home-section.dark {
    border-bottom: 1px solid #ccc;
  }
  
  .home-section.light-mode-border-bottom {
    border-bottom: 1px solid black;
  }
  
  .home-content.section-hovered .home-section.light-mode-border-bottom {
    border-bottom: 1px solid white;
  }
  
  .home-section:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    background-color: #f9f9f9;
  }
  
  .home-content.section-hovered .home-section:hover {
    background-color: white;
  }
  
  .home-section:hover h2 {
    color: var(--blue) !important;
  }
  
  .home-section:hover p {
    color: black !important;
  }
  
  .home-section h2 {
    margin: 0;
    font-size: 3vw;
    font-weight: bold;
    transition: color 0.3s ease;
  }
  
  .home-section p {
    margin: 10px 0 0;
    font-size: 1.8vw;
    color: #333;
    transition: color 0.3s ease;
  }
  
  .home-section.dark p {
    color: #eee;
  }
  
  .welcome-title {
    font-family: 'Arial Black', Gadget, Impact, sans-serif;
    font-weight: 1000;
    transition: color 0.3s ease;
  }
  
  .welcome-title.light-mode-text {
    color: black;
  }
  
  .welcome-title.dark-mode-text {
    color: white;
  }
  
  .cursor {
    display: inline-block;
    animation: blink-caret 0.75s step-end infinite;
  }
  
  @keyframes blink-caret {
    from, to { border-color: transparent }
    50% { border-color: currentcolor; }
  }

/* ===== Mobile responsive ===== */
@media (max-width: 780px){
  .home-content{
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .left-panel{
    order: 1;
    width: 100%;
    height: 35vh;
    border-right: none !important;
  }

  /* Divider between welcome and first block */
  .left-panel.light-mode-border-right{ border-bottom: 2px solid black; }
  .left-panel.dark-mode-border-right{ border-bottom: 2px solid white; }

  .right-panel{
    order: 2;
    width: 100%;
    height: 65vh;
  }

  .home-section{
    width: 100%;
    justify-content: flex-start;
    text-align: left;
  }

  .home-section-content{ align-items: flex-start; }
  .home-section-title-row{ justify-content: flex-start; }

  /* Arrow aligned with the bold title on mobile */
  .click-indicator{
    position: static;
    top: auto;
    left: auto;
    transform: none;
    animation: none;
    width: 26px;
    height: 26px;
    opacity: 0.85;
  }

  /* Make the 3 blocks easier to read on mobile */
  .home-section h2{
    font-size: 20px;
  }

  .home-section p{
    font-size: 15px;
  }
}
  </style>
  