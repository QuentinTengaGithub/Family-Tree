<template>
    <div class="content tree-content">
        <p class="title">{{ $t("tree.family_tree") }}</p>
        <div 
            class="tree-wrapper" 
            ref="treeWrapper" 
            v-if="members.length > 0"
            @mousedown="startPan"
            @mousemove="pan"
            @mouseup="endPan"
            @mouseleave="endPan"
            :class="{ panning: isPanning }"
        >
            <div 
              ref="transformContainer"
              class="transform-container"
              :style="{ transform: `scale(${zoomLevel}) translate(${treePosition.x}px, ${treePosition.y}px)`, transformOrigin: 'top center' }"
            >
              <div 
                class="all_the_members" 
                ref="container" 
              >
              <!-- Generational Layout -->
              <div v-for="(generation, index) in displayGenerations" :key="index" class="generation">
                  <div v-for="group in generation" :key="group.id" class="member-group" 
                    :class="['draggable-group', group.type + '-group']"
                    :style="{ transform: 'translate(' + group.x + 'px, ' + group.y + 'px)' }"
                    :data-group-id="group.id"
                    :data-x="group.x" :data-y="group.y">

                      <!-- Couple Group -->
                      <div v-if="group.type === 'couple'" class="couple-box" :class="{ 'highlight-married': selectedRelationship === 'married' }">
                          <div class="member_box"
                              :class="{ 'male-border': group.members[0].gender === 'male', 'female-border': group.members[0].gender === 'female', dark: darkMode }"
                              :ref="el => { if (el) allMemberBoxes[group.members[0].name] = el }">
                              <img style="width:70px" v-if="group.members[0].gender === 'male' && group.members[0].image === null" src="../assets/avatar_male.png">
                              <img style="width:70px" v-if="group.members[0].gender === 'female' && group.members[0].image === null" src="../assets/avatar_female.png">
                              <img style="width:70px" v-if="group.members[0].image !== null" :src="group.members[0].image"><br>
                              <span style="font-weight: bold">{{ group.members[0].name }}</span><br>
                              <span v-if="group.members[0].birthday !== ''">{{ memberAge(group.members[0]) }} ans</span><br>
                              <span class="birthday" v-if="group.members[0].birthday !== ''">
                                ({{ formatBirthday(group.members[0].birthday) }})
                              </span>
                          </div>
                          <div class="member_box"
                              :class="{ 'male-border': group.members[1].gender === 'male', 'female-border': group.members[1].gender === 'female', dark: darkMode }"
                              :ref="el => { if (el) allMemberBoxes[group.members[1].name] = el }">
                              <img style="width:70px" v-if="group.members[1].gender === 'male' && group.members[1].image === null" src="../assets/avatar_male.png">
                              <img style="width:70px" v-if="group.members[1].gender === 'female' && group.members[1].image === null" src="../assets/avatar_female.png">
                              <img style="width:70px" v-if="group.members[1].image !== null" :src="group.members[1].image"><br>
                              <span style="font-weight: bold">{{ group.members[1].name }}</span><br>
                              <span v-if="group.members[0].birthday !== ''">{{ memberAge(group.members[1]) }} ans</span><br>
                              <span class="birthday" v-if="group.members[1].birthday !== ''">
                                ({{ formatBirthday(group.members[1].birthday) }})
                              </span>
                          </div>
                      </div>

                      <!-- Sibling Group -->
                      <div
                        v-else-if="group.type === 'siblings'"
                        class="sibling-box"
                        :class="{ 'siblings-orange': !group.hasMarriedMember }"
                        :ref="el => { if (el) allGroupBoxes[group.id] = el }"
                      >
                        <div
                          v-for="member in group.members"
                          :key="member.name"
                          class="member_box"
                          :class="{ 'male-border': member.gender === 'male', 'female-border': member.gender === 'female', dark: darkMode }"
                          :ref="el => { if (el) allMemberBoxes[member.name] = el }"
                        >
                              <img style="width:70px" v-if="member.gender === 'male' && member.image === null" src="../assets/avatar_male.png">
                              <img style="width:70px" v-if="member.gender === 'female' && member.image === null" src="../assets/avatar_female.png">
                              <img style="width:70px" v-if="member.image !== null" :src="member.image"><br>
                              <span style="font-weight: bold">{{ member.name }}</span><br>
                              <span v-if="member.birthday !== ''">{{ memberAge(member) }} ans</span><br>

                              <span class="birthday" v-if="member.birthday !== ''">
                                ({{ formatBirthday(member.birthday) }})
                              </span>
                          </div>
                      </div>

                      <!-- Single & Children -->
                      <div v-else-if="group.type === 'single'" class="single-box">
                            <div class="member_box"
                              :class="{ 'male-border': group.members[0].gender === 'male', 'female-border': group.members[0].gender === 'female', dark: darkMode }"
                              :ref="el => { if (el) allMemberBoxes[group.members[0].name] = el }">
                              <img style="width:70px" v-if="group.members[0].gender === 'male' && group.members[0].image === null" src="../assets/avatar_male.png">
                              <img style="width:70px" v-if="group.members[0].gender === 'female' && group.members[0].image === null" src="../assets/avatar_female.png">
                              <img style="width:70px" v-if="group.members[0].image !== null" :src="group.members[0].image"><br>
                              <span style="font-weight: bold">{{ group.members[0].name }}</span><br>
                              <span v-if="group.members[0].birthday !== ''">{{ memberAge(group.members[0]) }} ans</span><br>
                              <span class="birthday" v-if="group.members[0].birthday !== ''">
                                ({{ formatBirthday(group.members[0].birthday) }})
                              </span>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
            <!-- SVG Overlay for all relationships -->
        <svg class="relationship-overlay" ref="svgContainer"></svg>
            </div>
        </div>
        
        <div v-else>
          <p style="font-style: italic;">{{ $t("members.no") }}</p>
          <div class="empty-state-divider"></div>
          <button @click="goToHome" class="button">{{ $t("members.create") }}</button>
        </div>
        <div v-if="showScreenshotOptions" class="modal-overlay">
            <div class="modal-content" :class="{ dark:darkMode}">
                <h3 :class="{ dark:darkMode}">{{ $t("tree.screenshots") }}</h3>
                <p>{{ $t("tree.what") }}</p>
                <button @click="downloadScreenshot" class="edit_photo_button" :class="{ dark:darkMode}">
                  <img :src="darkMode ? require('../assets/google_icons_download_dark.png') : require('../assets/google_icons_download.png')" alt="Logout Icon" class="logout-icon" />
                  {{ $t("tree.download") }}
                </button>
                <button @click="showEmailInput = true" class="edit_photo_button" :class="{ dark:darkMode}">
                  <img :src="darkMode ? require('../assets/google_icons_send_by_email_dark.png') : require('../assets/google_icons_send_by_email.png')" alt="Logout Icon" class="logout-icon" />
                  {{ $t("tree.send_by_email") }}
                </button>
                <button @click="showScreenshotOptions = false" class="edit_photo_button" :class="{ dark:darkMode}">
                  <img :src="darkMode ? require('../assets/google_icons_cancel_dark.png') : require('../assets/google_icons_cancel.png')" alt="Logout Icon" class="logout-icon" />
                  {{ $t("common.cancel") }}
                </button>
                <div v-if="showEmailInput" class="email-input-container">
                    <input type="email" v-model="email" :placeholder="$t('tree.enter_your_email')">
                    <button @click="sendEmail" class="button">{{ $t("tree.send") }}</button>
                </div>
            </div>
        </div>
        <div class="camera-control" v-if="members.length > 0">
            <button @click="openScreenshotOptions"><img src="../assets/camera.png"/></button>
        </div>
        <div class="filters-control" v-if="members.length > 0">
          <button @click="toggleFiltersPanel" v-if="!isFiltersPanelVisible"><img src="../assets/filters.png"/></button>
        </div>
        <div class="zoom-controls" v-if="members.length > 0">
            <button @click="zoomIn">+</button>
            <button @click="zoomOut">-</button>
        </div>
        <FiltersSidePanel 
          :isFiltersPanelVisible="isFiltersPanelVisible"
          :relationshipAvailable="hasAnyRelationship"
          @close-panel="closeFiltersPanel" 
          @gender-filter-changed="applyGenderFilter" 
          @relationship-filter-changed="applyRelationshipFilter" />
        <TutorialHints
          pageKey="tree"
          :hints="[
            { id: 'filters', title: 'Filter your tree', text: 'Use the filters on the top right corner.' },
            { id: 'zooms', title: 'Zoom in/out', text: 'You can zoom on the tree with the 2 buttons on the bottom-left corner' },
            { id: 'download', title: 'Share your tree', text: 'You can click on the “photo“ icon to share your tree with others' },
          ]"
        />
    </div>
