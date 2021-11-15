<template>
  <div>
    <v-img justify="center" :src="src" @click.stop="dialog = true" style="cursor:pointer"></v-img>
    <v-dialog v-model="dialog" width="70%">
        <img :src="src"/>
    </v-dialog>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    src: String
  },
  data: () => ({
    dialog: false
  })
};
</script>