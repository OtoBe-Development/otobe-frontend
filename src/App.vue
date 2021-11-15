<template>
  <v-app>
    <router-view />
  </v-app>
</template>
<script>
export default {
  created() {
    this.$vuetify.theme.dark = true;
  }
};
</script>