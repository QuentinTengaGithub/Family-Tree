<template>
  <div class="content members-page">
    <AddMember v-if="showAddMember" @member-created="handleMemberCreated" />

    <p class="title" style="text-align:center; padding-top:30px">The members</p>

    <table class="custom-table" v-if="members.length > 0">
      <thead>
        <tr>
          <td class="column_gender table_header" :class="{ dark: darkMode }" style="width:20px"></td>
          <td class="column_photo table_header" :class="{ dark: darkMode }">Photo</td>

          <td class="column_name table_header" :class="{ dark: darkMode }">
            Name
            <button style="background-color: transparent; border:none; cursor: pointer" @click="sortMembersByName">
              <img
                v-if="nameSortOrder === 'asc' && darkMode === false"
                style="width:15px; margin-left: -5px"
                src="@/assets/arrow-up.png"
              />
              <img
                v-if="nameSortOrder === 'desc' && darkMode === false"
                style="width:15px; margin-left: -5px"
                src="@/assets/arrow-down.png"
              />
              <img
                v-if="nameSortOrder === 'asc' && darkMode === true"
                style="width:15px; margin-left: -5px"
                src="@/assets/arrow-up-dark.png"
              />
              <img
                v-if="nameSortOrder === 'desc' && darkMode === true"
                style="width:15px; margin-left: -5px"
                src="@/assets/arrow-down-dark.png"
              />
            </button>
          </td>

          <td class="column_age table_header" :class="{ dark: darkMode }">
            Age
            <button style="background-color: transparent; border:none; cursor: pointer" @click="sortMembersByAge">
              <img
                v-if="ageSortOrder === 'asc' && darkMode === false"
                style="width:15px; margin-left: -5px"
                src="../assets/arrow-up.png"
              />
              <img
                v-if="ageSortOrder === 'desc' && darkMode === false"
                style="width:15px; margin-left: -5px"
                src="../assets/arrow-down.png"
              />
              <img
                v-if="ageSortOrder === 'asc' && darkMode === true"
                style="width:15px; margin-left: -5px"
                src="../assets/arrow-up-dark.png"
              />
              <img
                v-if="ageSortOrder === 'desc' && darkMode === true"
                style="width:15px; margin-left: -5px"
                src="../assets/arrow-down-dark.png"
              />
            </button>
          </td>

          <td class="column_birthday table_header" :class="{ dark: darkMode }">Birth Date</td>
          <td class="column_relationship table_header" :class="{ dark: darkMode }">Relationship</td>
          <td class="table_header" :class="{ dark: darkMode }"></td>
        </tr>
      </thead>

      <transition-group name="row" tag="tbody">
        <tr
          v-for="member in members"
          :key="member.name"
          class="list-item"
          :ref="el => { if (el) rowRefs[member.name] = el }"
        >
          <!-- GENDER -->
          <td>
            <div v-if="member.gender === 'male'" class="member_gender" style="background-color: var(--blue)"></div>
            <div v-else class="member_gender" style="background-color: var(--pink)"></div>
          </td>

          <!-- PHOTO -->
          <td>
            <img style="width:100px" v-if="member.image" :src="member.image" />
            <img style="width:100px" v-else-if="member.gender === 'male'" src="@/assets/avatar_male.png" />
            <img style="width:100px" v-else src="@/assets/avatar_female.png" />

            <img
              v-if="darkMode === false && (editingMember !== member.name || editingField !== 'image')"
              :src="hoveredIcon === member.name + '-image'
                ? require('@/assets/edit_red.png')
                : require('@/assets/edit.png')"
              style="width: 15px; margin-left:5px"
              class="edit_member_box"
              @click="editMemberPhoto(member)"
              @mouseenter="hoveredIcon = member.name + '-image'"
              @mouseleave="hoveredIcon = ''"
            />
            <img
              v-else-if="darkMode === true && (editingMember !== member.name || editingField !== 'image')"
              :src="hoveredIcon === member.name + '-image'
                ? require('@/assets/edit_red.png')
                : require('@/assets/edit_dark.png')"
              style="width: 15px; margin-left:5px"
              class="edit_member_box"
              @click="editMemberPhoto(member)"
              @mouseenter="hoveredIcon = member.name + '-image'"
              @mouseleave="hoveredIcon = ''"
            />

            <div v-if="editingMember === member.name && editingField === 'image'">
              <button
                class="edit_photo_button"
                v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                @click="triggerFileInput(member)"
              >
                CHANGE
              </button>
              <button class="edit_photo_button" v-else @click="triggerFileInput(member)">UPLOAD</button>

              <button
                class="edit_photo_button"
                v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                @click="openCropper(member)"
              >
                CROP
              </button>

              <button
                class="edit_photo_button"
                v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                @click="deleteMemberImage(member)"
              >
                DELETE
              </button>

              <button class="edit_photo_button" @click="cancelEdit()">CANCEL</button>
            </div>

            <input
              type="file"
              style="display: none;"
              :ref="el => { if (el) fileInputs[member.name] = el }"
              @change="updateMemberImage($event, member)"
            />
          </td>

          <!-- NAME -->
          <td>
            <span v-if="editingMember !== member.name || editingField !== 'name'">{{ member.name }}</span>

            <img
              v-if="!darkMode && (editingMember !== member.name || editingField !== 'name')"
              :src="hoveredIcon === member.name + '-name'
                ? require('@/assets/edit_red.png')
                : require('@/assets/edit.png')"
              style="width: 15px; margin-left:5px"
              class="edit_member_box"
              @click="editMemberName(member)"
              @mouseenter="hoveredIcon = member.name + '-name'"
              @mouseleave="hoveredIcon = ''"
            />
            <img
              v-else-if="darkMode && (editingMember !== member.name || editingField !== 'name')"
              :src="hoveredIcon === member.name + '-name'
                ? require('@/assets/edit_red.png')
                : require('@/assets/edit_dark.png')"
              style="width: 15px; margin-left:5px"
              class="edit_member_box"
              @click="editMemberName(member)"
              @mouseenter="hoveredIcon = member.name + '-name'"
              @mouseleave="hoveredIcon = ''"
            />

            <div v-if="editingMember === member.name && editingField === 'name'">
              <input type="text" v-model="editingName" @keyup.enter="saveMemberName()" />
              <button class="btn_edit" @click="saveMemberName()">SAVE</button>
              <button class="btn_edit" @click="cancelEdit()">CANCEL</button>
            </div>
          </td>

          <!-- AGE -->
          <td>
            <span v-if="member.age">{{ member.age }} years old</span>
            <span v-else>??</span>
          </td>

          <!-- BIRTHDAY -->
          <td>
            <div v-if="editingMember === member.name && editingField === 'birthday'">
              <input type="date" v-model="member.birthday" />
              <button class="btn_edit" @click="updateMemberBirthday(member)">SAVE</button>
              <button class="btn_edit" @click="deleteMemberBirthday(member)">DELETE</button>
              <button class="btn_edit" @click="cancelEdit()">CANCEL</button>
            </div>

            <div v-else>
              {{ formatBirthday(member.birthday) }}

              <img
                v-if="!darkMode"
                :src="hoveredIcon === member.name + '-birthday'
                  ? require('@/assets/edit_red.png')
                  : require('@/assets/edit.png')"
                style="width: 15px; margin-left:5px"
                class="edit_member_box"
                @click="editMemberBirthday(member)"
                @mouseenter="hoveredIcon = member.name + '-birthday'"
                @mouseleave="hoveredIcon = ''"
              />
              <img
                v-else
                :src="hoveredIcon === member.name + '-birthday'
                  ? require('@/assets/edit_red.png')
                  : require('@/assets/edit_dark.png')"
                style="width: 15px; margin-left:5px"
                class="edit_member_box"
                @click="editMemberBirthday(member)"
                @mouseenter="hoveredIcon = member.name + '-birthday'"
                @mouseleave="hoveredIcon = ''"
              />
            </div>
          </td>

          <!-- RELATIONSHIPS -->
          <td>
            <div v-if="members.length > 1">
              <div class="married-checkbox">
                <img
                  src="../assets/relationship_married.png"
                  class="rel-icon"
                  :class="getRelIconClass(member.name, 'married', !!member.married)"
                  style="width: 15px"
                />
                <input v-if="member.married" type="checkbox" :checked="true" @change="unsetMarried(member)" />
                <span class="rel-text">{{ member.married }}</span>
              </div>

              <div class="siblings_checkbox">
                <img
                  src="../assets/relationship_siblings.png"
                  class="rel-icon"
                  :class="getRelIconClass(member.name, 'siblings', (member.siblings && member.siblings.length > 0))"
                  style="width: 15px"
                />
                <span v-for="(siblingName, sIndex) in (member.siblings || [])" :key="siblingName" class="rel-item">
                  <input type="checkbox" :checked="true" @change="unsetSibling(member, siblingName)" />
                  {{ siblingName }}<span v-if="member.siblings && sIndex < member.siblings.length - 1">, </span>
                </span>
              </div>

              <div class="children-checkbox">
                <img
                  src="../assets/relationship_children.png"
                  class="rel-icon"
                  :class="getRelIconClass(member.name, 'children', (member.children && member.children.length > 0))"
                  style="width: 15px"
                />
                <span v-for="(childName, cIndex) in (member.children || [])" :key="childName" class="rel-item">
                  <input type="checkbox" :checked="true" @change="unsetChildren(member, childName)" />
                  {{ childName }}<span v-if="member.children && cIndex < member.children.length - 1">, </span>
                </span>
              </div>

              <div v-if="relationshipMessageByName[member.name]" class="relationship-message">
                {{ relationshipMessageByName[member.name] }}
              </div>

              <div v-if="!getRelationshipMode(member.name)" class="relationship-actions">
                <button class="rel-btn rel-btn--married" :class="{ 'rel-btn--disabled': isDisabled(member, 'married') }" @click="startRelationship(member, 'married')">Married</button>
                <button class="rel-btn rel-btn--siblings" :class="{ 'rel-btn--disabled': isDisabled(member, 'siblings') }" @click="startRelationship(member, 'siblings')">Siblings</button>
                <button class="rel-btn rel-btn--children" :class="{ 'rel-btn--disabled': isDisabled(member, 'children') }" @click="startRelationship(member, 'children')">Children</button>
              </div>

              <div v-else style="margin-top: 10px">
                <button
                  v-for="m in candidatesFor(member)"
                  :key="m.name"
                  class="btn_edit link-btn"
                  style="display:block; width: 100%; text-align:left; margin: 6px 0;"
                  @click="setRelation(member, m)"
                >
                  Link to {{ m.name }}
                </button>

                <p v-if="candidatesFor(member).length === 0" style="font-style: italic; margin-top: 10px;">
                  No member for this relationship
                </p>

                <button class="cancel_relationship button" @click="cancelRelationshipChoice(member)">ANNULER</button>
              </div>
            </div>

            <div v-else>
              <p style="font-style: italic;">1 member created. No relationship possible.</p>
              <button @click="goToHome" class="button">Create member</button>
            </div>
          </td>

          <!-- DELETE -->
          <td style="border: solid 2px white">
            <div class="delete_member">
              <button
                style="background-color:transparent; border: none; margin: auto 0"
                @click="openDeleteModal(member)"
                class="button"
              >
                <img v-if="darkMode === false" src="../assets/bin.png" class="shake_bin" />
                <img v-if="darkMode === true" src="../assets/bin_dark.png" class="shake_bin" />
              </button>
            </div>
          </td>
        </tr>
      </transition-group>
    </table>

    <div v-else>
      <p style="font-style: italic;">No member created.</p>
      <div class="empty-state-divider"></div>
      <button @click="goToHome" class="button">Create a member</button>
    </div>

    <!-- ✅ CONFIRM DELETE MODAL -->
    <div v-if="deleteModalVisible" class="confirm-backdrop" @click.self="closeDeleteModal">
      <div class="confirm-card" :class="{ dark: darkMode }">
        <div class="confirm-top">
          <div class="confirm-icon">🗑️</div>
          <div>
            <p class="confirm-title">Delete member</p>
            <p class="confirm-subtitle">
              Are you sure you want to delete <b>{{ memberToDelete?.name }}</b> ?
            </p>
          </div>
        </div>

        <div class="confirm-actions">
          <button class="button confirm-btn ghost" @click="closeDeleteModal">Cancel</button>
          <button class="button confirm-btn danger" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>

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
          <button class="button" @click="applyCrop">Save</button>
          <button class="button" @click="cancelCrop">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AddMember from './AddMember.vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

