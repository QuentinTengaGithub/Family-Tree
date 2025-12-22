<template>
  <div class="content members-page">
    <AddMember v-if="showAddMember" @member-created="handleMemberCreated" />

    <p class="title" style="text-align:center">
  The members
</p>
    <table class="custom-table" v-if="members.length > 0">
      <thead>
        <tr>
          <td class="column_photo table_header hover-to-edit" :class="{ dark: darkMode }">Photo</td>

          <td class="column_name table_header hover-to-edit" :class="{ dark: darkMode }">
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

          <td class="column_birthday table_header hover-to-edit" :class="{ dark: darkMode }">Birth Date</td>
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

          <!-- PHOTO -->
          <td class="column_photo editable-cell"
            :class="{ 'editable-cell--hover': hoveredCell === member.name + '-image' }"
            @mouseenter="hoveredCell = member.name + '-image'"
            @mouseleave="hoveredCell = ''"
          >
            <div class="photo-cell" :class="member.gender === 'male' ? 'photo-cell--male' : 'photo-cell--female'">
              <img style="width:100px" v-if="member.image" :src="member.image" />
              <img style="width:100px" v-else-if="member.gender === 'male'" src="@/assets/avatar_male.png" />
              <img style="width:100px" v-else src="@/assets/avatar_female.png" />
            </div>
            <button
              v-if="hoveredCell === member.name + '-image' && (editingMember !== member.name || editingField !== 'image')"
              class="edit-overlay-btn"
              type="button"
              @click.stop="editMemberPhoto(member)"
              aria-label="Edit photo"
            >
              <img :src="darkMode ? require('@/assets/edit_dark.png') : require('@/assets/edit.png')" />
            </button>


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
          <td
            class="editable-cell"
            :class="{ 'editable-cell--hover': hoveredCell === member.name + '-name' }"
            @mouseenter="hoveredCell = member.name + '-name'"
            @mouseleave="hoveredCell = ''"
          >
            <span v-if="editingMember !== member.name || editingField !== 'name'">{{ member.name }}</span>

            <div v-if="editingMember === member.name && editingField === 'name'">
              <input type="text" v-model="editingName" @keyup.enter="saveMemberName()" />
              <button class="btn_edit" @click="saveMemberName()">Save</button>
              <button class="btn_edit" @click="cancelEdit()">Cancel</button>
            </div>
            <div v-else>
              <button
                v-if="hoveredCell === member.name + '-name' && (editingMember !== member.name || editingField !== 'name')"
                class="edit-overlay-btn"
                type="button"
                @click.stop="editMemberName(member)"
                aria-label="Edit name"
              >
                <img :src="darkMode ? require('@/assets/edit_dark.png') : require('@/assets/edit.png')" />
              </button>
            </div>
          </td>

          <!-- AGE -->
          <td>
            <span v-if="member.age">{{ member.age }} years old</span>
            <span v-else>??</span>
          </td>

          <!-- BIRTHDAY -->
          <td
            class="editable-cell"
            :class="{ 'editable-cell--hover': hoveredCell === member.name + '-birthday' }"
            @mouseenter="hoveredCell = member.name + '-birthday'"
            @mouseleave="hoveredCell = ''"
          >
            <div v-if="editingMember === member.name && editingField === 'birthday'">
              <input type="date" v-model="member.birthday" /><br><br>
              <button class="btn_edit button" @click="updateMemberBirthday(member)">Save</button><br>
              <button class="btn_edit button" @click="deleteMemberBirthday(member)">Delete</button><br>
              <button class="btn_edit button" @click="cancelEdit()">Cancel</button>
            </div>

            <div v-else>
              {{ formatBirthday(member.birthday) }}
            </div>

            <button
              v-if="hoveredCell === member.name + '-birthday' && (editingMember !== member.name || editingField !== 'birthday')"
              class="edit-overlay-btn"
              type="button"
              @click.stop="editMemberBirthday(member)"
              aria-label="Edit birth date"
            >
              <img :src="darkMode ? require('@/assets/edit_dark.png') : require('@/assets/edit.png')" />
            </button>
          </td>

          <!-- RELATIONSHIPS -->
          <td>
            <div v-if="members.length > 1">
              <div class="married-checkbox">
                <img
                  src="../assets/relationship_married.png"
                  class="rel-icon"
                  :class="getRelIconClass(member.name, 'married', !!member.married)"
                  style="width: 15px; margin-right:8px"
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
                <hr/>
                <p class="rel-choose-title" :class="'rel-choose-title--' + getRelationshipMode(member.name)">
                  {{ relationshipChoiceLabel(getRelationshipMode(member.name)) }}
                </p>
                <button
                  v-for="m in candidatesFor(member)"
                  :key="m.name"
                  class="btn_edit link-btn"
                  :class="{ dark: darkMode }"
                  style="display:block; width: 100%; text-align:left; margin: 6px 0;"
                  @click="setRelation(member, m)"
                >
                  {{ m.name }}
                </button>

                <p v-if="candidatesFor(member).length === 0" style="font-style: italic; margin-top: 10px;">
                  No member for this relationship
                </p>

                <button class="cancel_relationship button" @click="cancelRelationshipChoice(member)">Cancel</button>
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

      hoveredCell: '',
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

      deleteModalVisible: false,
      memberToDelete: null,

      rowRefs: {},
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
    relationshipChoiceLabel(type) {
      if (type === 'married') return 'Married to :'
      if (type === 'siblings') return 'Siblings with :'
      if (type === 'children') return 'Children of :'
      return ''
    },
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

      const table = document.createElement('table')
      table.style.width = '100%'
      table.style.borderCollapse = 'collapse'
      table.innerHTML = `<tbody>${rowEl.outerHTML}</tbody>`

      ghost.appendChild(table)

      document.body.appendChild(ghost)
      requestAnimationFrame(() => ghost.classList.add('delete-ghost--anim'))

      setTimeout(() => {
        if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost)
      }, 650)

      return ghost
    },

    async confirmDelete() {
      if (!this.memberToDelete) return
      const name = this.memberToDelete.name

      this.closeDeleteModal()
      this.spawnDeleteGhost(name)

      setTimeout(() => {
        this.$store.dispatch('deleteMember', name)
      }, 120)
    },

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

    handleMemberCreated() {
      this.showAddMember = false
      this.$store.dispatch('fetchMembers')
    },
    goToHome() {
      this.$router.push({ path: '/add-member' })
    },

    formatBirthday(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const day = date.getDate()
      const year = date.getFullYear()
      const monthNames = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
      const month = monthNames[date.getMonth()]
      return `${day} ${month} ${year}`
    },

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
.members-page{
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

.rel-choose-title{
  font-weight: 900;
  margin: 6px 0 10px;
  text-align: left;
}

.rel-choose-title--married{ color: red; }
.rel-choose-title--siblings{ color: var(--orange); }
.rel-choose-title--children{ color: green; }

/* ===== MARRIED ===== */
.rel-choose-title--married + button.link-btn:hover,
.rel-choose-title--married ~ button.link-btn:hover {
  background-color: rgba(255, 0, 0, 0.08);
  border-color: red;
  color: red;
}

/* ===== SIBLINGS ===== */
.rel-choose-title--siblings + button.link-btn:hover,
.rel-choose-title--siblings ~ button.link-btn:hover {
  background-color: rgba(255, 165, 0, 0.12);
  border-color: var(--orange);
  color: var(--orange);
}

/* ===== CHILDREN ===== */
.rel-choose-title--children + button.link-btn:hover,
.rel-choose-title--children ~ button.link-btn:hover {
  background-color: rgba(0, 128, 0, 0.12);
  border-color: green;
  color: green;
}


.custom-table{
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  background-color: var(--lightGrey);
}

.custom-table {
  border-collapse: collapse;
  width: 100vw;
  table-layout: auto;
  background-color: var(--lightGrey);
}

.custom-table thead td {
  position: sticky;
  top: 60px;
  z-index: 50;
  background-color: var(--lightGrey);
  box-shadow: 0 2px 0 rgba(0,0,0,0.06);
}

.custom-table thead td { top: 60px; }

.table_header {
  color: black;
  font-weight: bold;
  text-transform: uppercase;
  box-shadow: inset 0 -1px 0 0 white;
  text-align:center;
}
.table_header.dark { color: white; }

td {
  border: 2px solid white;
  padding: 8px;
}

td.column_photo { width: 10%; }
td.column_name { width: 10%; }
td.column_age { width: 10%; }
td.column_relationship { width: 50%; }

td.column_photo,
td.column_name,
td.column_age {
  vertical-align: middle;
}

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

.photo-cell{
  position: relative;
  display: inline-block;
}

/* Triangle en haut à gauche */
.photo-cell::before{
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-top: 18px solid transparent; /* valeur par défaut écrasée dessous */
  border-right: 18px solid transparent;
}

/* Homme = bleu */
.photo-cell--male::before{
  border-top: 18px solid var(--blue);
  border-right: 18px solid transparent;
}

/* Femme = rose */
.photo-cell--female::before{
  border-top: 18px solid var(--pink);
  border-right: 18px solid transparent;
}


.link-btn {
  background-color: white;
  border:none;
  padding: 5px 10px;
  border-radius:5px;
  cursor:pointer;
  transition: 
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.12s ease,
    box-shadow 0.12s ease;
}

.link-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.6);
  animation: softPulse 0.4s ease;
}

