<template>
  <v-card tile flat class="transparent">
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-card-title class="align-center">
          <div cols="12" class="display-1">Our Awesome Team feat. Agile 2021</div>
        </v-card-title>
      </v-row>
      <v-row align="center" justify="center">
        <v-card-subtitle class="align-center">
          <div cols="12">イカれたメンバーを紹介するぜ!</div>
        </v-card-subtitle>
      </v-row>
      <v-row dense justify="center" align="stretch">
        <v-col v-for="card in cards" :key="card.title" :cols="card.flex">
          <Lord v-bind:card="card" />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import Lord from "../molecule/Lord";

export default {
  components: {
    Lord
  },
  data: () => ({
    cards: [
      {
        name: "あさお",
        title: "凶血卿 / 連日白昼夢のカフェイントリッパー",
        role: "[前説/〆説担当]",
        comment: "ｺﾞﾘｺﾞﾘの品質保証部門から異動してきたチームのザ・新参者",
        src: "team/asao.jpg",
        flex: 2
      },
      {
        name: "sakoko",
        title: "幻影卿 / ネットの妖精さここ",
        role: "[ドライバー]",
        comment: "スクラムが好き。最近はVRやメタバース？に興味アリ",
        src: "team/sakoko.png",
        flex: 2
      },
      {
        name: "h-kob",
        title: "流星卿 / ｽｹｰﾙﾄﾞﾒﾃｵﾌｫｰﾙ(作者)",
        role: "[主ナビゲーター]",
        comment:
          "コーディングしたい派。PPTとかExcelはもうやじゃ…",
        src: "team/h-kob.png",
        flex: 2
      },
      {
        name: "はしの",
        title: "豪酒卿 / 飲めば飲むほど冴え渡るアル中エンジニア",
        role: "[副ナビゲーター]",
        comment: "アジャイル4年生。酒のつまみにキャリアについて考えるこの頃",
        src: "team/hashino.jpg",
        flex: 2
      },
    ]
  })
};
</script>
