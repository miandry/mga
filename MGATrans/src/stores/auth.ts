import { defineStore } from 'pinia';
import { ref } from 'vue';
import { API_BASE_URL } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any | null>(null);
    const token = ref<string | null>(null);
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
                console.log('Login successful:', data);
                const userData = data;
                user.value = userData;
                isAuthenticated.value = true;
                localStorage.setItem('user', JSON.stringify(userData));
                if (data.token) {
                    token.value = data.token;
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

    async function register(credentials: { name: string; password: string; field_phone?: string;}) {
        loading.value = true;
        error.value = null;
        try {
            const response = await fetch(`${API_BASE_URL}/api_solutions/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            const data = await response.json();
            console.log('Register response:', data.status);
            if (response.ok && data.status === true) {
                console.log('Registration successful:', data);
                const userData = data;
                user.value = userData;
                isAuthenticated.value = true;
                localStorage.setItem('user', JSON.stringify(userData));
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                return true;
            } else {
                error.value = "Le Nom d'utilisateur existe déja";
                return false;
            }
            
        } catch (err) {
            error.value = 'Une erreur est survenue lors de la connexion';
            console.error('Sign up error:', err);
            return false;
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        user.value = null;
        token.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    function init() {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        if (savedUser) {
            user.value = JSON.parse(savedUser);
            isAuthenticated.value = true;
        }
        if (savedToken) {
            token.value = savedToken;
        }
    }

    return { user, token, isAuthenticated, loading, error, login, register, logout, init };
});
