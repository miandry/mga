<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="router.back()">
            <ion-icon slot="start" :icon="chevronBackOutline"></ion-icon>
            Retour
          </ion-button>
        </ion-buttons>
        <ion-title>Justificatifs</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="stepper">
        <div class="step">1</div>
        <div class="line active"></div>
        <div class="step active">2</div>
        <div class="line"></div>
        <div class="step">3</div>
      </div>

      <div class="summary-box">
        <div class="summary-item">
          <span>Montant</span>
          <strong>{{ transferData.amountMGA?.toLocaleString() }} MGA</strong>
        </div>
      </div>

      <div class="upload-section">
        <div v-for="(proof, index) in paymentProofs" :key="index" class="proof-item-container">
          <div class="proof-header">
            <label class="input-label">{{ index + 1 }}. Justificatif de paiement (MGA)</label>
            <ion-button fill="clear" color="danger" v-if="paymentProofs.length > 1" @click="removeProof(index)"
              class="remove-proof-btn">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-button>
          </div>
          <p class="input-hint">Photos de votre transfert ou reçu bancaire.</p>

          <div v-if="!proof.preview" class="upload-box" @click="triggerUpload(index)">
            <ion-icon :icon="cameraOutline"></ion-icon>
            <p>Prendre une photo ou choisir un fichier</p>
          </div>
          <div v-else class="preview-box">
            <img :src="proof.preview" :alt="proof.reference || 'Justificatif de paiement'"
              :title="proof.reference || 'Justificatif de paiement'" />
            <div class="remove-btn" @click="clearProofImage(index)">
              <ion-icon :icon="closeCircle"></ion-icon>
            </div>
          </div>

          <div class="reference-input-container">
            <ion-input placeholder="Référence de la transaction (Ex: MM2401...)" v-model="proof.reference"
              class="ref-input"></ion-input>
          </div>
        </div>

        <ion-button fill="outline" expand="block" class="add-more-btn" @click="addProof">
          <ion-icon slot="start" :icon="addOutline"></ion-icon>
          Ajouter un autre justificatif
        </ion-button>

        <!-- Hidden Input for File selection -->
        <input type="file" ref="paymentInput" style="display: none" accept="image/*" @change="handleFileChange" />
      </div>

      <div class="instructions">
        <h3>Instructions importantes :</h3>
        <ul>
          <li>Assurez-vous que les textes sont lisibles.</li>
          <li>La référence doit correspondre exactement au reçu.</li>
          <li>La validation par nos agents prendra entre 10 et 30 minutes.</li>
        </ul>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <ion-toolbar class="footer-toolbar">
        <div class="footer-actions">

          <ion-button fill="outline" color="medium" class="draft-btn" @click="saveAsDraft" :disabled="isLoading">
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Brouillon</span>
          </ion-button>

          <ion-button class="finish-btn" @click="handleContinue" :disabled="!isReady || isLoading">
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Suivant</span>
            <ion-icon v-if="!isLoading" slot="end" :icon="arrowForwardOutline"></ion-icon>
          </ion-button>

        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonIcon, IonFooter, IonButton, IonSpinner
} from '@ionic/vue';
import {
  chevronBackOutline, cameraOutline, arrowForwardOutline,
  closeCircle, addOutline, trashOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useExchangeStore } from '@/stores/exchange';
import { API_BASE_URL } from '@/services/api';
import { useTransactionStore } from '@/stores/transactions';
const transactionStore = useTransactionStore();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const exchangeStore = useExchangeStore();

const transferData = ref<any>({});
const paymentProofs = ref<{ preview: string | null, fid: number | null, reference: string, url: string | null }[]>([
  { preview: null, fid: null, reference: '', url: null }
]);
const currentActiveIndex = ref(0);
const isLoading = ref(false);

const paymentInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  transferData.value = route.query;
  await exchangeStore.init();
});

const addProof = () => {
  paymentProofs.value.push({ preview: null, fid: null, reference: '', url: null });
};

const removeProof = (index: number) => {
  paymentProofs.value.splice(index, 1);
};

const clearProofImage = (index: number) => {
  paymentProofs.value[index].preview = null;
  paymentProofs.value[index].fid = null;
};

