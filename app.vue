<script setup lang="ts">
const { data, error } = await useFetch("/api/aircraft", {
  query: { latitude: 54, longitude: 24 },
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col items-center gap-4 p-4">
    <Button>Fetch data</Button>
    {{ data }}
    {{ error?.statusMessage }}
  </div>
</template>
