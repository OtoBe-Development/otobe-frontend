<template>
  <v-card cols="12" class="transparent" flat>
    <v-card-title class="ma-0 pa-0 title">
      <v-icon>mdi-human-handsdown</v-icon>
      <div class="ml-1">アバター選択</div>
    </v-card-title>
    <v-row>
      <v-col v-for="card in avatars" :key="card.key" cols="2">
        <v-card
          v-on:click="avatarClicked(card)"
          :disabled="card.disabled"
        >
          <v-img
            :src="card.src"
            class="white--text"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            height="200px"
          >
            <v-icon
              transition="scroll-x-transition"
              color="#58acfc"
              v-if="card.selected"
              class="display-1"
            >mdi-checkbox-marked-circle-outline</v-icon>
          </v-img>

          <div>
            <v-card-actions v-text="card.title"></v-card-actions>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  created() {
    this.avatarClicked(this.avatars[0]);
  },
  components: {},
  props: {},
  methods: {
    avatarClicked(avatar) {
      this.avatars.forEach(a => (a.selected = false));
      avatar.selected = true;
      this.$emit("selected", avatar);
    }
  },
  data: () => ({
    avatars: [
      {
        key: 1,
        title: "千駄ヶ谷 篠さん",
        src: "models/shino/shino.png",
        model: "../models/shino/shino.vrm",
        selected: false
      },
      {
        key: 2,
        title: "No Model",
        src: "models/nomodel.png",
        model: "../models/shino/shino.vrm",
        selected: false,
        disabled: true
      },
      {
        key: 3,
        title: "No Model",
        src: "models/nomodel.png",
        model: "../models/shino/shino.vrm",
        selected: false,
        disabled: true
      },
      {
        key: 4,
        title: "No Model",
        src: "models/nomodel.png",
        model: "../models/shino/shino.vrm",
        selected: false,
        disabled: true
      },
      {
        key: 5,
        title: "No Model",
        src: "models/nomodel.png",
        model: "../models/shino/shino.vrm",
        selected: false,
        disabled: true
      },
      {
        key: 6,
        title: "No Model",
        src: "models/nomodel.png",
        model: "../models/shino/shino.vrm",
        selected: false,
        disabled: true
      }
    ]
  })
};
</script>