export default {
  components: { AddMember, VueCropper: Cropper },
  data() {
    return {
      showAddMember: false,

      ageSortOrder: 'asc',
      nameSortOrder: 'asc',

      hoveredIcon: '',
      editingMember: '',
      editingField: '',
      originalName: '',
      editingName: '',

      cropperVisible: false,
      currentMember: null,
      currentImage: null,
      fileInputs: {},

      relationshipModeByName: {},
      relationshipMessageByName: {},
      relationshipMessageTimerByName: {},

      relIconAnimByName: {},
      prevRelStateByName: {},

      // delete modal
      deleteModalVisible: false,
      memberToDelete: null,

      // refs lignes
      rowRefs: {},

      // 🔥 hauteur navbar (adapte si besoin)
      navbarHeight: 60,
    }
  },
  computed: {
    members() { return this.$store.state.members },
    darkMode() { return this.$store.state.darkMode },
  },
  mounted() {
    this.$store.dispatch('fetchMembers')
  },
  beforeDestroy() {
    Object.values(this.relationshipMessageTimerByName).forEach(t => clearTimeout(t))
  },
  watch: {
    members: {
      deep: true,
      immediate: true,
      handler(newMembers) {
        newMembers.forEach(m => {
          const now = this.getRelFlags(m)
          const prev = this.prevRelStateByName[m.name]
          if (!prev) {
            this.$set(this.prevRelStateByName, m.name, now)
            return
          }
          ['married', 'siblings', 'children'].forEach(key => {
            if (prev[key] !== now[key]) {
              this.triggerRelIconAnim(m.name, key, now[key] ? 'in' : 'out')
            }
          })
          this.$set(this.prevRelStateByName, m.name, now)
        })
      },
    },
  },
  methods: {
    /* ------------------ ✅ Ghost placeholder delete ------------------ */
    openDeleteModal(member) {
      this.memberToDelete = member
      this.deleteModalVisible = true
      document.body.classList.add('no-scroll')
    },
    closeDeleteModal() {
      this.deleteModalVisible = false
      this.memberToDelete = null
      document.body.classList.remove('no-scroll')
    },

    spawnDeleteGhost(memberName) {
      const rowEl = this.rowRefs[memberName]
      if (!rowEl) return null

      const rect = rowEl.getBoundingClientRect()

      const ghost = document.createElement('div')
      ghost.className = 'delete-ghost'

      ghost.style.top = rect.top + 'px'
      ghost.style.left = rect.left + 'px'
      ghost.style.width = rect.width + 'px'
      ghost.style.height = rect.height + 'px'

      // clone visuel (simple & efficace)
      const table = document.createElement('table')
      table.style.width = '100%'
      table.style.borderCollapse = 'collapse'
      table.innerHTML = `<tbody>${rowEl.outerHTML}</tbody>`

      // nettoyer le bouton delete pour le ghost (optionnel)
      ghost.appendChild(table)

      document.body.appendChild(ghost)

      // lance animation (dans le prochain frame)
      requestAnimationFrame(() => ghost.classList.add('delete-ghost--anim'))

      // cleanup
      setTimeout(() => {
        if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost)
      }, 650)

      return ghost
    },

    async confirmDelete() {
      if (!this.memberToDelete) return
      const name = this.memberToDelete.name

      // 1) fermer modal
      this.closeDeleteModal()

      // 2) ghost premium
      this.spawnDeleteGhost(name)

      // 3) petite latence pour laisser le ghost "prendre la place" visuellement
      setTimeout(() => {
        this.$store.dispatch('deleteMember', name)
      }, 120)
    },

    /* ------------------ règles relationnelles ------------------ */
    areSiblings(a, b) {
      const aS = a?.siblings || []
      const bS = b?.siblings || []
      return aS.includes(b.name) || bS.includes(a.name)
    },
    isParentOf(parent, child) {
      const pChildren = parent?.children || []
      return pChildren.includes(child.name)
    },
    isParentChild(a, b) {
      return this.isParentOf(a, b) || this.isParentOf(b, a)
    },
    areMarried(a, b) {
      return a?.married === b.name || b?.married === a.name
    },

    showRelationshipMessage(memberName, msg) {
      if (this.relationshipMessageTimerByName[memberName]) clearTimeout(this.relationshipMessageTimerByName[memberName])
      this.$set(this.relationshipMessageByName, memberName, msg)
      this.relationshipMessageTimerByName[memberName] = setTimeout(() => {
        this.$delete(this.relationshipMessageByName, memberName)
        this.$delete(this.relationshipMessageTimerByName, memberName)
      }, 1800)
    },

    getRelationshipMode(memberName) {
      return Object.prototype.hasOwnProperty.call(this.relationshipModeByName, memberName)
        ? this.relationshipModeByName[memberName]
        : null
    },
    setRelationshipMode(memberName, mode) {
      this.$set(this.relationshipModeByName, memberName, mode)
    },
    resetRelationshipMode(memberName) {
      this.$set(this.relationshipModeByName, memberName, null)
    },

    candidatesFor(member) {
      const mode = this.getRelationshipMode(member.name)
      return this.getCandidates(member, mode)
    },

    isDisabled(member, type) {
      if (type === 'married' && member.married) return true
      return this.getCandidates(member, type).length === 0
    },

    startRelationship(member, type) {
      if (this.isDisabled(member, type)) {
        this.showRelationshipMessage(member.name, 'No member for this relationship')
        return
      }
      this.setRelationshipMode(member.name, type)
    },

    cancelRelationshipChoice(member) {
      this.resetRelationshipMode(member.name)
    },

    getCandidates(currentMember, mode) {
      if (!mode) return []

      const currentName = currentMember.name
      const siblings = new Set(currentMember.siblings || [])
      const children = new Set(currentMember.children || [])

      const parents = new Set()
      this.members.forEach(m => {
        if (m.children && m.children.includes(currentName)) parents.add(m.name)
      })

      return this.members.filter(m => {
        if (m.name === currentName) return false
        if (mode === 'married' && currentMember.married) return false
        if (mode === 'siblings' && siblings.has(m.name)) return false
        if (mode === 'children' && children.has(m.name)) return false

        if (mode === 'siblings') {
          if (children.has(m.name)) return false
          if (parents.has(m.name)) return false
        }
        if (mode === 'children') {
          if (siblings.has(m.name)) return false
          if (parents.has(m.name)) return false
        }

        if (mode === 'married') {
          if (this.areSiblings(currentMember, m)) return false
          if (this.isParentChild(currentMember, m)) return false
          if (children.has(m.name)) return false
          if (parents.has(m.name)) return false
        }

        if (mode === 'siblings' || mode === 'children') {
          if (this.areMarried(currentMember, m)) return false
        }

        return true
      })
    },

    async setRelation(member, selectedMember) {
      const type = this.getRelationshipMode(member.name)
      if (!type) return

      if (type === 'married') {
        if (this.areSiblings(member, selectedMember) || this.isParentChild(member, selectedMember)) {
          this.showRelationshipMessage(member.name, 'No member for this relationship')
          this.resetRelationshipMode(member.name)
          return
        }
      }
      if (type === 'siblings' || type === 'children') {
        if (this.areMarried(member, selectedMember)) {
          this.showRelationshipMessage(member.name, 'No member for this relationship')
          this.resetRelationshipMode(member.name)
          return
        }
      }

      if (type === 'married') {
        await this.unlinkMarriedIfAny(member)
        await this.unlinkMarriedIfAny(selectedMember)
        await this.$store.dispatch('updateMember', { ...member, married: selectedMember.name })
        await this.$store.dispatch('updateMember', { ...selectedMember, married: member.name })
      }

      if (type === 'siblings') {
        await this.$store.dispatch('setSiblings', { member, selectedMember })
      }

      if (type === 'children') {
        const nextChildren = [...(member.children || [])]
        if (!nextChildren.includes(selectedMember.name)) nextChildren.push(selectedMember.name)
        await this.$store.dispatch('updateMember', { ...member, children: nextChildren })
      }

      this.resetRelationshipMode(member.name)
    },

    async unlinkMarriedIfAny(member) {
      const partnerName = member.married
      if (!partnerName) return
      const partner = this.members.find(m => m.name === partnerName)
      await this.$store.dispatch('updateMember', { ...member, married: '' })
      if (partner) await this.$store.dispatch('updateMember', { ...partner, married: '' })
    },

    unsetMarried(member) { this.unlinkMarriedIfAny(member) },
    unsetSibling(member, siblingName) { this.$store.dispatch('unsetSibling', { member, siblingName }) },
    unsetChildren(member, childName) { this.$store.dispatch('unsetChildren', { member, childName }) },

    /* ---------- anim icônes relations ---------- */
    getRelFlags(member) {
      return {
        married: !!member.married,
        siblings: (member.siblings || []).length > 0,
        children: (member.children || []).length > 0,
      }
    },
    triggerRelIconAnim(memberName, relKey, direction) {
      if (!this.relIconAnimByName[memberName]) this.$set(this.relIconAnimByName, memberName, {})
      this.$set(this.relIconAnimByName[memberName], relKey, direction)
      setTimeout(() => {
        if (this.relIconAnimByName[memberName]) this.$set(this.relIconAnimByName[memberName], relKey, '')
      }, 450)
    },
    getRelIconClass(memberName, relKey, isActive) {
      const anim = this.relIconAnimByName?.[memberName]?.[relKey] || ''
      return {
        'rel-icon--active': isActive,
        'rel-icon--inactive': !isActive,
        'rel-icon--anim-in': anim === 'in',
        'rel-icon--anim-out': anim === 'out',
      }
    },

    /* ---------- navigation ---------- */
    handleMemberCreated() {
      this.showAddMember = false
      this.$store.dispatch('fetchMembers')
    },
    goToHome() {
      this.$router.push({ path: '/add-member' })
    },

    /* ---------- helpers display ---------- */
    formatBirthday(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const day = date.getDate()
      const year = date.getFullYear()
      const monthNames = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
      const month = monthNames[date.getMonth()]
      return `${day} ${month} ${year}`
    },

    /* ---------- sorting ---------- */
    sortMembersByName() {
      if (this.nameSortOrder === 'asc') {
        this.members.sort((a, b) => a.name.localeCompare(b.name))
        this.nameSortOrder = 'desc'
      } else {
        this.members.sort((a, b) => b.name.localeCompare(a.name))
        this.nameSortOrder = 'asc'
      }
    },
    sortMembersByAge() {
      if (this.ageSortOrder === 'asc') {
        this.members.sort((a, b) => (a.age || 0) - (b.age || 0))
        this.ageSortOrder = 'desc'
      } else {
        this.members.sort((a, b) => (b.age || 0) - (a.age || 0))
        this.ageSortOrder = 'asc'
      }
    },

    /* ---------- photo/cropper ---------- */
    editMemberPhoto(member) { this.editingMember = member.name; this.editingField = 'image' },
    triggerFileInput(member) { const input = this.fileInputs[member.name]; if (input) input.click() },
    openCropper(member) { this.currentMember = member; this.currentImage = member.image; this.cropperVisible = true },
    cancelCrop() { this.cropperVisible = false; this.currentMember = null; this.currentImage = null },
    updateMemberImage(event, member) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        this.currentMember = member
        this.currentImage = e.target.result
        this.cropperVisible = true
      }
      reader.readAsDataURL(file)
    },
    applyCrop() {
      if (!this.currentMember) return
      const result = this.$refs.cropper.getResult()
      const sourceCanvas = result?.canvas || (typeof result.getCanvas === 'function' ? result.getCanvas() : null)
      if (!sourceCanvas) return

      const MAX_WIDTH = 300
      const MAX_HEIGHT = 300

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = MAX_WIDTH
      canvas.height = MAX_HEIGHT
      ctx.drawImage(sourceCanvas, 0, 0, MAX_WIDTH, MAX_HEIGHT)

      const croppedImage = canvas.toDataURL('image/jpeg', 0.7)
      this.$store.dispatch('updateMember', { name: this.currentMember.name, image: croppedImage })

      this.cropperVisible = false
      this.currentMember = null
      this.currentImage = null
      this.cancelEdit()
    },
    deleteMemberImage(member) {
      this.$store.dispatch('updateMember', { name: member.name, image: null })
      this.editingMember = ''
      this.editingField = ''
    },

    /* ---------- birthday ---------- */
    editMemberBirthday(member) { this.editingMember = member.name; this.editingField = 'birthday' },
    deleteMemberBirthday(member) { this.$store.dispatch('updateMember', { name: member.name, birthday: '' }); this.editingMember=''; this.editingField='' },
    updateMemberBirthday(member) { this.$store.dispatch('updateMember', { name: member.name, birthday: member.birthday }); this.editingMember=''; this.editingField='' },

    /* ---------- name ---------- */
    editMemberName(member) { this.originalName = member.name; this.editingName = member.name; this.editingMember = member.name; this.editingField = 'name' },
    saveMemberName() {
      if (!this.editingName || this.originalName === this.editingName) { this.cancelEdit(); return }
      this.$store.dispatch('updateMemberName', { oldName: this.originalName, newName: this.editingName })
      this.cancelEdit()
    },
    cancelEdit() { this.editingMember = ''; this.editingField = ''; this.originalName = ''; this.editingName = '' },
  },
}
</script>

