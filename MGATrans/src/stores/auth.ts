import { defineStore } from 'pinia';
import { ref } from 'vue';
import { API_BASE_URL } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any | null>(null);
    const roles = ref<string[]>([]);
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
                // Set roles ici
                setRoles(userData);

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
                // Set roles ici
                setRoles(userData);
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

    // Computed pratique pour vérifier un rôle
    const hasRole = (role: string) => {
        return roles.value.includes(role);
    };

    function setRoles(userData: any) {
        if (userData?.data?.roles && Array.isArray(userData.data.roles)) {
            roles.value = userData.data.roles;
        } else {
            roles.value = ['authenticated_user'];
        }
    }

    function init() {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            user.value = parsedUser;
            isAuthenticated.value = true;
            // Important : restaurer les rôles au refresh
            setRoles(parsedUser);
        }
        if (savedToken) {
            token.value = savedToken;
        }
    }

    return { user, token, isAuthenticated, loading, error, login, register, logout, init, hasRole, roles};
});
