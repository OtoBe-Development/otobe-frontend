<template>
  <v-card class="mx-auto my-12" max-width="374">
    <v-card-title></v-card-title>

    <v-layout justify-center>
      <v-avatar justify="center" size="100px">
        <img :src="card.src" />
      </v-avatar>
    </v-layout>
    <v-card-title v-text="card.name"></v-card-title>
    <v-card-subtitle class="text--primary" v-text="card.title"></v-card-subtitle>
    <v-card-text>
      <div class="text--primary" v-text="card.role"></div>
      <div v-text="card.comment" style="height:100px" ></div>
    </v-card-text>

    <v-spacer></v-spacer>
    <v-divider class="mx-4"></v-divider>
    <v-spacer></v-spacer>
    <v-card-actions>
      <v-btn icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-bookmark</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    card: {
      src: String,
      name: String,
      title: String,
      role: String,
      comment: String
    }
  }
};
</script>
