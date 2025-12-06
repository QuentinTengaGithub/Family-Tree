import { createApp } from 'vue';
import Vuex from 'vuex';
import App from './App.vue';
import Home from './views/HomeView.vue';
import MemberList from './views/MemberList.vue';
import MemberTree from './views/MemberTree.vue';
import AddMember from './views/AddMember';
import SignUp from './views/SignUp.vue';
import SignIn from './views/SignIn.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';

import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

import AdminView from './views/AdminView.vue';
import ProfileView from './views/ProfileView.vue';

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/add-member', component: AddMember, meta: { requiresAuth: true } },
  { path: '/tree', component: MemberTree, meta: { requiresAuth: true } },
  { path: '/members', component: MemberList, meta: { requiresAuth: true } },
  { path: '/admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/sign-up', component: SignUp },
  { path: '/sign-in', component: SignIn }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      async (user) => {
        removeListener();
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            resolve({ ...user, ...userDocSnap.data() });
          } else {
            // If user exists in Auth but not Firestore, it's an invalid state.
            // Sign them out and resolve to null so the router guard catches it.
            await signOut(getAuth());
            resolve(null);
          }
        } else {
          resolve(null);
        }
      },
      reject
    );
  });
};

router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser();
  store.commit('setUser', user);

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !user) {
    next('/sign-in');
  } else if (requiresAdmin && (!user || !['admin', 'superadmin'].includes(user.role))) {
    alert("Access Denied: You do not have administrator privileges.");
    next(from.path || '/home');
  } else if (!requiresAuth && user) {
    next('/home');
  } else {
    next();
  }
});

