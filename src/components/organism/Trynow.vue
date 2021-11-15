<template>
  <v-card tile flat class="transparent">
    <v-container fluid>
      <v-row align="center" justify="center">
        <router-link to="/main" style="color:white;text-decoration:none">
          <v-btn class="white--text v-btn v-btn--block v-btn--rounded theme--light elevation-8 v-size--x-large primary">ちょっと動きを試してみる</v-btn>
        </router-link>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  components: {},
  props: {},
  data: () => ({
  })
};
</script>
