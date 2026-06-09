import { ref, computed, onMounted, onUnmounted } from 'vue'
import vmService from '../api/vmService'

/**
 * useVMControl - Composable for managing VM control state and polling
 */
export function useVMControl() {
  const isOnline = ref(null) // null = loading, true = online, false = offline
  const isLoading = ref(false)
  const error = ref(null)
  const lastPolledAt = ref(null)

  // Polling state
  let pollingInterval = null
  let fastPollingTimeout = null
  let isNormalPolling = true
  let abortController = null

  const NORMAL_POLL_INTERVAL = 10000 // 10 seconds
  const FAST_POLL_INTERVAL = 1000 // 1 second
  const FAST_POLLING_DURATION = 30000 // 30 seconds

  /**
   * Fetch VM status from backend
   */
  const fetchStatus = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Create new abort controller for this request
      abortController = new AbortController()

      const { data, error: apiError } = await vmService.getStatus()

      if (apiError) {
        error.value = apiError.message
        console.error('Failed to fetch VM status:', apiError)
      } else if (data) {
        isOnline.value = data.isOnline
        lastPolledAt.value = new Date()
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle VM state (on/off)
   */
  const toggle = async () => {
    if (isLoading.value) return

    try {
      isLoading.value = true
      error.value = null

      const newState = !isOnline.value

      const { data, error: apiError } = await vmService.toggleVM(newState)

      if (apiError) {
        error.value = apiError.message
        console.error('Failed to toggle VM:', apiError)
      } else if (data) {
        isOnline.value = data.isOnline
        lastPolledAt.value = new Date()

        // Start fast polling after toggle
        startFastPolling()
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Start normal polling (every 10 seconds)
   */
  const startNormalPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval)

    isNormalPolling = true

    // Poll immediately, then set up interval
    fetchStatus()

    pollingInterval = setInterval(() => {
      if (isNormalPolling) {
        fetchStatus()
      }
    }, NORMAL_POLL_INTERVAL)
  }

  /**
   * Start fast polling (every 1 second for 30 seconds, then back to normal)
   */
  const startFastPolling = () => {
    isNormalPolling = false

    // Clear existing fast polling timeout
    if (fastPollingTimeout) clearTimeout(fastPollingTimeout)

    // Poll immediately
    fetchStatus()

    // Set up fast interval
    if (pollingInterval) clearInterval(pollingInterval)

    pollingInterval = setInterval(() => {
      fetchStatus()
    }, FAST_POLL_INTERVAL)

    // After 30 seconds, return to normal polling
    fastPollingTimeout = setTimeout(() => {
      startNormalPolling()
    }, FAST_POLLING_DURATION)
  }

  /**
   * Stop all polling
   */
  const stopPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval)
    if (fastPollingTimeout) clearTimeout(fastPollingTimeout)
    if (abortController) abortController.abort()
    isNormalPolling = false
  }

  /**
   * Computed status color
   */
  const statusColor = computed(() => {
    if (isOnline.value === null) return '#888888' // gray = loading
    if (isOnline.value) return '#22c55e' // green = online
    return '#ef4444' // red = offline
  })

  /**
   * Computed status text
   */
  const statusText = computed(() => {
    if (isOnline.value === null) return 'Loading...'
    if (isOnline.value) return 'Online'
    return 'Offline'
  })

  // Lifecycle hooks
  onMounted(() => {
    startNormalPolling()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    // State
    isOnline,
    isLoading,
    error,
    lastPolledAt,
    statusColor,
    statusText,

    // Methods
    fetchStatus,
    toggle,
    startNormalPolling,
    startFastPolling,
    stopPolling,
  }
}
