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
          <ImageDialog v-bind:src="src"></ImageDialog>
        </v-card-text>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import ImageDialog from "../molecule/ImageDialog";

export default {
  components: {
    ImageDialog
  },
  props: {},
  data: () => ({
    title: "システム概要",
    text: `カメラとブラウザだけ用意してOtoBeにアクセスすれば、簡単にバーチャル美しい体に！`,
    src:
      "image/otobe-system.png"
  })
};
</script>
