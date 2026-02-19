<template>
  <ion-page>
    <ion-content class="auth-content">
      <div class="auth-container">
        <!-- Logo & Brand -->
        <div class="logo-section">
          <div class="logo-wrapper">
            <ion-icon :icon="swapHorizontalOutline" class="main-logo"></ion-icon>
          </div>
          <h1>MGATrans</h1>
          <p>Transfert d'argent Madagascar - Chine</p>
        </div>

        <!-- Auth Forms -->
        <div class="form-section">
          <ion-segment v-model="authMode" mode="ios">
            <ion-segment-button value="login">
              <ion-label>Connexion</ion-label>
            </ion-segment-button>
            <ion-segment-button value="register">
              <ion-label>Inscription</ion-label>
            </ion-segment-button>
          </ion-segment>

          <div v-if="authMode === 'login'" class="form-fade-in">
            <ion-list lines="none">
              <ion-item class="custom-input">
                <ion-icon slot="start" :icon="personOutline"></ion-icon>
                <ion-input type="text" label-placement="floating" label="Nom d'utilisateur" placeholder="votre nom"
                  v-model="loginName"></ion-input>
              </ion-item>
              <ion-item class="custom-input">
                <ion-icon slot="start" :icon="lockClosedOutline"></ion-icon>
                <ion-input type="password" label-placement="floating" label="Mot de passe" placeholder="••••••••"
                  v-model="loginPassword"></ion-input>
              </ion-item>
            </ion-list>

            <div v-if="authStore.error && authMode === 'login'" class="error-msg">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              {{ authStore.error }}
            </div>

            <ion-button expand="block" class="main-btn" @click="handleLogin" :disabled="authStore.loading">
              <ion-spinner v-if="authStore.loading" name="crescent"></ion-spinner>
              <span v-else>Se connecter</span>
            </ion-button>
            <div class="form-footer">
              <a href="#">Mot de passe oublié ?</a>
            </div>
          </div>

          <div v-else class="form-fade-in">
            <ion-list lines="none">
              <ion-item class="custom-input">
                <ion-icon slot="start" :icon="personOutline"></ion-icon>
                <ion-input label-placement="floating" label="Nom d'utilisateur" placeholder="Jean Dupont"
                  v-model="registerForm.name"></ion-input>
              </ion-item>
              <ion-item class="custom-input hidden">
                <ion-icon slot="start" :icon="mailOutline"></ion-icon>
                <ion-input label-placement="floating" label="Email" placeholder="votre@email.com"></ion-input>
              </ion-item>
              <ion-item class="custom-input">
                <ion-icon slot="start" :icon="callOutline"></ion-icon>
                <ion-input label-placement="floating" label="Téléphone" placeholder="+261 ..."
                  v-model="registerForm.field_phone"></ion-input>
              </ion-item>
              <ion-item class="custom-input">
                <ion-icon slot="start" :icon="lockClosedOutline"></ion-icon>
                <ion-input type="password" label-placement="floating" label="Mot de passe" placeholder="••••••••"
                  v-model="registerForm.pass"></ion-input>
              </ion-item>
            </ion-list>

            <div v-if="authStore.error && authMode === 'register'" class="error-msg">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              {{ authStore.error }}
            </div>

            <p class="tos-text">
              En vous inscrivant, vous acceptez nos <a href="#">Conditions d'Utilisation</a>.
            </p>
            <ion-button expand="block" class="main-btn" color="secondary" @click="handleRegister">
              Créer mon compte
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner
} from '@ionic/vue';
import {
  swapHorizontalOutline,
  mailOutline,
  lockClosedOutline,
  personOutline,
  callOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authMode = ref('login');
const router = useRouter();
const authStore = useAuthStore();

const loginName = ref('');
const loginPassword = ref('');

const registerForm = reactive({
  name: '',
  pass: '',
  field_phone: ''
})

const handleLogin = async () => {
  if (!loginName.value || !loginPassword.value) {
    authStore.error = 'Veuillez remplir tous les champs';
    return;
  }

  const success = await authStore.login({
    name: loginName.value,
    password: loginPassword.value
  });

  if (success) {
    router.push('/dashboard');
  }
};

const handleRegister = async () => {
  if (!registerForm.name || !registerForm.pass) {
    authStore.error = 'Veuillez remplir tous les champs requis';
    return;
  }

  const success = await authStore.register({
    name: registerForm.name,
    password: registerForm.pass,
    field_phone: registerForm.field_phone,
  });

  if (success) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.auth-content {
  --background: linear-gradient(135deg, #1a4da2 0%, #0d2a5a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
}

.logo-section {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.logo-wrapper {
  background: rgba(255, 255, 255, 0.1);
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.main-logo {
  font-size: 40px;
  color: var(--ion-color-secondary);
}

.logo-section h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 5px;
  letter-spacing: 1px;
}

.logo-section p {
  opacity: 0.8;
  font-size: 14px;
}

.form-section {
  background: white;
  padding: 30px 25px;
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

ion-segment {
  margin-bottom: 25px;
  --background: #f4f5f8;
}

.custom-input {
  --background: #f9f9f9;
  --border-radius: 12px;
  margin-bottom: 15px;
  --padding-start: 15px;
  border: 1px solid #eee;
  transition: all 0.3s ease;
}

.custom-input:focus-within {
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 2px rgba(26, 77, 162, 0.1);
}

.custom-input ion-icon {
  color: #999;
  margin-right: 10px;
}

.main-btn {
  --border-radius: 12px;
  --padding-top: 15px;
  --padding-bottom: 15px;
  font-weight: 600;
  margin-top: 25px;
  height: 56px;
  font-size: 16px;
}

.form-footer {
  text-align: center;
  margin-top: 15px;
}

.form-footer a {
  text-decoration: none;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.tos-text {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-top: 20px;
}

.tos-text a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 600;
}

.form-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-msg {
  background: rgba(235, 68, 90, 0.1);
  color: #eb445a;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  animation: fadeIn 0.3s ease-out;
}

.error-msg ion-icon {
  font-size: 18px;
  margin-right: 8px;
}

@media (prefers-color-scheme: dark) {
  .form-section {
    background: #1e1e1e;
  }

  .custom-input {
    --background: #2a2a2a;
    border-color: #333;
  }

  .logo-section p {
    color: #ccc;
  }
}
</style>
