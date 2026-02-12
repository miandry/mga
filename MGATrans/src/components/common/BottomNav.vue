<template>
  <ion-footer class="ion-no-border">
    <ion-toolbar class="bottom-nav">
      <div class="nav-items">
        <div 
          class="nav-item" 
          :class="{ active: active === 'dashboard' }"
          @click="navigateTo('/dashboard')"
        >
          <ion-icon :icon="active === 'dashboard' ? home : homeOutline"></ion-icon>
          <span>Accueil</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: active === 'transactions' }"
          @click="navigateTo('/transactions')"
        >
          <ion-icon :icon="active === 'transactions' ? list : listOutline"></ion-icon>
          <span>Historique</span>
        </div>
        <div 
          class="nav-item central"
          @click="navigateTo('/transfer')"
        >
          <div class="plus-btn">
            <ion-icon :icon="add"></ion-icon>
          </div>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: active === 'notifications' }"
          @click="navigateTo('/notifications')"
        >
          <ion-icon :icon="active === 'notifications' ? notifications : notificationsOutline"></ion-icon>
          <span>Alertes</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: active === 'profile' }"
          @click="navigateTo('/profile')"
        >
          <ion-icon :icon="active === 'profile' ? person : personOutline"></ion-icon>
          <span>Profil</span>
        </div>
      </div>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import { IonFooter, IonToolbar, IonIcon } from '@ionic/vue';
import { 
  home, homeOutline, 
  list, listOutline, 
  notifications, notificationsOutline, 
  person, personOutline,
  add
} from 'ionicons/icons';
import { useRouter } from 'vue-router';

defineProps<{
  active: string;
}>();

const router = useRouter();

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<style scoped>
.bottom-nav {
  --background: white;
  padding: 10px 0;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.05);
}

.nav-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.nav-item ion-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-item.active {
  color: var(--ion-color-primary);
}

.central {
  position: relative;
  top: -20px;
}

.plus-btn {
  background: var(--ion-color-primary);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(26, 77, 162, 0.3);
  transform: rotate(45deg);
}

.plus-btn ion-icon {
  font-size: 30px;
  transform: rotate(-45deg);
  margin-bottom: 0;
}

@media (prefers-color-scheme: dark) {
  .bottom-nav {
    --background: #1e1e1e;
  }
}
</style>
