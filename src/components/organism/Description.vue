<template>
  <v-card tile flat class="transparent">
    <v-container fluid>
      <v-row dense justify="center">
        <!-- <v-row dense justify="space-around"> -->
        <v-col cols="6">
          <v-card tile flat class="transparent">
            <v-card-text>
              <!-- <div>Word of the Day</div> -->
              <p class="display-1 text--primary">What's {{$appName}}?</p>
              <p>O(ssan) to Be(auty)</p>
              <div class="text--primary">
                <ul>
                  <li>
                    <strong>「Otobe」</strong> は映像を2.5次元のキャラクタに変換する、いわゆるバ美肉の実装です。
                  </li>
                  <li>
                    カメラとブラウザがあれば、あなたもすぐにバーチャル美しい肉体になることができます。
                  </li>
                  <li>
                    PDF連携でキュートなプレゼンを実施することはもちろん、既存の動画を美しくすることも可能です。
                  </li>
                </ul>
              </div>
            </v-card-text>
            <v-card-actions>
              幸せな働き方の実現のため、どうぞ奮ってご活用ください！
              <v-btn text color="deep-purple accent-4">
                <a :href="search_link">「{{search_word}}」ってなに？</a>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card tile flat>
            <!--v-img justify="center" max-width="800px" :src="src"></v-img-->
            <v-img src="image/otobe_animation.gif" contain />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  components: {},
  props: {},
  data: () => ({
    search_word: "バ美肉",
    search_link: "https://www.google.com/search?q=バ美肉",
    src:
      "image/title.jpg"
  })
};
</script>
