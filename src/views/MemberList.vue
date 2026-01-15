<template>
  <div class="content members-page">
    <AddMember v-if="showAddMember" @member-created="handleMemberCreated" />

    <p class="title" style="text-align:center">
      {{ $t("members.the_members") }}
    </p>

    <!-- Desktop hint -->
    <p class="desktop-edit-hint" v-if="members.length !== 0">
      <svg
        class="hint-icon"
        width="1em"
        height="1em"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        aria-hidden="true"
      >
        <path
          d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
        />
      </svg>
      <span class="hint-text">{{ $t("members.click") }}</span>
    </p>

    <!-- Desktop table -->
    <table class="custom-table desktop-table" v-if="members.length > 0">
      <thead>
        <tr>
          <th class="column_photo table_header hover-to-edit" :class="{ dark: darkMode }">
            Photo
          </th>

          <th class="column_name table_header hover-to-edit" :class="{ dark: darkMode }">
            {{ $t("common.name") }}
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
            {{ $t("members.age") }}
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
            {{ $t("members.birth_date") }}
          </th>

          <th class="column_relationship table_header" :class="{ dark: darkMode }">
            {{ $t("members.relationship") }}
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
                <span>{{ $t("members.change") }}</span>
              </button>

              <button class="edit_photo_button" :class="{ dark: darkMode}" v-else @click="triggerFileInput(member)">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_upload_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_upload.png')" alt="" />
                {{ $t("members.upload") }}
              </button>

              <button
                class="edit_photo_button"
                :class="{ dark: darkMode}"
                v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                @click="openCropper(member)"
              >
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_crop_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_crop.png')" alt="" />
                <span>{{ $t("members.crop") }}</span>
              </button>

              <button
                class="edit_photo_button"
                :class="{ dark: darkMode}"
                v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                @click="deleteMemberImage(member)"
              >
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_delete_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_delete.png')" alt="" />
                <span>{{ $t("members.delete") }}</span>
              </button>

              <button class="edit_photo_button" :class="{ dark: darkMode}" @click="cancelEdit()">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                <span>{{ $t("common.cancel") }}</span>
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
                  {{ $t("common.save") }}
                </button>

                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit()">
                  <img v-if="darkMode" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                  <span>{{ $t("common.cancel") }}</span>
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
            <span v-if="getAge(member) !== null" class="member-age" :class="{ dark: darkMode }">
              {{ getAge(member) }} <span class="age-suffix" :class="{ dark: darkMode }">{{ $t("members.years") }}</span>
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
              <input
                type="date"
                class="member_birthday_input desktop-inline-edit__input"
                :class="{ dark:darkMode }"
                v-model="member.birthday"
              />

              <div class="desktop-inline-edit__actions">
                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="updateMemberBirthday(member)">
                  <img v-if="darkMode" :class="{ dark:darkMode }" :src="require('@/assets/google_icons_save_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_save.png')" alt="" />
                  {{ $t("common.save") }}
                </button>

                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="clearBirthday(member)">
                  <img v-if="darkMode" :class="{ dark:darkMode }" :src="require('@/assets/google_icons_clear_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_clear.png')" alt="" />
                  {{ $t("members.clear") }}
                </button>

                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit()">
                  <img v-if="darkMode" :class="{ dark:darkMode }" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                  <span>{{ $t("common.cancel") }}</span>
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

          <!-- RELATIONSHIPS (DESKTOP) -->
          <td class="column_relationship">
            <div v-if="members.length > 1" class="relationship-cell">
              <!-- TOP: current links -->
              <div class="relationship-top">
                <div class="married-checkbox">
                  <img
                    src="../assets/relationship_married.png"
                    class="rel-icon"
                    :class="getRelIconClass(member.name, 'married', !!member.married)"
                    style="width: 15px"
                  />
                  <span class="rel-item" v-if="member.married">
                    <span v-if="member.gender === 'male'" style="font-weight:1">{{ $t("members.wife") }}</span>
                    <span v-if="member.gender === 'female'" style="font-weight:1">{{ $t("members.husband") }}</span>
                    <input type="checkbox" :checked="true" @change="unsetMarried(member)" />
                    {{ member.married }}
                  </span>
                  <span v-else>
                    <span v-if="member.gender === 'male'" style="color:grey; font-weight:1">{{ $t("members.no_wife") }}</span>
                    <span v-if="member.gender === 'female'" style="color:grey; font-weight:1">{{ $t("members.no_husband") }}</span>
                  </span>
                </div>

                <div class="siblings-checkbox">
                  <img
                    src="../assets/relationship_siblings.png"
                    class="rel-icon"
                    :class="getRelIconClass(member.name, 'siblings', (member.siblings && member.siblings.length > 0))"
                    style="width: 15px"
                  />
                  <span v-if="member.siblings.length > 0" style="font-weight:1">{{ $t("members.siblings") }} : </span>
                  <span v-else style="color:grey; font-weight:1">{{ $t("members.no_sibling") }}</span>
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
                  <span v-if="member.children.length > 0" style="font-weight:1">{{ $t("members.children") }} : </span>
                  <span v-else style="font-weight:1; color:grey">{{ $t("members.no_children") }}</span>
                  <span v-for="(childName, cIndex) in (member.children || [])" :key="childName" class="rel-item">
                    <input type="checkbox" :checked="true" @change="unsetChildren(member, childName)" />
                    {{ childName }}<span v-if="member.children && cIndex < member.children.length - 1">, </span>
                  </span>
                </div>

                <div v-if="relationshipMessageByName[member.name]" class="relationship-message">
                  {{ relationshipMessageByName[member.name] }}
                </div>
              </div>

              <!-- BOTTOM: separated "Select" area -->
              <div class="relationship-bottom">
                <!-- Normal mode -->
                <div v-if="!getRelationshipMode(member.name)" class="relationship-actions-wrap">
                  <div class="relationship-actions-label">{{ $t("members.select") }}:</div>

                  <div class="relationship-actions relationship-actions--compact">
                    <button
                      class="rel-btn rel-btn--married rel-btn--compact"
                      :class="{ 'rel-btn--disabled': isDisabled(member, 'married') }"
                      @click="startRelationship(member, 'married')"
                    >
                      {{ $t("members.married") }}
                    </button>

                    <button
                      class="rel-btn rel-btn--siblings rel-btn--compact"
                      :class="{ 'rel-btn--disabled': isDisabled(member, 'siblings') }"
                      @click="startRelationship(member, 'siblings')"
                    >
                      {{ $t("members.siblings") }}
                    </button>

                    <button
                      class="rel-btn rel-btn--children rel-btn--compact"
                      :class="{ 'rel-btn--disabled': isDisabled(member, 'children') }"
                      @click="startRelationship(member, 'children')"
                    >
                      {{ $t("members.children") }}
                    </button>
                  </div>
                </div>

                <!-- Choice mode -->
                <div v-else class="relationship-picker">
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
                    {{ $t("members.no_member") }}
                  </p>

                  <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelRelationshipChoice(member)">
                    <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                    <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                    <span>{{ $t("common.cancel") }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-else>
              <p style="font-style: italic; color:#6A6A6A; font-size:12px">{{ $t("members.only") }}</p>
              <button @click="goToHome" class="edit_photo_button" :class="{ dark:darkMode }">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_create_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_create.png')" alt="" />
                {{ $t("members.create") }}
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

    <!-- Mobile sort controls -->
    <div class="mobile-sortbar" v-if="members.length > 1">
      <div class="mobile-sortbar__inner" :class="{ dark: darkMode }">
        <span class="mobile-sortbar__label">{{ $t("members.sort") }}</span>
        <select class="mobile-sortbar__select" v-model="mobileSort" @change="applyMobileSort">
          <option value="name_az">{{ $t("common.name") }} (A → Z)</option>
          <option value="name_za">{{ $t("common.name") }} (Z → A)</option>
          <option value="age_young_old">{{ $t("members.age") }} ({{ $t("members.young") }} → {{ $t("members.old") }})</option>
          <option value="age_old_young">{{ $t("members.age") }} ({{ $t("members.old") }} → {{ $t("members.young") }})</option>
        </select>
      </div>
    </div>

    <!-- Mobile table -->
    <table class="custom-table mobile-table" v-if="members.length > 0">
      <thead>
        <tr>
          <th class="who-col table_header" :class="{ dark: darkMode }">{{ $t("members.who") }}</th>
          <th class="rel-col table_header" :class="{ dark: darkMode }">{{ $t("members.relationship") }}</th>
        </tr>
      </thead>

      <transition-group name="row" tag="tbody">
        <tr
          v-for="member in members"
          :key="member.name + '-mobile'"
          class="list-item"
          :class="rowDeleteClass(member)"
        >
          <!-- WHO -->
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
                  <span>{{ $t("members.change") }}</span>
                </button>

                <button class="edit_photo_button" :class="{ dark:darkMode }" v-else @click="triggerFileInput(member)">
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_upload_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_upload.png')" alt="" />
                  {{ $t("members.upload") }}
                </button>

                <button
                  class="edit_photo_button"
                  :class="{ dark:darkMode }"
                  v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                  @click="openCropper(member)"
                >
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_crop_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_crop.png')" alt="" />
                  {{ $t("members.crop") }}
                </button>

                <button
                  class="edit_photo_button"
                  :class="{ dark:darkMode }"
                  v-if="member.image && !member.image.includes('avatar_male') && !member.image.includes('avatar_female')"
                  @click="deleteMemberImage(member)"
                >
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_delete_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_delete.png')" alt="" />
                  {{ $t("members.delete") }}
                </button>

                <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit()">
                  <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                  <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                  {{ $t("common.cancel") }}
                </button>
              </div>

              <div class="who-meta">
                <!-- Name -->
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
                      {{ $t("common.save") }}
                    </button>
                    <button class="edit_photo_button" :class="{dark:darkMode}" @click="cancelEdit()">
                      <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                      <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                      <span>{{ $t("common.cancel") }}</span>
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
                <div class="who-age" v-if="getAge(member) !== null">{{ getAge(member) }} {{ $t("members.years") }}</div>
                <div class="who-age" v-else>??</div>

                <!-- Birthday -->
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
                      {{ $t("common.save") }}
                    </button>
                    <button class="edit_photo_button" :class="{ dark:darkMode }" @click="clearBirthday(member)">
                      <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_clear_dark.png')" alt="" />
                      <img v-else class="btn-icon" :src="require('@/assets/google_icons_clear.png')" alt="" />
                      {{ $t("members.clear") }}
                    </button>
                    <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelEdit()">
                      <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                      <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                      {{ $t("common.cancel") }}
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

          <!-- RELATIONSHIP (MOBILE) -->
          <td class="rel-col">
            <button
              class="row-delete-x row-delete-x--mobile-rel"
              type="button"
              @click.stop="openDeleteModal(member)"
              aria-label="Delete member"
            >
              ×
            </button>

            <div v-if="members.length > 1" class="relationship-cell">
              <!-- TOP: current links -->
              <div class="relationship-top">
                <div class="married-checkbox">
                  <img
                    src="../assets/relationship_married.png"
                    class="rel-icon"
                    :class="getRelIconClass(member.name, 'married', !!member.married)"
                    style="width: 15px"
                  />
                  <span class="rel-item" v-if="member.married">
                    <span v-if="member.gender === 'male'" style="font-weight:1">{{ $t("members.wife") }}</span>
                    <span v-else style="font-weight:1">{{ $t("members.husband") }}</span>
                    <input type="checkbox" :checked="true" @change="unsetMarried(member)" />
                    {{ member.married }}
                  </span>
                  <span v-else style="color:grey">
                    <span v-if="member.gender === 'male'" style="font-weight:1">{{ $t("members.no_wife") }}</span>
                    <span v-else style="font-weight:1">{{ $t("members.no_husband") }}</span>
                  </span>
                </div>

                <div class="siblings-checkbox">
                  <img
                    src="../assets/relationship_siblings.png"
                    class="rel-icon"
                    :class="getRelIconClass(member.name, 'siblings', (member.siblings && member.siblings.length > 0))"
                    style="width: 15px"
                  />
                  <span v-if="member.siblings.length > 0" style="font-weight:1">{{ $t("members.siblings") }} : </span>
                  <span v-else style="color:grey; font-weight:1">{{ $t("members.no_sibling") }}</span>
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
                  <span v-if="member.children.length > 0" style="font-weight:1">{{ $t("members.children") }} : </span>
                  <span v-else style="color:grey; font-weight:1">{{ $t("members.no_children") }}</span>
                  <span v-for="(childName, cIndex) in (member.children || [])" :key="childName" class="rel-item">
                    <input type="checkbox" :checked="true" @change="unsetChildren(member, childName)" />
                    {{ childName }}<span v-if="member.children && cIndex < member.children.length - 1">, </span>
                  </span>
                </div>

                <div v-if="relationshipMessageByName[member.name]" class="relationship-message">
                  {{ relationshipMessageByName[member.name] }}
                </div>
              </div>

              <!-- BOTTOM: separated "Select" area -->
              <div class="relationship-bottom">
                <div v-if="!getRelationshipMode(member.name)" class="relationship-actions-wrap">
                  <div class="relationship-actions-label">{{ $t("members.select") }}:</div>

                  <div class="relationship-actions relationship-actions--compact">
                    <button
                      class="rel-btn rel-btn--married rel-btn--compact"
                      :class="{ 'rel-btn--disabled': isDisabled(member, 'married') }"
                      @click="startRelationship(member, 'married')"
                    >
                      {{ $t("members.married") }}
                    </button>

                    <button
                      class="rel-btn rel-btn--siblings rel-btn--compact"
                      :class="{ 'rel-btn--disabled': isDisabled(member, 'siblings') }"
                      @click="startRelationship(member, 'siblings')"
                    >
                      {{ $t("members.siblings") }}
                    </button>

                    <button
                      class="rel-btn rel-btn--children rel-btn--compact"
                      :class="{ 'rel-btn--disabled': isDisabled(member, 'children') }"
                      @click="startRelationship(member, 'children')"
                    >
                      {{ $t("members.children") }}
                    </button>
                  </div>
                </div>

                <div v-else class="relationship-picker">
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
                    {{ $t("members.no_member") }}
                  </p>

                  <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelRelationshipChoice(member)">
                    <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
                    <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
                    <span>{{ $t("common.cancel") }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-else>
              <p style="font-style: italic; color:#6A6A6A; font-size:12px">{{ $t("members.only") }}</p>
              <button @click="goToHome" class="edit_photo_button" :class="{ dark:darkMode }">
                <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_create_dark.png')" alt="" />
                <img v-else class="btn-icon" :src="require('@/assets/google_icons_create.png')" alt="" />
                {{ $t("members.create") }}
              </button>
            </div>
          </td>
        </tr>
      </transition-group>
    </table>

    <div v-else>
      <p style="font-style: italic;">{{ $t("members.no") }}</p>
      <div class="empty-state-divider"></div>
      <button @click="goToHome" class="button">{{ $t("members.create") }}</button>
    </div>

    <!-- CONFIRM DELETE MODAL -->
    <div v-if="deleteModalVisible" class="confirm-backdrop" @click.self="closeDeleteModal">
      <div class="confirm-card" :class="{ dark: darkMode }">
        <div class="confirm-top">
          <div class="confirm-icon">🗑️</div>
          <div>
            <p class="confirm-title">{{ $t("members.delete_member") }}</p>
            <p class="confirm-subtitle">
              {{ $t("members.are_you_sure") }} <b>{{ memberToDelete?.name }}</b> ?
            </p>
          </div>
        </div>

        <div class="confirm-actions">
          <button class="button confirm-btn ghost" @click="closeDeleteModal">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
            <span>{{ $t("common.cancel") }}</span>
          </button>
          <button class="button confirm-btn danger" @click="confirmDelete">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_delete_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_delete.png')" alt="" />
            <span>{{ $t("members.delete") }}</span>
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
            {{ $t("common.save") }}
          </button>
          <button class="edit_photo_button" :class="{ dark:darkMode }" @click="cancelCrop">
            <img v-if="darkMode" class="btn-icon" :src="require('@/assets/google_icons_cancel_dark.png')" alt="" />
            <img v-else class="btn-icon" :src="require('@/assets/google_icons_cancel.png')" alt="" />
            <span>{{ $t("common.cancel") }}</span>
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
      if (type === 'married') return `${this.$t('members.married_to')} :`
      if (type === 'siblings') return `${this.$t('members.siblings_with')} :`
      if (type === 'children') {
        if (member?.gender === 'male') return `${this.$t('members.father_of')} :`
        if (member?.gender === 'female') return `${this.$t('members.mother_of')} :`
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
      if (this.relationshipMessageTimerByName[memberName]) {
        clearTimeout(this.relationshipMessageTimerByName[memberName])
      }
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
        this.showRelationshipMessage(member.name, this.$t('members.no_member'))
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
          this.showRelationshipMessage(member.name, this.$t('members.no_member'))
          this.resetRelationshipMode(member.name)
          return
        }
      }
      if (type === 'siblings' || type === 'children') {
        if (this.areMarried(member, selectedMember)) {
          this.showRelationshipMessage(member.name, this.$t('members.no_member'))
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
      const d = new Date(dateString)
      if (Number.isNaN(d.getTime())) return ''
      const locale = this.$i18n?.locale || 'en'
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d)
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

    applyMobileSort() {
      const option = this.mobileSort

      if (option === 'name_az') {
        this.members.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
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

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--
      return age
    },

    getAge(member) {
      if (member.birthday) return this.calculateAgeFromBirthday(member.birthday)
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

    /* birthday */
    editMemberBirthday(member) {
      this.birthdayError = ''
      this.originalBirthday = member.birthday || ''
      this.editingMember = member.name
      this.editingField = 'birthday'
    },

    clearBirthday(member) {
      this.birthdayError = ''
      member.birthday = ''
    },

    updateMemberBirthday(member) {
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

    /* name */
    editMemberName(member) {
      this.originalName = member.name
      this.editingName = member.name
      this.editingMember = member.name
      this.editingField = 'name'
    },

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
      return member.gender === 'female' ? 'row-delete-female' : 'row-delete-male'
    },
  },
}
</script>

<style scoped>
/* ====== Layout ====== */
.members-page { padding: 20px; }
.desktop-table { display: table; }
.mobile-table { display: none; }

@media (max-width: 480px){
  .desktop-table{ display: none; }
  .mobile-table{ display: table; }
}

/* ====== Table base ====== */
.custom-table {
  width: 100%;
  table-layout: auto;
  border-collapse: collapse;
  background-color: var(--lightGrey);
}
td { border: 2px solid white; padding: 8px; }
td.column_photo { width: 10%; }
td.column_name { width: 10%; }
td.column_age { width: 10%; }
td.column_relationship { width: 50%; }

/* header */
.table_header{
  color: black;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  background-color: transparent;
  border: solid 2px white;
  padding: 10px 0;
}
.table_header.dark{ color: white; }

/* sticky head */
.custom-table thead th{
  position: sticky;
  top: 60px;
  z-index: 10;
  background-color: var(--lightGrey);
  box-shadow: 0 2px 0 rgba(0,0,0,0.06);
}

/* ====== Hints ====== */
.desktop-edit-hint{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-style: italic;
  margin: 8px 0 12px 0;
  color: #6A6A6A;
  align-self: flex-start;
}
.mobile-edit-hint{ display: none; }
@media (max-width: 480px){
  .mobile-edit-hint{
    display: block;
    font-size: 12px;
    text-align: center;
    margin: 6px 0 10px 0;
    color: #6A6A6A;
  }
}

/* ====== Photos ====== */
.member-photo{
  width: 96px;
  height: 96px;
  object-fit: cover;
  display: block;
  cursor: pointer;
}
@media (max-width: 480px){
  .member-photo{
    width: 52px !important;
    height: 52px !important;
  }
}

/* photo cell border accents */
.photo-cell{ position: relative; display: inline-block; }
.photo-cell::before{
  content:"";
  position:absolute;
  top:0; left:0;
  width:0; height:0;
  border-top: 18px solid transparent;
  border-right: 18px solid transparent;
}
.photo-cell--male img { border: 1px solid var(--blue); border-radius: 6px; box-shadow: 0 0 6px var(--blue); }
.photo-cell--male::before{ border-top: 18px solid var(--blue); }
.photo-cell--female img { border: 1px solid var(--pink); border-radius: 6px; box-shadow: 0 0 6px var(--pink); }
.photo-cell--female::before{ border-top: 18px solid var(--pink); }

/* ====== Inline edit overlay button ====== */
.editable-cell{ position: relative; transition: background-color 140ms ease, box-shadow 140ms ease; }
.editable-cell--hover{
  background: rgba(0, 170, 255, 0.08);
  box-shadow: inset 0 0 0 2px rgba(0, 170, 255, 0.35);
}
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
}
.edit-overlay-btn img{ width: 18px; height: 18px; }
.dark .edit-overlay-btn{
  background: rgba(20,20,24,0.92);
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow: 0 10px 22px rgba(0,0,0,0.55);
}

/* ====== Relationship cell (NEW) ====== */
.relationship-cell{
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* TOP: current relationships */
.relationship-top{
  padding-bottom: 6px;
}

/* BOTTOM: separate area for "Select ..." */
.relationship-bottom{
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0,0,0,0.12);
}
.dark .relationship-bottom{
  border-top: 1px solid rgba(255,255,255,0.14);
}

/* Relationship lines */
.married-checkbox, .siblings-checkbox, .children-checkbox{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  text-align: left;
  font-weight: bold;
}
.married-checkbox{ color: red; }
.siblings-checkbox{ color: var(--orange); }
.children-checkbox{ color: green; }

.married-checkbox input[type="checkbox"]{ accent-color: red; }
.siblings-checkbox input[type="checkbox"]{ accent-color: var(--orange); }
.children-checkbox input[type="checkbox"]{ accent-color: green; }

.rel-item{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

/* Message */
.relationship-message{
  margin-top: 8px;
  text-align: left;
  font-weight: bold;
  color: #555;
}

/* ====== Select row (NEW smaller buttons) ====== */
.relationship-actions-wrap{
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}
.relationship-actions-label{
  font-weight: 800;
  font-size: 12px;
  margin: 0;
  white-space: nowrap;
  opacity: 0.9;
}
.relationship-actions{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

/* Compact buttons */
.rel-btn{
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease;
}
.rel-btn:hover{ transform: translateY(-1px) scale(1.03); filter: brightness(1.05); }
.rel-btn:active{ transform: translateY(0px) scale(0.98); }

.rel-btn--married{ background: red; }
.rel-btn--siblings{ background: var(--orange); }
.rel-btn--children{ background: green; }

.rel-btn--disabled{
  background: #9e9e9e !important;
  opacity: 0.75;
  cursor: not-allowed;
}
.rel-btn--disabled:hover{ transform: none; filter: none; }

.rel-btn--compact{
  padding: 4px 10px;          /* much smaller than before */
  font-size: 11px;
  border-radius: 999px;       /* pill */
  line-height: 1;
  min-height: 26px;
  white-space: nowrap;
}
@media (max-width: 480px){
  .relationship-actions-wrap{ gap: 8px; }
  .relationship-actions{ gap: 6px; }
  .rel-btn--compact{
    padding: 4px 8px;
    font-size: 10.5px;
    min-height: 24px;
  }
}

/* ====== Rel icons ====== */
.rel-icon{
  display: inline-block;
  transition: filter 280ms ease, transform 280ms ease, opacity 280ms ease;
  transform-origin: center;
}
.rel-icon--inactive{ filter: grayscale(1); opacity: 0.45; }
.rel-icon--active{ filter: grayscale(0); opacity: 1; }
.rel-icon--anim-in{ animation: relIconIn 420ms ease; }
.rel-icon--anim-out{ animation: relIconOut 420ms ease; }

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

/* ====== Buttons (shared) ====== */
.edit_photo_button{
  background-color: white;
  color: black;
  cursor: pointer;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}
.edit_photo_button:hover{ background-color: #f2f2f2; }
.dark.edit_photo_button{ background-color: black; color: white; }
.dark.edit_photo_button:hover{ background-color:#3D3D3D; }
.edit_photo_button .btn-icon{
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

/* photo action bar */
.photo-action-bar{
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
@media (max-width: 480px){
  .photo-action-bar{ gap: 4px; }
  .edit_photo_button{ padding: 4px 6px; font-size: 11px; }
  .edit_photo_button .btn-icon{ width: 14px; height: 14px; flex: 0 0 14px; }
}

/* ====== Mobile cells ====== */
.who-col{ width: 30%; }
.rel-col{ width: 70%; }
.who-cell{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.who-meta{
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.who-name{ font-weight: 800; line-height: 1.1; overflow-wrap: anywhere; }
.who-editable{ cursor: pointer; }

.mobile-inline-input{
  width: 100%;
  box-sizing: border-box;
  padding: 5px 10px;
  margin: 2px 0;
  border: none;
}
.dark.mobile-inline-input{ background-color:black; color:white; }

.mobile-inline-actions{
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  justify-content: flex-start;
  margin-top: 4px;
}
.mobile-inline-actions button{
  padding: 4px 6px;
  font-size: 11px;
  border-radius: 10px;
}

/* Birthday / age */
.who-age, .who-bday{ font-size: 12px; line-height: 1.1; }
.birth-short{ display: none; }
@media (max-width: 480px){
  td, th{ padding: 4px 5px; }
}

/* ====== Mobile delete cross ====== */
.row-delete-x{ display: none; }
.row-delete-x--mobile-rel{
  display: inline-flex;
  position: absolute;
  top: 6px;
  right: 6px;
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
  z-index: 10;
}
.custom-table.mobile-table td.rel-col{ position: relative; }

/* ====== Sort toggle (kept) ====== */
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
  transition: background-color 160ms ease, box-shadow 160ms ease, transform 120ms ease;
}
.sort-toggle--light{ background: rgba(0,0,0,0.02); }
.sort-toggle--dark{ background: rgba(255,255,255,0.06); }
.sort-toggle:hover{ transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.18); }
.sort-toggle:active{ transform: translateY(0) scale(0.96); box-shadow: 0 2px 6px rgba(0,0,0,0.25); }

.sort-toggle__icon{ position: relative; width: 14px; height: 14px; }
.sort-toggle__icon::before,
.sort-toggle__icon::after{
  content:"";
  position:absolute;
  left:50%;
  width:0; height:0;
  border-left:5px solid transparent;
  border-right:5px solid transparent;
  transform: translateX(-50%);
  transition: border-color 160ms ease, opacity 160ms ease, transform 160ms ease;
}
.sort-toggle__icon::before{ top:1px; border-bottom-width:6px; border-bottom-style:solid; }
.sort-toggle__icon::after{ bottom:1px; border-top-width:6px; border-top-style:solid; }

.sort-toggle--light .sort-toggle__icon::before,
.sort-toggle--light .sort-toggle__icon::after{ border-bottom-color: rgba(0,0,0,0.35); border-top-color: rgba(0,0,0,0.35); }
.sort-toggle--dark .sort-toggle__icon::before,
.sort-toggle--dark .sort-toggle__icon::after{ border-bottom-color: rgba(255,255,255,0.65); border-top-color: rgba(255,255,255,0.65); }

.sort-toggle--asc .sort-toggle__icon::before{ border-bottom-color: #00aaff; transform: translateX(-50%) translateY(-1px); }
.sort-toggle--asc .sort-toggle__icon::after{ opacity: 0.45; transform: translateX(-50%) translateY(1px); }
.sort-toggle--desc .sort-toggle__icon::after{ border-top-color: #00aaff; transform: translateX(-50%) translateY(1px); }
.sort-toggle--desc .sort-toggle__icon::before{ opacity: 0.45; transform: translateX(-50%) translateY(-1px); }

/* ====== Mobile sort bar ====== */
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
.mobile-sortbar__label{ font-size: 13px; font-weight: 600; white-space: nowrap; }
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
@media (max-width: 480px){
  .mobile-sortbar{ display: flex; justify-content: flex-start; }
  .mobile-sortbar__inner{ width: fit-content; max-width: 92vw; padding: 6px 10px; gap: 8px; }
  .mobile-sortbar__label{ font-size: 12px; }
  .mobile-sortbar__select{ max-width: 190px; padding: 6px 10px; font-size: 12px; }
}

/* ====== Modals (kept simplified) ====== */
.modal-backdrop{
  position: fixed;
  top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.6);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:2000;
}
.modal{ background: white; padding: 20px; border-radius: 8px; }
.dark .modal{ background: black; }
.cropper{ width: 300px; height: 300px; }
.modal-actions{ margin-top: 10px; display:flex; gap:10px; }

.confirm-backdrop{
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 12, 0.55);
  backdrop-filter: blur(8px);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:3000;
}
.confirm-card{
  width: min(520px, calc(100vw - 30px));
  background:#fff;
  border-radius:16px;
  padding:18px 18px 14px;
  box-shadow: 0 22px 70px rgba(0,0,0,0.22);
  border: 1px solid rgba(0,0,0,0.06);
}
.confirm-card.dark{
  background:#0f0f12;
  border: 1px solid rgba(255,255,255,0.08);
  color:white;
}
.confirm-top{ display:flex; gap:12px; align-items:center; margin-bottom:14px; }
.confirm-icon{
  width:42px; height:42px; border-radius:12px;
  display:grid; place-items:center;
  background: rgba(255,74,74,0.12);
}
.confirm-title{ margin:0; font-weight:900; font-size:16px; }
.confirm-subtitle{ margin:3px 0 0; opacity:0.8; font-size:13px; }
.confirm-actions{ display:flex; justify-content:flex-end; gap:10px; margin-top:10px; }

.confirm-btn{ min-width: 110px; }
.confirm-btn.ghost{ background: transparent !important; border: 1px solid rgba(0,0,0,0.18) !important; color: inherit; }
.confirm-card.dark .confirm-btn.ghost{ border: 1px solid rgba(255,255,255,0.18) !important; }
.confirm-btn.danger{ background: #ff3b3b !important; }
.confirm-card:not(.dark) .confirm-btn.danger{ color: #000 !important; }
.confirm-card.dark .confirm-btn.danger{ color: #fff !important; }

.no-scroll{ overflow:hidden; }

/* small helpers */
.birthday-error{ margin-top: 6px; color: #ff4d4f; font-size: 13px; font-weight: 600; }

.rel-choose-title{ font-weight: 900; margin: 6px 0 10px; text-align: left; }
.rel-choose-title--married{ color: red; }
.rel-choose-title--siblings{ color: var(--orange); }
.rel-choose-title--children{ color: green; }

/* row animations */
.row-leave-active{ transition: opacity 220ms ease, transform 220ms ease, filter 220ms ease; }
.row-leave-to{ opacity: 0; transform: translateY(6px); filter: blur(2px); }
.row-move{ transition: transform 320ms cubic-bezier(.2,.9,.2,1); }

/* ====== Mobile typography tightening ====== */
@media (max-width: 480px) {
  /* 1) Nom du membre (WHO) : 1 ligne max */
  .who-name {
    font-size: 13px;          /* réduit */
    line-height: 1.15;
    white-space: nowrap;      /* 1 ligne */
    overflow: hidden;
    text-overflow: ellipsis;  /* ... si trop long */
    max-width: 140px;         /* ajuste si besoin */
    display: block;
  }

  /* Age + date : plus petits que le nom */
  .who-age,
  .who-bday {
    font-size: 11px;
    line-height: 1.1;
  }

  /* 2) Noms des membres dans les relations (en haut) */
  .relationship-top .rel-item {
    font-size: 12px;          /* < who-name (13px) */
    font-weight: 700;
  }

  /* Si tu veux aussi “resserrer” le checkbox + texte */
  .married-checkbox,
  .siblings-checkbox,
  .children-checkbox {
    gap: 4px;
  }

  /* 3) Titre "Choisissez ..." : plus petit que les noms */
  .relationship-actions-label {
    font-size: 10px;          /* < rel-item (12px) */
  }

  /* 4) Boutons Marié/Frères/Enfants : plus petits que les noms */
  .rel-btn--compact {
    font-size: 10px;          /* < who-name (13px) */
    min-height: 22px;
    padding: 3px 7px;
  }

  /* 5) Liste de choix (boutons des candidats) : plus petit que le nom */
  .relationship-picker .link-btn {
    font-size: 12px;          /* < who-name (13px), > choose label (10px) */
    padding: 6px 10px;
    white-space: nowrap;      /* garde le nom sur une ligne */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Titre du mode choix (ex: "Marié(e) avec :") : plus petit que le nom */
  .rel-choose-title {
    font-size: 11px;          /* < link-btn (12px) */
    margin: 6px 0 8px;
  }
}

@media (max-width: 480px){
  .mobile-sortbar{
    display: flex;
    justify-content: flex-start; /* gauche */
    width: 100%;
    margin: 0 0 8px 0;          /* juste au-dessus du tableau */
  }

  .mobile-sortbar__inner{
    margin: 0;                  /* enlève les marges qui “descendent”/centrent visuellement */
    width: auto;
    max-width: 92vw;
    margin-right: auto;         /* colle à gauche */
  }
}

@media (max-width: 480px) {
  /* Garde les noms (rel-item) comme tu as déjà */
  .relationship-top .rel-item {
    font-size: 12px;
    font-weight: 700;
  }

  /* Réduit UNIQUEMENT les libellés et textes "No ..." (pas les rel-item) */
  .relationship-top .married-checkbox > span:not(.rel-item),
  .relationship-top .siblings-checkbox > span:not(.rel-item),
  .relationship-top .children-checkbox > span:not(.rel-item) {
    font-size: 11px;
    font-weight: 600; /* optionnel */
    line-height: 1.1;
  }

  /* Optionnel : message d’info (no_member, etc.) */
  .relationship-message {
    font-size: 11px;
    line-height: 1.15;
  }
}

/* ✅ Rapproche checkbox <-> nom (desktop + mobile) */
.rel-item{
  gap: 5px;            /* avant: 6px */
}

.rel-item input[type="checkbox"]{
  margin: 0;           /* supprime la marge par défaut */
  transform: scale(0.92);  /* optionnel: un poil plus petit */
  transform-origin: center;
}

/* ✅ Resserre aussi le gap global de chaque ligne (Wife/Siblings/Children) */
.married-checkbox,
.siblings-checkbox,
.children-checkbox{
  gap: 3px;            /* avant: 6px (ou 4px en mobile) */
}

</style>
