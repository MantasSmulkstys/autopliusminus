/**
 * API helper functions for making authenticated requests with JWT
 */

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
    return localStorage.getItem('jwt_token');
}

/**
 * Set JWT token in localStorage
 */
export function setToken(token: string): void {
    localStorage.setItem('jwt_token', token);
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
    localStorage.removeItem('jwt_token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Fetch with JWT token
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();
    
    const headers = new Headers(options.headers);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    const token = getToken();
    
    if (token) {
        try {
            await fetchWithAuth('/api/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    removeToken();
    window.location.href = '/';
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<{
    id: number;
    name: string;
    email: string;
    role: string;
    credits: number;
}> {
    const response = await fetchWithAuth('/api/auth/me');
    
    if (!response.ok) {
        if (response.status === 401) {
            removeToken();
            window.location.href = '/login';
        }
        throw new Error('Failed to get user info');
    }
    
    return response.json();
}

