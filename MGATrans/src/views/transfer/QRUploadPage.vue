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
        <ion-title>QR Codes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="stepper">
        <div class="step">1</div>
        <div class="line active"></div>
        <div class="step">2</div>
        <div class="line active"></div>
        <div class="step active">3</div>
      </div>

      <div class="instruction-header">
        <h2>Ajouter vos QR codes</h2>
        <p>Vous pouvez ajouter un ou plusieurs codes de réception (WeChat Pay ou Alipay) pour ce bénéficiaire.</p>
      </div>

      <div class="qr-list">
        <div v-for="(qr, index) in uploadedQRs" :key="index" class="qr-item-card">
          <div class="qr-preview-container">
            <img :src="qr.preview" alt="QR Preview" />
            <div class="remove-btn" @click="removeQR(index)">
              <ion-icon :icon="closeCircle"></ion-icon>
            </div>
          </div>
          <div class="qr-label-input">
            <label>Montant (RMB) </label>
            <ion-input 
              placeholder="Ex: 3000 ..." 
              v-model="qr.label"
              class="custom-box-input"
            ></ion-input>
          </div>
        </div>

        <div class="add-qr-box" @click="triggerUpload" v-if="!isLoading">
          <ion-icon :icon="addOutline"></ion-icon>
          <span>Ajouter</span>
        </div>
        
        <div v-if="isLoading" class="add-qr-box loading">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      </div>

      <input 
        type="file" 
        ref="qrInput" 
        style="display: none" 
        accept="image/*" 
        @change="handleFileChange" 
      />

      <div class="info-banner">
        <ion-icon :icon="informationCircleOutline"></ion-icon>
        <p>Ces codes permettront au bénéficiaire de recevoir les fonds plus rapidement.</p>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <ion-toolbar class="footer-toolbar">
        <div class="footer-actions">
          <ion-button fill="outline" color="secondary" @click="handleFinish(true)" :disabled="isSaving" class="draft-btn">
            <ion-spinner v-if="isSavingDraft" name="crescent"></ion-spinner>
            <span v-else>Brouillon</span>
          </ion-button>
          
          <ion-button class="finish-btn" @click="handleFinish(false)" :disabled="isSaving">
            <ion-spinner v-if="isSaving && !isSavingDraft" name="crescent"></ion-spinner>
            <span v-else>Terminer</span>
            <ion-icon v-if="!isSaving" slot="end" :icon="checkmarkCircleOutline"></ion-icon>
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
  chevronBackOutline, addOutline, closeCircle, 
  checkmarkCircleOutline, informationCircleOutline 
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useExchangeStore } from '@/stores/exchange';
import { useTransactionStore } from '@/stores/transactions';
import { API_BASE_URL } from '@/services/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const exchangeStore = useExchangeStore();
const transactionStore = useTransactionStore();

const transferData = ref<any>({});
const uploadedQRs = ref<{preview: string, fid: number, label: string}[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isSavingDraft = ref(false);
const qrInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  transferData.value = route.query;
});

const triggerUpload = () => {
  qrInput.value?.click();
};

