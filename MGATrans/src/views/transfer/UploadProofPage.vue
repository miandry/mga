<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Justificatifs</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="stepper">
        <div class="step">1</div>
        <div class="line active"></div>
        <div class="step active">2</div>
      </div>

      <div class="summary-box">
        <div class="summary-item">
          <span>Montant</span>
          <strong>{{ transferData.amountMGA?.toLocaleString() }} MGA</strong>
        </div>
        <div class="summary-item">
          <span>Bénéficiaire</span>
          <strong>{{ transferData.beneficiaryName }}</strong>
        </div>
      </div>

      <div class="upload-section">
        <label class="input-label">1. Preuve du paiement (MGA)</label>
        <p class="input-hint">Capture d'écran de votre transfert Mobile Money ou reçu bancaire.</p>
        
        <div v-if="!proofPayment" class="upload-box" @click="triggerUpload('payment')">
          <ion-icon :icon="cameraOutline"></ion-icon>
          <p>Prendre une photo ou choisir un fichier</p>
        </div>
        <div v-else class="preview-box">
          <img :src="proofPayment" alt="Proof Payment" />
          <div class="remove-btn" @click="proofPayment = null">
            <ion-icon :icon="closeCircle"></ion-icon>
          </div>
        </div>

        <label class="input-label">2. Pièce d'identité</label>
        <p class="input-hint">Passeport ou CIN du bénéficiaire ou de l'envoyeur.</p>
        
        <div v-if="!proofIdentity" class="upload-box" @click="triggerUpload('identity')">
          <ion-icon :icon="imageOutline"></ion-icon>
          <p>Choisir un document</p>
        </div>
        <div v-else class="preview-box">
          <img :src="proofIdentity" alt="Proof Identity" />
          <div class="remove-btn" @click="proofIdentity = null">
            <ion-icon :icon="closeCircle"></ion-icon>
          </div>
        </div>

        <!-- Hidden Inputs for File selection -->
        <input type="file" ref="paymentInput" style="display: none" accept="image/*" @change="handleFileChange($event, 'payment')" />
        <input type="file" ref="identityInput" style="display: none" accept="image/*" @change="handleFileChange($event, 'identity')" />
      </div>

      <div class="instructions">
        <h3>Instructions importantes :</h3>
        <ul>
          <li>Assurez-vous que les textes sont lisibles.</li>
          <li>Format autorisé : JPG, PNG, PDF (max 5MB).</li>
          <li>La validation par nos agents prendra entre 10 et 30 minutes.</li>
        </ul>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <ion-toolbar class="footer-toolbar">
        <ion-button expand="block" class="finish-btn" @click="handleFinish" :disabled="!isReady">
          Valider le transfert
          <ion-icon slot="end" :icon="checkmarkCircleOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-footer>

    <ion-loading :is-open="isLoading" message="Traitement en cours..."></ion-loading>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, 
  IonContent, IonIcon, IonFooter, IonButton, IonLoading, loadingController 
} from '@ionic/vue';
import { 
  chevronBackOutline, cameraOutline, imageOutline, 
  closeCircle, checkmarkCircleOutline 
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTransactionStore } from '@/stores/transactions';

const router = useRouter();
const route = useRoute();
const transactionStore = useTransactionStore();

const transferData = ref<any>({});
const proofPayment = ref<string | null>(null);
const proofIdentity = ref<string | null>(null);
const isLoading = ref(false);

const paymentInput = ref<HTMLInputElement | null>(null);
const identityInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  transferData.value = route.query;
});

const triggerUpload = (type: 'payment' | 'identity') => {
  if (type === 'payment') paymentInput.value?.click();
  else identityInput.value?.click();
};

const handleFileChange = (event: any, type: 'payment' | 'identity') => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'payment') proofPayment.value = e.target?.result as string;
      else proofIdentity.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const isReady = computed(() => proofPayment.value && proofIdentity.value);

const handleFinish = async () => {
  isLoading.value = true;
  
  // Simulate API delay
  setTimeout(() => {
    const newId = Math.random().toString(36).substr(2, 9).toUpperCase();
    transactionStore.addTransaction({
      id: newId,
      amountMGA: parseFloat(transferData.value.amountMGA),
      amountCNY: parseFloat(transferData.value.amountCNY),
      method: transferData.value.method,
      status: 'pending',
      date: 'À l\'instant',
      beneficiary: transferData.value.beneficiaryName,
      proofUrl: proofPayment.value as string
    });
    
    isLoading.value = false;
    router.push('/transaction/' + newId);
  }, 2000);
};
</script>

<style scoped>
ion-header ion-toolbar {
  --background: white;
  --color: #1e2a4a;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 25px;
}

.step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f4f5f8;
  color: #8892a0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  z-index: 2;
}

.step.active {
  background: var(--ion-color-primary);
  color: white;
}

.line {
  width: 60px;
  height: 2px;
  background: #f4f5f8;
  margin: 0 -5px;
}

.line.active {
  background: var(--ion-color-primary);
}

.summary-box {
  background: #f8f9fc;
  border-radius: 18px;
  padding: 15px 20px;
  margin-bottom: 30px;
  border: 1px solid #edf1f7;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-item:last-child { margin-bottom: 0; }

.summary-item span {
  font-size: 13px;
  color: #8892a0;
}

.summary-item strong {
  font-size: 14px;
  color: #1e2a4a;
}

.input-label {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #1e2a4a;
  margin-bottom: 4px;
}

.input-hint {
  font-size: 12px;
  color: #8892a0;
  margin-bottom: 12px;
}

.upload-box {
  height: 120px;
  border: 2px dashed #d1d9e6;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8892a0;
  margin-bottom: 25px;
  background: #fbfbfc;
  transition: all 0.3s ease;
}

.upload-box:active {
  background: #f0f4f9;
  border-color: var(--ion-color-primary);
}

.upload-box ion-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.preview-box {
  position: relative;
  height: 150px;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 25px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.preview-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 28px;
  color: #eb445a;
  background: white;
  border-radius: 50%;
  height: 28px;
  display: flex;
}

.instructions {
  background: #f0f4f9;
  padding: 15px 20px;
  border-radius: 18px;
  margin-top: 10px;
}

.instructions h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1e2a4a;
  margin: 0 0 10px;
}

.instructions ul {
  padding-left: 20px;
  margin: 0;
}

.instructions li {
  font-size: 12px;
  color: #616e7e;
  margin-bottom: 6px;
}

.footer-toolbar {
  padding: 10px 20px 20px;
}

.finish-btn {
  --border-radius: 16px;
  height: 56px;
  font-weight: 700;
}

@media (prefers-color-scheme: dark) {
  ion-header ion-toolbar { --background: #121212; --color: white; }
  .summary-box, .instructions { background: #1e1e1e; border-color: #2a2a2a; }
  .input-label, .summary-item strong, .instructions h3 { color: white; }
  .upload-box { background: #1a1a1a; border-color: #333; }
}
</style>
