<template>
  <transition name="layer-wave">
    <div v-if="tutorialEnabled" class="tutorial-layer">
      <transition-group name="bubble" tag="div" class="tutorial-layer-inner">
        <div
          v-for="hint in visibleHints"
          :key="hint.id"
          class="bubble"
          :class="{ dark: darkMode, dragging: draggingId === hint.id }"
          :style="bubbleStyle(hint.id)"
          @pointerdown="onPointerDown($event, hint.id)"
        >
          <div class="bubble__inner">
            <button
              class="bubble__close"
              type="button"
              @click.stop="dismiss(hint.id)"
              aria-label="Close hint"
            >
              ✕
            </button>

            <div class="bubble__shine"></div>

            <div class="bubble__title" v-if="hint.title">{{ hint.title }}</div>
            <div class="bubble__text">{{ hint.text }}</div>

            <div v-if="hint.actions?.length" class="bubble__actions">
              <button
                v-for="a in hint.actions"
                :key="a.label"
                class="bubble__action"
                type="button"
                @click.stop="a.onClick && a.onClick()"
              >
                {{ a.label }}
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </transition>
</template>

  
  <script>
  const POS_KEY_PREFIX = "tutorialHintPos:" // + pageKey
  
  export default {
    name: "TutorialHints",
    props: {
      pageKey: { type: String, required: true },
      hints: { type: Array, required: true },
    },
    data() {
      return {
        positions: {}, // { [hintId]: { x, y } }
        draggingId: null,
        dragOffset: { x: 0, y: 0 },
        hasMoved: false,
      }
    },
    computed: {
      tutorialEnabled() { return this.$store.state.tutorialEnabled },
      darkMode() { return this.$store.state.darkMode },
      visibleHints() {
        return (this.hints || []).filter(h => !this.$store.getters.isHintDismissed(this.pageKey, h.id))
      },
      storageKey() {
        return `${POS_KEY_PREFIX}${this.pageKey}`
      },
    },
    watch: {
      // Si on réactive le tutorial (reset global), on peut aussi reset les positions si tu veux.
      tutorialEnabled(enabled) {
        if (enabled) this.ensureInitialPositions()
      },
      // si la liste de hints change (autre page / nouveau hint), on seed les positions
      hints: {
        deep: true,
        immediate: true,
        handler() {
          this.loadPositions()
          this.ensureInitialPositions()
        }
      }
    },
    mounted() {
      window.addEventListener("pointermove", this.onPointerMove)
      window.addEventListener("pointerup", this.onPointerUp)
    },
    beforeDestroy() {
        window.removeEventListener("pointermove", this.onPointerMove)
        window.removeEventListener("pointerup", this.onPointerUp)
        },

    methods: {
      dismiss(hintId) {
        // ✅ suppression store (persistée)
        this.$store.commit("dismissTutorialHint", { pageKey: this.pageKey, hintId })
  
        // optionnel : supprimer aussi sa position persistée
        if (this.positions[hintId]) {
          this.$delete(this.positions, hintId)
          this.savePositions()
        }
      },
  
      loadPositions() {
        try {
          const raw = localStorage.getItem(this.storageKey)
          this.positions = raw ? JSON.parse(raw) : {}
        } catch {
          this.positions = {}
        }
      },
      savePositions() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.positions))
      },
  
      ensureInitialPositions() {
        // Seed positions for hints that don't have one yet
        const padding = 16
        const gap = 14
        const bubbleW = 320
        const bubbleH = 130
  
        const vw = window.innerWidth
        const vh = window.innerHeight
  
        // zone par défaut : en bas, mais "flottantes" => on les étale
        let startX = padding
        let startY = vh - padding - bubbleH
  
        ;(this.hints || []).forEach((h, idx) => {
          if (this.positions[h.id]) return
  
          const x = startX + idx * (bubbleW + gap)
          const row = Math.floor(x / Math.max(1, (vw - padding)))
          const finalX = padding + (x % Math.max(1, (vw - padding)))
          const finalY = startY - row * (bubbleH + gap)
  
          this.$set(this.positions, h.id, {
            x: Math.max(padding, Math.min(finalX, vw - padding - 260)),
            y: Math.max(padding, Math.min(finalY, vh - padding - 120)),
          })
        })
  
        this.savePositions()
      },
  
      bubbleStyle(hintId) {
        const p = this.positions[hintId] || { x: 16, y: 16 }
        const phase = (this.hash(hintId) % 100) / 100
        return {
            left: `${p.x}px`,
            top: `${p.y}px`,
            "--phase": `${phase}`,
        }
    },

  
      onPointerDown(e, hintId) {
        // important: ne pas démarrer drag quand on clique sur un bouton
        if (e.target.closest("button")) return
  
        this.draggingId = hintId
        this.hasMoved = false
  
        const p = this.positions[hintId] || { x: 16, y: 16 }
        this.dragOffset.x = e.clientX - p.x
        this.dragOffset.y = e.clientY - p.y
  
        // capture
        if (e.target && typeof e.target.setPointerCapture === "function") {
            e.target.setPointerCapture(e.pointerId)
        }
      },
  
      onPointerMove(e) {
        if (!this.draggingId) return
  
        const padding = 10
        const vw = window.innerWidth
        const vh = window.innerHeight
  
        const x = e.clientX - this.dragOffset.x
        const y = e.clientY - this.dragOffset.y
  
        const clampedX = Math.max(padding, Math.min(x, vw - padding - 260))
        const clampedY = Math.max(padding, Math.min(y, vh - padding - 110))
  
        if (!this.positions[this.draggingId]) {
          this.$set(this.positions, this.draggingId, { x: clampedX, y: clampedY })
        } else {
          this.positions[this.draggingId].x = clampedX
          this.positions[this.draggingId].y = clampedY
        }
  
        this.hasMoved = true
      },
  
      onPointerUp() {
        if (!this.draggingId) return
        this.savePositions()
        this.draggingId = null
      },
  
      hash(str) {
        let h = 0
        for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
        return h
      },
    }
  }
  </script>
  
