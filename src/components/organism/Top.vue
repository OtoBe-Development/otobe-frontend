<template>
  <div>
    <v-card tile flat>
      <v-img class="white--text align-center" height="600px" :src="src">
        <v-container fluid>
          <v-row align="center">
            <!-- カルーセル版はいったんコメントアウト 
            <v-col cols="4">
              <v-row align="center">
                <v-col cols="6">
                  <v-img src="image/trump.gif" />
                </v-col>
                <v-col cols="6">
                  <v-img src="image/normal.gif" />
                </v-col>
              </v-row>
              <v-row />
            </v-col>
            -->
            <v-col cols="12">
              <v-row align="center" justify="center" class="lighten-5">
                <v-card-title class="align-center">
                  <div
                    cols="12"
                    class="display-4"
                    style="text-shadow: 4px  4px 5px #000044,4px  4px 5px #000044,4px -4px 5px #000044,-4px -4px 5px #000044;"
                  >{{$appName}}</div>
                </v-card-title>
              </v-row>
              <v-row align="center" justify="center" class="lighten-5">
                <v-card-title class="align-center">
                  <div
                    cols="12"
                    class="display-1"
                    style="text-shadow: 2px  2px 5px #000044,2px  2px 5px #000044,2px -2px 5px #000044,-2px -2px 5px #000044;"
                  >{{text}}</div>
                </v-card-title>
              </v-row>
            </v-col>
            <!-- カルーセル版はいったんコメントアウト 
            <v-col cols="4">
              <v-row>
                <v-spacer />
                <v-col cols="7">
                  <v-img src="image/presen.gif" contain />
                </v-col>
                <v-spacer />
              </v-row>
              <v-row>
                <v-spacer />
                <v-col cols="7">
                  <v-img src="image/menu.gif" contain />
                </v-col>
                <v-spacer />
              </v-row>
            </v-col>
            -->
          </v-row>
        </v-container>
      </v-img>
    </v-card>

    <!-- カルーセル版はいったんコメントアウト 
    <v-card tile flat>
      <v-img class="white--text align-center" height="600px" :src="src">
        <v-container fluid>
          <v-row align="center">
            <v-col cols="4">
              <v-carousel cycle height="400" hide-delimiter-background>
                <v-carousel-item v-for="(item,i) in items" :key="i">
                  <v-img :src="item.src" contain />
                </v-carousel-item>
              </v-carousel>
            </v-col>
            <v-col cols="4">
              <v-row align="center" justify="center" class="lighten-5">
                <v-card-title class="align-center">
                  <div
                    cols="12"
                    class="display-4"
                    style="text-shadow: 4px  4px 5px #000044,4px  4px 5px #000044,4px -4px 5px #000044,-4px -4px 5px #000044;"
                  >{{$appName}}</div>
                </v-card-title>
              </v-row>
              <v-row align="center" justify="center" class="lighten-5">
                <v-card-title class="align-center">
                  <div
                    cols="12"
                    class="display-1"
                    style="text-shadow: 2px  2px 5px #000044,2px  2px 5px #000044,2px -2px 5px #000044,-2px -2px 5px #000044;"
                  >{{text}}</div>
                </v-card-title>
              </v-row>
            </v-col>
            <v-col cols="4"></v-col>
          </v-row>
        </v-container>
      </v-img>
    </v-card>-->
  </div>
</template>


<script>
export default {
  components: {},
  data: () => ({
    text: "悩めるエンジニアに魂の黎明を",
    src:
      "image/title.jpg",
    items: [
      {
        src: "image/trump.gif"
      },
      {
        src: "image/normal.gif"
      },
      {
        src: "image/presen.gif"
      },
      {
        src: "image/menu.png"
      }
    ]
  })
};
</script>
