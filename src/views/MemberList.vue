<template>
    <div class="content">
        <AddMember v-if="showAddMember" @member-created="handleMemberCreated" />
        <p class="title">The members</p>
        <table class="custom-table" v-if="members.length > 0">
            <thead>
                <tr>
                    <td class="column_gender table_header" :class="{ dark: darkMode }" style="width:20px"></td>
                    <td class="column_photo table_header" :class="{ dark: darkMode }">Photo</td>
                    <td class="column_name table_header" :class="{ dark: darkMode }">Name
                        <button style="background-color: transparent; border:none; cursor: pointer"
                            @click="sortMembersByName">
                            <img 
                                v-if="this.nameSortOrder === 'asc' && this.darkMode === false"
                                style="width:15px; margin-left: -5px"
                                src="@/assets/arrow-up.png" />
                            <img 
                                v-if="this.nameSortOrder === 'desc' && this.darkMode === false" 
                                style="width:15px; margin-left: -5px" 
                                src="@/assets/arrow-down.png" />
                            <img 
                                v-if="this.nameSortOrder === 'asc' && this.darkMode === true"
                                style="width:15px; margin-left: -5px"
                                src="@/assets/arrow-up-dark.png" />
                            <img 
                                v-if="this.nameSortOrder === 'desc' && this.darkMode === true" 
                                style="width:15px; margin-left: -5px" 
                                src="@/assets/arrow-down-dark.png" />
                        </button>
                    </td>
                    <td class="column_age table_header" :class="{ dark: darkMode }">Age
                        <button style="background-color: transparent; border:none; cursor: pointer"
                            @click="sortMembersByAge">
                            <img 
                                v-if="this.ageSortOrder === 'asc' && this.darkMode === false" 
                                style="width:15px; margin-left: -5px"
                                src="../assets/arrow-up.png" />
                            <img 
                                v-if="this.ageSortOrder === 'desc' && this.darkMode === false" 
                                style="width:15px; margin-left: -5px" 
                                src="../assets/arrow-down.png" />
                            <img 
                                v-if="this.ageSortOrder === 'asc' && this.darkMode === true" 
                                style="width:15px; margin-left: -5px"
                                src="../assets/arrow-up-dark.png" />
                            <img 
                                v-if="this.ageSortOrder === 'desc' && this.darkMode === true" 
                                style="width:15px; margin-left: -5px" 
                                src="../assets/arrow-down-dark.png" />
                        </button>
                    </td>
                    <td class="column_birthday table_header" :class="{ dark: darkMode }">Birthday</td>
                    <td class="column_relationship table_header" :class="{ dark: darkMode }">Relationship</td>
                    <td class="table_header" :class="{ dark: darkMode }"></td>
                </tr>
            </thead>
            <transition-group name="list" tag="tbody">
                <tr v-for="(member, index) in  members " :key="member.name" class="list-item">
                    <!-- GENDER -->
                    <td>
                        <div v-if="member.gender === 'male'" class="member_gender"
                            style="background-color: var(--blue)">
                        </div>
                        <div v-else class="member_gender" style="background-color: var(--pink)"></div>
                    </td>
                    <!-- PHOTO -->
                    <td>
                        <img style="width:100px" v-if="member.image" :src="member.image">
                        <img style="width:100px" v-else-if="member.gender === 'male'" src="@/assets/avatar_male.png">
                        <img style="width:100px" v-else src="@/assets/avatar_female.png">
                        <img
                            v-if="this.darkMode === false && (editingMember !== member.name || editingField !== 'image')" 
                            :src="hoveredIcon === member.name + '-image' ? 
                            require('@/assets/edit_red.png') : require('@/assets/edit.png')"
                            style="width: 15px; margin-left:5px" 
                            class="edit_member_box" 
                            @click="editMemberPhoto(member)"
                            @mouseenter="hoveredIcon = member.name + '-image'"
                            @mouseleave="hoveredIcon = ''" />
                        <img
                            v-else-if="this.darkMode === true && (editingMember !== member.name || editingField !== 'image')" 
                            :src="hoveredIcon === member.name + '-image' ? 
                            require('@/assets/edit_red.png') : require('@/assets/edit_dark.png')"
                            style="width: 15px; margin-left:5px" 
                            class="edit_member_box" 
                            @click="editMemberPhoto(member)"
                            @mouseenter="hoveredIcon = member.name + '-image'"
                            @mouseleave="hoveredIcon = ''" />
                        <div v-if="editingMember === member.name && editingField === 'image'">
                            <button class="btn_edit" v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')" @click="triggerFileInput(member)">CHANGE</button>
                            <button class="btn_edit" v-else @click="triggerFileInput(member)">UPLOAD</button>
                            <button class="btn_edit" v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')" @click="openCropper(member)">CROP</button>
                            <button class="btn_edit" v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')" @click="deleteMemberImage(member)">DELETE</button>
                            <button class="btn_edit" @click="cancelEdit()">CANCEL</button>
                        </div>
                        <input 
                            type="file"
                            style="display: none;"
                            :ref="el => { if (el) fileInputs[member.name] = el }"
                            @change="updateMemberImage($event, member)" />
                    </td>
                    <td>
                        <span v-if="editingMember !== member.name || editingField !== 'name'">{{ member.name }}</span>
                        <img
                            v-if="!darkMode && (editingMember !== member.name || editingField !== 'name')"
                            :src="hoveredIcon === member.name + '-name' ? require('@/assets/edit_red.png') : require('@/assets/edit.png')"
                            style="width: 15px; margin-left:5px" 
                            class="edit_member_box" 
                            @click="editMemberName(member)"
                            @mouseenter="hoveredIcon = member.name + '-name'"
                            @mouseleave="hoveredIcon = ''" />
                        <img
                            v-else-if="darkMode && (editingMember !== member.name || editingField !== 'name')"
                            :src="hoveredIcon === member.name + '-name' ? require('@/assets/edit_red.png') : require('@/assets/edit_dark.png')"
                            style="width: 15px; margin-left:5px" 
                            class="edit_member_box" 
                            @click="editMemberName(member)"
                            @mouseenter="hoveredIcon = member.name + '-name'"
                            @mouseleave="hoveredIcon = ''" />
                        <div v-if="editingMember === member.name && editingField === 'name'">
                            <input 
                                type="text"
                                v-model="editingName"
                                @keyup.enter="saveMemberName()"
                            />
                            <button class="btn_edit" @click="saveMemberName()">SAVE</button>
                            <button class="btn_edit" @click="cancelEdit()">CANCEL</button>
                        </div>
                    </td>
                    <td>
                        <span v-if="member.age">{{ member.age }} years old</span>
                        <span v-else>??</span>
                    </td>
                    <td>
                        <div v-if="editingMember === member.name && editingField === 'birthday'">
                            <input 
                                type="date"
                                v-model="member.birthday"
                            />
                            <button class="btn_edit" @click="updateMemberBirthday(member)">SAVE</button>
                            <button class="btn_edit" @click="deleteMemberBirthday(member)">DELETE</button>
                            <button class="btn_edit" @click="cancelEdit()">CANCEL</button>
                        </div>
                        <div v-else>
                            {{ formatBirthday(member.birthday) }}
                            <img
                                v-if="!darkMode"
                                :src="hoveredIcon === member.name + '-birthday' ? require('@/assets/edit_red.png') : require('@/assets/edit.png')"
                                style="width: 15px; margin-left:5px"
                                class="edit_member_box"
                                @click="editMemberBirthday(member)"
                                @mouseenter="hoveredIcon = member.name + '-birthday'"
                                @mouseleave="hoveredIcon = ''"
                            />
                            <img
                                v-else
                                :src="hoveredIcon === member.name + '-birthday' ? require('@/assets/edit_red.png') : require('@/assets/edit_dark.png')"
                                style="width: 15px; margin-left:5px"
                                class="edit_member_box"
                                @click="editMemberBirthday(member)"
                                @mouseenter="hoveredIcon = member.name + '-birthday'"
                                @mouseleave="hoveredIcon = ''"
                            />
                        </div>
                    </td>
                    <td>
                        <div style="color: red; font-weight: bold;" class="married-checkbox">
                            <img src="../assets/relationship_married.png" style="width: 15px" v-if="member.married"/>
                            <img src="../assets/relationship_married_none.png" style="width: 15px" v-else/>
                            <input type="checkbox" :checked="!!member.married" @change="unsetMarried(member)" v-if="member.married">
                            {{ member.married }}
                        </div>
                        <div style="color: var(--blue); font-weight: bold" class="siblings_checkbox">
                            <img src="../assets/relationship_siblings.png" style="width: 15px" v-if="member.siblings && member.siblings.length > 0"/>
                            <img src="../assets/relationship_siblings_none.png" style="width: 15px" v-else/>
                            <span v-for="(siblingName, sIndex) in member.siblings" :key="siblingName">
                                <input type="checkbox" :checked="true" @change="unsetSibling(member, siblingName)">
                                {{ siblingName }}<span v-if="member.siblings && sIndex < member.siblings.length - 1">, </span>
                            </span>
                        </div>
                        <div style="color: green; font-weight: bold" class="children-checkbox">
                            <img src="../assets/relationship_children.png" style="width: 15px" v-if="member.children && member.children.length > 0"/>
                            <img src="../assets/relationship_children_none.png" style="width: 15px" v-else/>
                            <span v-for="(childName, cIndex) in member.children" :key="childName">
                                <input type="checkbox" :checked="true" @change="unsetChildren(member, childName)">
                                {{ childName }}<span v-if="member.children && cIndex < member.children.length - 1">, </span>
                            </span>
                        </div>
                        <div style="display: flex; margin: 20px auto 0 auto; justify-content: center; align-items: center;"
                            v-if="!member.toggleRelationship">
                            <div style="margin-right: 10px;" v-if="!member.married">
                                <input type="checkbox" data-relation-type="married" v-model="member.toggleRelationship"
                                    @change="handleCaseMarried(member)">
                                <label for="member.toggleRelationship">Married</label>
                            </div>
                            <div style="margin-right: 10px;">
                                <input type="checkbox" data-relation-type="siblings" v-model="member.toggleRelationship"
                                    @change="handleCaseSiblings(member)">
                                <label for="member.toggleRelationship">Siblings</label>
                            </div>
                            <div style="margin-right: 10px;">
                                <input type="checkbox" data-relation-type="children" v-model="member.toggleRelationship"
                                    @change="handleCaseChildren(member)">
                                <label for="member.toggleRelationship">Children</label>
                            </div>
                        </div>
                        <div style="margin-top: 10px" v-else>
                            <div class="members-relationships" v-for=" m  in  filteredMembersExceptCurrent(index) "
                                :key="m.name" @click="setRelation(member, m, $event)">
                                <input type="checkbox" :id="m.name + '_rel'">
                                <label :for="m.name + '_rel'">{{ m.name }}</label>
                            </div>
                            <button class="btn_edit cancel_relationship"
                                @click="cancelRelationshipChoice(member)">ANNULER</button>
                        </div>
                    </td>
                    <td style="border: solid 2px white">
                        <div class="delete_member"><button
                                style="background-color:transparent; border: none; margin: auto 0"
                                @click="confirmDeleteMember(member)" class="button">
                                <img 
                                    v-if="this.darkMode === false"
                                    src="../assets/bin.png" 
                                    class="shake_bin" />
                                <img 
                                    v-if="this.darkMode === true"
                                    src="../assets/bin_dark.png" 
                                    class="shake_bin" />
                            </button></div>
                    </td>
                </tr>
            </transition-group>
        </table>
        <p v-else style="font-style: italic;">Aucun membre n'est enregistré.</p>
        <div>
    

    <!-- MODAL CROPPER -->
    <div v-if="cropperVisible" class="modal-backdrop">
      <div class="modal">
        <vue-cropper
          ref="cropper"
          :src="currentImage"
          :stencil-props="{ aspectRatio: 1 }"
          class="cropper"
        />
        <div class="modal-actions">
          <button class="btn_edit" @click="applyCrop">Save</button>
          <button class="btn_edit" @click="cancelCrop">Cancel</button>
        </div>
      </div>
    </div>
  </div>
    </div>
    
