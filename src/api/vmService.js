import httpClient from './httpClient'

/**
 * VM Service - Handles all VM-related API calls
 */

export const vmService = {
  /**
   * Fetch current VM status
   * @returns {Promise} { data: { isOnline: boolean } } or error
   */
  async getStatus() {
    try {
      const response = await httpClient.get('/vm/status')
      return {
        data: response.data,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error,
      }
    }
  },

  /**
   * Toggle VM state
   * @param {boolean} state - true to turn online, false to turn offline
   * @returns {Promise} { data: { isOnline: boolean } } or error
   */
  async toggleVM(state) {
    try {
      const response = await httpClient.post('/vm/toggle', { state })
      return {
        data: response.data,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error,
      }
    }
  },
}

export default vmService