<style>
/* ✅ 1) FULL WIDTH LEFT (on neutralise l’align center de .content ici) */
.members-page.content {
  width: 100vw;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;

  /* override du layout global */
  display: block !important;
  align-items: unset !important;
}

/* tableau full width */
.custom-table {
  border-collapse: collapse;
  width: 100vw;           /* prend toute la fenêtre */
  table-layout: auto;
  background-color: var(--lightGrey);
}

/* ✅ 2) header normal sous "The members" au chargement,
   puis sticky sous navbar quand on scroll la page */
.custom-table thead td {
  position: sticky;
  top: 60px;              /* hauteur navbar (ajuste si besoin) */
  z-index: 50;
  background-color: var(--lightGrey);
  box-shadow: 0 2px 0 rgba(0,0,0,0.06);
}

.custom-table thead td { top: 60px; }


/* header style */
.table_header {
  color: black;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: inset 0 -1px 0 0 white;
}
.table_header.dark { color: white; }

td {
  border: 2px solid white;
  padding: 8px;
  vertical-align: top;
}

td.column_photo { width: 10%; }
td.column_name { width: 10%; }
td.column_age { width: 10%; }
td.column_gender { width: 10%; }
td.column_relationship { width: 50%; }

.edit_member_box { cursor: pointer; }

