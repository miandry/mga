<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/manage" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Générer Accès Visiteur</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding admin-content">
      <div class="intro-box">
        <ion-icon :icon="personAddOutline"></ion-icon>
        <h3>Nouvel Accès Temporaire</h3>
        <p>Générez un lien d'accès direct pour un visiteur. Ce lien permettra d'accéder au formulaire de transfert sans connexion préalable.</p>
      </div>

      <div class="form-card">
        <ion-list lines="none">
          <ion-item class="custom-input">
            <ion-input 
              label="Email (Optionnel)" 
              label-placement="stacked" 
              v-model="email" 
              placeholder="ex: visiteur@example.com"
            ></ion-input>
          </ion-item>
        </ion-list>

        <ion-button expand="block" class="generate-btn" @click="handleGenerate" :disabled="isLoading">
          <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
          <span v-else>Générer le lien</span>
          <ion-icon v-if="!isLoading" slot="end" :icon="sparklesOutline"></ion-icon>
        </ion-button>
        
      </div>

      <div v-if="generatedData" class="result-card animate__animated animate__fadeInUp">
        <div class="result-header">
          <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
          <h4>Généré avec succès</h4>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Utilisateur</label>
            <p>{{ generatedData.username }}</p>
          </div>
          <div class="info-item">
            <label>Mot de passe</label>
            <p><code>{{ generatedData.password }}</code></p>
          </div>
        </div>

        <div class="url-box">
          <label>URL d'accès direct</label>
          <div class="url-copy-wrapper">
            <div class="url-text">{{ transferUrl }}</div>
            <ion-button fill="clear" @click="copyUrl">
              <ion-icon slot="icon-only" :icon="copyOutline"></ion-icon>
            </ion-button>
          </div>
        </div>

        <ion-note color="medium" class="ion-text-center ion-margin-top block">
          Ce compte expirera le {{ generatedData.expiration }}
        </ion-note>
      </div>
    </ion-content>

    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      :duration="2000"
      @didDismiss="showToast = false"
    ></ion-toast>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, 
  IonContent, IonInput, IonList, IonItem, IonButton, IonIcon, 
  IonSpinner, IonNote, IonToast 
} from '@ionic/vue';
import { 
  chevronBackOutline, personAddOutline, sparklesOutline, 
  checkmarkCircleOutline, copyOutline 
} from 'ionicons/icons';
import { ref, computed } from 'vue';
import { API_BASE_URL } from '@/services/api';

const email = ref('');
const isLoading = ref(false);
const generatedData = ref<any>(null);
const showToast = ref(false);
const toastMessage = ref('');

const transferUrl = computed(() => {
  if (!generatedData.value) return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}/transfer?token=${generatedData.value.token}`;
});

const handleGenerate = async () => {
  isLoading.value = true;
  generatedData.value = null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/mz_visitor/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value || undefined })
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      generatedData.value = data.data;
      toastMessage.value = 'Visiteur généré !';
    } else {
      toastMessage.value = data.message || 'Erreur lors de la génération';
    }
  } catch (err) {
    console.error('Generation error:', err);
    toastMessage.value = 'Erreur de connexion au serveur';
  } finally {
    isLoading.value = false;
    showToast.value = true;
  }
};

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(transferUrl.value);
    toastMessage.value = 'URL copiée dans le presse-papier !';
    showToast.value = true;
  } catch (err) {
    console.error('Copy error:', err);
  }
};
</script>

<style scoped>
.admin-content {
  --background: #f4f7fa;
}

.intro-box {
  text-align: center;
  padding: 30px 20px;
  color: #1e2a4a;
}

.intro-box ion-icon {
  font-size: 48px;
  color: var(--ion-color-primary);
  margin-bottom: 15px;
}

.intro-box h3 {
  margin: 0 0 10px;
  font-weight: 800;
}

.intro-box p {
  margin: 0;
  font-size: 14px;
  color: #8892a0;
  line-height: 1.5;
}

.form-card {
  background: white;
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  margin-bottom: 25px;
}

.custom-input {
  --background: #f8f9fc;
  --border-radius: 14px;
  --padding-start: 15px;
  margin-bottom: 20px;
}

.generate-btn {
  --border-radius: 16px;
  height: 56px;
  font-weight: 700;
  margin: 0;
}

.result-card {
  background: white;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.1);
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f3f7;
}

.result-header ion-icon {
  font-size: 28px;
  margin-right: 12px;
}

.result-header h4 {
  margin: 0;
  font-weight: 700;
  color: #1e2a4a;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.info-item label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #8892a0;
  margin-bottom: 5px;
}

.info-item p {
  margin: 0;
  font-weight: 700;
  color: #1e2a4a;
}

.url-box label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #8892a0;
  margin-bottom: 8px;
}

.url-copy-wrapper {
  background: #f0f4f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 5px 5px 5px 15px;
}

.url-text {
  flex: 1;
  font-size: 13px;
  color: var(--ion-color-primary);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.block {
  display: block;
}

@media (prefers-color-scheme: dark) {
  .admin-content { --background: #000; }
  .form-card, .result-card { background: #1c1c1e; }
  .custom-input { --background: #2c2c2e; }
  .intro-box h3, .result-header h4, .info-item p { color: white; }
  .url-copy-wrapper { background: #2c2c2e; }
}
</style>
