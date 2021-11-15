<template>
  <v-card class="transparent">
    <v-card-title class="ma-0 pa-0 title">
      <v-icon>mdi-island</v-icon>
      <div class="ml-1">背景選択</div>
    </v-card-title>
    <v-row>
      <v-col v-for="item in backgrounds" :key="item.key" cols="4">
        <v-card v-on:click="backgroundClicked(item)">
          <v-img
            :src="item.src.replace('../', '')"
            class="white--text"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            height="200px"
          >
            <v-icon
              transition="scroll-x-transition"
              color="#58acfc"
              v-if="item.selected"
              class="display-1"
            >mdi-checkbox-marked-circle-outline</v-icon>
          </v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  created() {
    this.backgroundClicked(this.backgrounds[0]);
  },
  components: {},
  props: {},
  methods: {
    backgroundClicked(background) {
      this.backgrounds.forEach(a => (a.selected = false));
      background.selected = true;
      this.$emit("selected", background);
    }
  },
  data: () => ({
    backgrounds: [
      {
        key: 1,
        src: "../bgs/2.jpg",
        selected: false
      },
      {
        key: 2,
        src: "../bgs/1.jpg",
        selected: false
      },
      {
        key: 3,
        src: "../bgs/3.jpg",
        selected: false
      },
      {
        key: 4,
        src: "../bgs/4.jpg",
        selected: false
      },
      {
        key: 5,
        src: "../bgs/5.jpg",
        selected: false
      },
      {
        key: 6,
        src: "../bgs/6.jpg",
        selected: false
      }
    ]
  })
};
</script>
