
<template>
  <div>
    <v-app-bar dense absolute color="black" dark>
      <v-toolbar-title></v-toolbar-title>
      <img src="logo-small-dark.png" /> 
      <div>
        <v-btn text v-scroll-to="'#description'">概要</v-btn>
      </div>
      <div>
        <v-btn text v-scroll-to="'#concept'">ストーリー</v-btn>
      </div>
      <div>
        <v-btn text v-scroll-to="'#system'">システム概要</v-btn>
      </div>
      <div >
        <v-btn text v-scroll-to="'#roadmap'">ロードマップ</v-btn>
      </div>
      <div>
        <v-btn text v-scroll-to="'#team'">開発チーム</v-btn>
      </div>

      <v-spacer></v-spacer>
      <v-spacer></v-spacer>

      <router-link to="/main" style="color:white;text-decoration: none">
        <v-btn color="primary">TRY Now</v-btn>
      </router-link>
    </v-app-bar>
    <v-sheet id="scrolling-techniques">
      <v-container fluid ma-0 pa-0>
        <!-- テンプレ：トップ画面 -->
        <v-row my-0 class="black">
          <v-col cols="12">
            <Top />
          </v-col>
        </v-row>

        <!-- テンプレ：説明文。右側にテキスト、左側に画像 -->
        <v-row id="description" justify="center" class="white">
          <v-col cols="8">
            <Description />
          </v-col>
        </v-row>

        <!-- テンプレ：説明文。右側にテキスト、左側に画像 -->
        <v-row id="concept" justify="center" class="indigo lighten-5">
          <v-col cols="8">
            <Concept />
          </v-col>
        </v-row>

        <!-- テンプレ：使ってみてよ -->
        <v-row justify="center">
          <v-col cols="8">
            <Trynow />
          </v-col>
        </v-row>

        <!-- テンプレ：システム構成説明 -->
        <v-row id="system" justify="center" class="indigo lighten-5">
          <v-col cols="6">
            <System />
          </v-col>
        </v-row>

        <!-- テンプレ：ロードマップ -->
        <v-row id="roadmap" justify="center" class="white">
          <v-col cols="6">
            <Roadmap />
          </v-col>
        </v-row>

        <!-- テンプレ：使ってみてよ -->
        <v-row justify="center" class="indigo lighten-5">
          <v-col cols="8">
            <Trynow />
          </v-col>
        </v-row>

        <!-- テンプレ：メンバー紹介 -->
        <v-row id="team" justify="center"  class="white">
          <v-col cols="10">
            <Team />
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </div>
</template>

<style>
* :not(.v-icon) {
  font-family: Roboto, "Meiryo UI", -apple-system, BlinkMacSystemFont,
    "Segoe UI", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
</style>
<script>
import Top from "../organism/Top";
import Description from "../organism/Description";
import Concept from "../organism/Concept";
import Trynow from "../organism/Trynow";
import System from "../organism/System";
import Roadmap from "../organism/Roadmap";
import Team from "../organism/Team";

export default {
  components: {
    Top,
    Description,
    Concept,
    Trynow,
    System,
    Roadmap,
    Team
  },
  created() {
    this.$vuetify.theme.dark = false;
  },
  props: {
    source: String
  },
  data: () => ({
    drawer: null
  })
};
</script>