</template>

<script>
import interact from 'interactjs';
import html2canvas from 'html2canvas';
import FiltersSidePanel from '../components/FiltersSidePanel.vue';
import TutorialHints from "@/components/TutorialHints.vue"

export default {
  data() {
    return {
      processedGenerations: [],
      allMemberBoxes: {},
      allGroupBoxes: {},
      zoomLevel: 1,
      showScreenshotOptions: false,
      showEmailInput: false,
      email: '',
      isFiltersPanelVisible: false,
      selectedGender: '', // To store the filter value
      selectedRelationship: '',
      isPanning: false,
      panStart: { x: 0, y: 0 },
      treePosition: { x: 0, y: 0 },
    };
  },
  computed: {
    members() {
      return this.$store.state.members;
    },
    filteredMembers() {
      if (!this.selectedGender) {
          return this.members;
      }
      return this.members.filter(member => member.gender === this.selectedGender);
    },
    darkMode() {
      return this.$store.state.darkMode;
    },
    displayGenerations() {
      if (!this.selectedRelationship) {
          return this.processedGenerations;
      }

      const filteredGenerations = [];
      for (const generation of this.processedGenerations) {
        const filteredGroups = generation.filter(group => {
          if (this.selectedRelationship === 'married') {
              return group.type === 'couple';
          }
          return true;
        });
        if (filteredGroups.length > 0) {
          filteredGenerations.push(filteredGroups);
        }
      }
      return filteredGenerations;
    },
    hasAnyRelationship() {
      return this.members.some(m =>
        (m.married && String(m.married).trim() !== '') ||
        ((m.siblings || []).length > 0) ||
        ((m.children || []).length > 0)
      )
    },
  },  
  components: {
    FiltersSidePanel, 
    TutorialHints,
  },
  watch: {
    members: {
      handler: 'renderTree',
      deep: true
    },
    zoomLevel() {
      // Wait for the 0.3s zoom transition to finish before redrawing lines
      setTimeout(() => {
        this.drawRelationships();
      }, 300);
    },
    hasAnyRelationship(val) {
      if (!val && this.selectedRelationship !== '') {
        this.selectedRelationship = ''
        this.renderTree()
      }
    }
  },
  mounted() {
    this.$store.dispatch('fetchMembers');
    window.addEventListener('resize', this.renderTree);
    this.renderTree();
    this.initInteract();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.renderTree);
  },
  methods: {
    
    memberAge(m) {
    if (m && m.birthday) {
      const birth = new Date(m.birthday)
      if (isNaN(birth.getTime())) return null
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      const dayDiff = today.getDate() - birth.getDate()
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--
      return age
    }
    return typeof m.age === 'number' ? m.age : null
  },
    goToHome() {
      this.$router.push('/add-member');
    },
    startPan(event) {
      if (event.target.closest('.draggable-group')) {
        return;
      }
      this.isPanning = true;
      this.panStart.x = event.clientX;
      this.panStart.y = event.clientY;
    },
    pan(event) {
      if (this.isPanning) {
        const dx = event.clientX - this.panStart.x;
        const dy = event.clientY - this.panStart.y;
        this.treePosition.x += dx;
        this.treePosition.y += dy;
        this.panStart.x = event.clientX;
        this.panStart.y = event.clientY;
      }
    },
    endPan() {
      this.isPanning = false;
    },
    toggleFiltersPanel() {
      this.isFiltersPanelVisible = !this.isFiltersPanelVisible;
    },
    closeFiltersPanel() {
      this.isFiltersPanelVisible = false;
    },
    applyGenderFilter(gender) {
      this.selectedGender = gender;
      this.renderTree(); // Re-render the tree with the new filter
    },
    applyRelationshipFilter(relationship) {
      this.selectedRelationship = relationship;
      this.renderTree(); // Re-render the tree with the new filter
    },
    openScreenshotOptions() {
      this.showScreenshotOptions = true;
      this.showEmailInput = false;
      this.email = '';
    },

    downloadScreenshot() {
      const captureTarget = this.$refs.treeWrapper;
      if (!captureTarget) return;

      html2canvas(captureTarget, {
        useCORS: true,
        allowTaint: true,
        width: captureTarget.scrollWidth,
        height: captureTarget.scrollHeight,
        backgroundColor: 'white',
      }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'family-tree.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showScreenshotOptions = false;
      });
    },

    sendEmail() {
      const captureTarget = this.$refs.treeWrapper;
      if (!captureTarget) return;

      if (!this.email) {
        alert('Please enter an email address.');
        return;
      }

      html2canvas(captureTarget, {
        useCORS: true,
        allowTaint: true,
        width: captureTarget.scrollWidth,
        height: captureTarget.scrollHeight,
        backgroundColor: 'white',
      }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        
        fetch('http://localhost:3000/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: this.email, image: image }),
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            this.showScreenshotOptions = false;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error sending email. Make sure the backend server is running.');
        });
      });
    },

    renderTree() {
        console.log('Rendering tree. Members from store:', this.members);
        this.allMemberBoxes = {};
        this.allGroupBoxes = {};
        this.processMembers();
        console.log('Processed Generations:', this.processedGenerations);
        this.optimizeCoupleOrder();
        this.$nextTick(() => {
            this.drawRelationships();
        });
    },

    initInteract() {
      interact('.draggable-group').draggable({
        inertia: true,
        autoScroll: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: this.$refs.treeWrapper,
            endOnly: true,
          }),
        ],
        listeners: {
          move: this.dragMoveListener,
          end: this.dragEndListener
        }
      });
    },

    dragMoveListener(event) {
      const target = event.target;
      const groupId = target.getAttribute('data-group-id');
      
      // Find the group in the processedGenerations data
      let group = null;
      for (const generation of this.processedGenerations) {
        group = generation.find(g => g.id === groupId);
        if (group) break;
      }

      if (group) {
        // The drag event's dx/dy are scaled by the zoom, we need to un-scale them
        const unscaledDx = event.dx / this.zoomLevel;
        const unscaledDy = event.dy / this.zoomLevel;

        const x = (group.x || 0) + unscaledDx;
        const y = (group.y || 0) + unscaledDy;

        group.x = x;
        group.y = y;
        
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        this.drawRelationships();
      }
    },

    dragEndListener(event) {
        const target = event.target;
        const groupId = target.getAttribute('data-group-id');
        const x = parseFloat(target.getAttribute('data-x')) || 0;
        const y = parseFloat(target.getAttribute('data-y')) || 0;
        this.saveGroupPosition(groupId, x, y);
    },

    saveGroupPosition(groupId, x, y) {
        localStorage.setItem(`group-pos-${groupId}`, JSON.stringify({ x, y }));
    },

    loadGroupPosition(groupId) {
        const pos = localStorage.getItem(`group-pos-${groupId}`);
        if (pos) {
            return JSON.parse(pos);
        }
        return { x: 0, y: 0 };
    },

    optimizeCoupleOrder() {
        this.processedGenerations.forEach(generation => {
            for (let k = 0; k < generation.length; k++) {
                for (let i = 0; i < generation.length - 1; i++) {
                    const groupA = generation[i];
                    const groupB = generation[i + 1];

                    if (groupA.type === 'couple' && groupB.type === 'couple') {
                        const [memberA1] = groupA.members;
                        const [, memberB2] = groupB.members;

                        const groupBMembers = new Set(groupB.members.map(m => m.name));
                        const groupAMembers = new Set(groupA.members.map(m => m.name));

                        if (memberA1.siblings && memberA1.siblings.some(s => groupBMembers.has(s))) {
                            [groupA.members[0], groupA.members[1]] = [groupA.members[1], groupA.members[0]];
                        }

                        if (memberB2.siblings && memberB2.siblings.some(s => groupAMembers.has(s))) {
                            [groupB.members[0], groupB.members[1]] = [groupB.members[1], groupB.members[0]];
                        }
                    }
                }
            }
        });
    },

    processMembers() {
        const members = this.filteredMembers;
        if (members.length === 0) {
            this.processedGenerations = [];
            return;
        }

        const memberMap = new Map(members.map(m => [m.name, m]));
        const generations = new Map();
        const visited = new Set();

        const roots = members.filter(m => !members.some(p => (p.children || []).includes(m.name)));

        function assignGeneration(memberName, generation) {
            if (visited.has(memberName) || !memberMap.has(memberName)) return;
            visited.add(memberName);

            if (!generations.has(generation)) {
                generations.set(generation, new Set());
            }
            generations.get(generation).add(memberName);

            const member = memberMap.get(memberName);
            (member.children || []).forEach(childName => {
                assignGeneration(childName, generation + 1);
            });
        }

        roots.forEach(root => assignGeneration(root.name, 0));
        
        const finalGenerations = [];
        const sortedGenerationKeys = [...generations.keys()].sort((a, b) => a - b);

        sortedGenerationKeys.forEach(genKey => {
  const generationMembers = [...generations.get(genKey)].map(name => memberMap.get(name));
  const finalProcessed = [];
  const processedNames = new Set();

  const processGroup = (id, type, members, extra = {}) => {
    const pos = this.loadGroupPosition(id);
    finalProcessed.push({ id, type, members, ...extra, ...pos });
    members.forEach(m => processedNames.add(m.name));
  };

  // 1) Build sibling clusters (connected components) within this generation
  const genSet = new Set(generationMembers.map(m => m.name));

  const adj = new Map();
  generationMembers.forEach(m => adj.set(m.name, new Set()));
  generationMembers.forEach(m => {
    (m.siblings || []).forEach(sibName => {
      if (genSet.has(sibName)) {
        adj.get(m.name).add(sibName);
        adj.get(sibName).add(m.name);
      }
    });
  });

  const seen = new Set();
  const clusters = [];

  for (const m of generationMembers) {
    if (seen.has(m.name)) continue;

    const stack = [m.name];
    const clusterNames = [];
    seen.add(m.name);

    while (stack.length) {
      const cur = stack.pop();
      clusterNames.push(cur);
      for (const nxt of adj.get(cur) || []) {
        if (!seen.has(nxt)) {
          seen.add(nxt);
          stack.push(nxt);
        }
      }
    }

    if (clusterNames.length > 1) {
      const clusterMembers = clusterNames
        .map(n => generationMembers.find(x => x.name === n))
        .filter(Boolean);
      clusters.push(clusterMembers);
    }
  }

  // 2) Create sibling groups ONLY if no one in the cluster is married
  clusters.forEach(cluster => {
    const hasMarriedMember = cluster.some(m => (m.married && String(m.married).trim() !== ''));
    if (!hasMarriedMember) {
      const groupId = cluster.map(m => m.name).sort().join('-');
      if (!cluster.some(m => processedNames.has(m.name))) {
        processGroup(groupId, 'siblings', cluster, { hasMarriedMember: false });
      }
    }
  });

  // If filter is strictly "siblings", show only sibling groups
  if (this.selectedRelationship === 'siblings') {
    finalGenerations.push(finalProcessed);
    return;
  }

  // 3) Couples (skip people already in sibling groups)
  generationMembers.forEach(member => {
    if (processedNames.has(member.name)) return;
    if (member.married) {
      const partner = generationMembers.find(m => m.name === member.married);
      if (partner && !processedNames.has(partner.name)) {
        const coupleMembers = [member, partner].sort(
          (a, b) => (this.memberAge(b) ?? 0) - (this.memberAge(a) ?? 0)
        );
        processGroup(`${member.name}-${partner.name}`, 'couple', coupleMembers);
      }
    }
  });

  // 4) Singles for the rest
  generationMembers.forEach(member => {
    if (!processedNames.has(member.name)) {
      processGroup(member.name, 'single', [member]);
    }
  });

  finalGenerations.push(finalProcessed);
});

        this.processedGenerations = finalGenerations;
    },

    buildSiblingGroupIndex() {
  const map = new Map();

  this.processedGenerations.forEach(generation => {
    generation.forEach(group => {
      if (group.type === 'siblings' && !group.hasMarriedMember) {
        group.members.forEach(m => {
          map.set(m.name, group.id);
        });
      }
    });
  });

  return map;
},

    drawRelationships() {
      const siblingGroupIndex = this.buildSiblingGroupIndex();
        const svg = this.$refs.svgContainer;
        const wrapper = this.$refs.transformContainer;
        if (!svg || !wrapper) return;

        svg.innerHTML = '';
        wrapper.querySelectorAll('.html-heart').forEach(h => h.remove());

        const wrapperRect = wrapper.getBoundingClientRect();

        const drawnChildren = new Set();
        const relationship = this.selectedRelationship;

        if (relationship === '' || relationship === 'married') {
            this.filteredMembers.forEach(member => {
                if (member.married && member.name < member.married) {
                    const partner = this.members.find(m => m.name === member.married);
                    if (!partner) return;

                    const memberBox = this.allMemberBoxes[member.name];
                    const partnerBox = this.allMemberBoxes[partner.name];
                    if (!memberBox || !partnerBox) return;

                    this.drawHeart(wrapper, wrapperRect, memberBox, partnerBox);

                    if (relationship === '') {
                      const commonChildren = this.getCommonChildren(member, partner);
                      const heartMidpoint = this.getHeartMidpoint(wrapperRect, memberBox, partnerBox);

                      // 1) If children are displayed as one siblings group, connect once to the group box
                      const siblingsGroupEl = this.findSiblingsGroupElementForChildren(commonChildren);
                      if (siblingsGroupEl) {
                        this.drawPathFromPoint(svg, wrapperRect, heartMidpoint, siblingsGroupEl, 'green');
                        commonChildren.forEach(c => drawnChildren.add(c));
                      } else {
                        // 2) fallback: connect to each child individually
                        commonChildren.forEach(childName => {
                          const childBox = this.allMemberBoxes[childName];
                          if (childBox) {
                            this.drawPathFromPoint(svg, wrapperRect, heartMidpoint, childBox, 'green');
                            drawnChildren.add(childName);
                          }
                        });
                      }

                    }
                }
            });
        }

        if (relationship === '') {
          this.filteredMembers.forEach(member => {
            if (!member.siblings) return;

            member.siblings.forEach(siblingName => {
              if (member.name >= siblingName) return;

              const g1 = siblingGroupIndex.get(member.name);
              const g2 = siblingGroupIndex.get(siblingName);

              // ❌ SAME non-married sibling group → DO NOT draw
              if (g1 && g1 === g2) return;

              const box1 = this.allMemberBoxes[member.name];
              const box2 = this.allMemberBoxes[siblingName];
              if (box1 && box2) {
                this.drawPath(svg, wrapperRect, box1, box2, 'var(--orange)');
              }
            });
          });
        }


        if (relationship === '') {
            this.filteredMembers.forEach(member => {
                if (member.children) {
                    member.children.forEach(childName => {
                        if (!drawnChildren.has(childName)) {
                            const childBox = this.allMemberBoxes[childName];
                            if (childBox) this.drawPath(svg, wrapperRect, this.allMemberBoxes[member.name], childBox, 'green');
                        }
                    });
                }
            });
        }
    },

    getCommonChildren(member1, member2) {
        const children1 = new Set(member1.children || []);
        const children2 = new Set(member2.children || []);
        return [...children1].filter(childName => children2.has(childName));
    },

    getBoxCenter(wrapperRect, box) {
        if (!box) return { x: 0, y: 0 };
        const boxRect = box.getBoundingClientRect();
        const x = boxRect.left + boxRect.width / 2 - wrapperRect.left;
        const y = boxRect.top + boxRect.height / 2 - wrapperRect.top;
        return {
            x: x / this.zoomLevel,
            y: y / this.zoomLevel,
        };
    },

    getHeartMidpoint(wrapperRect, box1, box2) {
        const center1 = this.getBoxCenter(wrapperRect, box1);
        const center2 = this.getBoxCenter(wrapperRect, box2);
        return { x: (center1.x + center2.x) / 2, y: (center1.y + center2.y) / 2 };
    },

    drawALine(svg, p1, p2, color) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
    },

    drawPathFromPoint(svg, wrapperRect, startPoint, endElement, color) {
  const endPoint = this.getBoxCenter(wrapperRect, endElement);
  this.drawALine(svg, startPoint, endPoint, color);
},

    drawPath(svg, wrapperRect, box1, box2, color) {
        const startPoint = this.getBoxCenter(wrapperRect, box1);
        const endPoint = this.getBoxCenter(wrapperRect, box2);
        this.drawALine(svg, startPoint, endPoint, color);
    },

    drawHeart(container, wrapperRect, box1, box2) {
        const midPoint = this.getHeartMidpoint(wrapperRect, box1, box2);

        const heart = document.createElement('img');
        heart.src = require('../assets/red_heart.png');
        heart.className = 'heart-icon html-heart';
        heart.style.position = 'absolute';

        // On mobile, show the heart above the couple box (lines are behind)
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 780px)').matches;
        if (isMobile && box1 && box2) {
          const r1 = box1.getBoundingClientRect();
          const r2 = box2.getBoundingClientRect();
          const topPx = (Math.min(r1.top, r2.top) - wrapperRect.top) / this.zoomLevel;

          heart.style.left = `${midPoint.x - 12.5}px`;
          heart.style.top = `${topPx - 22}px`; // slightly above the boxes
        } else {
          heart.style.left = `${midPoint.x - 12.5}px`;
          heart.style.top = `${midPoint.y - 12.5}px`;
        }

        container.appendChild(heart);
    },

    formatBirthday(birthday) {
      if (!birthday) return null;
      const date = new Date(birthday);
      if (isNaN(date)) return null;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + 0.2, 3);
    },

    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.2);
    },
    sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
},

