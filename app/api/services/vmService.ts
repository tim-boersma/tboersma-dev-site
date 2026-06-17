import { getProxyHttpClient } from '@/api/httpClient';


interface ServiceTextResponse {
  text: string | null;
  error: unknown | null;
}

export const vmService = {
  /**
   * Fetch current VM status
   * @returns {ServiceTextResponse} { text: string | null, error: unknown | null }
   */
  async getStatus(): Promise<ServiceTextResponse> {
    try {
      const proxyHttpClient = getProxyHttpClient();
      const response = await proxyHttpClient.get<string>('/vm/status');
      return {
        text: response.data,
        error: null,
      };
    } catch (error) {
      return {
        text: null,
        error,
      };
    }
  },

  /**
   * Toggle VM state
   * @param {boolean} state - true to turn online, false to turn offline
   * @returns {ServiceTextResponse} { text: string | null, error: unknown | null }
   */
  async toggleVM(state: boolean): Promise<ServiceTextResponse> {
    try {
      const proxyHttpClient = getProxyHttpClient();
      const response = await proxyHttpClient.post<string>('/vm/toggle', { state });
      return {
        text: response.data,
        error: null,
      };
    } catch (error) {
      return {
        text: null,
        error,
      };
    }
  },
};

export default vmService;