.member_gender {
  height: 20px;
  width: 20px;
  margin: auto;
  animation: gender_rotate 1.5s infinite;
}
@keyframes gender_rotate {
  0% { transform: scale(1); }
  50% { transform: rotate(45deg); }
  100% { transform: rotate(90deg); }
}

.shake_bin { width: 25px; }
.shake_bin:hover { animation: shake_bin 0.5s infinite; }
@keyframes shake_bin {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(45deg) scale(1.5); }
  50% { transform: rotate(0deg) scale(2); }
  75% { transform: rotate(-45deg) scale(1.5); }
  100% { transform: rotate(0deg); }
}

/* Transition normale sur la vraie ligne (discrète) */
.row-leave-active {
  transition: opacity 220ms ease, transform 220ms ease, filter 220ms ease;
}
.row-leave-to {
  opacity: 0;
  transform: translateY(6px);
  filter: blur(2px);
}
.row-move {
  transition: transform 320ms cubic-bezier(.2,.9,.2,1);
}

/* Relationship styles */
.children-checkbox { text-align: left; color: green; font-weight: bold; }
.children-checkbox input[type="checkbox"] { accent-color: green; }

.married-checkbox { text-align: left; color: red; font-weight: bold; }
.married-checkbox input[type="checkbox"] { accent-color: red; }

