import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loginUser, registerUser } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any | null>(null);
    const isAuthenticated = ref(false);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function login(credentials: { name: string; password: string }) {
        loading.value = true;
        error.value = null;
        try {
            const response = await loginUser(credentials);
            if (response.data.status) {
                const userData = response.data;
                user.value = userData;
                isAuthenticated.value = true;
                localStorage.setItem('user', JSON.stringify(userData));
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                return true;
            } else {
                error.value = 'Identifiants invalides';
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
            const response = await registerUser(credentials);
            if (response.data.status) {
                const userData = response.data;
                user.value = userData;
                isAuthenticated.value = true;
                localStorage.setItem('user', JSON.stringify(userData));
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
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

    return { user, isAuthenticated, loading, error, login, register, logout, init };
});
