export const environment = {
  production: true,
  apiUrl: typeof window !== 'undefined' ? window.location.origin + '/api/v1' : '${API_URL}/api/v1'
};
