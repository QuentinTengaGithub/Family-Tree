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
  background-color:rgba(255, 255, 255, 0.7);
}

.footer.dark {
    background-color: rgba(0, 0, 0, 0.7);
}
</style>