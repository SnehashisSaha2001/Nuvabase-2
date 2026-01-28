/**
 * Nuvabase API Service
 * Standardized fetch wrapper with automatic JWT injection.
 */

export const api = {
    baseUrl: '/api', // Standard path for NovaBase Engine

    async request(path, options = {}) {
        const token = localStorage.getItem('nuvabase_token');
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
            
            if (response.status === 401) {
                // Force logout on session expiry
                localStorage.removeItem('nuvabase_token');
                window.location.href = 'index.html';
                throw new Error('Session Expired');
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Platform request failed');
            }
            
            return data;
        } catch (error) {
            console.error(`[API ERROR] ${path}:`, error);
            throw error;
        }
    },

    get(path) { return this.request(path, { method: 'GET' }); },
    post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); },
    patch(path, body) { return this.request(path, { method: 'PATCH', body: JSON.stringify(body) }); },
    delete(path) { return this.request(path, { method: 'DELETE' }); }
};