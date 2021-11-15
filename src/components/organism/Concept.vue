<template>
  <v-card tile flat class="transparent">
    <v-container fluid>
      <v-row dense justify="center">
        <!-- <v-row dense justify="space-around"> -->
        <v-col cols="6">
          <v-card tile flat>
            <v-img justify="center" max-width="800px" src="image/pexels-lennart-wittstock-316778.jpg"></v-img>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card tile flat class="transparent">
            <v-card-text>
              <!-- <div>Word of the Day</div> -->
              <p class="display-1 text--primary">Background Story</p>
              <p>魂の黎明</p>
              <div class="text--primary">
                <ul>
                  <li>働き方改革の最前線を行く某社では、テレワークやリモートワークの導入が順調に進んでいるように見えた。</li>
                  <ul>
                    <li>しかし、一部の探窟家(Ossan)から「何か違う」「生産性が思うように上がらない」との声が多数上げられた。</li>
                    <li>曰く「これは本当の自分ではない」「私はこのような汚い中年ではない」というのである。</li>
                  </ul>
                  <li>詳しく調査したところ、彼らの主張は正しい事が判明した。</li>
                  <ul>
                    <li>彼らの真実の姿は、美少女なのだ。</li>
                    <li>魂レベルで見たとき、まごうことなき美少女であり、物理的な外見は真実の姿ではないのだ。</li>
                  </ul>
                  <li>心ある祈り手数人が、このバグを修正するべく、寝食と休日を削り、研究開発に明け暮れた…。</li>
                  <ul>
                    <li>結果、ここに彼らを救うためのソリューションを提供できるに至った。</li>
                  </ul>
                  <li>名を 「OtoBe（Ossan to Beauty）」 という。</li>
                  <li>世の中すべてのOssanに魂の黎明が訪れることを願ってやまない。</li>
                  <li>あなたたちの仕事に、溢れんばかりの呪いと祝福を・・・</li>
                </ul>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="deep-purple accent-4">
                <a :href="search_link">Learn More Scaled Meteo Fall</a>
              </v-btn>
            </v-card-actions>
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
    search_link: "https://hogepiyohoo.hatenablog.com/entry/2019/07/07/003625",
    src:
      "https://image.shutterstock.com/z/stock-vector-vr-headset-holographic-projection-virtual-reality-glasses-helmet-low-poly-wire-outline-geometric-1240225933.jpg"
  })
};
</script>