@keyframes softPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.link-btn:hover::before {
  content: "➜ ";
  font-weight: bold;
}

.link-btn.dark {
  background-color: #0f0f12;
  color: white;
  border: 1px solid rgba(255,255,255,0.15);
}

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

.empty-subtitle{
  margin-top: 16px;
  font-style: italic;
}

/* Cellules éditables : base */
.editable-cell{
  position: relative;
  transition: background-color 140ms ease, box-shadow 140ms ease;
}

/* Effet “cliquable” au survol */
.editable-cell--hover{
  background: rgba(0, 170, 255, 0.08);
  box-shadow: inset 0 0 0 2px rgba(0, 170, 255, 0.35);
}

/* Dark mode : un peu plus lumineux */
.table_header.dark ~ tbody .editable-cell--hover,
.dark .editable-cell--hover{
  background: rgba(0, 170, 255, 0.12);
  box-shadow: inset 0 0 0 2px rgba(0, 170, 255, 0.45);
}

/* Bouton overlay (coin haut-droite) */
.edit-overlay-btn{
  position: absolute;
  top: 8px;
  right: 8px;

  width: 34px;
  height: 34px;
  border-radius: 10px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(0,0,0,0.12);
  background: rgba(255,255,255,0.9);
  box-shadow: 0 8px 18px rgba(0,0,0,0.15);

  cursor: pointer;
  padding: 0;

  animation: editPopIn 120ms ease;
}

.edit-overlay-btn img{
  width: 18px; /* ✅ icône plus grande */
  height: 18px;
}

.edit-overlay-btn:hover{
  transform: translateY(-1px) scale(1.03);
}

@keyframes editPopIn{
  from { opacity: 0; transform: translateY(-2px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Dark mode overlay */
.dark .edit-overlay-btn,
.edit-overlay-btn.dark{
  background: rgba(20,20,24,0.92);
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow: 0 10px 22px rgba(0,0,0,0.55);
}


</style>
