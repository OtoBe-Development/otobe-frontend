<template>
  <v-card tile flat class="transparent">
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-card-title class="align-center">
          <div cols="12" class="display-1">Roadmap</div>
        </v-card-title>
      </v-row>
      <v-row align="center" justify="center">
        <v-card-subtitle class="align-center">
          <div cols="12"></div>
        </v-card-subtitle>
      </v-row>
      <v-row align="center" justify="center">
        <v-card-text class="align-center">
          <v-timeline align-top :dense="$vuetify.breakpoint.smAndDown">
            <v-timeline-item
              v-for="(item, i) in items"
              :key="i"
              :color="item.color"
              :icon="item.icon"
              fill-dot
              :small="item.small"
              
            >
              <v-card :color="item.color" dark>
                <v-card-title class="title">{{item.title}}<br/>{{item.date}}</v-card-title>
                <v-card-text class="white text--primary">
                  <p>{{item.text}}</p>
                  <ul id="hoge">
                    <li v-for="(feature, j) in item.features" :key="j">
                       {{feature}}
                    </li>
                  </ul>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-row>
    </v-container>
  </v-card>
</template>


<script>
export default {
  components: {},
  data: () => ({
    items: [
      {
        title: "Project Start",
        date: "2020.2.14",
        color: "blue-grey lighten-2",
        icon: "mdi-star",
        small: true,
        text:
          "いつも通り思い付きでプロジェクトが始まった。開始日に意味はない。断じて意味はない。",
        features: []
      },
      {
        title: "Beta release",
        date: "2020.3.9",
        color: "blue-grey lighten-1",
        icon: "mdi-skull",
        small: true,
        text:
          "途中やる気を喪失したが、何とかベータ版が出来上がった。",
        features: ['映像変換','アバター選択','デバッグモード']
      },
      {
        title: "Version 1.0",
        date: "2020.4.1 1st リリース",
        color: "blue-grey darken-1",
        icon: "mdi-lightbulb-on-outline",
        text:
          "人類の黎明",
        features: ['動画対応','PDF連携','このページ']
      },
      {
        title: "Version 1.1",
        date: "2021.11.16/17",
        color: "deep-orange lighten-2",
        icon: "mdi-infinity",
        small: true,
        text:
          "Agile Japan 2021でReboot！！",
        features: ['腕が大きくなる機能','カスタム背景機能','etc']
      },
      {
        title: "Future...",
        color: "blue-grey darken-2",
        icon: "mdi-power-plug",
        small: true,
        text:
          "憧れは止められない...",
        features: ['電脳化','量子変換','精神隷属','認証プロキシ対応']
      }
    ]
  })
};
</script>
