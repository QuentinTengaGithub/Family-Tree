<template>
  <div class="content">
    <p class="title">Add a member</p>
    <form @submit.prevent="createMember">
      <div class="form_input_container">
        <p class="form_text" :class="{ dark: darkMode }">* Name</p>
        <div class="form_input">
          <input 
            style="padding-left:10px" 
            type="text" 
            name="name" 
            id="name" 
            v-model="name" 
            class="form_input" 
            placeholder="Enter name" 
            :class="{ invalid: errors.name, dark: darkMode }">
        </div>
      </div>
      <div class="form_input_container">
        <p class="form_text" :class="{ dark: darkMode }">* Birthday</p>
        <div class="form_input">
          <input 
            style="padding-left:10px" 
            type="date" 
            name="birthday" 
            id="birthday" 
            v-model="birthday" 
            class="form_input"
            :class="{ invalid: errors.birthday, dark: darkMode }">
          </div>
      </div>
      <div class="form_input_container">
        <p class="form_text" :class="{ dark: darkMode }">* Gender</p>
        <div class="form_input" style="" :class="{ invalid: errors.gender }">
          <label style="margin-right:10px"><input type="radio" name="gender" value="male" v-model="gender"> Male</label>
          <label><input type="radio" name="gender" value="female" v-model="gender"> Female</label></div>
        </div>
        <div class="form_input_container">
          <p class="form_text" :class="{ dark: darkMode }">Photo</p>
          <div class="form_input">
            <label for="image" class="button">Choose a file</label>
            <input type="file" name="image" id="image" @change="handleImageUpload" style="display: none;">
          </div>
        </div>
        <div class="form-divider"></div>
        <div v-if="showSuccessMessage" class="success-message">Member created</div>
      <p><input class="button" type="submit" value="Create"></p>
    </form>


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
      showSuccessMessage: false,
      errors: { name: false, birthday: false, gender: false }
    };
  },
          computed: {
              isFormValid() {
                  return this.name && this.age && this.gender && this.image;
              },
              darkMode() {
                  return this.$store.state.darkMode;
              }
          },  methods: {

    createMember() {
      this.errors = { name: false, birthday: false, gender: false };

      if (!this.name) this.errors.name = true;
      if (!this.gender) this.errors.gender = true;

      if (this.errors.name || this.errors.birthday || this.errors.gender) {
        return;
      }

      const name = this.name;
      let image = this.image;
      const gender = this.gender;
      const birthday = this.birthday;

      const today = new Date();
      const birthDate = new Date(birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (!image) {
        if (gender === "male") {
          image = require("../assets/avatar_male.png"); 
        } else if (gender === "female") {
          image = require("../assets/avatar_female.png");
        }
      }

      const newMember = { name, age, image, gender, birthday, x: 0, y: 0 };
      this.$store.dispatch('addMember', newMember);
      
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);

      this.name = "";
      this.birthday = "";
      this.image = null;
      this.gender = "";
      const inputImage = document.getElementById("image");
      if (inputImage) {
        inputImage.value = "";
      }
    },

    deleteMember(member) {
      this.$store.dispatch('deleteMember', member.name);
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

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

          this.image = canvas.toDataURL('image/jpeg', 0.7);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    getMemberPosition(member) {
      const index = this.members.indexOf(member);
      return {
        x: (index + 1) * 200,
        y: 100 
      };
    }
  }
}
</script>

<style>
.form_text {
  width: 80px;
  text-align: right;
  margin-right: 15px;
  padding-right: 15px;
  border-right: 1px solid black;
}

.form_text.dark {
  border-right: 1px solid white;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.delete-member {
  border: none;
  padding: 10px;
  border-radius: 12px;
}

.female {
  background-color: pink;
}

.form_input {
  height: 30px;
  display: flex; 
  align-items: center;
}

input.form_input {
  width: 150px;
  border: 1px solid var(--input-border-color);
  border-radius: 5px;
}

input.form_input.dark {
  background-color:black !important;
  color:white;
}

.form-divider {
  width: 100%;
  max-width: 300px;
  height: 1px;
  background-color: var(--divider-color);
  margin: 20px 0;
}

.form_input_container {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  height:fit-content;
}

.gender {
  display: flex;
  flex-direction: inline;
  align-items: center;
  margin: 0 auto 10px auto;
  width: 5vw;
}

.gender button {
  background-color: transparent;
  width: fit-content;
  border: none;
  padding: 5%;
}

.gender img {
  width: 20px;
  height: 25px;
}

.form_input.invalid {
  border: 2px solid red !important;
}

.male {
  background-color: #87CEFA;
}

.members-container {
  display: flex;
  flex-wrap: wrap;
}

.member-gender {
  width: 20vw;
}

.member-image {
  width: 10vw;
  border-radius: 20px;
}

.member-name {
  font-weight: bold;
  font-size: 20px;
}

.new-member {
  display: inline-block;
  margin-right: 10px;
  border: solid 1px black;
  width: fit-content;
  padding: 2%;
  border: solid 1px black;
  border-radius: 20px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.success-message {
  background-color: #4CAF50;
  color: white;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
  animation: fadein 0.5s, fadeout 0.5s 4.5s;
}

@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeout {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>