findSiblingsGroupElementForChildren(childNames) {
  if (!childNames || childNames.length === 0) return null;

  const target = new Set(childNames);

  for (const generation of this.processedGenerations) {
    for (const group of generation) {
      if (group.type !== 'siblings') continue;

      const groupSet = new Set((group.members || []).map(m => m.name));
      if (this.sameSet(target, groupSet)) {
        return this.allGroupBoxes[group.id] || null;
      }
    }
  }
  return null;
},

  }
}
</script>

<style> 

.tree-wrapper {
    position: relative;
    width: 100%;
    cursor: grab;
}

.tree-wrapper.panning {
    cursor: grabbing;
}

.transform-container {
    transition: transform 0.3s ease-in-out;
    position: relative;
}

.all_the_members {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 20px;
    position: relative;
    z-index: 1;
}

.generation {
    display: flex;
    justify-content: center;
    align-items: flex-start; /* Align groups to the top */
    gap: 20px;
    width: 100%;
}

.member-group {
    cursor: grab;
    position: relative; /* Needed for interact.js to work with transforms */
}

.member-group:active {
    cursor: grabbing;
    z-index: 10; /* Bring to front while dragging */
}

.sibling-box {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 20px;
  justify-content: center;
  padding: 15px;
  border-radius: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}

