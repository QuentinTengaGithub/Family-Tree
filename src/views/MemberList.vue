<template>
  <div class="content members-page">
    <AddMember v-if="showAddMember" @member-created="handleMemberCreated" />

    <p class="title" style="text-align:center">
      The members
    </p>
    <!-- Desktop table -->
    <p class="desktop-edit-hint" v-if="members.length !== 0"><svg class="hint-icon" width="1em" height="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true">
  <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
</svg><span class="hint-text">Click on a member's row to edit their information</span></p>
    <table class="custom-table desktop-table" v-if="members.length > 0">
      <thead>
        <tr>
          <th class="column_photo table_header hover-to-edit" :class="{ dark: darkMode }">
            Photo
          </th>

          <th class="column_name table_header hover-to-edit" :class="{ dark: darkMode }">
            Name
            <button
              class="sort-toggle"
              :class="[
                darkMode ? 'sort-toggle--dark' : 'sort-toggle--light',
                nameSortOrder === 'asc' ? 'sort-toggle--asc' : 'sort-toggle--desc'
              ]"
              type="button"
              aria-label="Sort by name"
              @click="sortMembersByName"
              v-if="members.length > 1"
            >
              <span class="sort-toggle__icon"></span>
            </button>
          </th>

          <th class="column_age table_header" :class="{ dark: darkMode }">
            Age
            <button
              class="sort-toggle"
              :class="[
                darkMode ? 'sort-toggle--dark' : 'sort-toggle--light',
                ageSortOrder === 'asc' ? 'sort-toggle--asc' : 'sort-toggle--desc'
              ]"
              type="button"
              aria-label="Sort by age"
              @click="sortMembersByAge"
              v-if="members.length > 1"
            >
              <span class="sort-toggle__icon"></span>
            </button>
          </th>

          <th class="column_birthday table_header hover-to-edit" :class="{ dark: darkMode }">
            Birth Date
          </th>
          <th class="column_relationship table_header" :class="{ dark: darkMode }">
            Relationship
          </th>
          <th class="table_header" :class="{ dark: darkMode }"></th>
        </tr>
      </thead>

      <transition-group name="row" tag="tbody">
        <tr
          v-for="member in members"
          :key="member.name"
          class="list-item"
          :class="rowDeleteClass(member)"
          :ref="el => { if (el) rowRefs[member.name] = el }"
        >

          <!-- PHOTO -->
          <td
            class="column_photo editable-cell"
            :class="[
              { 'editable-cell--hover': hoveredCell === member.name + '-image' },
              member.gender === 'female' ? 'editable-cell--female' : 'editable-cell--male'
            ]"
            @mouseenter="hoveredCell = member.name + '-image'"
            @mouseleave="hoveredCell = ''"
          >
            <div class="photo-cell" :class="member.gender === 'male' ? 'photo-cell--male' : 'photo-cell--female'">
              <img class="member-photo" v-if="member.image" :src="member.image" />
              <img class="member-photo" v-else-if="member.gender === 'male'" src="@/assets/avatar_male.png" @click.stop="editMemberPhoto(member)" />
              <img class="member-photo" v-else src="@/assets/avatar_female.png" />
            </div>

            <!-- Mobile delete (keeps confirmation modal) -->
            <button
              class="row-delete-x"
              type="button"
              @click.stop="openDeleteModal(member)"
              aria-label="Delete member"
            >
              ×
            </button>
            <button
              v-if="hoveredCell === member.name + '-image' && (editingMember !== member.name || editingField !== 'image')"
              class="edit-overlay-btn"
              type="button"
              @click.stop="editMemberPhoto(member)"
              aria-label="Edit photo"
            >
              <img :src="darkMode ? require('@/assets/edit_dark.png') : require('@/assets/edit.png')" />
            </button>

            <div v-if="editingMember === member.name && editingField === 'image'" class="photo-action-bar">
              <button
                class="edit_photo_button"
                :class="{ dark: darkMode}"
                v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                @click="triggerFileInput(member)"
              >
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_change_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_change.png')" alt="" />
                <span>Change</span>
              </button>
              <button class="edit_photo_button" :class="{ dark: darkMode}" v-else @click="triggerFileInput(member)">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_upload_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_upload.png')" alt="" />
                Upload
              </button>

              <button
                class="edit_photo_button"
                :class="{ dark: darkMode}"
                v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                @click="openCropper(member)"
              >
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_crop_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_crop.png')" alt="" />
                <span>Crop</span>
              </button>

              <button
                class="edit_photo_button"
                :class="{ dark: darkMode}"
                v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                @click="deleteMemberImage(member)"
              >
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_delete_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_delete.png')" alt="" />
                <span>Delete</span>
              </button>

              <button class="edit_photo_button" :class="{ dark: darkMode}" @click="cancelEdit()">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                <span>Cancel</span>
              </button>
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
            :class="[
              { 'editable-cell--hover': hoveredCell === member.name + '-name' },
              member.gender === 'female' ? 'editable-cell--female' : 'editable-cell--male'
            ]"
            @mouseenter="hoveredCell = member.name + '-name'"
            @mouseleave="hoveredCell = ''"
          >
            <span v-if="editingMember !== member.name || editingField !== 'name'">{{ member.name }}</span>
            <div v-if="editingMember === member.name && editingField === 'name'" class="desktop-inline-edit">
              <input
                type="text"
                class="member_birthday_input desktop-inline-edit__input"
                :class="{ dark: darkMode }"
                v-model="editingName"
                @keyup.enter="saveMemberName()"
              />

              <div class="desktop-inline-edit__actions">
                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="saveMemberName()">
                  <img v-if="darkMode" :src="require('@/assets/google_icons_save_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_save.png')" alt="" />
                  Save
                </button>

                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit()">
                  <img v-if="darkMode" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                  <span>Cancel</span>
                </button>
              </div>
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
            <span v-if="getAge(member) !== null"  class="member-age" :class="{ dark: darkMode }">
              {{ getAge(member) }} <span class="age-suffix" :class="{ dark: darkMode }">years old</span>
            </span>
            <span v-else>??</span>
          </td>

          <!-- BIRTHDAY -->
          <td
            class="editable-cell"
            :class="[
              { dark:darkMode },
              { 'editable-cell--hover': hoveredCell === member.name + '-birthday' },
              member.gender === 'female' ? 'editable-cell--female' : 'editable-cell--male'
            ]"
            @mouseenter="hoveredCell = member.name + '-birthday'"
            @mouseleave="hoveredCell = ''"
          >
            <div v-if="editingMember === member.name && editingField === 'birthday'">
              <input type="date"
                class="member_birthday_input desktop-inline-edit__input" 
                :class="{ dark:darkMode }" 
                v-model="member.birthday" />
              <div class="desktop-inline-edit__actions">
              <button class="edit_photo_button" :class="{ dark:darkMode }" @click="updateMemberBirthday(member)">
                <img v-if="darkMode" :class="{ dark:darkMode }" :src="require('@/assets/google_icons_save_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_save.png')" alt="" />
                Save
              </button>
              <button class="edit_photo_button" :class="{ dark:darkMode }" @click="clearBirthday(member)">
                <img v-if="darkMode" :class="{ dark:darkMode }" :src="require('@/assets/google_icons_clear_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_clear.png')" alt="" />
                Clear
              </button>
              <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit()">
                <img v-if="darkMode" :class="{ dark:darkMode }" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                <span>Cancel</span>
              </button>
            </div>

              <p v-if="birthdayError" class="birthday-error">
                {{ birthdayError }}
              </p>
            </div>

            <div v-else>
              <span class="birth-long">{{ formatBirthday(member.birthday) }}</span>
              <span class="birth-short">{{ formatBirthdayShort(member.birthday) }}</span>
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
          <td class="column_relationship">
            <div v-if="members.length > 1">
              <div class="married-checkbox">
                <img
                  src="../assets/relationship_married.png"
                  class="rel-icon"
                  :class="getRelIconClass(member.name, 'married', !!member.married)"
                  style="width: 15px"
                />
                <span class="rel-item" v-if="member.married"><input type="checkbox" :checked="true" @change="unsetMarried(member)" />{{ member.married }}</span>
              </div>

              <div class="siblings-checkbox">
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
              <div class="rel-col-inner"></div>

              <!-- Normal mode -->
              <div v-if="!getRelationshipMode(member.name)" class="relationship-actions-wrap">
                <div class="relationship-actions-label">Select:</div>
                <div class="relationship-actions">
                  <button class="rel-btn rel-btn--married"
                    :class="{ 'rel-btn--disabled': isDisabled(member, 'married') }"
                    @click="startRelationship(member, 'married')">Married</button>

                  <button class="rel-btn rel-btn--siblings"
                    :class="{ 'rel-btn--disabled': isDisabled(member, 'siblings') }"
                    @click="startRelationship(member, 'siblings')">Siblings</button>

                  <button class="rel-btn rel-btn--children"
                    :class="{ 'rel-btn--disabled': isDisabled(member, 'children') }"
                    @click="startRelationship(member, 'children')">Children</button>
                </div>
              </div>


              <div v-else style="margin-top: 10px">
                <hr/>
                <p class="rel-choose-title" :class="'rel-choose-title--' + getRelationshipMode(member.name)">
                  {{ relationshipChoiceLabel(getRelationshipMode(member.name), member) }}
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

                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelRelationshipChoice(member)">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                <span>Cancel</span>
              </button>
              </div>
            </div>

            <div v-else>
              <p style="font-style: italic; color:#6A6A6A; font-size:12px">Only 1 member created. No relationship possible.</p>
              <button @click="goToHome" class="edit_photo_button" :class="{ dark:darkMode }">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_create_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_create.png')" alt="" />
                Create member
              </button>
            </div>
          </td>

          <!-- DELETE -->
          <td style="border: solid 2px white; text-align:center">
            <div class="delete_member">
              <button
                style="background-color:transparent; border: none; margin: auto 0"
                @click="openDeleteModal(member)"
                @mouseenter="onDeleteHover(member)"
                @mouseleave="onDeleteHover(null)"
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

    <!-- Mobile sort controls (shown only in responsive view) -->
    <div class="mobile-sortbar" v-if="members.length > 1">
      <div class="mobile-sortbar__inner" :class="{ dark: darkMode }">
        <span class="mobile-sortbar__label">Sort by</span>
        <select class="mobile-sortbar__select" v-model="mobileSort" @change="applyMobileSort">
          <option value="name_az">Name (A → Z)</option>
          <option value="name_za">Name (Z → A)</option>
          <option value="age_young_old">Age (young → old)</option>
          <option value="age_old_young">Age (old → young)</option>
        </select>
      </div>
    </div>

    <!-- Mobile table (2 columns: WHO / RELATIONSHIP) -->
    <p class="mobile-edit-hint"><svg class="hint-icon" width="1em" height="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" aria-hidden="true">
  <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