.siblings_checkbox { text-align: left; color: var(--orange); font-weight: bold; }
.siblings_checkbox input[type="checkbox"] { accent-color: var(--orange); }

.rel-text { margin-left: 8px; }
.rel-item { margin-left: 8px; display: inline-block; }

.relationship-actions {
  display: flex;
  margin: 20px auto 0 auto;
  justify-content: center;
  align-items: center;
}
.rel-btn {
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease;
  margin-right: 6px;
}
.rel-btn:hover { transform: translateY(-1px) scale(1.03); filter: brightness(1.05); }
.rel-btn:active { transform: translateY(0px) scale(0.98); }
.rel-btn--married { background: red; }
.rel-btn--siblings { background: var(--orange); }
.rel-btn--children { background: green; }
.rel-btn--disabled { background: #9e9e9e !important; opacity: 0.75; cursor: not-allowed; }
.rel-btn--disabled:hover { transform: none; filter: none; }

.relationship-message {
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
  color: #555;
}

/* icônes */
.rel-icon {
  display: inline-block;
  transition: filter 280ms ease, transform 280ms ease, opacity 280ms ease;
  transform-origin: center;
}
.rel-icon--inactive { filter: grayscale(1); opacity: 0.45; }
.rel-icon--active { filter: grayscale(0); opacity: 1; }
.rel-icon--anim-in { animation: relIconIn 420ms ease; }
.rel-icon--anim-out { animation: relIconOut 420ms ease; }

@keyframes relIconIn {
  0%   { transform: scale(0.85); filter: grayscale(1); opacity: 0.4; }
  60%  { transform: scale(1.15); filter: grayscale(0); opacity: 1; }
  100% { transform: scale(1.0);  filter: grayscale(0); opacity: 1; }
}
@keyframes relIconOut {
  0%   { transform: scale(1.0);  filter: grayscale(0); opacity: 1; }
  60%  { transform: scale(0.85); filter: grayscale(1); opacity: 0.55; }
  100% { transform: scale(1.0);  filter: grayscale(1); opacity: 0.45; }
}

/* Modal cropper */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal { background: white; padding: 20px; border-radius: 8px; }
.cropper { width: 300px; height: 300px; }
.modal-actions { margin-top: 10px; display: flex; gap: 10px; }

/* Confirm modal */
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 12, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: popFade 180ms ease;
}
@keyframes popFade { from { opacity: 0; } to { opacity: 1; } }

