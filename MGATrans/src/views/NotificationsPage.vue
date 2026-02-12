<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="notifications-content">
      <div v-if="notifications.length > 0" class="notifications-list">
        <div v-for="notif in notifications" :key="notif.id" class="notif-item" :class="{ unread: !notif.read }" @click="handleNotifClick(notif)">
          <div class="notif-icon" :class="notif.type">
            <ion-icon :icon="getIcon(notif.type)"></ion-icon>
            <div v-if="!notif.read" class="unread-dot"></div>
          </div>
          <div class="notif-text">
            <h4>{{ notif.title }}</h4>
            <p>{{ notif.message }}</p>
            <span class="notif-time">{{ notif.time }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-notif">
        <ion-icon :icon="notificationsOffOutline"></ion-icon>
        <h3>Aucune notification</h3>
        <p>Vous êtes à jour ! Vos alertes de transfert apparaîtront ici.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, 
  IonTitle, IonContent, IonIcon 
} from '@ionic/vue';
import { 
  chevronBackOutline, checkmarkCircle, alertCircle, 
  informationCircle, notificationsOffOutline 
} from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const notifications = ref([
  { 
    id: '1', title: 'Transfert Validé !', 
    message: 'Votre transfert #TX54321 vers Alibaba Seller a été validé. Le QR Code est disponible.', 
    time: 'Il y a 10 min', type: 'success', read: false, txId: 'TX54321' 
  },
  { 
    id: '2', title: 'Action requise', 
    message: 'Veuillez uploader une pièce d\'identité valide pour votre transfert #TX98765.', 
    time: 'Hier, 15:30', type: 'warning', read: true, txId: 'TX98765' 
  },
  { 
    id: '3', title: 'Bienvenue sur MGATrans', 
    message: 'Votre compte a été créé avec succès. Commencez vos transferts dès maintenant.', 
    time: '2 jours', type: 'info', read: true 
  },
]);

const getIcon = (type: string) => {
  if (type === 'success') return checkmarkCircle;
  if (type === 'warning') return alertCircle;
  return informationCircle;
};

const handleNotifClick = (notif: any) => {
  notif.read = true;
  if (notif.txId) {
    router.push('/transaction/' + notif.txId);
  }
};
</script>

<style scoped>
.notifications-content {
  --background: #f8f9fc;
}

ion-header ion-toolbar {
  --background: white;
  --color: #1e2a4a;
}

.notifications-list {
  padding: 10px 20px;
}

.notif-item {
  background: white;
  border-radius: 18px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  border: 1px solid #edf1f7;
  transition: all 0.3s ease;
}

.notif-item.unread {
  background: white;
  border-left: 4px solid var(--ion-color-primary);
  box-shadow: 0 4px 15px rgba(26, 77, 162, 0.05);
}

.notif-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
  position: relative;
  flex-shrink: 0;
}

.success { background: rgba(45, 211, 111, 0.1); color: #2dd36f; }
.warning { background: rgba(255, 196, 9, 0.1); color: #ffc409; }
.info { background: rgba(26, 77, 162, 0.1); color: var(--ion-color-primary); }

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #eb445a;
  border: 2px solid white;
  border-radius: 50%;
}

.notif-text { flex: 1; }
.notif-text h4 { margin: 0 0 5px; font-size: 15px; font-weight: 700; color: #1e2a4a; }
.notif-text p { margin: 0 0 8px; font-size: 13px; color: #5d6d7e; line-height: 1.4; }
.notif-time { font-size: 11px; color: #b2bec3; font-weight: 600; }

.empty-notif {
  text-align: center;
  padding: 100px 30px;
  color: #8892a0;
}

.empty-notif ion-icon { font-size: 80px; opacity: 0.15; margin-bottom: 20px; }
.empty-notif h3 { font-size: 20px; font-weight: 700; color: #1e2a4a; margin-bottom: 10px; }

@media (prefers-color-scheme: dark) {
  ion-header ion-toolbar { background: #121212; --color: white; }
  .notif-item { background: #1e1e1e; border-color: #2a2a2a; }
  .notif-text h4 { color: white; }
  .unread-dot { border-color: #1e1e1e; }
}
</style>