</svg><span class="hint-text">Tap on the member&#x27;s datas to edit them</span></p>
    <table class="custom-table mobile-table" v-if="members.length > 0">
      <thead>
        <tr>
          <th class="who-col table_header" :class="{ dark: darkMode }">WHO</th>
          <th class="rel-col table_header" :class="{ dark: darkMode }">RELATIONSHIP</th>
        </tr>
      </thead>

      <transition-group name="row" tag="tbody">
        <tr
          v-for="member in members"
          :key="member.name + '-mobile'"
          class="list-item"
          :class="rowDeleteClass(member)"
        >
          <!-- WHO (30%) -->
          <td class="who-col">
            <div class="who-cell">
              <div class="who-photo-wrap" :class="member.gender === 'male' ? 'photo-cell--male' : 'photo-cell--female'">
                <img class="member-photo" v-if="member.image" :src="member.image" @click.stop="editMemberPhoto(member)" />
                <img class="member-photo" v-else-if="member.gender === 'male'" src="@/assets/avatar_male.png" @click.stop="editMemberPhoto(member)" />
                <img class="member-photo" v-else src="@/assets/avatar_female.png" @click.stop="editMemberPhoto(member)" />
              </div>

              <div class="mobile-photo-edit" v-if="editingMember === member.name && editingField === 'image'">
                <button
                  class="edit_photo_button"
                  :class="{ dark: darkMode }"
                  v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                  @click="triggerFileInput(member)"
                >
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_change_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_change.png')" alt="" />
                <span>Change</span>
              </button>
                <button class="edit_photo_button" :class="{ dark:darkMode }" v-else @click="triggerFileInput(member)">
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_upload_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_upload.png')" alt="" />
                  Upload
                </button>
                <button
                  class="edit_photo_button"
                  :class="{ dark:darkMode }"
                  v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                  @click="openCropper(member)"
                >
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_crop_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_crop.png')" alt="" />
                  Crop
              </button>

                <button
                  class="edit_photo_button"
                  :class="{ dark:darkMode }"
                  v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                  @click="deleteMemberImage(member)"
                >
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_delete_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_delete.png')" alt="" />
                  Delete
              </button>

                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit()">
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                  Cancel
              </button>
              </div>

              <div class="who-meta">
                <!-- Name (click to edit in mobile) -->
                <template v-if="editingMember === member.name && editingField === 'name'">
                  <input
                    type="text"
                    class="mobile-inline-input"
                    :class="{dark:darkMode}"
                    v-model="editingName"
                    @keyup.enter="saveMemberName()"
                  />
                  <div class="mobile-inline-actions">
                    <button class="edit_photo_button" :class="{dark:darkMode}" @click="saveMemberName()">
                      <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_save_dark.png')" alt="" />
                      <img v-else class="btn-icon" :src="require('@/assets/google_icons_save.png')" alt="" />
                      Save
                    </button>
                    <button class="edit_photo_button" :class="{dark:darkMode}" @click="cancelEdit()">
                      <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                      <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </template>
                <div
                  v-else
                  class="who-name who-editable"
                  role="button"
                  tabindex="0"
                  @click.stop="editMemberName(member)"
                  @keyup.enter.stop="editMemberName(member)"
                >
                  {{ member.name }}
                </div>

                <!-- Age -->
                <div class="who-age" v-if="getAge(member) !== null">{{ getAge(member) }} years</div>
                <div class="who-age" v-else>??</div>

                <!-- Birthday (click to edit in mobile) -->
                <template v-if="editingMember === member.name && editingField === 'birthday'">
                  <input
                    type="date"
                    class="mobile-inline-input"
                    :class="{ dark:darkMode }"
                    v-model="member.birthday"
                  />
                  <div class="mobile-inline-actions">
                    <button class="edit_photo_button" :class="{ dark:darkMode }" @click="updateMemberBirthday(member)">
                      <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_save_dark.png')" alt="" />
                      <img v-else class="btn-icon" :src="require('@/assets/google_icons_save.png')" alt="" />
                      Save
                    </button>
                    <button class="edit_photo_button" :class="{ dark:darkMode }" @click="clearBirthday(member)">
                      <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_clear_dark.png')" alt="" />
                      <img v-else class="btn-icon" :src="require('@/assets/google_icons_clear.png')" alt="" />
                      Clear
                    </button>
                    <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit()">
                      <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                      <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                      Cancel
                    </button>
                  </div>
                  <p v-if="birthdayError" class="birthday-error">
                    {{ birthdayError }}
                  </p>
                </template>
                <div
                  v-else
                  class="who-bday who-editable"
                  role="button"
                  tabindex="0"
                  @click.stop="editMemberBirthday(member)"
                  @keyup.enter.stop="editMemberBirthday(member)"
                >
                  <span v-if="formatBirthdayShort(member.birthday)">({{ formatBirthdayShort(member.birthday) }})</span>
                  <span v-else>(--/--/----)</span>
                </div>
              </div>
            </div>
          </td>

          <!-- RELATIONSHIP (70%) -->
          <td class="rel-col">
            <button
              class="row-delete-x row-delete-x--mobile-rel"
              type="button"
              @click.stop="openDeleteModal(member)"
              aria-label="Delete member"
            >
              ×
            </button>

            <div v-if="members.length > 1">
              <div class="married-checkbox">
                <img
                  src="../assets/relationship_married.png"
                  class="rel-icon"
                  :class="getRelIconClass(member.name, 'married', !!member.married)"
                  style="width: 15px"
                />
                <span class="rel-item" v-if="member.married"><input type="checkbox" :checked="true" @change="unsetMarried(member)" />{{ member.married }}</span>
              </div>

              <div class="siblings-checkbox">
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
              
              <!-- Responsive mode -->
              <div class="relationship-bottom">
              <div v-if="!getRelationshipMode(member.name)" class="relationship-actions-wrap">
                <div class="relationship-actions-label">Select:</div>
                <button class="rel-btn rel-btn--married" :class="{ 'rel-btn--disabled': isDisabled(member, 'married') }" @click="startRelationship(member, 'married')">Married</button>
                <button class="rel-btn rel-btn--siblings" :class="{ 'rel-btn--disabled': isDisabled(member, 'siblings') }" @click="startRelationship(member, 'siblings')">Siblings</button>
                <button class="rel-btn rel-btn--children" :class="{ 'rel-btn--disabled': isDisabled(member, 'children') }" @click="startRelationship(member, 'children')">Children</button>
              </div>

              <div v-else style="margin-top: 10px">
                <hr/>
                <p class="rel-choose-title" :class="'rel-choose-title--' + getRelationshipMode(member.name)">
                  {{ relationshipChoiceLabel(getRelationshipMode(member.name), member) }}
                </p>

                <button
                  v-for="m in candidatesFor(member)"
                  :key="m.name + '-mobile'"
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

                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelRelationshipChoice(member)">
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                <span>Cancel</span>
              </button>
              </div>
            </div></div>

            <div v-else>
              <p style="font-style: italic; color:#6A6A6A; font-size:12px">Only 1 member created. No relationship possible.</p>
              <button @click="goToHome" class="edit_photo_button" :class="{ dark:darkMode }">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_create_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_create.png')" alt="" />
                Create member
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
          <button class="button confirm-btn ghost" @click="closeDeleteModal">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
            <span>Cancel</span>
          </button>
          <button class="button confirm-btn danger" @click="confirmDelete">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_delete_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_delete.png')" alt="" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL CROPPER -->
    <div v-if="cropperVisible" class="modal-backdrop">
      <div class="modal" :class="{ dark: darkMode }">
        <vue-cropper
          ref="cropper"
          :src="currentImage"
          :stencil-props="{ aspectRatio: 1 }"
          class="cropper"
        />
        <div class="modal-actions">
          <button class="edit_photo_button" :class="{ dark:darkMode }" @click="applyCrop">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_save_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_save.png')" alt="" />
            Save
          </button>
          <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelCrop">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
    <TutorialHints
      pageKey="list"
      :hints="[
        { id: 'add', title: 'Add a member', text: 'Use “Add member” to create a new person.' },
        { id: 'edit', title: 'Edit', text: 'Hover a cell to edit name/photo/birth date.' },
        { id: 'rels', title: 'Relationships', text: 'Use Married / Siblings / Children to link members.' },
      ]"
    />
  </div>