.sibling-box.siblings-orange {
  border: 2px solid var(--orange);
  background-color: rgba(255, 165, 0, 0.25);
}

.single-box {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.couple-box.highlight-married {
    background-color: rgba(255, 99, 71, 0.3); /* Tomato with opacity */
}

.couple-box {
  display: flex;
  flex-direction: row;      /* force horizontal */
  flex-wrap: nowrap;        /* jamais à la ligne */
  align-items: flex-start;
  gap: 50px;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 10px;
  background-color: rgba(230, 230, 230, 0.5);
}

.relationship-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

.heart-icon {
    animation: pulse 1.5s infinite;
}

.html-heart {
    width: 25px;
    height: 25px;
    z-index: 0; /* desktop: behind member boxes */
    pointer-events: none; /* Make it non-interactive */
}

@media (max-width: 780px) {
  .html-heart {
    z-index: 5; /* mobile: above boxes */
  }
}

.member_box {
    border: solid 1px black;
    width: 95px;
    padding: 5px;
    box-shadow: 2px 5px 5px black;
    background-color: #fdfdfd;
    text-align: center;
}

.member_box.dark {
  background-color:black;
}

.member_box.male-border {
    border: 2px solid var(--blue);
}

.member_box.female-border {
    border: 2px solid var(--pink);
}

.member_box:hover {
    background-color: var(--lightGrey);
}

span.birthday {
  font-size:13px;
}

.camera-control {
  position: fixed;
  top: 50px; 
  left:20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.camera-control button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background-color: #333;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.camera-control button:hover {
  background-color: #555;
}

.filters-control {
  position: fixed;
  top: 50px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.filters-control button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background-color: #333;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.filters-control button:hover {
 background-color: #555;
}

.zoom-controls {
  position: fixed;
  bottom: 50px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.zoom-controls button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background-color: #333;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.zoom-controls button:hover {
 background-color: #555;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.dark.modal-content {
  background-color:black;
}

.modal-content h3 {
  margin-top: 0;
}

.modal-content button {
  margin: 5px;
}

.email-input-container {
  margin-top: 15px;
}

.email-input-container input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}

.empty-state-divider {
  width: 100%;
  max-width: 300px;
  height: 1px;
  background-color: var(--divider-color);
  margin: 20px auto;
}

/* ===== Mobile responsive adjustments ===== */
@media (max-width: 480px){
  .member_box{
    width: 82px;
    padding: 4px;
    font-size: 12px;
  }

  .member_box img{
    width: 52px !important;
  }

  span.birthday{ font-size: 11px; }

  /* Couples must stay on one line */
  .couple-box{
    flex-wrap: nowrap;
    gap: 8px;
  }
}

.edit_photo_button {
  border: solid 1px grey;
}

@media (max-width: 480px){
  .couple-box{
    flex-wrap: nowrap;
    gap: 8px;
  }

  .sibling-box{
    flex-wrap: nowrap;
    gap: 8px;
  }
}

.tree-content {
  overflow: hidden;
}

.tree-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: grab;
}

</style>