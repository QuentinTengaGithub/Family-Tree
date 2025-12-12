<template>
    <div class="home-content" :class="{ 'section-hovered': hoveringSection && !darkMode }">
        <div class="left-panel" :class="{ 'no-background': !hasMembers, 'light-mode-border-right': !darkMode, 'dark-mode-border-right': darkMode }">
            <div class="background-slider" v-if="hasMembers">
                <div v-for="(member, index) in memberImages" 
                     :key="index" 
                     class="slide" 
                     :style="{ 
                         backgroundImage: 'url(' + member.image + ')', 
                         animationDuration: animationDuration + 's', 
                         animationDelay: (index * 5) + 's' 
                     }">
                </div>
            </div>
            <div class="overlay" v-if="hasMembers"></div>
            <h1 class="welcome-title" :class="{ 'dark-mode-text': darkMode, 'light-mode-text': !darkMode }" style="font-size: clamp(2rem, 5vw, 6rem); position: relative; z-index: 2;">
                <span class="animated-text">{{ animatedWelcomeText }}</span><span class="cursor" v-if="textIndex < fullWelcomeText.length">|</span>
            </h1>
        </div>
        <div class="right-panel">
            <section class="home-section" :class="{ dark: darkMode, 'light-mode-border-bottom': !darkMode }" @click="changeTab('Add-Member')" @mouseenter="setHovering(true)" @mouseleave="setHovering(false)">
                <img :src="arrowRightImage" alt="Arrow Right" class="click-indicator">
                <div>
                    <h2>Create your own family tree</h2>
                    <p>Add new members and grow your family.</p>
                </div>
            </section>
            <section class="home-section" :class="{ dark: darkMode, 'light-mode-border-bottom': !darkMode }" @click="changeTab('Tree')" @mouseenter="setHovering(true)" @mouseleave="setHovering(false)">
                <img :src="arrowRightImage" alt="Arrow Right" class="click-indicator">
                <div>
                    <h2>View your family tree</h2>
                    <p>Explore your family's history in an interactive tree.</p>
                </div>
            </section>
            <section class="home-section" :class="{ dark: darkMode, 'light-mode-border-bottom': !darkMode }" @click="changeTab('Members')" @mouseenter="setHovering(true)" @mouseleave="setHovering(false)">
                <img :src="arrowRightImage" alt="Arrow Right" class="click-indicator">
                <div>
                    <h2>Consult the member list</h2>
                    <p>See all the members of your family.</p>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    data() {
        return {
            hoveringSection: false,
            animatedWelcomeText: '',
            fullWelcomeText: 'Welcome to the family !!',
            textIndex: 0,
            typingSpeed: 100, // milliseconds per character
            arrowRightImage: require('@/assets/arrow_right.png') // Import the image
        }
    },
    mounted() {
        this.startTyping();
    },
    methods: {
        changeTab(tab) {
            this.$router.push('/' + tab.toLowerCase());
        },
        setHovering(isHovering) {
            this.hoveringSection = isHovering;
        },
        startTyping() {
            if (this.textIndex < this.fullWelcomeText.length) {
                this.animatedWelcomeText += this.fullWelcomeText.charAt(this.textIndex);
                this.textIndex++;
                setTimeout(this.startTyping, this.typingSpeed);
            }
        }
    },
    computed: {
        ...mapState(['members', 'darkMode']),
        memberImages() {
            if (!this.members) return [];
            return this.members.filter(member => member.image);
        },
        animationDuration() {
            return this.memberImages.length * 5;
        },
        hasMembers() {
            return this.memberImages.length > 0;
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
  background-color: rgba(128, 128, 128, 0.5); /* Semi-transparent gray */
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
  border-right: 1px solid transparent; /* Default to transparent, controlled by classes */
  transition: border-right-color 0.3s ease; /* Smooth transition for border color */
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

/* Hover effect for borders in light mode */
.home-content.section-hovered .left-panel.light-mode-border-right {
    border-right: 1px solid white; /* Override to white on hover in light mode */
}

.background-slider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0;
    animation-name: imageAnimation;
    animation-iteration-count: infinite;
}

@keyframes imageAnimation {
  0% { opacity: 0; animation-timing-function: ease-in; }
  8% { opacity: 1; transform: scale(1.05); animation-timing-function: ease-out; }
  17% { opacity: 1; transform: scale(1.1); }
  25% { opacity: 0; transform: scale(1.1); }
  100% { opacity: 0 }
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
}

.right-panel {
  display: flex;
  flex-direction: column;
  width: 67vw;
  height: 100vh;
}

.home-section {
  flex: 1;
  display: flex; /* Make it a flex container */
  align-items: center; /* Vertically center content */
  justify-content: center; /* Align content to the center */
  border-bottom: 1px solid transparent; /* Default to transparent */
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative; /* For absolute positioning of indicator if needed */
}

.home-section > div { /* To contain h2 and p */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1; /* Allow content to grow */
}

.click-indicator {
    display: block; /* Changed to block for image */
    width: 100px; /* Increased size for image */
    height: 60px; /* Increased size for image */
    transition: all 0.3s ease;
    opacity: 0.7;
    position: absolute; /* Position absolutely within the section */
    left: 20px; /* Distance from left edge */
    animation: pulse 1.5s infinite; /* Added pulse animation */
    filter: invert(100%); /* Black in light mode (assuming original is white) */
}

@keyframes pulse {
    0% { transform: scale(0.9); opacity: 0.7; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(0.9); opacity: 0.7; }
}

.home-section:hover .click-indicator {
    left: 30px; /* Move it slightly to the right on hover */
    opacity: 1;
}

/* Specific styling for the image in dark mode */
.home-section.dark .click-indicator {
    filter: invert(0%); /* White in dark mode */
}

/* Specific styling for the image in dark mode hover */
.home-section.dark:hover .click-indicator {
    filter: invert(100%); /* Invert colors to make it black */
}

.home-section:last-child {
  border-bottom: none !important;
}

.home-section.dark {
    border-bottom: 1px solid #ccc; /* Dark mode border */
}

.home-section.light-mode-border-bottom {
    border-bottom: 1px solid black;
}

/* Hover effect for borders in light mode */
.home-content.section-hovered .home-section.light-mode-border-bottom {
    border-bottom: 1px solid white; /* Override to white on hover in light mode */
}

.home-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  background-color: #f9f9f9;
}
/* This needs to be applied only when in light mode */
.home-content.section-hovered .home-section:hover {
    background-color: white; /* Make background white on hover in light mode */
}

.home-section:hover h2 {
    color: var(--blue) !important;
}

.home-section:hover p {
    color: black !important; /* Set p to black on hover */
}

.home-section h2 {
    margin: 0;
    font-size: 3vw;
    font-weight:bold;
    transition: color 0.3s ease;
}

.home-section p {
    margin: 10px 0 0;
    font-size: 1.8vw;
    color: #333; /* Darker for light mode */
    transition: color 0.3s ease;
}

.home-section.dark p {
    color: #eee; /* Lighter for dark mode */
}

.welcome-title {
    font-family: 'Arial Black', Gadget, Impact, sans-serif;
    font-weight: 1000; /* Ensure it's very bold */
    transition: color 0.3s ease; /* Smooth color transition */
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

/* The typing effect */
@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: currentcolor; } /* Blinking cursor */
}
</style>
