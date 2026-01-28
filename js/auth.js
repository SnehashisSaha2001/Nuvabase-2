/**
 * Nuvabase Auth Engine
 * Logic for sessions and identity.
 */

export const auth = {
    async login(email, password) {
        // Mocking for frontend proof-of-concept
        if (email === 'admin@example.com' && password === 'password') {
            const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
            const mockUser = { id: 'u-1', email, full_name: 'Principal Admin', role: 'owner' };
            
            localStorage.setItem('nuvabase_token', mockToken);
            localStorage.setItem('nuvabase_user', JSON.stringify(mockUser));
            return true;
        }
        throw new Error('Invalid email or password. Use admin@example.com / password');
    },

    logout() {
        localStorage.removeItem('nuvabase_token');
        localStorage.removeItem('nuvabase_user');
        window.location.href = 'index.html';
    },

    isAuthenticated() {
        return !!localStorage.getItem('nuvabase_token');
    },

    getUser() {
        return JSON.parse(localStorage.getItem('nuvabase_user') || '{}');
    }
};