<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 px-5 py-10">
    <div class="flex flex-col items-center gap-10 w-full max-w-sm bg-white rounded-3xl p-12 shadow-2xl">
      <!-- Large Status Circle -->
      <div class="relative flex items-center justify-center w-52 h-52">
        <svg
          class="status-circle w-full h-full"
          :style="{ '--status-color': statusColor }"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Background circle -->
          <circle cx="50" cy="50" r="48" fill="none" stroke="#e5e7eb" stroke-width="2" />

          <!-- Animated status circle -->
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            :stroke="statusColor"
            stroke-width="3"
            class="animated-circle"
            stroke-linecap="round"
          />

          <!-- Center dot -->
          <circle
            cx="50"
            cy="50"
            r="8"
            :fill="statusColor"
            class="center-dot"
          />
        </svg>

        <!-- Status text overlay -->
        <div class="absolute text-center flex flex-col gap-1">
          <div class="text-2xl font-semibold text-gray-900">{{ statusText }}</div>
          <div v-if="lastPolledAt" class="text-xs text-gray-500">
            Updated {{ formatTime(lastPolledAt) }}
          </div>
        </div>
      </div>

      <!-- Toggle Button -->
      <button
        @click="toggle"
        :disabled="isLoading"
        class="px-10 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span v-if="!isLoading">
          {{ isOnline ? 'Turn Off' : 'Turn On' }}
        </span>
        <span v-else class="inline-flex items-center gap-2">
          <i class="pi pi-spin pi-spinner text-lg"></i>
        </span>
      </button>

      <!-- Error Message -->
      <transition name="slideIn">
        <div v-if="error" class="flex items-center gap-2 w-full px-4 py-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm animate-slideIn">
          <i class="pi pi-exclamation-triangle text-lg flex-shrink-0"></i>
          <span>{{ error }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { useVMControl } from '../composables/useVMControl'

const {
  isOnline,
  isLoading,
  error,
  lastPolledAt,
  statusColor,
  statusText,
  toggle,
} = useVMControl()

const formatTime = (date) => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
/* Keep only the SVG-specific animations and filters */
.animated-circle {
  animation: svgPulse 2s ease-in-out infinite;
  transition: stroke 0.3s ease;
}

.center-dot {
  transition: fill 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.status-circle {
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1));
}

@keyframes svgPulse {
  0%,
  100% {
    stroke-dasharray: 283;
    stroke-dashoffset: 0;
    opacity: 1;
  }
  50% {
    stroke-dasharray: 283;
    stroke-dashoffset: 283;
    opacity: 0.5;
  }
}
</style>
