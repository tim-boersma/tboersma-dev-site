<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { useToggleVMMutation, useVMStatusQuery } from '@/api/hooks/vmQueries';
import { createPollingController } from '@/composables/vmPolling';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const lastPolledAt = ref<Date | null>(null);
const pollingController = createPollingController();

const { data: status, isLoading: isStatusLoading, error: statusError, refetch: refetchStatus } = useVMStatusQuery();
const { mutateAsync: toggleVM, isLoading: isToggleLoading, error: toggleError } = useToggleVMMutation();

const isOnline = computed(() => {
  if (!status.value) {
    return null;
  }

  if (typeof status.value === 'string') {
    const normalized = status.value.toLowerCase();
    if (normalized.includes('running') || normalized.includes('online') || normalized === 'on') {
      return true;
    }

    if (normalized.includes('stopped') || normalized.includes('offline') || normalized === 'off') {
      return false;
    }
  }

  return null;
});

const isLoading = computed(() => isStatusLoading.value || isToggleLoading.value);

const error = computed(() => {
  if (statusError.value)
    return (statusError.value as any).message || 'Failed to fetch status';
  if (toggleError.value) return (toggleError.value as any).message || 'Failed to toggle VM';
  return null;
});

const statusColor = computed(() => {
  if (isOnline.value === null) return '#888888'; // gray = loading
  if (isOnline.value) return '#22c55e'; // green = online
  return '#ef4444'; // red = offline
});

const pollingColor = computed(() => {
  if (isLoading.value || isOnline.value === null) return '#888888'; // gray = loading
  if (isOnline.value) return '#22c55e'; // green = online
  return '#ef4444'; // red = offline
});

const statusText = computed(() => {
  if (isOnline.value === null) return 'Loading...';
  if (isOnline.value) return 'Online';
  return 'Offline';
});

const refreshText = computed(() => {
  if (isLoading.value) return 'Refreshing...';
  return 'Refresh';
});

const statusSeverity = computed<'success' | 'danger' | 'secondary'>(() => {
  if (isToggleLoading.value || isOnline.value === null) {
    return 'secondary';
  }

  return isOnline.value ? 'success' : 'danger';
});

const statusIcon = computed(() => {
  if (isLoading.value || isOnline.value === null) {
    return 'pi pi-sync';
  }

  return isOnline.value ? 'pi pi-check-circle' : 'pi pi-pause-circle';
});

const toggleLabel = computed(() => {
  if (isToggleLoading.value) {
    return 'Applying...';
  }

  return isOnline.value ? 'Power Off VM' : 'Power On VM';
});

const toggle = async (): Promise<void> => {
  try {
    const newState = !(isOnline.value ?? false);
    await toggleVM(newState);
    lastPolledAt.value = new Date();
    pollingController.startFastPolling(() => refetchStatus());
  } catch (err) {
    console.error('Failed to toggle VM:', err);
  }
};

const handlePoll = () => {
  refetchStatus();
  lastPolledAt.value = new Date();
};

onMounted(() => {
  pollingController.startNormalPolling(handlePoll);
});

onUnmounted(() => {
  pollingController.stopPolling();
});

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};
</script>

<template>
  <div class="min-h-screen w-full bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
    <Card class="w-full max-w-5xl">
      <template #content>
        <div class="space-y-6">
          <!-- Header -->
          <div class="space-y-2 pb-4 border-b border-surface-200 dark:border-surface-700">
            <p class="text-xs uppercase tracking-widest text-emerald-400">Plex Infrastructure</p>
            <h1 class="text-3xl font-bold sm:text-4xl">Virtual Machine Control</h1>
            <p class="text-sm text-surface-600 dark:text-surface-400">
              Monitor live VM state and trigger power actions from a single control panel.
            </p>
          </div>

          <!-- Main Content: Flex Layout -->
          <div class="flex flex-col gap-8 lg:flex-row lg:items-center">
            <!-- Left Section: Controls -->
            <section class="space-y-6 flex-1">
              <!-- Status Display -->
              <div class="flex items-center gap-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-4">
                <i :class="[statusIcon, isLoading ? 'pi-spin' : '', 'text-2xl text-primary']" :style="{ color: pollingColor }" />
                <div class="flex flex-col gap-1.5">
                  <Tag :severity="statusSeverity" :value="statusText" />
                  <span class="text-xs text-surface-500">
                    {{ lastPolledAt ? `Last updated ${formatTime(lastPolledAt)}` : 'Waiting for first status poll' }}
                  </span>
                </div>
              </div>

              <Divider />

              <!-- Action Buttons -->
              <div class="flex flex-col gap-3 sm:flex-row">
                <Button
                  :label="toggleLabel"
                  :loading="isToggleLoading"
                  :disabled="isToggleLoading"
                  :severity="isOnline ? 'danger' : 'success'"
                  @click="toggle"
                  class="flex-1"
                />
                <Button
                  :label="refreshText"
                  icon="pi pi-refresh"
                  outlined
                  :disabled="isLoading"
                  @click="handlePoll"
                  class="flex-1"
                />
              </div>

              <!-- Error Message -->
              <Message v-if="error" severity="error" :closable="false" class="w-full">
                {{ error }}
              </Message>
            </section>

            <!-- Right Section: Status Ring Visualization -->
            <section class="flex items-center justify-center flex-1">
              <div class="relative grid h-72 w-72 place-items-center rounded-full border border-surface-300 dark:border-surface-600 bg-surface-100 dark:bg-surface-800 shadow-md">
                <svg class="status-circle h-60 w-60" :style="{ '--status-color': statusColor }" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(148,163,184,0.28)" stroke-width="4" />
                  <circle cx="50" cy="50" r="45" fill="none" :stroke="statusColor" stroke-width="5" class="animated-circle" stroke-linecap="round" />
                  <circle cx="50" cy="50" r="7" :fill="statusColor" class="center-dot" />
                </svg>
                <div class="absolute grid place-items-center gap-2 text-center">
                  <!-- <ProgressSpinner
                    v-if="isLoading"
                    style="width: 2rem; height: 2rem"
                    strokeWidth="8"
                    fill="transparent"
                    animationDuration="1s"
                  /> -->
                  <span class="text-lg font-semibold">{{ statusText }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.animated-circle {
  animation: svgPulse 3s ease-in-out infinite;
  transition: stroke 0.3s ease;
}

.center-dot {
  transition: fill 0.3s ease;
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--status-color) 70%, transparent));
}

.status-circle {
  filter: drop-shadow(0 0 24px color-mix(in srgb, var(--status-color) 35%, transparent));
}

@keyframes svgPulse {
  0%,
  100% {
    stroke-dasharray: 283;
    stroke-dashoffset: 0;
    opacity: 0.9;
  }

  50% {
    stroke-dasharray: 283;
    stroke-dashoffset: 94;
    opacity: 0.55;
  }
}
</style>