</template>

<script>
import AddMember from './AddMember.vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import TutorialHints from "@/components/TutorialHints.vue"

export default {
  components: { AddMember, VueCropper: Cropper, TutorialHints },
  data() {
    return {
      showAddMember: false,

      // Mobile sort dropdown (responsive view)
      mobileSort: 'name_az',

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
      birthdayError: '',
      originalBirthday: '',
      deleteHoverName: '',
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
    relationshipChoiceLabel(type, member) {
      if (type === 'married') return 'Married to :'
      if (type === 'siblings') return 'Siblings with :'
      if (type === 'children') {
        if (member?.gender === 'male') return 'Father of :'
        if (member?.gender === 'female') return 'Mother of :'
        return 'Parent of :'
      }
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

    formatBirthdayShort(dateString) {
      if (!dateString) return ''
      const d = new Date(dateString)
      if (Number.isNaN(d.getTime())) return ''

      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}.${mm}.${yyyy}`
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

    // Explicit sort for mobile dropdown (does not rely on toggle buttons)
    applyMobileSort() {
      const option = this.mobileSort

      if (option === 'name_az') {
        this.members.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        // keep desktop toggle state coherent: next click would sort Z→A
        this.nameSortOrder = 'desc'
        return
      }

      if (option === 'name_za') {
        this.members.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        this.nameSortOrder = 'asc'
        return
      }

      const ageVal = (m) => {
        const v = this.getAge(m)
        // Put unknown ages at the end
        return typeof v === 'number' ? v : Number.POSITIVE_INFINITY
      }

      if (option === 'age_young_old') {
        this.members.sort((a, b) => ageVal(a) - ageVal(b))
        this.ageSortOrder = 'desc'
        return
      }

      if (option === 'age_old_young') {
        this.members.sort((a, b) => ageVal(b) - ageVal(a))
        this.ageSortOrder = 'asc'
      }
    },
    calculateAgeFromBirthday(birthday) {
    if (!birthday) return null
    const birth = new Date(birthday)
    if (isNaN(birth.getTime())) return null

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    const dayDiff = today.getDate() - birth.getDate()

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--
    }
    return age
  },

  getAge(member) {
    if (member.birthday) {
      return this.calculateAgeFromBirthday(member.birthday)
    }
    // fallback si pas de birthday en base
    return typeof member.age === 'number' ? member.age : null
  },

  sortMembersByAge() {
    const dir = this.ageSortOrder === 'asc' ? 1 : -1

    this.members.sort((a, b) => {
      const ageA = this.getAge(a) ?? 0
      const ageB = this.getAge(b) ?? 0
      return (ageA - ageB) * dir
    })

    this.ageSortOrder = this.ageSortOrder === 'asc' ? 'desc' : 'asc'
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
    editMemberBirthday(member) {
      this.birthdayError = ''
      this.originalBirthday = member.birthday || ''   // on garde la valeur d’origine
      this.editingMember = member.name
      this.editingField = 'birthday'
    },

    // ne touche pas à la base : nettoie juste le champ en cours d’édition
    clearBirthday(member) {
      this.birthdayError = ''
      member.birthday = ''
    },

    updateMemberBirthday(member) {
      // impossible de sauvegarder une date vide
      if (!member.birthday) {
        this.birthdayError = 'Please select a birth date before saving.'
        return
      }

      this.$store.dispatch('updateMember', {
        name: member.name,
        birthday: member.birthday,
      })

      this.birthdayError = ''
      this.editingMember = ''
      this.editingField = ''
    },

    /* ---------- name ---------- */
    editMemberName(member) { this.originalName = member.name; this.editingName = member.name; this.editingMember = member.name; this.editingField = 'name' },
    saveMemberName() {
      if (!this.editingName || this.originalName === this.editingName) { this.cancelEdit(); return }
      this.$store.dispatch('updateMemberName', { oldName: this.originalName, newName: this.editingName })
      this.cancelEdit()
    },
    cancelEdit() {
      if (this.editingField === 'birthday' && this.editingMember) {
        const m = this.members.find(m => m.name === this.editingMember)
        if (m) m.birthday = this.originalBirthday
        this.birthdayError = ''
      }

      this.editingMember = ''
      this.editingField = ''
      this.originalName = ''
      this.editingName = ''
    },
    onDeleteHover(member) {
    this.deleteHoverName = member ? member.name : ''
    },

    rowDeleteClass(member) {
      if (this.deleteHoverName !== member.name) return ''
      return member.gender === 'female'
        ? 'row-delete-female'
        : 'row-delete-male'
    },
  },
}
</script>

<style>

.desktop-edit-hint{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-style: italic;
  text-align: left;
  margin: 8px 0 12px 0;
  color: #6A6A6A;
  padding-left: 0;
  align-self: flex-start;
  white-space: nowrap;
}

.member_birthday_input {
  margin-right:10px !important;
  border:none;
  padding: 8px 8px;
  font-weight:bold;
  margin: auto 0;
}

.dark.member_birthday_input {
  background-color:black;
  color:white;
}

.mobile-edit-hint{ display: none; }

/* Mobile sort bar (responsive only) */
.mobile-sortbar{ display: none; }
.mobile-sortbar__inner{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(0,0,0,0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  margin: 10px 0 8px 0;
}
.mobile-sortbar__inner.dark{
  background: rgba(32,32,32,0.72);
  border: 1px solid rgba(255,255,255,0.12);
}
.mobile-sortbar__label{
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.mobile-sortbar__select{
  width: 100%;
  max-width: 220px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.14);
  background: rgba(255,255,255,0.9);
  font-weight: 600;
}
.mobile-sortbar__inner.dark .mobile-sortbar__select{
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(20,20,20,0.9);
  color: white;
}

.members-page {
  padding: 20px;
}

/* table variants */
.mobile-table{ display: none; }

.who-col{ width: 30%; }
.rel-col{ width: 70%; }

.who-cell{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.who-photo-wrap{
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.who-meta{
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.who-name{
  font-weight: 800;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

/* Make name & birthday tappable in mobile view */
.who-editable{
  cursor: pointer;
}

.who-editable .dark {
  color:white !important;
}
.who-editable:focus{
  outline: 2px solid rgba(0,0,0,0.15);
  outline-offset: 2px;
}

.mobile-inline-input{
  width: 100%;
  box-sizing: border-box;
  padding: 5px 10px;
  margin: 2px 0;
  border:none;
}

.dark.mobile-inline-input {
  background-color:black;
  color:white;
}

.mobile-inline-actions{
  display: flex;
  flex-wrap: nowrap;
  gap: 2px;
  justify-content: flex-start;
  margin-top: 4px;
}

.mobile-inline-actions button{
  flex: 0 1 auto;
  padding: 4px 6px;
  font-size: 11px;
  border-radius: 4px;
  margin: 0;
  min-width: unset;
  white-space: nowrap;
}

.who-age,
.who-bday{
  font-size: 12px;
  line-height: 1.1;
}

.dark .who-age {
  color:white !important;
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

/* ===== SORT TOGGLE (header) ===== */
.sort-toggle{
  position: relative;
  margin-left: 4px;
  padding: 0;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  outline: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    transform 120ms ease;
}

/* light / dark base */
.sort-toggle--light{
  background: rgba(0,0,0,0.02);
}
.sort-toggle--dark{
  background: rgba(255,255,255,0.06);
}

/* hover “bubble” */
.sort-toggle:hover{
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
}

/* petit ripple quand on clique */
.sort-toggle:active{
  transform: translateY(0) scale(0.96);
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

/* icône double flèche */
.sort-toggle__icon{
  position: relative;
  width: 14px;
  height: 14px;
}

.relationship-actions-label{
  font-weight: 800;
  font-size: 12px;
  margin: 0 0 6px 0;
  text-align: left;
  opacity: 0.9;
}

.relationship-actions{
  display: flex;
  align-items: center;
  justify-content: space-between; /* ou center si tu préfères */
  gap: 6px;
  flex-wrap: nowrap;             /* ✅ reste sur 1 ligne */
}

.relationship-actions .rel-btn{
  flex: 1 1 0;                   /* ✅ 3 boutons de même largeur */
  min-width: 0;                  /* ✅ évite overflow */
  padding: 6px 8px;              /* ✅ plus petit */
  font-size: 12px;               /* ✅ plus petit */
  border-radius: 8px;
  margin-right: 0;               /* ✅ tu avais margin-right:6px */
  white-space: nowrap;           /* ✅ pas de retour à la ligne dans le bouton */
}

/* Mobile: encore plus compact si besoin */
@media (max-width: 480px){
  .relationship-actions .rel-btn{
    padding: 6px 6px;
    font-size: 11px;
  }
}

/* flèche haut */
.sort-toggle__icon::before,
.sort-toggle__icon::after{
  content: "";
  position: absolute;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  transform: translateX(-50%);
  transition:
    border-color 160ms ease,
    opacity 160ms ease,
    transform 160ms ease;
}

/* up */
.sort-toggle__icon::before{
  top: 1px;
  border-bottom-width: 6px;
  border-bottom-style: solid;
}

/* down */
.sort-toggle__icon::after{
  bottom: 1px;
  border-top-width: 6px;
  border-top-style: solid;
}

/* couleurs par défaut (neutre) */
.sort-toggle--light .sort-toggle__icon::before,
.sort-toggle--light .sort-toggle__icon::after{
  border-bottom-color: rgba(0,0,0,0.35);
  border-top-color:    rgba(0,0,0,0.35);
}
.sort-toggle--dark .sort-toggle__icon::before,
.sort-toggle--dark .sort-toggle__icon::after{
  border-bottom-color: rgba(255,255,255,0.65);
  border-top-color:    rgba(255,255,255,0.65);
}

/* ===== état ASC : flèche haut bleue, bas atténuée ===== */
.sort-toggle--asc .sort-toggle__icon::before{
  border-bottom-color: #00aaff;          /* flèche active */
  transform: translateX(-50%) translateY(-1px);
}
.sort-toggle--asc .sort-toggle__icon::after{
  opacity: 0.45;
  transform: translateX(-50%) translateY(1px);
}

/* ===== état DESC : flèche bas bleue, haut atténuée ===== */
.sort-toggle--desc .sort-toggle__icon::after{
  border-top-color: #00aaff;
  transform: translateX(-50%) translateY(1px);
}
.sort-toggle--desc .sort-toggle__icon::before{
  opacity: 0.45;
  transform: translateX(-50%) translateY(-1px);
}

/* petit glow aqua quand actif */
.sort-toggle--asc,
.sort-toggle--desc{
  box-shadow: 0 0 0 1px rgba(0,170,255,0.25);
}
.dark .sort-toggle--asc,
.dark .sort-toggle--desc,
.sort-toggle--dark.sort-toggle--asc,
.sort-toggle--dark.sort-toggle--desc{
  box-shadow: 0 0 0 1px rgba(0,170,255,0.5);
}

.custom-table {
  width: 100%;
  table-layout: auto;
  border-collapse: collapse;
  background-color: var(--lightGrey);
}

.custom-table thead th {
  position: sticky;
  top: 60px;
  z-index: 10;
  background-color: var(--lightGrey);
  box-shadow: 0 2px 0 rgba(0,0,0,0.06);
}

.table_header {
  color: black;
  font-weight: bold;
  text-transform: uppercase;
  /*box-shadow: inset 0 -1px 0 0 white;*/
  text-align: center;
  background-color:transparent;
  border:solid 2px white;
  padding: 10px 0;
}
.table_header.dark { color: white; }


.edit_photo_button {
  background-color: white;
  color: black;
  font-size: 15px;
  cursor: pointer;
  border-radius:5px;
}

.edit_photo_button:hover {
  background-color: #f2f2f2;
}

.dark.edit_photo_button {
  background-color:black;
  color:white;
}

.dark.edit_photo_button:hover {
  background-color:#3D3D3D;
}

.birthday-error{
  margin-top: 6px;
  color: #ff4d4f;
  font-size: 13px;
  font-weight: 600;
}

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

td.column_photo {
  text-align:center;
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

.photo-cell--male img {
  border: 1px solid var(--blue);
  border-radius: 6px;
  box-shadow: 0 0 6px var(--blue);
}

.photo-cell--male::before{
  border-top: 18px solid var(--blue);
  border-right: 18px solid transparent;
}

.photo-cell--female img {
  border: 1px solid var(--pink);
  border-radius: 6px;
  box-shadow: 0 0 6px var(--pink);
}

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

.siblings-checkbox { text-align: left; color: var(--orange); font-weight: bold; }
.siblings-checkbox input[type="checkbox"] { accent-color: var(--orange); }

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

.dark .modal { background-color: black }
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

/* Modal actions layout */
.confirm-actions{
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Buttons: icon + text inline, vertically centered */
.confirm-actions .confirm-btn{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;

  min-height: 44px;
  padding: 10px 14px;
  border-radius: 12px;

  line-height: 1;          /* évite le décalage vertical */
  
}

/* Icon sizing + baseline fix */
.confirm-actions .confirm-btn .btn-icon{
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  display: block;
}

/* Text baseline fix */
.confirm-actions .confirm-btn span{
  display: inline-block;
  line-height: 1;
}

/* Ghost button: keep border + transparent bg */
.confirm-actions .confirm-btn.ghost{
  background: transparent !important;
}

/* Danger button: keep your red */
.confirm-actions .confirm-btn.danger{
  background: #ff3b3b !important;
}

/* Optional: consistent focus */
.confirm-actions .confirm-btn:focus-visible{
  outline: 2px solid rgba(0,170,255,0.6);
  outline-offset: 2px;
}


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

.dark .editable-cell {
  color:white;
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

.editable-cell--male.editable-cell--hover{
  background: rgba(0, 170, 255, 0.08);
  box-shadow: inset 0 0 0 2px rgba(0, 170, 255, 0.35);
}
.editable-cell--female.editable-cell--hover{
  background: rgba(255, 105, 180, 0.10); /* rose clair */
  box-shadow: inset 0 0 0 2px rgba(255, 105, 180, 0.45);
}

.dark .editable-cell--male.editable-cell--hover{
  background: rgba(0, 170, 255, 0.14);
  box-shadow: inset 0 0 0 2px rgba(0, 170, 255, 0.55);
  color:white !important;
}

.dark .editable-cell--female.editable-cell--hover{
  background: rgba(255, 105, 180, 0.18);
  box-shadow: inset 0 0 0 2px rgba(255, 105, 180, 0.6);
}

/* Dark mode : un peu plus lumineux */
.table_header.dark ~ tbody .editable-cell--hover,
.dark .editable-cell--hover{
  /*background: rgba(0, 170, 255, 0.12);*/
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

/* ===== ROW DELETE HIGHLIGHT ===== */

/* base commune */
.row-delete-male td,
.row-delete-female td{
  position: relative;
  background-image: linear-gradient(
    to right,
    rgba(0,0,0,0.01),
    rgba(0,0,0,0.01)
  );
  transition: background-color 160ms ease;
}

/* contour + glow bleu */
.row-delete-male td{
  box-shadow:
    inset 0 0 0 2px rgba(0,170,255,0.85),
    0 0 16px rgba(0,170,255,0.45);
  animation: rowPulseMale 0.5s ease-out;
}

/* contour + glow rose */
.row-delete-female td{
  box-shadow:
    inset 0 0 0 2px rgba(255,105,180,0.9),
    0 0 16px rgba(255,105,180,0.55);
  animation: rowPulseFemale 0.5s ease-out;
}

/* petites pulsations “danger” */
@keyframes rowPulseMale{
  0%   { box-shadow: inset 0 0 0 0 rgba(0,170,255,0.0), 0 0 0 rgba(0,170,255,0.0); }
  40%  { box-shadow: inset 0 0 0 3px rgba(0,170,255,0.9), 0 0 20px rgba(0,170,255,0.6); }
  100% { box-shadow: inset 0 0 0 2px rgba(0,170,255,0.85), 0 0 16px rgba(0,170,255,0.45); }
}

@keyframes rowPulseFemale{
  0%   { box-shadow: inset 0 0 0 0 rgba(255,105,180,0.0), 0 0 0 rgba(255,105,180,0.0); }
  40%  { box-shadow: inset 0 0 0 3px rgba(255,105,180,1), 0 0 22px rgba(255,105,180,0.7); }
  100% { box-shadow: inset 0 0 0 2px rgba(255,105,180,0.9), 0 0 16px rgba(255,105,180,0.55); }
}

/* mettre la poubelle encore plus en avant dans cet état */
.row-delete-male .shake_bin,
.row-delete-female .shake_bin{
  animation: shake_bin 0.5s infinite;
}

/* Default (desktop) member photo sizing */
.member-photo{
  width: 96px;
  height: 96px;
  object-fit: cover;
  display: block;
}

/* ===== Mobile responsive adjustments ===== */
.birth-short{ display: none; }

/* hidden on desktop */
.row-delete-x{ display: none; }

@media (max-width: 480px){

  .mobile-sortbar{ display: flex; justify-content: flex-start; }

  .mobile-sortbar__inner{
    width: fit-content;
    max-width: 92vw;
    padding: 6px 10px;
    gap: 8px;
    margin: 10px 0 8px 0;
  }

  .mobile-sortbar__label{
    font-size: 12px;
    white-space: nowrap;
  }

  .mobile-sortbar__select{
    max-width: 190px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .mobile-edit-hint{
    font-size: 12px;
    text-align: center;
    margin: 6px 0 10px 0;
    color: #6A6A6A;
  }

  .relationship-actions{
    flex-direction: row;   /* ✅ reste en ligne */
    align-items: center;
  }
  .relationship-actions .rel-btn{
    width: auto;           /* ✅ laisse flex gérer */
  }

.desktop-edit-hint{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-style: italic;
  text-align: left;
  margin: 8px 0 12px 0;
  color: #6A6A6A;
  padding-left: 0;
  align-self: flex-start;
  white-space: nowrap;
}

  .mobile-edit-hint{
    font-size: 12px;
    text-align: center;
    margin: 6px 0 10px 0;
    color: #6A6A6A;
  }
  /* switch to the 2-column mobile table */
  .desktop-table{ display: none; }
  .mobile-table{ display: table; }

  table{ font-size: 12px; }
  /* tighter spacing between members */
  td, th{ padding: 4px 5px; }

  /* Full-width rows + room for the mobile delete cross */
  tr.list-item{ position: relative; }

  /* Place the delete cross in the WHO cell (not on top of the photo) */
  .who-col{ position: relative; }
  .who-photo-wrap{ position: static; }
  .who-cell{ padding-top: 18px; }

  /* Reduce member photo size */
  .member-photo{
    width: 52px !important;
    height: 52px !important;
  }

  .mobile-table td{ vertical-align: top; }
  .who-cell{ gap: 8px; }

  /* Smaller selected member names + smaller checkboxes */
  .rel-text,
  .rel-item{
    font-size: 11px;
    margin-left: 4px;
  }

  .married-checkbox,
  .siblings_checkbox,
  .children-checkbox{
    font-size: 11px;
  }

  .married-checkbox input[type="checkbox"],
  .siblings-checkbox input[type="checkbox"],
  .children-checkbox input[type="checkbox"]{
    transform: scale(0.85);
    transform-origin: left center;
  }

  /* Remove the last (trash) column on the desktop table (mobile viewport) */
  .desktop-table thead th:last-child,
  .desktop-table tbody td:last-child{
    display: none;
  }

  /* Alternative mobile delete control */
  .row-delete-x{
    display: inline-flex;
    position: absolute;
    top: 6px;
    left: 6px;
    right: auto;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: none;
    background: rgba(0,0,0,0.12);
    font-size: 18px;
    line-height: 1;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
  }

  body.dark .row-delete-x{
    background: rgba(255,255,255,0.18);
    color: white;
  }

  body.dark {
    color:white !important;
  }

  .age-suffix{ display: none; }

  .birth-long{ display: none; }
  .birth-short{ display: inline; }

  .relationship-actions{
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
  }
  .relationship-actions .rel-btn{ width: 100%; }

  .rel-btn{
    padding: 6px 10px;
    font-size: 12px;
  }

  .married-checkbox,
  .siblings_checkbox,
  .children-checkbox{
    display: block;
    margin-bottom: 4px;
  }
}

.custom-table.mobile-table .rel-item{
  display:inline-flex;
  align-items:center;
  gap:4px;
}

.custom-table.mobile-table .rel-item input[type="checkbox"]{
  margin:0 4px 0 0;
}

.custom-table.mobile-table .married-checkbox,
.custom-table.mobile-table .siblings-checkbox,
.custom-table.mobile-table .children-checkbox{
  display:flex;
  align-items:center;
  gap:6px;
}

.custom-table.mobile-table .married-checkbox .rel-icon,
.custom-table.mobile-table .siblings-checkbox .rel-icon,
.custom-table.mobile-table .children-checkbox .rel-icon{
  margin-right:0 !important; /* gap handles spacing */
  flex:0 0 auto;
}

.custom-table.mobile-table .married-checkbox .rel-item:first-of-type,
.custom-table.mobile-table .siblings-checkbox .rel-item:first-of-type,
.custom-table.mobile-table .children-checkbox .rel-item:first-of-type{
  margin-left:0 !important;
}

.custom-table.mobile-table td.rel-col .married-checkbox,
.custom-table.mobile-table td.rel-col .siblings-checkbox,
.custom-table.mobile-table td.rel-col .children-checkbox{
  display:flex !important;
  align-items:center !important;
  flex-wrap:wrap;
  column-gap:4px; /* icon -> first checkbox spacing */
  row-gap:4px;
}

.custom-table.mobile-table td.rel-col .married-checkbox .rel-icon,
.custom-table.mobile-table td.rel-col .siblings-checkbox .rel-icon,
.custom-table.mobile-table td.rel-col .children-checkbox .rel-icon{
  margin-right:0 !important; /* override inline styles */
}

.custom-table.mobile-table td.rel-col .rel-item{
  display:inline-flex !important;
  align-items:center !important;
  gap:4px; /* checkbox -> name spacing */
  margin:0 !important;
}

.custom-table.mobile-table td.rel-col .rel-item input[type="checkbox"]{
  margin:0 !important;
}

/* Mobile: identical spacing for Married / Siblings / Children relationship lines */
.custom-table.mobile-table td.rel-col .married-checkbox,
.custom-table.mobile-table td.rel-col .siblings-checkbox,
.custom-table.mobile-table td.rel-col .children-checkbox{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:6px;           /* icon <-> first item */
}

.custom-table.mobile-table td.rel-col .rel-icon{
  margin:0 !important; /* neutralize any inline margins */
}

.custom-table.mobile-table td.rel-col .rel-item{
  display:inline-flex;
  align-items:center;
  gap:6px;           /* checkbox <-> name */
  margin:0;
  white-space:nowrap;
}

.custom-table.mobile-table td.rel-col .rel-item input[type="checkbox"]{
  margin:0 !important;
}

/* Ensure siblings labels and checkboxes are orange on mobile */
.custom-table.mobile-table td.rel-col .siblings-checkbox,
.custom-table.mobile-table td.rel-col .siblings-checkbox .rel-item{
  color: var(--orange);
  font-weight: bold;
}
.custom-table.mobile-table td.rel-col .siblings-checkbox input[type="checkbox"]{
  accent-color: var(--orange);
}

/* Desktop: normalize spacing for Married / Siblings / Children relationship lines */
.custom-table.desktop-table td .married-checkbox,
.custom-table.desktop-table td .siblings-checkbox,
.custom-table.desktop-table td .children-checkbox{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:6px;            /* icon <-> first item */
}

.custom-table.desktop-table td .married-checkbox .rel-icon,
.custom-table.desktop-table td .siblings-checkbox .rel-icon,
.custom-table.desktop-table td .children-checkbox .rel-icon{
  margin-right:0 !important;
}

.custom-table.desktop-table td .rel-item{
  display:inline-flex;
  align-items:center;
  gap:6px;            /* checkbox <-> name */
  margin-left:0 !important;  /* overrides old rel-item/rel-text margins */
  white-space:nowrap;
}

.custom-table.desktop-table td .rel-item input[type="checkbox"]{
  margin:0 !important;
}


.edit_photo_button{display:inline-block;margin-right:8px;}


@media (max-width: 768px) {
  /* Mobile sort bar: compact, aligned left */
  .mobile-sortbar{ display:flex; justify-content:flex-start; }
  .mobile-sortbar__inner{
    width: fit-content;
    padding: 6px 10px;
    gap: 8px;
    margin: 10px 0 8px 0;
  }
  .mobile-sortbar__label{
    font-size: 12px;
    white-space: nowrap;
  }
  .mobile-sortbar__select{
    max-width: 190px;
    padding: 6px 10px;
    font-size: 12px;
  }

  /* Legacy sort-container (kept for compatibility) */
  .sort-container {
    max-width: 220px;
    margin-left: 0;
    margin-right: auto;
    padding: 6px 8px;
  }

  .sort-container label {
    font-size: 12px;
    white-space: nowrap;
  }

  .sort-container select {
    font-size: 12px;
    padding: 4px 6px;
  }
  
}

@media (max-width: 768px) {
  .mobile-sortbar{
    display: flex;
    justify-content: flex-start;
  }
  .mobile-sortbar__inner{
    width: fit-content;
    padding: 6px 10px;
    gap: 8px;
    margin: 8px 0 8px 0;
  }
  .mobile-sortbar__label{
    font-size: 12px;
    white-space: nowrap;
  }
  .mobile-sortbar__select{
    max-width: 190px;
    padding: 6px 10px;
    font-size: 12px;
  }
}


/* --- Mobile layout overrides (final) --- */
@media (max-width: 768px){
  /* Ensure the sort bar aligns to the left even if the page layout centers items */
  .mobile-sortbar{
    width: 100% !important;
    justify-content: flex-start !important;
    align-self: flex-start !important;
  }
  .mobile-sortbar__inner{
    margin-left: 0 !important;
  }
  /* Bring the hint closer to the sort bar on mobile */
  .desktop-edit-hint{
    margin-bottom: 6px !important;
  }
  .mobile-sortbar__inner{
    margin-top: 6px !important;
  }
}



/* --- Mobile spacing adjustment (final) --- */
@media (max-width: 768px){
  /* Push the hint text closer to the sort bar */
  .desktop-edit-hint{
    margin-bottom: 2px !important;
  }
  .mobile-sortbar{
    margin-top: 4px !important;
  }

  
}



/* Photo edit actions: compact toolbar (mobile-friendly) */
.photo-action-bar{
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.edit_photo_button{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 10px;
  line-height: 1;
  white-space: nowrap;
}

.edit_photo_button .btn-icon{
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

@media (max-width: 768px){
  .photo-action-bar{
    gap: 5px;
  }
  .edit_photo_button{
    padding: 6px 8px;
    font-size: 12px;
  }
}



/* --- Photo action buttons: tighter on responsive --- */
@media (max-width: 768px){
  .photo-action-bar{
    gap: 4px !important;
    margin-top: 4px !important;
  }
  .edit_photo_button{
    padding: 4px 6px !important;
    font-size: 11px !important;
    border-radius: 9px !important;
    min-height: 28px;
  }
  .edit_photo_button .btn-icon{
    width: 14px !important;
    height: 14px !important;
    flex: 0 0 14px !important;
  }
}
@media (max-width: 480px){
  .photo-action-bar{
    gap: 3px !important;
  }
  .edit_photo_button{
    padding: 3px 6px !important;
    font-size: 10px !important;
    border-radius: 8px !important;
    min-height: 26px;
  }
  .edit_photo_button .btn-icon{
    width: 13px !important;
    height: 13px !important;
    flex: 0 0 13px !important;
  }
}

</style>


<style scoped>
.member-actions-delete{
 position:absolute;
 top:8px;
 right:8px;
}

.dark.member-age {
  color:white;
}
.member-photo{cursor:pointer;}
.member-photo-options{
 position:absolute;
 top:0;left:0;right:0;bottom:0;
 background:rgba(0,0,0,0.6);
 display:flex;
 flex-direction:column;
 justify-content:center;
 align-items:center;
}

.row-delete-x--mobile-rel{
  position:absolute;
  top:6px;
  right:6px;
  left:auto !important;
  z-index:10;
}
.custom-table.mobile-table td.rel-col{
  position:relative;
}
.mobile-photo-edit{
  margin-top:8px;
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}
.mobile-photo-edit .edit_photo_button{
  font-size:12px;
  padding:6px 10px;
}


.custom-table.mobile-table .rel-item{
  display:inline-flex;
  align-items:center;
  gap:4px;
}
.custom-table.mobile-table .rel-item input[type="checkbox"]{
  margin:0 4px 0 0;
}


.custom-table.mobile-table .married-checkbox,
.custom-table.mobile-table .siblings-checkbox,
.custom-table.mobile-table .children-checkbox{
  display:flex;
  align-items:center;
  gap:6px;
}

.custom-table.mobile-table .married-checkbox .rel-icon,
.custom-table.mobile-table .siblings-checkbox .rel-icon,
.custom-table.mobile-table .children-checkbox .rel-icon{
  margin-right:0 !important; /* gap handles spacing */
  flex:0 0 auto;
}

.custom-table.mobile-table .married-checkbox .rel-item:first-of-type,
.custom-table.mobile-table .siblings-checkbox .rel-item:first-of-type,
.custom-table.mobile-table .children-checkbox .rel-item:first-of-type{
  margin-left:0 !important;
}



.custom-table.mobile-table td.rel-col .married-checkbox,
.custom-table.mobile-table td.rel-col .siblings-checkbox,
.custom-table.mobile-table td.rel-col .children-checkbox{
  display:flex !important;
  align-items:center !important;
  flex-wrap:wrap;
  column-gap:4px; /* icon -> first checkbox spacing */
  row-gap:4px;
}

.custom-table.mobile-table td.rel-col .married-checkbox .rel-icon,
.custom-table.mobile-table td.rel-col .siblings-checkbox .rel-icon,
.custom-table.mobile-table td.rel-col .children-checkbox .rel-icon{
  margin-right:0 !important; /* override inline styles */
}

.custom-table.mobile-table td.rel-col .rel-item{
  display:inline-flex !important;
  align-items:center !important;
  gap:4px; /* checkbox -> name spacing */
  margin:0 !important;
}

.custom-table.mobile-table td.rel-col .rel-item input[type="checkbox"]{
  margin:0 !important;
}

/* Mobile: identical spacing for Married / Siblings / Children relationship lines */
.custom-table.mobile-table td.rel-col .married-checkbox,
.custom-table.mobile-table td.rel-col .siblings-checkbox,
.custom-table.mobile-table td.rel-col .children-checkbox{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
         /* icon <-> first item */
}

.custom-table.mobile-table td.rel-col .rel-icon{
  margin:0 !important; /* neutralize any inline margins */
}

.custom-table.mobile-table td.rel-col .rel-item{
  display:inline-flex;
  align-items:center;
  gap:6px;           /* checkbox <-> name */
  margin:0;
  white-space:nowrap;
}

.custom-table.mobile-table td.rel-col .rel-item input[type="checkbox"]{
  margin:0 !important;
}


/* Ensure siblings labels and checkboxes are orange on mobile */
.custom-table.mobile-table td.rel-col .siblings-checkbox,
.custom-table.mobile-table td.rel-col .siblings-checkbox .rel-item{
  color: var(--orange);
  font-weight: bold;
}
.custom-table.mobile-table td.rel-col .siblings-checkbox input[type="checkbox"]{
  accent-color: var(--orange);
}


/* Desktop: normalize spacing for Married / Siblings / Children relationship lines */
.custom-table.desktop-table td .married-checkbox,
.custom-table.desktop-table td .siblings-checkbox,
.custom-table.desktop-table td .children-checkbox{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:6px;            /* icon <-> first item */
}

.custom-table.desktop-table td .married-checkbox .rel-icon,
.custom-table.desktop-table td .siblings-checkbox .rel-icon,
.custom-table.desktop-table td .children-checkbox .rel-icon{
  margin-right:0 !important;
}

.custom-table.desktop-table td .rel-item{
  display:inline-flex;
  align-items:center;
  gap:6px;            /* checkbox <-> name */
  margin-left:0 !important;  /* overrides old rel-item/rel-text margins */
  white-space:nowrap;
}

.custom-table.desktop-table td .rel-item input[type="checkbox"]{
  margin:0 !important;
}


.edit_photo_button{display:inline-block;margin-right:8px;}

.hint-icon{
  width: 1em !important;
  height: 1em !important;
  display: inline-block;
  flex: 0 0 auto;
  fill: currentColor !important;
}

.hint-text{
  white-space: nowrap;
  color:#6A6A6A;
  font-style:italic;
}

@media (max-width: 768px) {
  /* Mobile sort bar: compact, aligned left */
  .mobile-sortbar{ display:flex; justify-content:flex-start; }
  .mobile-sortbar__inner{
    width: fit-content;
    padding: 6px 10px;
    gap: 8px;
    margin: 10px 0 8px 0;
  }
  .mobile-sortbar__label{
    font-size: 12px;
    white-space: nowrap;
  }
  .mobile-sortbar__select{
    max-width: 190px;
    padding: 6px 10px;
    font-size: 12px;
  }

  /* Legacy sort-container (kept for compatibility) */
  .sort-container {
    max-width: 220px;
    margin-left: 0;
    margin-right: auto;
    padding: 6px 8px;
  }

  .sort-container label {
    font-size: 12px;
    white-space: nowrap;
  }

  .sort-container select {
    font-size: 12px;
    padding: 4px 6px;
  }
}


/* --- Mobile layout overrides (final) --- */
@media (max-width: 768px){
  /* Ensure the sort bar aligns to the left even if the page layout centers items */
  .mobile-sortbar{
    width: 100% !important;
    justify-content: flex-start !important;
    align-self: flex-start !important;
  }
  .mobile-sortbar__inner{
    margin-left: 0 !important;
  }
  /* Bring the hint closer to the sort bar on mobile */
  .desktop-edit-hint{
    margin-bottom: 6px !important;
  }
  .mobile-sortbar__inner{
    margin-top: 6px !important;
  }
}



/* --- Mobile spacing adjustment (final) --- */
@media (max-width: 768px){
  /* Push the hint text closer to the sort bar */
  .desktop-edit-hint{
    margin-bottom: 2px !important;
  }
  .mobile-sortbar{
    margin-top: 4px !important;
  }
}



/* Photo edit actions: compact toolbar (mobile-friendly) */
.photo-action-bar{
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.edit_photo_button{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 10px;
  line-height: 1;
  white-space: nowrap;
}

.edit_photo_button .btn-icon{
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

@media (max-width: 768px){
  .photo-action-bar{
    gap: 5px;
  }
  .edit_photo_button{
    padding: 6px 8px;
    font-size: 12px;
  }
}



/* --- Photo action buttons: tighter on responsive --- */
@media (max-width: 768px){
  .photo-action-bar{
    gap: 4px !important;
    margin-top: 4px !important;
  }
  .edit_photo_button{
    padding: 4px 6px !important;
    font-size: 11px !important;
    border-radius: 9px !important;
    min-height: 28px;
  }
  .edit_photo_button .btn-icon{
    width: 14px !important;
    height: 14px !important;
    flex: 0 0 14px !important;
  }
}
@media (max-width: 480px){
  .photo-action-bar{
    gap: 3px !important;
  }
  .edit_photo_button{
    padding: 3px 6px !important;
    font-size: 10px !important;
    border-radius: 8px !important;
    min-height: 26px;
  }
  .edit_photo_button .btn-icon{
    width: 13px !important;
    height: 13px !important;
    flex: 0 0 13px !important;
  }
}

.desktop-inline-edit__input{
  display: block;
  box-sizing: border-box;
  margin-right: 0 !important;
}

.desktop-inline-edit__actions{
  display: flex;
  gap: 0px;
  margin-top: 10px;
  flex-wrap: wrap;
  align-items: center;
}

/* Force 3 buttons inline on mobile (override legacy column rule) */
@media (max-width: 480px){
  .custom-table.mobile-table td.rel-col .relationship-actions{
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 6px !important;
    align-items: center !important;
    justify-content: space-between !important;
    margin: 10px 0 0 0 !important; /* évite ton margin auto centré */
  }

  .custom-table.mobile-table td.rel-col .relationship-actions .rel-btn{
    flex: 1 1 0 !important;
    width: auto !important;
    min-width: 0 !important;
    margin-right: 0 !important;
    white-space: nowrap !important;
    padding: 6px 6px !important;
    font-size: 11px !important;
    border-radius: 8px !important;
  }
}

/* ===== Relationship: "Select:" + 3 buttons on the same line (desktop + mobile) ===== */
.relationship-actions-wrap{
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: nowrap !important;
}

/* the label must not take a whole line */
.relationship-actions-label{
  margin: 0 !important;
  white-space: nowrap !important;
  flex: 0 0 auto !important;
}

.relationship-actions-wrap .relationship-actions{
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 6px !important;
  margin: 0 !important;
  flex: 1 1 auto !important;
  flex-wrap: nowrap !important;
}

.relationship-actions-wrap > .rel-btn,
.relationship-actions-wrap .relationship-actions .rel-btn{
  flex: 1 1 0 !important;
  min-width: 0 !important;
  margin-right: 0 !important;
  white-space: nowrap !important;
}

@media (max-width: 480px){
  .relationship-actions-wrap{ gap: 6px !important; }
  .relationship-actions-wrap > .rel-btn,
  .relationship-actions-wrap .relationship-actions .rel-btn{
    padding: 6px 6px !important;
    font-size: 11px !important;
    border-radius: 8px !important;
  }
}

@media (max-width: 768px){
  .custom-table.mobile-table td.rel-col .relationship-bottom{
    margin-top: auto;            /* <- pushes BOTH states to bottom */
  }
}

/* Light mode: texte noir sur le bouton danger */
.confirm-card:not(.dark) .confirm-actions .confirm-btn.danger{
  color: #000 !important;
}

/* Dark mode: texte blanc sur le bouton danger */
.confirm-card.dark .confirm-actions .confirm-btn.danger{
  color: #fff !important;
}


</style>
