<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="profile-content">
      <div class="profile-header">
        <div class="avatar-big">JD</div>
        <h2>{{ authStore.user?.name || 'John Doe' }}</h2>
        <p>{{ authStore.user?.email || 'john.doe@example.com' }}</p>
        <ion-button fill="outline" color="primary" class="edit-btn">Modifier le profil</ion-button>
      </div>

      <div class="settings-section">
        <label class="section-label">Sécurité & Compte</label>
        <ion-list lines="none" class="settings-list">
          <ion-item button>
            <ion-icon slot="start" :icon="lockClosedOutline" class="sec-icon"></ion-icon>
            <ion-label>Changer le mot de passe</ion-label>
          </ion-item>
          <ion-item button>
            <ion-icon slot="start" :icon="shieldCheckmarkOutline" class="sec-icon"></ion-icon>
            <ion-label>Authentification à deux facteurs</ion-label>
            <ion-toggle slot="end" :checked="true"></ion-toggle>
          </ion-item>
          <ion-item button>
            <ion-icon slot="start" :icon="fingerPrintOutline" class="sec-icon"></ion-icon>
            <ion-label>Face ID / Empreinte</ion-label>
            <ion-toggle slot="end" :checked="true"></ion-toggle>
          </ion-item>
        </ion-list>

        <label class="section-label">Préférences</label>
        <ion-list lines="none" class="settings-list">
          <ion-item button>
            <ion-icon slot="start" :icon="notificationsOutline" class="pref-icon"></ion-icon>
            <ion-label>Notifications Push</ion-label>
            <ion-toggle slot="end" :checked="true"></ion-toggle>
          </ion-item>
          <ion-item button>
            <ion-icon slot="start" :icon="moonOutline" class="pref-icon"></ion-icon>
            <ion-label>Mode Sombre</ion-label>
            <ion-toggle slot="end"></ion-toggle>
          </ion-item>
        </ion-list>

        <label class="section-label">Support</label>
        <ion-list lines="none" class="settings-list">
          <ion-item button>
            <ion-icon slot="start" :icon="helpCircleOutline" class="sup-icon"></ion-icon>
            <ion-label>Centre d'aide / FAQ</ion-label>
          </ion-item>
          <ion-item button>
            <ion-icon slot="start" :icon="chatbubblesOutline" class="sup-icon"></ion-icon>
            <ion-label>Contacter le support</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <div class="logout-section">
        <ion-button expand="block" fill="clear" color="danger" @click="handleLogout">
          <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
          Déconnexion
        </ion-button>
        <p class="version">Version 1.0.42 (Beta)</p>
      </div>

      <div style="height: 100px;"></div>
    </ion-content>

    <BottomNav active="profile" />
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonIcon, IonList, IonItem, IonLabel, IonToggle 
} from '@ionic/vue';
import { 
  lockClosedOutline, shieldCheckmarkOutline, fingerPrintOutline, 
  notificationsOutline, moonOutline, helpCircleOutline, 
  chatbubblesOutline, logOutOutline 
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BottomNav from '@/components/common/BottomNav.vue';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/auth/login');
};
</script>

<style scoped>
.profile-content {
  --background: #f8f9fc;
}

.profile-header {
  text-align: center;
  padding: 40px 20px 30px;
  background: white;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
}

.avatar-big {
  width: 100px;
  height: 100px;
  background: var(--ion-color-primary);
  color: white;
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  margin: 0 auto 20px;
  box-shadow: 0 10px 30px rgba(26, 77, 162, 0.2);
}

.profile-header h2 { margin: 0 0 5px; font-size: 22px; font-weight: 800; color: #1e2a4a; }
.profile-header p { margin: 0 0 20px; font-size: 14px; color: #8892a0; }

.edit-btn { --border-radius: 12px; height: 40px; font-weight: 600; text-transform: none; }

.settings-section { padding: 25px 20px; }

.section-label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: #8892a0;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.settings-list {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  padding: 5px 0;
}

ion-item { --background: transparent; margin-bottom: 5px; }

.sec-icon { color: #5d6d7e; }
.pref-icon { color: #5260ff; }
.sup-icon { color: #fbb03b; }

.logout-section { text-align: center; padding: 0 20px; }
.version { font-size: 12px; color: #b2bec3; margin-top: 10px; }

@media (prefers-color-scheme: dark) {
  .profile-content { --background: #121212; }
  .profile-header, .settings-list { background: #1e1e1e; }
  .profile-header h2, ion-label { color: white; }
}
</style>
