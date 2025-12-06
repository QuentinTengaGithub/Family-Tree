<template>
    <div class="footer" :class="{ dark: darkMode }">Copyright</div>
</template>

<script>
export default {
    computed: {
        darkMode() {
            return this.$store.state.darkMode;
        }
    }
}
</script>

<style>
.footer {
  border-top:solid 1px var(--lightGrey);
  width: 100%;
  text-align: center;
  padding:10px;
  margin:0;
  background-color:white;
}

.footer.dark {
    background-color: black;
}
</style>