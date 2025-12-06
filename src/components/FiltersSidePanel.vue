<template>
    <div class="filters-content" :class="{ dark: darkMode }" :style="{ right: isFiltersPanelVisible ? '0' : '-25vw', 'box-shadow': isFiltersPanelVisible ? '-5px 0px 5px grey' : 'none' }">
        <button class="close-btn" @click="$emit('close-panel')" :style="{ dark : darkMode}">X</button>
        <p :style="{ dark : darkMode}">Filters</p>
        <fieldset>
        <legend>Gender</legend>
        <div>
            <label :class="{ 'disabled-option': selectedRelationship === 'married' }">
                <input type="radio" name="gender" value="" v-model="selectedGender" :disabled="selectedRelationship === 'married'" />
                All
            </label>
        </div>
        <div>
            <label :class="{ 'disabled-option': selectedRelationship === 'married' }">
                <input type="radio" name="gender" value="male" v-model="selectedGender" :disabled="selectedRelationship === 'married'" />
                Male
            </label>
        </div>
        <div>
            <label :class="{ 'disabled-option': selectedRelationship === 'married' }">
                <input type="radio" name="gender" value="female" v-model="selectedGender" :disabled="selectedRelationship === 'married'" />
                Female
            </label>
        </div>
        </fieldset>
        <fieldset>
        <legend>Relationship</legend>
        <div>
            <label>
                <input type="radio" name="relationship" value="" v-model="selectedRelationship" />
                All
            </label>
        </div>
        <div>
            <label :class="{ 'disabled-option': selectedGender !== '' }">
                <input type="radio" name="relationship" value="married" v-model="selectedRelationship" :disabled="selectedGender !== ''" />
                Married
            </label>
        </div>
        <div>
            <label>
                <input type="radio" name="relationship" value="siblings" v-model="selectedRelationship" />
                Siblings
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
  watch: {
    selectedGender(newGender) {
      console.log('FiltersSidePanel: selectedGender changed to', newGender);
      this.$emit('gender-filter-changed', newGender);
      if (newGender !== '' && this.selectedRelationship === 'married') {
        this.selectedRelationship = ''; // Deselect relationship if gender is selected
      }
    },
    selectedRelationship(newRelationship) {
      console.log('FiltersSidePanel: selectedRelationship changed to', newRelationship);
      this.$emit('relationship-filter-changed', newRelationship);
      if (newRelationship === 'married') {
        this.selectedGender = ''; // Deselect gender if married is selected
      }
    },
  },
  methods: {
    logClick(message) {
      console.log(message);
    }
  },
  computed: {
    darkMode() {
      return this.$store.state.darkMode;
    }
  }
};
</script>

<style>
/* Dark mode styles */
.filters-content.dark {
  background-color: black;
  color: white;
}

.filters-content.dark fieldset,
.filters-content.dark legend,
.filters-content.dark label {
  color: white;
}

.filters-content {
    background-color: white;
    border-left:solid 1px var(--lightGrey);
    width: 25vw;
    height:100vh;
    position:fixed;
    top:43px;
    box-shadow:-5px 0px 5px grey;
    transition: right 0.3s ease-in-out;
    z-index: 100; /* Ensure panel is on top */
}


.filters-content.dark .close-btn {
  color: white;
}

.close-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
}

.close-btn.dark {
  color:white;
}

input[type="radio"] {
  cursor: pointer;
  z-index: 9999; /* High z-index for debugging */
  margin-right: 5px;
}

label {
  cursor: pointer;
  z-index: 9999; /* High z-index for debugging */
  display: inline-block;
  padding: 3px 5px;
  border: 1px solid transparent;
}

.disabled-option {
  text-decoration: line-through;
  color: grey;
  cursor: not-allowed;
}



fieldset div {
  margin-bottom: 5px;
}

p.dark {
  color:white;
}
</style>