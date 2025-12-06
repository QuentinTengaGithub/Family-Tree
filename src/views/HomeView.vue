<template>
    <div class="container">
        <div class="section" :style="{ backgroundImage: 'url(' + require('../assets/members.jpg') + ')' }">
            <div class="section-title" @click="changeTab('Add-Member')">ADD A MEMBER</div>
        </div>
        <div class="section" :style="{ backgroundImage: 'url(' + require('../assets/family.png') + ')' }">
            <div class="section-title" @click="changeTab('Tree')">VIEW THE TREE</div>
        </div>
        <div class="section" :style="{ backgroundImage: 'url(' + require('../assets/consulter.png') + ')' }">
            <div class="section-title" @click="changeTab('Members')">CONSULT MEMBERS</div>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        changeTab(tab) {
            this.$router.push('/' + tab.toLowerCase());
        }
    }
}
</script>

<style>
.black {
    height: 100%;
    background-color: black;
    opacity: 0.7;
    z-index: 1;
}

.container {
    display: flex;
    flex-direction: inline;
}

.section {
    border: solid 1px black;
    width: 33vw;
    margin: 10px;
    height: 88vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center;
}

.section-title {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: auto 10px;
    width: 100%;
    height: 100%;
    text-align: center;
    box-sizing: border-box;
    font-weight: bold;
    font-size: 55px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.section-title:hover {
    background-color: rgba(0, 0, 0, 0.4);
    cursor: pointer;
}

.section p {
    color: white;
    font-size: 40px;
    font-weight: bold;
    z-index: 2;
}
</style>