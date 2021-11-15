<template>
  <div>
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list>
        <!-- アバターを選ぶ画面 -->
        <v-list-item link>
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>美少女変換</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link @click.stop="notImplemented()">
          <v-list-item-action>
            <v-icon>mdi-cast-connected</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>動画/音声配信</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- 設定画面 -->
        <v-list-item link @click.stop="notImplemented()">
          <v-list-item-action>
            <v-icon>mdi-wrench</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>個人設定</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar dense app clipped-left>
      <!-- <v-app-bar-nav-icon @click.stop="drawer = !drawer" /> -->
      <v-toolbar-title></v-toolbar-title>
      <img src="logo-small-dark.png" />

      <v-spacer></v-spacer>

      <router-link to="/" style="color:white;text-decoration: none">
        <v-btn color="primary">About</v-btn>
      </router-link>
    </v-app-bar>

    <v-content>
      <v-dialog v-model="dialog" max-width="290">
        <v-card>
          <v-card-title class="headline">未実装です</v-card-title>
          <v-card-text>そのうち作ります…そのうち…</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="dialog = false">ヨシッ！！</v-btn>
            <v-btn color="error" @click="moveLink(`https://github.com/OtoBe-Development/otobe-frontend`)">だが断る</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center" class="ma-0 pa-0">
          <v-col>
            <AvatarList @selected="avatarClicked" />
          </v-col>
        </v-row>
        <v-row class="ma-0 pa-0">
          <v-col cols="6">
            <BackgroundList @selected="backgroundClicked" />
          </v-col>
          <v-col cols="6">
            <v-card class="transparent">
              <v-card-title class="ma-0 pa-0 title">
                <v-icon>mdi-wrench</v-icon>
                <div class="ml-1">設定</div>
              </v-card-title>
              <v-row>
                <v-col>
                  <v-card>
                    <v-card-text>
                      <v-row class="ma-0 pa-0">
                        <v-col class="ma-1 pa-1">
                          <v-text-field v-model="configs.username" label="表示する自分の名前"></v-text-field>
                        </v-col>
                        <v-col class="ma-1 pa-1">
                          <v-select
                            v-model="configs.pcspec.select"
                            :items="configs.pcspec.items"
                            item-text="text"
                            item-value="value"
                            label="PCスペック"
                            return-object
                          ></v-select>
                        </v-col>
                      </v-row>
                      <v-row class="ma-0 pa-0">
                        <v-col class="ma-1 pa-1">
                          <v-text-field v-model="configs.xwindow" label="ウィンドウサイズ-X"></v-text-field>
                        </v-col>
                        <v-col class="ma-1 pa-1">
                          <v-text-field v-model="configs.ywindow" label="ウィンドウサイズ-Y"></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row class="ma-0 pa-0" align="stretch">
                        <v-col class="box ma-2 pa-1 d-flex flex-column">
                          <span class="box-title">美少女でプレゼンする</span>
                          <v-switch v-model="configs.showSourceCamera" label="ラーの鑑(自分も表示)"></v-switch>
                          <v-switch
                            v-model="configs.presentationMode"
                            label="PDF表示"
                            v-on:change="presenChanged"
                          ></v-switch>
                          <v-spacer></v-spacer>
                          <v-btn
                            class="mt-auto ml-auto"
                            v-on:click="launchViewerWindow('camera')"
                            color="primary"
                            x-large
                            dark
                            fab
                          >起動</v-btn>
                        </v-col>
                        <v-col class="box ma-2 pa-1 d-flex flex-column">
                          <span class="box-title">動画を美少女にする</span>
                          <v-switch v-model="configs.showSourceMovie" label="ラーの鑑(元動画も表示)"></v-switch>
                          <v-switch v-model="configs.useSample" label="サンプル動画"></v-switch>
                          <v-btn
                            class="mt-auto ml-auto"
                            v-on:click="launchViewerWindow('movie')"
                            color="primary"
                            x-large
                            dark
                            fab
                          >起動</v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <v-footer app>
      <span>&copy; 2020.04.01</span>
    </v-footer>
  </div>
</template>
<style>
.box {
  position: relative;
  margin: 2em 0;
  padding: 0.5em 1em;
  border: solid 3px #58acfc;
  border-radius: 8px;
}
.box .box-title {
  position: absolute;
  display: inline-block;
  top: -13px;
  left: 10px;
  padding: 0 9px;
  line-height: 1;
  font-size: 19px;
  background-color: #1e1e1e;
  color: #58acfc;
  font-weight: bold;
}
.box p {
  margin: 0;
  padding: 0;
}
.box-custom-avator {
  position: relative;
  margin: 2em 0;
  padding: 0.5em 1em;
  border: solid 3px #fff;
  border-radius: 20px;
  height: 60%;
  width: 100%;
  text-align: center;
  vertical-align: middle;
}
</style>
<script>
import AvatarList from "../organism/AvatarList";
import BackgroundList from "../organism/BackgroundList";

export default {
  components: {
    AvatarList,
    BackgroundList
  },
  created() {
    this.$vuetify.theme.dark = true;
    this.accessPath = this.$route.path.replace("main", "");
  },
  props: {
    source: String
  },
  methods: {
    avatarClicked(avator) {
      this.configs.currentAvatar = avator;
    },
    backgroundClicked(background) {
      this.configs.currentBackground = background;
    },
    launchViewerWindow(source) {
      this.configs.sourceType = source;

      localStorage.setItem("viewer_config", JSON.stringify(this.configs));
      window.open(
        `viewer/`,
        "_blank",
        `width=${
          this.configs.debug ? this.configs.xwindow * 2 : this.configs.xwindow
        },height=${
          this.configs.ywindow
        },top=200,left=200,status=no,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no`
      );
    },
    moveLink(url) {
      window.open(url, "_blank");
    },
    presenChanged() {
      if (this.configs.presentationMode) {
        this.configs.xwindow = window.parent.screen.width;
        this.configs.ywindow = window.parent.screen.height;
      }
    },
    notImplemented() {
      this.dialog = true;
    }
  },
  data: () => ({
    dialog: false,
    drawer: null,
    accessPath: null,
    configs: {
      currentAvatar: null,
      currentBackground: null,
      pcspec: {
        select: { text: "人権PC", value: "middle" },
        items: [
          { text: "非人権PC", value: "low" },
          { text: "人権PC", value: "middle" },
          { text: "上級国民PC", value: "high" }
        ]
      },
      showSourceCamera: true,
      showSourceMovie: true,
      sourceType: "camera",
      username: "名無しさん",
      xwindow: "500",
      ywindow: "400",
      debug: false,
      presentationMode: false
    }
  })
};
</script>