</template>

<script>
import AddMember from './AddMember.vue';
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
export default {
    state: {
        members: []
    },
    components: {
        AddMember,
        VueCropper: Cropper
    },
    data() {
        return {
            showAddMember: false,
            relationship: '',
            ageSortOrder: 'asc',
            nameSortOrder: 'asc',
            hoveredIcon: '',
            editingMember: '',
            editingField: '',
            originalName: '',
            editingName: '',
            memberAge: null,
            cropperVisible: false,
            currentMember: null,
            currentImage: null,
            fileInputs: {},
        };
    },
    computed: {
        members() {
            return this.$store.state.members;
        },
        darkMode() {
            return this.$store.state.darkMode;
        }
    },
    watch: {
        members: {
            handler(members) {
                (members || []).forEach(member => {
                    member.toggleRelationship = false;
                });
            },
            immediate: true
        }
    },
    methods: {
        formatBirthday(dateString) {
          if (!dateString) return '';
          const date = new Date(dateString);
          const day = date.getDate();
          const year = date.getFullYear();
          const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
            "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
          ];
          const month = monthNames[date.getMonth()];
          return `${day} ${month} ${year}`;
        },
        sortMembersByName() {
            if (this.nameSortOrder === 'asc') {
                this.members.sort((a, b) => a.name.localeCompare(b.name));
                this.nameSortOrder = 'desc';
            } else {
                this.members.sort((a, b) => b.name.localeCompare(a.name));
                this.nameSortOrder = 'asc';
            }
        },
        sortMembersByAge() {
            if (this.ageSortOrder === 'asc') {
                this.members.sort((a, b) => a.age - b.age);
                this.ageSortOrder = 'desc';
            } else {
                this.members.sort((a, b) => b.age - a.age);
                this.ageSortOrder = 'asc';
            }
        },
        confirmDeleteMember(member) {
            this.memberToDelete = member;
            if (confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
                this.deleteMember(this.memberToDelete);
            } else {
                // Si l'utilisateur clique sur "NON", ne faites rien
                // Vous pouvez également ajouter un message ou une action supplémentaire ici si nécessaire
            }
        },

        deleteMember(member) {
            this.$store.dispatch('deleteMember', member.name);
        },
        handleCaseMarried(member) {
            this.relationship = "married";
            member.toggleRelationship = true;
        },
        handleCaseSiblings(member) {
            this.relationship = "siblings";
            member.toggleRelationship = true;
        },
        handleCaseChildren(member) {
            this.relationship = "children";
            member.toggleRelationship = true;
        },
        filteredMembersExceptCurrent(index) {
            const currentMember = this.members[index];
            const marriedMemberName = currentMember.married;

            const childrenNames = new Set(currentMember.children || []);
            const parentNames = new Set();
            this.members.forEach(m => {
                if (m.children && m.children.includes(currentMember.name)) {
                    parentNames.add(m.name);
                }
            });

            switch (this.relationship) {
                case 'married':
                    return this.members.filter(member => {
                        return member.name !== currentMember.name &&
                            member.name !== marriedMemberName &&
                            !(currentMember.siblings || []).includes(member.name) &&
                            !childrenNames.has(member.name) &&
                            !parentNames.has(member.name);
                    });
                case 'siblings':
                    var siblingsMemberNames = currentMember.siblings || [];
                    return this.members.filter(member => {
                        return member.name !== currentMember.name &&
                            member.name !== marriedMemberName &&
                            !childrenNames.has(member.name) &&
                            !parentNames.has(member.name) &&
                            !siblingsMemberNames.includes(member.name);
                    });
                case 'children':
                    var childrenMemberNames = currentMember.children || [];
                    return this.members.filter(member => {
                        return member.name !== currentMember.name &&
                            member.name !== marriedMemberName &&
                            !(currentMember.siblings || []).includes(member.name) &&
                            !parentNames.has(member.name) &&
                            !childrenMemberNames.includes(member.name);
                    });
            }
        },
        setRelation(member, selectedMember, event) {
            console.log("event : " + event)
            const selectedInputId = this.relationship;
            switch (selectedInputId) {
                case 'married':
                    this.$store.dispatch('updateMember', { ...member, married: selectedMember.name });
                    this.$store.dispatch('updateMember', { ...selectedMember, married: member.name });
                    break;
                case 'siblings':
                    this.$store.dispatch('setSiblings', { member: member, selectedMember: selectedMember });
                    break;
                case 'children':
                    this.$store.dispatch('updateMember', { ...member, children: [...member.children, selectedMember.name] });
                    break;
                default:
                    console.error('Type de relation non valide');
                    return;
            }
        },
        
        cancelRelationshipChoice(member) {
            member.toggleRelationship = false;
        },
        unsetMarried(member) {
            const partner = this.members.find(m => m.name === member.married);
            this.$store.dispatch('updateMember', { ...member, married: '' });
            if (partner) {
                this.$store.dispatch('updateMember', { ...partner, married: '' });
            }
        },
        unsetSibling(member, siblingName) {
            this.$store.dispatch('unsetSibling', { member, siblingName });
        },
        unsetChildren(member, childName) {
            this.$store.dispatch('unsetChildren', { member, childName });
        },
        editMemberPhoto(member) {
            this.editingMember = member.name;
            this.editingField = 'image';
            console.log(member)
        },
        editMemberBirthday(member) {
            this.editingMember = member.name;
            this.editingField = 'birthday';
        },
        editMemberName(member) {
            this.originalName = member.name;
            this.editingName = member.name;
            this.editingMember = member.name;
            this.editingField = 'name';
        },
        triggerFileInput(member) {
            this.fileInputs[member.name].click();
        },
        onFileChange(e, member) {
      const file = e.target.files[0]
      if (file) {
        const url = URL.createObjectURL(file)
        member.image = url
      }
    },
    openCropper(member) {
      this.currentMember = member
      this.currentImage = member.image
      this.cropperVisible = true
    },
    applyCrop() {
      if (!this.currentMember) return;

      const result = this.$refs.cropper.getResult();
      const sourceCanvas = result?.canvas || (typeof result.getCanvas === 'function' ? result.getCanvas() : null);

      if (!sourceCanvas) {
        console.error('Aucun canvas trouvé pour le crop');
        return;
      }

      const MAX_WIDTH = 300; // Max width for the final image
      const MAX_HEIGHT = 300; // Max height for the final image

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = MAX_WIDTH;
      canvas.height = MAX_HEIGHT;

      ctx.drawImage(sourceCanvas, 0, 0, MAX_WIDTH, MAX_HEIGHT);

      // Convertir en base64 JPEG with quality 0.7
      const croppedImage = canvas.toDataURL('image/jpeg', 0.7);

      // Mettre à jour l'image du membre dans le store
      this.$store.dispatch('updateMember', {
        name: this.currentMember.name,
        image: croppedImage
      });

      // Réinitialiser
      this.cropperVisible = false;
      this.currentMember = null;
      this.currentImage = null;
      this.cancelEdit();
    },

    cancelCrop() {
      this.cropperVisible = false
      this.currentMember = null
    },
  
        updateMemberImage(event, member) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.currentMember = member;
                this.currentImage = e.target.result;
                this.cropperVisible = true;
            };
            reader.readAsDataURL(file);
        },
        deleteMemberImage(member) {
            this.$store.dispatch('updateMember', { name: member.name, image: null });
            this.editingMember = '';
        },
        deleteMemberBirthday(member) {
            this.$store.dispatch('updateMember', { name: member.name, birthday: '' });
            this.editingMember = '';
        },
        updateMemberBirthday(member) {
            this.$store.dispatch('updateMember', { 
                name: member.name, 
                birthday: member.birthday 
            });
            this.editingMember = '';
            this.editingField = '';
        },
        saveMemberName() {
            if (!this.editingName || this.originalName === this.editingName) {
                this.cancelEdit();
                return;
            }
            this.$store.dispatch('updateMemberName', {
                oldName: this.originalName,
                newName: this.editingName,
            });
            this.cancelEdit();
        },
        cancelEdit() {
            this.editingMember = '';
            this.editingField = '';
            this.originalName = '';
            this.editingName = '';
        },
    }}