<style scoped>
.tutorial-layer{
  position: fixed;
  inset: 0;
  z-index: 6000;
  pointer-events: none;
}

.tutorial-layer-inner{
  position: relative;
  width: 100%;
  height: 100%;
} 

.layer-wave-enter-active,
.layer-wave-leave-active{
  animation-duration: 360ms;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}
.layer-wave-enter-active{
  animation-name: layerWaterIn;
}
.layer-wave-leave-active{
  animation-name: layerWaterOut;
}

@keyframes layerWaterIn{
  0%   { opacity: 0; transform: scale(0.98); filter: blur(4px); }
  60%  { opacity: 1; transform: scale(1.02); filter: blur(1px); }
  100% { opacity: 1; transform: scale(1);    filter: blur(0); }
}
@keyframes layerWaterOut{
  0%   { opacity: 1; transform: scale(1);    filter: blur(0); }
  40%  { opacity: 1; transform: scale(1.02); filter: blur(1px); }
  100% { opacity: 0; transform: scale(0.96); filter: blur(4px); }
}

.bubble-enter-active,
.bubble-leave-active{
  transition:
    opacity 260ms ease,
    transform 260ms ease,
    filter 260ms ease;
}
.bubble-enter{
  opacity: 0;
  transform: scale(0.8);
  filter: blur(3px);
}
.bubble-leave-to{
  opacity: 0;
  transform: scale(0.9);
  filter: blur(4px);
}

.bubble{
  pointer-events: auto;
  position: absolute;
  width: min(260px, calc(100vw - 24px));
  border-radius: 999px;
  cursor: grab;
  user-select: none;
}