const triggerUpload = (index: number) => {
  currentActiveIndex.value = index;
  paymentInput.value?.click();
};

const handleFileChange = async (event: any) => {
  const file = event.target.files[0];
  const index = currentActiveIndex.value;

  if (file && paymentProofs.value[index]) {
    // 1. Show preview locally
    const reader = new FileReader();
    reader.onload = (e) => {
      paymentProofs.value[index].preview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // 2. Upload to server
    try {
      isLoading.value = true;
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api_solutions/action/uploader`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.status && data.fid) {
        paymentProofs.value[index].fid = data.fid;
        paymentProofs.value[index].url = data.url;
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      isLoading.value = false;
      if (paymentInput.value) paymentInput.value.value = '';
    }
  }
};

const isReady = computed(() => {
  // Make upload not required as per user request
  return true;
});

const handleContinue = () => {
  router.push({
    path: '/transfer/qrcode',
    query: {
      ...transferData.value,
      paymentProofs: JSON.stringify(paymentProofs.value.map(p => ({
        fid: p.fid,
        reference: p.reference,
        url: p.url
      })))
    }
  });
};

const saveAsDraft = async () => {
  try {
    isLoading.value = true;

    const payload = {
      entity_type: 'node',
      bundle: 'transfer',
      title: `Brouillon - ${new Date().toLocaleDateString('fr-MG')}`,
      field_montant_rmb: parseFloat(String(transferData.value.amountCNY || 0)),
      field_method_payment: transferData.value.method,
      field_status_process: "draft",
      field_image_ariary: paymentProofs.value.map(p => (p.fid)),
      field_cours_rmb: exchangeStore.rateHistory[0]?.tid || '',
      status: 0,
      token: authStore.token,
      uid: authStore.user.id,
    };

    const response = await fetch(`${API_BASE_URL}/api_solutions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.status === true) {

      const now = new Date().toLocaleDateString('fr-MG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      transactionStore.addTransaction({
        id: String(data.item),
        username: authStore.user?.name || '_',
        amountMGA: parseFloat(String(transferData.value.amountMGA || 0)),
        amountCNY: parseFloat(String(transferData.value.amountCNY || 0)),
        method: transferData.value.method,
        status: 'draft',
        date: now,
        beneficiary: '—',
        proofUrl: paymentProofs.value.map(p => p.url).filter(url => url !== null) as string[],
        rate: exchangeStore.rateMGAtoCNY,
        reference: 'Brouillon'
      });

      router.push('/dashboard');

    } else {
      alert('Erreur: ' + (data.message || 'Impossible de sauvegarder le brouillon.'));
    }

  } catch (err: any) {
    console.error('Draft save error:', err);
    alert('Erreur réseau: ' + err.message);
  } finally {
    isLoading.value = false;
  }
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

.summary-item:last-child {
  margin-bottom: 0;
}

.footer-actions {
  display: grid;
  grid-template-columns: 1fr 1.8fr;
  gap: 12px;
}

.draft-btn {
  --border-radius: 14px;
  height: 56px;
  font-weight: 700;
  margin: 0;
}

.summary-item span {
  font-size: 13px;
  color: #8892a0;
}

.summary-item strong {
  font-size: 14px;
  color: #1e2a4a;
}

.proof-item-container {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f4f9;
}

.proof-item-container:last-of-type {
  border-bottom: none;
  margin-bottom: 20px;
}

.proof-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.remove-proof-btn {
  --padding-start: 4px;
  --padding-end: 4px;
  margin: 0;
  height: 32px;
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
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.preview-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reference-input-container {
  margin-top: -15px;
  margin-bottom: 25px;
  background: white;
  border: 1px solid #edf1f7;
  border-radius: 12px;
  padding: 5px 15px;
}

.ref-input {
  --padding-start: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1e2a4a;
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
  ion-header ion-toolbar {
    --background: #121212;
    --color: white;
  }

  .summary-box,
  .instructions {
    background: #1e1e1e;
    border-color: #2a2a2a;
  }

  .input-label,
  .summary-item strong,
  .instructions h3 {
    color: white;
  }

  .upload-box {
    background: #1a1a1a;
    border-color: #333;
  }
}
</style>
