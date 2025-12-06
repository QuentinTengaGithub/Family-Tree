<template>
    <div class="relationship">
        <p>Relationship between :
            <label>
                <input type="radio" name="gender" value="male" v-model="gender"> Male
            </label>
            <label>
                <input type="radio" name="gender" value="female" v-model="gender"> Female
            </label>
        </p>
    </div>
</template>

<script>
export default {
    props: {
        members: {
            type: Array,
        }
    },
    // ...
}
</script>

<style></style>