.bubble__inner{
  position: relative;
  padding: 10px 12px 10px;
  border-radius: 999px;

  background:
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.75), rgba(255,255,255,0) 42%),
    radial-gradient(circle at 70% 70%, rgba(0, 170, 255, 0.22), rgba(0,170,255,0.10) 50%, rgba(0,170,255,0.06) 72%),
    rgba(160, 220, 255, 0.22);

  border: 1px solid rgba(120, 200, 255, 0.55);
  box-shadow:
    0 12px 36px rgba(0,0,0,0.16),
    inset 0 0 0 1px rgba(255,255,255,0.35);

  backdrop-filter: blur(10px);

  animation: floatInner 3.8s ease-in-out infinite;
  animation-delay: calc(var(--phase, 0) * -2s);
}

.bubble.dragging .bubble__inner{
  animation: none;
}

@keyframes floatInner{
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}
 
.bubble.dragging{
    cursor: grabbing;
    animation: none;
}

.bubble.dark{
    background:
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.12), rgba(255,255,255,0) 42%),
        radial-gradient(circle at 70% 70%, rgba(0, 170, 255, 0.20), rgba(0,170,255,0.10) 50%, rgba(0,170,255,0.06) 72%),
        rgba(20, 25, 30, 0.55);
    border: 1px solid rgba(140, 220, 255, 0.35);
    color: white;
}

@keyframes floatBubble{
0%   { transform: translate3d(var(--x, 0px), var(--y, 0px), 0) translateY(0px); }
50%  { transform: translate3d(var(--x, 0px), var(--y, 0px), 0) translateY(-6px); }
100% { transform: translate3d(var(--x, 0px), var(--y, 0px), 0) translateY(0px); }
}

/* petit reflet */
.bubble__shine{
    position: absolute;
    top: 10px;
    left: 16px;
    width: 70px;
    height: 28px;
    border-radius: 999px;
    background: rgba(255,255,255,0.35);
    filter: blur(1px);
    transform: rotate(-12deg);
    opacity: 0.85;
    pointer-events: none;
}
  
.bubble__close{
  position: absolute;
  top: 6px;
  right: 8px;
  width: 22px;
  height: 22px;
  font-size: 13px;
  border:none;
  background-color: transparent;
}
.bubble.dark .bubble__close{
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(0,0,0,0.25);
    color: white;
}
.bubble__close:hover{ transform: scale(1.05); }

.bubble__title{
    font-weight: 800;
    font-size: 13px;
    margin-bottom: 4px;
    padding-right: 28px;
}

.bubble__text{
    font-size: 12px;
    line-height: 1.05rem;
    opacity: 0.95;
}

.bubble__actions{
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.bubble__action{
    border: none;
    padding: 6px 10px;
    border-radius: 999px;
    cursor: pointer;
    background: rgba(255,255,255,0.55);
}
.bubble.dark .bubble__action{
    background: rgba(255,255,255,0.12);
    color: white;
}

.bubble:active .bubble__inner{
  transform: scale(0.97);
  box-shadow:
    0 18px 40px rgba(0,0,0,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.4);
}

.bubble__inner{
  position: relative;
  padding: 10px 12px 10px;
  border-radius: 999px;

  background:
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.75), rgba(255,255,255,0) 42%),
    radial-gradient(circle at 70% 70%, rgba(0, 170, 255, 0.22), rgba(0,170,255,0.10) 50%, rgba(0,170,255,0.06) 72%),
    rgba(160, 220, 255, 0.22);

  border: 1px solid rgba(120, 200, 255, 0.55);
  box-shadow:
    0 12px 36px rgba(0,0,0,0.16),
    inset 0 0 0 1px rgba(255,255,255,0.35);

  backdrop-filter: blur(10px);

  animation: floatInner 3.8s ease-in-out infinite;
  animation-delay: calc(var(--phase, 0) * -2s);
  will-change: transform;
}

.bubble.dragging .bubble__inner{
  animation: none;
}
</style>
