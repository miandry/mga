<template>
  <ion-app>
    <ion-menu side="start" content-id="main-content">
      <ion-header class="ion-no-border">
        <ion-toolbar color="primary">
          <ion-title>MGATrans Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list lines="none" class="menu-list">
          <ion-menu-toggle :auto-hide="false">
            <ion-item button router-link="/dashboard">
              <ion-icon slot="start" :icon="homeOutline"></ion-icon>
              <ion-label>Tableau de bord</ion-label>
            </ion-item>
            <ion-item button router-link="/transactions">
              <ion-icon slot="start" :icon="listOutline"></ion-icon>
              <ion-label>Historique</ion-label>
            </ion-item>
            <ion-item button router-link="/manage/generate-visitor">
              <ion-icon slot="start" :icon="personAddOutline"></ion-icon>
              <ion-label>Générer Visiteur</ion-label>
            </ion-item>
            <ion-item button router-link="/manage/rate">
              <ion-icon slot="start" :icon="trendingUpOutline"></ion-icon>
              <ion-label>Gestion du Taux</ion-label>
            </ion-item>
            <ion-item button router-link="/profile">
              <ion-icon slot="start" :icon="personOutline"></ion-icon>
              <ion-label>Mon Profil</ion-label>
            </ion-item>
            <ion-item button router-link="/manage">
              <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
              <ion-label>Administration</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { 
  IonApp, IonRouterOutlet, IonMenu, IonHeader, 
  IonToolbar, IonTitle, IonContent, IonList, 
  IonItem, IonIcon, IonLabel, IonMenuToggle 
} from '@ionic/vue';
import { 
  homeOutline, listOutline, personAddOutline, 
  personOutline, settingsOutline, trendingUpOutline 
} from 'ionicons/icons';
</script>

<style>
/* Global styles */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.menu-list {
  padding: 20px 0;
}

.menu-list ion-item {
  --padding-start: 20px;
  --border-radius: 12px;
  margin: 5px 15px;
  --background-focused: rgba(var(--ion-color-primary-rgb), 0.1);
}

.menu-list ion-item ion-icon {
   color: #8892a0;
  margin-right: 15px;
}
</style>
