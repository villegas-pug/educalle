<template>
  <q-page class="flex flex-center">
    <q-spinner color="primary" size="3em" />
  </q-page>
</template>

<script>
export default {
  name: 'Principal',
  mounted() {
    this.$router.push({ path: '/inicio' })
  }
}
</script>
