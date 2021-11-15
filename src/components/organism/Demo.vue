<template>
  <v-card tile flat class="transparent">
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-card-title class="align-center text-center display-1" v-text="title" />
      </v-row>
      <v-row align="center" justify="center">
        <v-card-subtitle class="align-center text-center" v-text="text" />
      </v-row>
      <v-row align="center" justify="center">
        <v-card-text class="align-center">
          <v-img justify="center" :src="src"></v-img>
        </v-card-text>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  components: {},
  props: {},
  data: () => ({
    title: "Demo(動画再生したい。)",
    text: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`,
    src:
      "image/title.jpg"
  })
};
</script>
