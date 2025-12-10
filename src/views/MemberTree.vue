<template>
    <div class="content">
        <p class="title">Family tree</p>
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
                              <span v-if="group.members[0].birthday !== ''">{{ group.members[0].age }} ans</span><br>
                              <span class="birthday" v-if="group.members[0].birthday !== ''">
                                <img src="../assets/cake_dark.png" v-if="this.darkMode === true" style="width:14px"/> 
                                <img src="../assets/cake.png" v-if="this.darkMode === false" style="width:14px"/>
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
                              <span v-if="group.members[1].birthday !== ''">{{ group.members[1].age }} ans</span><br>
                              <span class="birthday" v-if="group.members[1].birthday !== ''">
                                <img src="../assets/cake_dark.png" v-if="this.darkMode === true" style="width:14px"/> 
                                <img src="../assets/cake.png" v-if="this.darkMode === false" style="width:14px"/>
                                ({{ formatBirthday(group.members[1].birthday) }})
                              </span>
                          </div>
                      </div>

                      <!-- Sibling Group -->
                      <div v-else-if="group.type === 'siblings'" class="sibling-box">
                          <div v-for="member in group.members" :key="member.name" class="member_box"
                              :class="{ 'male-border': member.gender === 'male', 'female-border': member.gender === 'female', dark: darkMode }"
                              :ref="el => { if (el) allMemberBoxes[member.name] = el }">
                              <img style="width:70px" v-if="member.gender === 'male' && member.image === null" src="../assets/avatar_male.png">
                              <img style="width:70px" v-if="member.gender === 'female' && member.image === null" src="../assets/avatar_female.png">
                              <img style="width:70px" v-if="member.image !== null" :src="member.image"><br>
                              <span style="font-weight: bold">{{ member.name }}</span><br>
                              <span v-if="member.birthday !== ''">{{ member.age }} ans</span><br>
                              <span class="birthday" v-if="member.birthday !== ''">
                                <img src="../assets/cake_dark.png" v-if="this.darkMode === true" style="width:14px"/> 
                                <img src="../assets/cake.png" v-if="this.darkMode === false" style="width:14px"/>
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
                              <span v-if="group.members[0].birthday !== ''">{{ group.members[0].age }} ans</span><br>
                              <span class="birthday" v-if="group.members[0].birthday !== ''">
                                <img src="../assets/cake_dark.png" v-if="this.darkMode === true" style="width:14px"/> 
                                <img src="../assets/cake.png" v-if="this.darkMode === false" style="width:14px"/>
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
          <p style="font-style: italic;">No member created.</p>
          <div class="empty-state-divider"></div>
          <button @click="goToHome" class="button">Create a member</button>
        </div>
        <div v-if="showScreenshotOptions" class="modal-overlay">
            <div class="modal-content">
                <h3>Screenshot Options</h3>
                <p>What would you like to do with the screenshot?</p>
                <button @click="downloadScreenshot">Download</button>
                <button @click="showEmailInput = true">Send by Email</button>
                <button @click="showScreenshotOptions = false">Cancel</button>

                <div v-if="showEmailInput" class="email-input-container">
                    <input type="email" v-model="email" placeholder="Enter your email">
                    <button @click="sendEmail">Send</button>
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
        <FiltersSidePanel :isFiltersPanelVisible="isFiltersPanelVisible" @close-panel="closeFiltersPanel" @gender-filter-changed="applyGenderFilter" @relationship-filter-changed="applyRelationshipFilter" />
    </div>
</template>

<script>
import interact from 'interactjs';
import html2canvas from 'html2canvas';
import FiltersSidePanel from '../components/FiltersSidePanel.vue';

