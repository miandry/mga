import { defineStore } from 'pinia';
import { ref } from 'vue';
import { API_BASE_URL } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any | null>(null);
    const isAuthenticated = ref(false);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function login(credentials: { name: string; password: string }) {
        loading.value = true;
        error.value = null;
        try {
            const response = await fetch(`${API_BASE_URL}/api_solutions/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok && data.status) {
                const userData = data.data;
                user.value = userData;
                isAuthenticated.value = true;
                localStorage.setItem('user', JSON.stringify(userData));
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                return true;
            } else {
                error.value = data.error || data.message || 'Identifiants invalides';
                return false;
            }
        } catch (err) {
            error.value = 'Une erreur est survenue lors de la connexion';
            console.error('Login error:', err);
            return false;
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        user.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    function init() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            user.value = JSON.parse(savedUser);
            isAuthenticated.value = true;
        }
    }

    return { user, isAuthenticated, loading, error, login, logout, init };
});