</script>

<style>
.btn_edit {
    padding: 2px 10px;
} 

.custom-table {
    border-collapse: collapse;
    width: 100%;
    height: fit-content;
    background-color: var(--lightGrey);
}

.edit_member_box {
    cursor:pointer;
}

.member_gender {
    height: 20px;
    width: 20px;
    margin: auto;
    animation: gender_rotate 1.5s infinite;
}

@keyframes gender_rotate {
    0% {
        transform: scale(1);
    }

    50% {
        transform: rotate(45deg);
    }

    100% {
        transform: rotate(90deg);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1.2);
    }
}

.heart-icon {
    animation: pulse 1.5s infinite;

}

.shake_bin {
    width: 25px;
}

.shake_bin:hover {
    animation: shake_bin 0.5s infinite;
}

@keyframes shake_bin {
    0% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(45deg) scale(1.5);
    }

    50% {
        transform: rotate(0deg) scale(2);
    }

    75% {
        transform: rotate(-45deg) scale(1.5);
    }

    100% {
        transform: rotate(0deg);
    }
}

.custom-table thead tr {
    position: sticky;
    top: 40px;
    z-index: 1;
}

.table_header {
    background-color: var(--lightGrey);
    color: black;
    font-weight: bold;
    text-transform: uppercase;
    box-shadow: inset 0 -1px 0 0 white;
}

.table_header.dark {
    color:white;
}

td {
    border: 2px solid white;
    padding: 8px;
}

td.column_photo {
    width: 10%;
}

td.column_name {
    width: 10%;
}

td.column_age {
    width: 10%;
}

td.column_gender {
    width: 10%;
}

td.column_relationship {
    width: 50%;
}

.children-checkbox {
    text-align:left;
}

.children-checkbox input[type="checkbox"] {
    accent-color: green;
}

.married-checkbox {
    text-align: left;
}

.married-checkbox input[type="checkbox"] {
    accent-color: red;
}

.siblings_checkbox {
    text-align: left;
}

.list-item {
    transition: all 0.5s ease;
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

.list-move {
    transition: transform 0.5s ease;
}

.member-photo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

/* Modal simple */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
.cropper {
  width: 300px;
  height: 300px;
}
.modal-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