const store = new Vuex.Store({
  state: {
    members: [],
    darkMode: false,
    user: null,
    userRole: null,
    viewingAs: null,
    viewingAsName: null
  },
  mutations: {
    setMembers(state, members) {
      state.members = members;
    },
    addMember(state, member) {
      state.members.push(member);
    },
    deleteMember(state, memberName) {
      state.members = state.members.filter(m => m.name !== memberName);
    },
    updateMember(state, updatedMember) {
      const index = state.members.findIndex(m => m.name === updatedMember.name);
      if (index !== -1) {
        state.members[index] = { ...state.members[index], ...updatedMember };
      }
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    setDarkMode(state, darkMode) {
      state.darkMode = darkMode;
    },
    setUser(state, user) {
      state.user = user;
      state.userRole = user ? user.role : null;
    },
    setViewingAs(state, { userId, userName }) {
      state.viewingAs = userId;
      state.viewingAsName = userName;
    }
  },
  actions: {
    async fetchMembers({ commit, state }, paramUserId = null) {
      const userId = state.viewingAs || paramUserId || (state.user ? state.user.uid : null);
      if (!userId) {
        commit('setMembers', []);
        return;
      }
      const membersCol = collection(db, 'users', userId, 'members');
      const memberSnapshot = await getDocs(membersCol);
      let members = memberSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      const memberMap = new Map(members.map(m => [m.id, m.name]));
      const allMemberNames = new Set(members.map(m => m.name));

      const getMemberName = (identifier) => {
          if (!identifier) return '';
          const nameFromId = memberMap.get(identifier);
          if (nameFromId) return nameFromId;
          if (allMemberNames.has(identifier)) return identifier;
          return ''; 
      };

      members = members.map(member => {
        const newMember = { ...member };
        if (member.married) {
          newMember.married = getMemberName(member.married);
        }
        if (member.siblings) {
          newMember.siblings = member.siblings.map(getMemberName).filter(Boolean);
        }
        if (member.children) {
          newMember.children = member.children.map(getMemberName).filter(Boolean);
        }
        return newMember;
      });

      console.log("Fetched and cleaned members:", members);
      commit('setMembers', members);
    },
    async addMember({ commit, state }, member) {
      if (!state.user) return;
      const memberData = { ...member, createdBy: state.viewingAs || state.user.uid };
      await setDoc(doc(db, "users", state.viewingAs || state.user.uid, "members", member.name), memberData);
      commit('addMember', member);
    },
    async deleteMember({ commit, state, dispatch }, memberName) {
      if (!state.user) return;
      const userId = state.viewingAs || state.user.uid;
      await deleteDoc(doc(db, "users", userId, "members", memberName));
      commit('deleteMember', memberName);

      const membersToUpdate = state.members.filter(m => m.married === memberName || m.siblings.includes(memberName) || m.children.includes(memberName));

      for (const member of membersToUpdate) {
        const updatedMember = { ...member };
        if (updatedMember.married === memberName) {
          updatedMember.married = '';
        }
        if (updatedMember.siblings.includes(memberName)) {
          updatedMember.siblings = updatedMember.siblings.filter(s => s !== memberName);
        }
        if (updatedMember.children.includes(memberName)) {
          updatedMember.children = updatedMember.children.filter(c => c !== memberName);
        }
        dispatch('updateMember', updatedMember);
      }
    },
    async updateMember({ commit, state }, member) {
      if (!state.user) return;
      const userId = state.viewingAs || state.user.uid;
      const memberRef = doc(db, "users", userId, "members", member.name);
      const dataToSave = { ...member };
      delete dataToSave.toggleRelationship;
      await updateDoc(memberRef, dataToSave);
      commit('updateMember', member);
    },
    async setSiblings({ dispatch, state }, { member, selectedMember }) {
      if (!state.user) return;
      const userId = state.viewingAs || state.user.uid;
      const fullSiblingGroup = new Set([
        member.name,
        selectedMember.name,
        ...(member.siblings || []),
        ...(selectedMember.siblings || []),
      ]);

      const membersToUpdate = state.members.filter(m => fullSiblingGroup.has(m.name));

      for (const memberToUpdate of membersToUpdate) {
        const newSiblings = [...fullSiblingGroup].filter(name => name !== memberToUpdate.name);
        if (JSON.stringify(memberToUpdate.siblings) !== JSON.stringify(newSiblings)) {
          dispatch('updateMember', { ...memberToUpdate, siblings: newSiblings, userId });
        }
      }
    },
    async updateMemberName({ dispatch, state }, { oldName, newName }) {
      if (!state.user) return;
      const userId = state.viewingAs || state.user.uid;
      const oldMemberRef = doc(db, "users", userId, "members", oldName);
      const oldMemberSnap = await getDoc(oldMemberRef);

      if (oldMemberSnap.exists()) {
        const memberData = oldMemberSnap.data();
        memberData.name = newName;

        await setDoc(doc(db, "users", userId, "members", newName), memberData);
        await deleteDoc(oldMemberRef);

        const membersCol = collection(db, "users", userId, "members");
        const memberSnapshot = await getDocs(membersCol);
        const allMembers = memberSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        for (const member of allMembers) {
          if (member.id === newName) continue;

          let needsUpdate = false;
          const updatedData = { ...member };
          delete updatedData.id;

          if (updatedData.married === oldName) {
            updatedData.married = newName;
            needsUpdate = true;
          }
          if (updatedData.siblings && updatedData.siblings.includes(oldName)) {
            updatedData.siblings = updatedData.siblings.map(s => s === oldName ? newName : s);
            needsUpdate = true;
          }
          if (updatedData.children && updatedData.children.includes(oldName)) {
            updatedData.children = updatedData.children.map(c => c === oldName ? newName : c);
            needsUpdate = true;
          }

          if (needsUpdate) {
            const memberToUpdateRef = doc(db, "users", userId, "members", member.id);
            await updateDoc(memberToUpdateRef, updatedData);
          }
        }

        dispatch('fetchMembers');
      }
    },
    async migrateData({ dispatch, state }) {
        if (!state.user) {
            alert("You must be logged in to migrate data.");
            return;
        }
        const userId = state.user.uid;
        const confirmation = confirm("This will migrate your Firestore data. It will delete and recreate documents to use names as IDs. This is a sensitive operation. Are you sure you want to proceed?");
        if (!confirmation) {
            return;
        }

        const membersCol = collection(db, 'users', userId, 'members');
        const memberSnapshot = await getDocs(membersCol);
        const allMembers = memberSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        const membersToMigrate = allMembers.filter(m => m.id !== m.name);

        if (membersToMigrate.length === 0) {
            alert("No members to migrate.");
            return;
        }

        const idMap = new Map();

        for (const memberToMigrate of membersToMigrate) {
            const oldId = memberToMigrate.id;
            const newId = memberToMigrate.name;
            if (oldId !== newId) {
                idMap.set(oldId, newId);
            }
        }

        // Pass 1: Create new docs and delete old ones
        for (const memberToMigrate of membersToMigrate) {
            const oldId = memberToMigrate.id;
            const newId = memberToMigrate.name;

            console.log(`Migrating ${newId} from ${oldId}`);
            
            const memberData = { ...memberToMigrate, createdBy: userId };
            delete memberData.id;
            await setDoc(doc(db, "users", userId, "members", newId), memberData);
            await deleteDoc(doc(db, "users", userId, "members", oldId));
        }

        // Pass 2: Update relationships
        const newMemberSnapshot = await getDocs(membersCol);
        const newAllMembers = newMemberSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        for (const member of newAllMembers) {
            let needsUpdate = false;
            const memberData = { ...member };
            delete memberData.id;

            if (memberData.married && idMap.has(memberData.married)) {
                memberData.married = idMap.get(memberData.married);
                needsUpdate = true;
            }
            if (memberData.siblings && memberData.siblings.length > 0) {
                const originalSiblings = [...memberData.siblings];
                memberData.siblings = memberData.siblings.map(s => idMap.get(s) || s);
                if (JSON.stringify(originalSiblings) !== JSON.stringify(memberData.siblings)) {
                    needsUpdate = true;
                }
            }
            if (memberData.children && memberData.children.length > 0) {
                const originalChildren = [...memberData.children];
                memberData.children = memberData.children.map(c => idMap.get(c) || c);
                if (JSON.stringify(originalChildren) !== JSON.stringify(memberData.children)) {
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                console.log(`Updating relationships for ${member.name}`);
                const memberRef = doc(db, "users", userId, "members", member.id);
                await updateDoc(memberRef, memberData);
            }
        }

        alert("Data migration completed!");
        dispatch('fetchMembers');
    },
    async unsetChildren({ dispatch, state }, { member, childName }) {
        if (!state.user) return;
        const parent = state.members.find(m => m.name === member.name);
        if (parent) {
            const newChildren = parent.children.filter(c => c !== childName);
            dispatch('updateMember', { ...parent, children: newChildren });
        }
    },
    async unsetSibling({ dispatch, state }, { member, siblingName }) {
        if (!state.user) return;
        const member1 = state.members.find(m => m.name === member.name);
        const member2 = state.members.find(m => m.name === siblingName);

        if (member1) {
            const newSiblings = member1.siblings.filter(s => s !== siblingName);
            dispatch('updateMember', { ...member1, siblings: newSiblings });
        }
        if (member2) {
            const newSiblings = member2.siblings.filter(s => s !== member.name);
            dispatch('updateMember', { ...member2, siblings: newSiblings });
        }
    }
  }
});

const app = createApp(App);

app.use(router);
app.use(store);

store.dispatch('fetchMembers');

store.watch(
  (state) => state.darkMode,
  (darkMode) => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  },
  { immediate: true }
);

app.mount('#app');
