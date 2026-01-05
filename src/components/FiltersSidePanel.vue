<template>
  <div
    class="filters-content"
    :class="{
      dark: darkMode,
      'filters-content--visible': isFiltersPanelVisible
    }"
  >
  <div class="filters-header">
  <button
    class="close-btn"
    :class="{ dark: darkMode }"
    @click="$emit('close-panel')"
  >
    ✕
  </button>
  <span class="filters-title" :class="{ dark: darkMode }">Filters</span>
</div>


    <!-- GENDER -->
    <fieldset class="filter-group">
      <legend class="filter-group__legend">Gender</legend>
      <div class="filter-options">
        <label
          class="filter-option"
          :class="{
            'filter-option--active': selectedGender === '',
            'filter-option--disabled': selectedRelationship === 'married'
          }"
        >
          <input
            class="filter-option__input"
            type="radio"
            name="gender"
            value=""
            v-model="selectedGender"
            :disabled="selectedRelationship === 'married'"
          />
          <span class="filter-option__label-text">All</span>
        </label>

        <label
          class="filter-option"
          :class="{
            'filter-option--active': selectedGender === 'male',
            'filter-option--disabled': selectedRelationship === 'married'
          }"
        >
          <input
            class="filter-option__input"
            type="radio"
            name="gender"
            value="male"
            v-model="selectedGender"
            :disabled="selectedRelationship === 'married'"
          />
          <span class="filter-option__label-text">Male</span>
        </label>

        <label
          class="filter-option"
          :class="{
            'filter-option--active': selectedGender === 'female',
            'filter-option--disabled': selectedRelationship === 'married'
          }"
        >
          <input
            class="filter-option__input"
            type="radio"
            name="gender"
            value="female"
            v-model="selectedGender"
            :disabled="selectedRelationship === 'married'"
          />
          <span class="filter-option__label-text">Female</span>
        </label>
      </div>
    </fieldset>

    <!-- RELATIONSHIP -->
    <fieldset class="filter-group">
      <legend class="filter-group__legend">Relationship</legend>
      <div class="filter-options">
        <label
          class="filter-option"
          :class="{ 'filter-option--active': selectedRelationship === '' }"
        >
          <input
            class="filter-option__input"
            type="radio"
            name="relationship"
            value=""
            v-model="selectedRelationship"
          />
          <span class="filter-option__label-text">All</span>
        </label>

        <label
          class="filter-option"
          :class="{
            'filter-option--active': selectedRelationship === 'married',
            'filter-option--disabled': selectedGender !== ''
          }"
        >
          <input
            class="filter-option__input"
            type="radio"
            name="relationship"
            value="married"
            v-model="selectedRelationship"
            :disabled="selectedGender !== ''"
          />
          <span class="filter-option__label-text">Married</span>
        </label>

        <label
          class="filter-option"
          :class="{ 'filter-option--active': selectedRelationship === 'siblings' }"
        >
          <input
            class="filter-option__input"
            type="radio"
            name="relationship"
            value="siblings"
            v-model="selectedRelationship"
          />
          <span class="filter-option__label-text">Siblings</span>
        </label>
      </div>
    </fieldset>
  </div>
</template>

<script>
export default {
  props: {
    isFiltersPanelVisible: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      selectedGender: '',
      selectedRelationship: '',
    };
  },
  computed: {
    darkMode() {
      return this.$store.state.darkMode;
    }
  },
  watch: {
    selectedGender(newGender) {
      this.$emit('gender-filter-changed', newGender);
      if (newGender !== '' && this.selectedRelationship === 'married') {
        this.selectedRelationship = '';
      }
    },
    selectedRelationship(newRelationship) {
      this.$emit('relationship-filter-changed', newRelationship);
      if (newRelationship === 'married') {
        this.selectedGender = '';
      }
    },
  },
};
</script>


<style>
.filters-content{
  position: fixed;
  top: 43px;
  right: 0;
  width: 25vw;
  min-width: 260px;
  height: calc(100vh - 43px);

  /* hidden by default */
  transform: translateX(110%);

  padding: 18px 18px 24px;
  box-sizing: border-box;

  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(14px);
  border-left: 1px solid rgba(0,0,0,0.06);
  border-radius: 18px 0 0 18px;

  transition:
    transform 320ms cubic-bezier(.2,.9,.2,1),
    box-shadow 220ms ease,
    background-color 220ms ease;
  box-shadow: none;
  z-index: 100;
}

.filters-content--visible{
  transform: translateX(0);
  box-shadow: -14px 0 34px rgba(0,0,0,0.35);
}

/* Dark mode */
.filters-content.dark{
  background: rgba(8,8,12,0.96);
  border-left: 1px solid rgba(255,255,255,0.08);
}

.filters-title{
  margin: 0 0 14px;
  font-weight: 900;
  font-size: 18px;
}
.filters-title.dark{
  color: #fff;
}

/* Close button */
.close-btn{
  position: absolute;
  top: 10px;
  left: 12px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: none;
  background: rgba(0,0,0,0.04);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 16px;
  transition: background-color 160ms ease, transform 120ms ease, box-shadow 160ms ease;
}
.close-btn.dark{
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.close-btn:hover{
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
.close-btn:active{
  transform: translateY(0) scale(0.95);
}

/* Groups */
.filter-group{
  margin: 10px 0 18px;
  padding: 10px 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.85);
}
.filters-content.dark .filter-group{
  background: rgba(18,18,24,0.9);
  border: 1px solid rgba(255,255,255,0.08);
}

.filter-group__legend{
  padding: 0 4px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .05em;
  opacity: 0.75;
}

/* Options line */
.filter-options{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

/* Radio pill */
.filter-option{
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.12);
  background: rgba(255,255,255,0.9);
  font-size: 13px;
  cursor: pointer;

  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 120ms ease,
    color 160ms ease;
}

.filters-content.dark .filter-option{
  background: rgba(16,16,24,0.95);
  border-color: rgba(255,255,255,0.14);
  color: #f5f5f5;
}

.filter-option__input{
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Hover */
.filter-option:hover:not(.filter-option--disabled){
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
}

/* Active / selected state */
.filter-option--active{
  background: linear-gradient(135deg, #8ed6ff, #00aaff);
  border-color: rgba(0,170,255,0.9);
  color: #fff;
  box-shadow: 0 8px 20px rgba(0,170,255,0.45);
  animation: filterPop 220ms cubic-bezier(.2,.9,.2,1);
}

.filters-content.dark .filter-option--active{
  background: linear-gradient(135deg, #00aaff, #0077cc);
}

/* Disabled */
.filter-option--disabled{
  cursor: not-allowed;
  opacity: 0.45;
}
.filter-option--disabled .filter-option__label-text{
  text-decoration: line-through;
}

/* Small text inside pill */
.filter-option__label-text{
  white-space: nowrap;
}

/* Petite anim “pop” quand on change */
@keyframes filterPop{
  0%   { transform: scale(0.9); }
  60%  { transform: scale(1.04); }
  100% { transform: scale(1); }
}

.filters-header{
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 4px 18px;
  height: 48px;
}

.filters-title{
  font-weight: 900;
  font-size: 18px;
}

.filters-title.dark{
  color: #fff;
}

/* Update close button placement (now inside flex) */
.close-btn{
  position: relative;
  top: 0;
  left: 0;
  margin-left: 4px;
}


</style>