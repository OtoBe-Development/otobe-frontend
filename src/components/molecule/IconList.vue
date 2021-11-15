<template>
  <v-list dense>
    <v-list-item-group color="primary">
      <v-list-item v-for="item in items" :key="item.icon + item.text">
        <v-list-item-icon>
          <v-icon>{{item.icon}}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{item.text}}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>

<script>
export default {
  components: {},
  props: {
    items: Array
  }
};
</script>