export default {
  data() {
    return {
      processedGenerations: [],
      allMemberBoxes: {},
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
              }
          },  components: {
    FiltersSidePanel,
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
    }
  },
  mounted() {
    window.addEventListener('resize', this.renderTree);
    this.renderTree();
    this.initInteract();
  },
    beforeUnmount() {
    window.removeEventListener('resize', this.renderTree);
  },
  methods: {
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
        this.allMemberBoxes = {};
        this.processMembers();
        this.optimizeCoupleOrder();
        this.$nextTick(() => {
            this.drawRelationships();
        });
    },

    initInteract() {
      interact('.draggable-group').draggable({
        inertia: true,
        autoScroll: true,
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

            const processGroup = (id, type, members) => {
                const pos = this.loadGroupPosition(id);
                finalProcessed.push({ id, type, members, ...pos });
                members.forEach(m => processedNames.add(m.name));
            };

            if (this.selectedRelationship === 'siblings') {
                generationMembers.forEach(member => {
                    if (processedNames.has(member.name)) return;

                    if (member.siblings && member.siblings.length > 0) {
                        const siblingGroupMembers = [member, ...member.siblings.map(name => generationMembers.find(m => m.name === name)).filter(Boolean)];

                        if (siblingGroupMembers.length > 1) {
                            // Check if any member of this potential group has already been processed.
                            const alreadyProcessed = siblingGroupMembers.some(m => processedNames.has(m.name));
                            if (!alreadyProcessed) {
                                const groupId = siblingGroupMembers.map(m => m.name).sort().join('-');
                                processGroup(groupId, 'siblings', siblingGroupMembers);
                            }
                        }
                    }
                });
            } else {
                // Existing logic
                generationMembers.forEach(member => {
                    if (processedNames.has(member.name)) return;
                    if (member.married) {
                        const partner = generationMembers.find(m => m.name === member.married);
                        if (partner && !processedNames.has(partner.name)) {
                            const coupleMembers = [member, partner].sort((a, b) => b.age - a.age);
                            processGroup(`${member.name}-${partner.name}`, 'couple', coupleMembers);
                        }
                    }
                });

                generationMembers.forEach(member => {
                    if (processedNames.has(member.name)) return;
                    if (member.siblings && member.siblings.length > 0) {
                        const siblingGroup = [member, ...member.siblings.map(name => generationMembers.find(m => m.name === name)).filter(Boolean)];
                        if (siblingGroup.length > 1 && siblingGroup.every(m => !processedNames.has(m.name))) {
                            // Instead of grouping siblings, treat them as singles for individual dragging
                            siblingGroup.forEach(sibling => {
                                if (!processedNames.has(sibling.name)) {
                                    processGroup(sibling.name, 'single', [sibling]);
                                }
                            });
                        }
                    }
                });

                generationMembers.forEach(member => {
                    if (!processedNames.has(member.name)) {
                        processGroup(member.name, 'single', [member]);
                    }
                });
            }
            finalGenerations.push(finalProcessed);
        });

        this.processedGenerations = finalGenerations;
    },

    drawRelationships() {
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
                        commonChildren.forEach(childName => {
                            const childBox = this.allMemberBoxes[childName];
                            if (childBox) {
                                const heartMidpoint = this.getHeartMidpoint(wrapperRect, memberBox, partnerBox);
                                this.drawPathFromPoint(svg, wrapperRect, heartMidpoint, childBox, 'blue');
                                drawnChildren.add(childName);
                            }
                        });
                    }
                }
            });
        }

        if (relationship === '') {
            this.filteredMembers.forEach(member => {
                if (member.siblings) {
                    member.siblings.forEach(siblingName => {
                        if (member.name < siblingName) {
                            const siblingBox = this.allMemberBoxes[siblingName];
                            if (siblingBox) this.drawPath(svg, wrapperRect, this.allMemberBoxes[member.name], siblingBox, 'green');
                        }
                    });
                }
            });
        }

        if (relationship === '') {
            this.filteredMembers.forEach(member => {
                if (member.children) {
                    member.children.forEach(childName => {
                        if (!drawnChildren.has(childName)) {
                            const childBox = this.allMemberBoxes[childName];
                            if (childBox) this.drawPath(svg, wrapperRect, this.allMemberBoxes[member.name], childBox, 'blue');
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

    drawPathFromPoint(svg, wrapperRect, startPoint, endBox, color) {
        const endPoint = this.getBoxCenter(wrapperRect, endBox);
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
        heart.style.left = `${midPoint.x - 12.5}px`;
        heart.style.top = `${midPoint.y - 12.5}px`;
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
    }
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
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
    border: 1px solid green;
    background-color: rgba(144, 238, 144, 0.3);
    padding: 15px;
    border-radius: 10px;
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
    gap: 50px;
    justify-content: center;
    flex-wrap: wrap;
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
    z-index: 0; /* Keep it behind member boxes */
    pointer-events: none; /* Make it non-interactive */
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

</style>