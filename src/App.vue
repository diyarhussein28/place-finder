<template>
  <div
    class="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900"
  >
    <h1 class="text-4xl font-semibold mb-6 text-blue-600">Place Finder</h1>

    <div class="relative w-full max-w-xl">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a city, country, or continent..."
        class="w-full px-5 py-3 rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
      />
      <button
        @click="search"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full shadow-md transition"
      >
        🔍
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

const search = () => {
  console.log('Searching for:', searchQuery.value)
}
</script>