const handleFileChange = async (event: any) => {
  const file = event.target.files[0];
  if (file) {
    console.log('File selected:', file.name, file.size);
    isLoading.value = true;
    
    // 1. Preview
    const reader = new FileReader();
    const previewPromise = new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    // 2. Upload
    try {
      console.log('Uploading to:', `${API_BASE_URL}/api_solutions/action/uploader`);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api_solutions/action/uploader`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.status && data.fid) {
        const preview = await previewPromise;
        uploadedQRs.value.push({ 
          preview, 
          fid: data.fid,
          label: '' 
        });
        console.log('QR added successfully');
      } else {
        alert('Erreur: ' + (data.message || 'Le serveur n\'a pas renvoyé de fid.'));
      }
    } catch (err: any) {
      console.error('QR Upload error:', err);
      alert('Erreur d\'upload: ' + err.message);
    } finally {
      isLoading.value = false;
      if (qrInput.value) qrInput.value.value = ''; // Reset input
    }
  } else {
    console.log('No file selected');
  }
};

const removeQR = (index: number) => {
  uploadedQRs.value.splice(index, 1);
};

const handleFinish = async (isDraft = false) => {
  isSaving.value = true;
  isSavingDraft.value = isDraft;
  
  try {
    const proofs = transferData.value.paymentProofs ? JSON.parse(transferData.value.paymentProofs) : [];
    const proofFids = proofs.map((p: any) => p.fid);
    const references = proofs.map((p: any) => p.reference);

    const payload = {
      entity_type: 'node',
      bundle: 'transfer',
      title: references[0] || `Transfert ${new Date().toLocaleDateString()}`,
      field_cours_rmb: exchangeStore.rateHistory[0]?.tid || '',
      field_image_ariary: proofFids,
      field_image_qrcode: uploadedQRs.value.map(qr => qr.fid),
      field_method_payment: transferData.value.method,
      field_montant_rmb: transferData.value.amountCNY,
      field_status_priority: isDraft ? 'low' : 'normal',
      field_reference_code: references,
      status: isDraft ? 0 : 1, // 0 = Draft (Unpublished), 1 = Published
      token: authStore.token
    };

    const response = await fetch(`${API_BASE_URL}/api_solutions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.status === true) {
      const newNodeId = data.item;
      transactionStore.addTransaction({
        id: newNodeId.toString(),
        amountMGA: parseFloat(transferData.value.amountMGA),
        amountCNY: parseFloat(transferData.value.amountCNY),
        method: transferData.value.method,
        status: isDraft ? 'draft' : 'request_transfer',
        date: 'À l\'instant',
        beneficiary: 'Transaction directe',
        rate: parseFloat(transferData.value.rate ?? exchangeStore.rateMGAtoCNY),
        proofUrl: '', 
        qrCodeUrl: uploadedQRs.value[0]?.preview || '',
        reference: references[0] || 'Draft'
      });
      
      router.push(isDraft ? '/dashboard' : '/transaction/' + newNodeId);
    } else {
      throw new Error(data.message || 'Failed to save transfer');
    }
  } catch (err: any) {
    console.error('Error saving transfer:', err);
    alert('Erreur: ' + err.message);
  } finally {
    isSaving.value = false;
    isSavingDraft.value = false;
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

.instruction-header {
  margin-bottom: 25px;
}

.instruction-header h2 {
  font-size: 20px;
  font-weight: 800;
  color: #1e2a4a;
  margin-bottom: 8px;
}

.instruction-header p {
  font-size: 14px;
  color: #8892a0;
  line-height: 1.5;
}

.qr-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.qr-item-card {
  background: white;
  border-radius: 18px;
  border: 1px solid #edf1f7;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.qr-preview-container {
  position: relative;
  height: 200px;
  background: #f8f9fc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-preview-container img {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.qr-label-input {
  padding: 15px;
  border-top: 1px solid #f0f4f9;
}

.qr-label-input label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #8892a0;
  margin-bottom: 8px;
}

.custom-box-input {
  --padding-start: 12px;
  --background: #f8f9fc;
  --border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
}

.add-qr-box {
  width: 100%;
  height: 80px;
  border: 2px dashed #d1d9e6;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8892a0;
  background: #fbfbfc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-qr-box:active {
  background: #f0f4f9;
  border-color: var(--ion-color-primary);
}

.add-qr-box.loading {
  border-style: solid;
}

.add-qr-box ion-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.add-qr-box span {
  font-size: 13px;
  font-weight: 600;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 24px;
  color: #eb445a;
  background: white;
  border-radius: 50%;
  height: 24px;
  display: flex;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #eef4ff;
  padding: 15px;
  border-radius: 14px;
  color: #3880ff;
}

.info-banner ion-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.info-banner p {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}

.footer-toolbar {
  padding: 10px 20px 20px;
}

.footer-actions {
  display: grid;
  grid-template-columns: 1fr 1.8fr;
  gap: 12px;
}

.draft-btn, .finish-btn {
  --border-radius: 12px;
  height: 54px;
  font-weight: 700;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  ion-header ion-toolbar { --background: #121212; --color: white; }
  .instruction-header h2 { color: white; }
  .add-qr-box { background: #1a1a1a; border-color: #333; }
  .info-banner { background: rgba(56, 128, 255, 0.1); }
}
</style>
