<template>
  <v-card tile flat class="transparent">
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-card-title>
          <div cols="12" class="display-1">Features</div>
        </v-card-title>
      </v-row>
      <v-row dense justify="center">
        <v-col v-for="edition in editions" :key="edition.name">
          <v-card class="mx-auto my-12" max-width="374">
            <v-card-title class="align-center white--text" v-bind:class="edition.color">
              <v-row justify="center">{{edition.name}}</v-row>
            </v-card-title>

            <v-divider class="mx-4"></v-divider>
            <v-card-title class="white display-1">
              <v-row justify="center">${{edition.price}}</v-row>
            </v-card-title>
            <v-card-subtitle class="white">
              <v-row justify="center">per Person</v-row>
            </v-card-subtitle>

            <v-divider class="mx-4"></v-divider>
            <v-card-text class="white">
              <v-row justify="center">
                <IconList v-bind:items="edition.functions" />
              </v-row>
            </v-card-text>
            <v-divider class="mx-4"></v-divider>

            <v-card-actions class="white align-center">
              <v-row justify="center">
                <v-btn color="primary">Try Now</v-btn>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>


<script>
import IconList from "../molecule/IconList";

export default {
  components: {
    IconList
  },
  data: () => ({
    editions: [
      {
        color: "indigo darken-4",
        name: "Community Edition",
        price: "0.00",
        functions: [
          {
            icon: "mdi-check",
            text: "aaa"
          }
        ]
      },
      {
        color: "blue-grey darken-3",
        name: "Standard Edition",
        price: "0.00",
        functions: [
          {
            icon: "mdi-check",
            text: "aaa"
          },
          {
            icon: "mdi-check",
            text: "bbb"
          }
        ]
      },
      {
        color: "grey darken-4",
        name: "Ultimate Edition",
        price: "0.00",
        functions: [
          {
            icon: "mdi-check",
            text: "aaa"
          },
          {
            icon: "mdi-check",
            text: "bbb"
          },
          {
            icon: "mdi-check",
            text: "ccc"
          }
        ]
      }
    ]
  })
};
</script>