.confirm-card {
  width: min(520px, calc(100vw - 30px));
  background: #fff;
  border-radius: 16px;
  padding: 18px 18px 14px;
  box-shadow: 0 22px 70px rgba(0,0,0,0.22);
  animation: cardIn 220ms cubic-bezier(.2,.9,.2,1);
  border: 1px solid rgba(0,0,0,0.06);
}
.confirm-card.dark {
  background: #0f0f12;
  border: 1px solid rgba(255,255,255,0.08);
  color: white;
}
@keyframes cardIn {
  from { transform: translateY(8px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
.confirm-top { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.confirm-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: grid; place-items: center;
  background: rgba(255, 74, 74, 0.12);
}
.confirm-title { margin: 0; font-weight: 900; font-size: 16px; }
.confirm-subtitle { margin: 3px 0 0; opacity: 0.8; font-size: 13px; }
.confirm-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.confirm-btn { min-width: 110px; }
.confirm-btn.ghost { background: transparent !important; border: 1px solid rgba(0,0,0,0.18) !important; color: inherit; }
.confirm-card.dark .confirm-btn.ghost { border: 1px solid rgba(255,255,255,0.18) !important; }
.confirm-btn.danger { background: #ff3b3b !important; }

.no-scroll { overflow: hidden; }

/* ✅ 3) GHOST PLACEHOLDER premium (carte flottante) */
.delete-ghost {
  position: fixed;
  z-index: 5000;
  border-radius: 16px;
  overflow: hidden;
  pointer-events: none;
  box-shadow: 0 26px 90px rgba(0,0,0,0.22);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  transform-origin: center;
}
.delete-ghost::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 30, 30, 0.28), transparent 55%);
  opacity: 0;
  transition: opacity 120ms ease;
}
.delete-ghost--anim::after {
  opacity: 1;
  animation: redFlash 520ms ease forwards;
}
@keyframes redFlash {
  0% { opacity: 0; }
  18% { opacity: 1; }
  100% { opacity: 0; }
}

.delete-ghost--anim {
  animation: ghostCollapse 620ms cubic-bezier(.2,.9,.2,1) forwards;
}
@keyframes ghostCollapse {
  0%   { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px); }
  35%  { transform: translateY(6px) scale(0.995); opacity: 1; }
  100% { transform: translateY(18px) scale(0.96); opacity: 0; filter: blur(3px); height: 0px; }
}
</style>
