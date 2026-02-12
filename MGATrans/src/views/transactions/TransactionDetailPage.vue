<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/transactions" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Détails du transfert</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleShare">
            <ion-icon slot="icon-only" :icon="shareSocialOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding transaction-detail-content">
      <div v-if="tx" class="detail-container">
        <!-- Status Header -->
        <div class="status-banner" :class="tx.status">
          <div class="status-icon">
            <ion-icon :icon="tx.status === 'validated' ? checkmarkCircle : (tx.status === 'pending' ? time : closeCircle)"></ion-icon>
          </div>
          <h2>{{ statusLabel }}</h2>
          <p>{{ statusDescription }}</p>
        </div>

        <!-- Transfer Card -->
        <div class="info-card main-info">
          <div class="info-row amount-row">
            <div>
              <p class="label">Montant envoyé</p>
              <h3>{{ tx.amountMGA.toLocaleString() }} <span>MGA</span></h3>
            </div>
            <ion-icon :icon="arrowForward" class="arrow"></ion-icon>
            <div class="text-right">
              <p class="label">Montant reçu</p>
              <h3>{{ tx.amountCNY }} <span>CNY</span></h3>
            </div>
          </div>
          
          <div class="info-divider"></div>

          <div class="info-grid">
            <div class="grid-item">
              <p class="label">Méthode</p>
              <div class="method-chip" :class="tx.method.toLowerCase()">
                <ion-icon :icon="tx.method === 'WeChat' ? chatbubbleEllipses : card"></ion-icon>
                {{ tx.method }}
              </div>
            </div>
            <div class="grid-item text-right">
              <p class="label">Date</p>
              <p class="value">{{ tx.date }}</p>
            </div>
            <div class="grid-item">
              <p class="label">Bénéficiaire</p>
              <p class="value">{{ tx.beneficiary }}</p>
            </div>
            <div class="grid-item text-right">
              <p class="label">ID Transaction</p>
              <p class="value">#{{ tx.id }}</p>
            </div>
          </div>
        </div>

        <!-- QR Code Section (Only if validated) -->
        <div v-if="tx.status === 'validated'" class="qr-section">
          <h3>Votre QR Code de réception</h3>
          <p>Présentez ce code ou partagez-le avec le bénéficiaire en Chine.</p>
          <div class="qr-container" @click="router.push('/transaction/qr/' + tx.id)">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MGATrans-VALIDATED" alt="QR Code" />
            <div class="qr-overlay">
              <ion-icon :icon="expandOutline"></ion-icon>
            </div>
          </div>
          <ion-button expand="block" fill="outline" class="qr-btn" @click="router.push('/transaction/qr/' + tx.id)">
            <ion-icon slot="start" :icon="qrCodeOutline"></ion-icon>
            Voir en plein écran
          </ion-button>
        </div>

        <!-- Proof Section -->
        <div class="info-card proof-card">
          <h3>Justificatif envoyé</h3>
          <div class="proof-preview">
            <img :src="tx.proofUrl || 'https://placehold.co/600x400?text=Preuve+de+Paiement'" alt="Proof" />
          </div>
        </div>

        <!-- Help Button -->
        <ion-button expand="block" fill="clear" color="medium" class="support-btn">
          <ion-icon slot="start" :icon="helpCircleOutline"></ion-icon>
          Besoin d'aide avec ce transfert ?
        </ion-button>
      </div>

      <div v-else class="loading-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement des détails...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, 
  IonContent, IonIcon, IonButton, IonSpinner 
} from '@ionic/vue';
import { 
  chevronBackOutline, shareSocialOutline, checkmarkCircle, 
  time, closeCircle, arrowForward, chatbubbleEllipses, card,
  qrCodeOutline, expandOutline, helpCircleOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTransactionStore } from '@/stores/transactions';

const route = useRoute();
const router = useRouter();
const transactionStore = useTransactionStore();

const tx = ref<any>(null);

onMounted(() => {
  const id = route.params.id as string;
  tx.value = transactionStore.transactions.find(t => t.id === id);
  // If not found (refresh), mock it
  if (!tx.value) {
    tx.value = {
      id: id,
      amountMGA: 500000,
      amountCNY: 750,
      method: 'Alipay',
      status: 'pending',
      date: 'Aujourd\'hui, 10:30',
      beneficiary: 'Li Wei',
      proofUrl: null
    };
  }
});

const statusLabel = computed(() => {
  if (tx.value?.status === 'validated') return 'Transfert Validé';
  if (tx.value?.status === 'rejected') return 'Transfert Rejeté';
  return 'En attente de validation';
});

const statusDescription = computed(() => {
  if (tx.value?.status === 'validated') return 'Les fonds sont disponibles. Utilisez le QR code ci-dessous.';
  if (tx.value?.status === 'rejected') return 'Le justificatif n\'est pas conforme. Veuillez contacter le support.';
  return 'Nos agents vérifient vos justificatifs. Cela prend généralement 15 min.';
});

const handleShare = () => {
  // Share logic
};
</script>

<style scoped>
.transaction-detail-content {
  --background: #f8f9fc;
}

.status-banner {
  text-align: center;
  padding: 30px 20px;
  border-radius: 24px;
  margin-bottom: 25px;
  color: white;
}

.status-banner.pending { background: linear-gradient(135deg, #fbb03b 0%, #f7931e 100%); }
.status-banner.validated { background: linear-gradient(135deg, #2dd36f 0%, #28ba62 100%); }
.status-banner.rejected { background: linear-gradient(135deg, #eb445a 0%, #cf3c4f 100%); }

.status-icon {
  font-size: 56px;
  margin-bottom: 10px;
}

.status-banner h2 { margin: 0 0 5px; font-size: 22px; font-weight: 800; }
.status-banner p { margin: 0; font-size: 14px; opacity: 0.9; }

.info-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.amount-row h3 { margin: 5px 0 0; font-size: 20px; font-weight: 800; color: #1e2a4a; }
.amount-row h3 span { font-size: 12px; font-weight: 400; color: #8892a0; }
.arrow { font-size: 24px; color: #d1d9e6; }

.info-divider {
  height: 1px;
  background: #edf1f7;
  margin: 15px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.label { font-size: 12px; color: #8892a0; margin: 0 0 4px; }
.value { font-size: 14px; font-weight: 600; color: #1e2a4a; margin: 0; }

.method-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.wechat { background: #07c160; }
.alipay { background: #00a0e9; }
.method-chip ion-icon { margin-right: 5px; }

.qr-section {
  text-align: center;
  padding: 20px;
  margin-bottom: 25px;
}

.qr-section h3 { font-size: 18px; font-weight: 700; color: #1e2a4a; margin-bottom: 10px; }
.qr-section p { font-size: 13px; color: #8892a0; margin-bottom: 20px; }

.qr-container {
  display: inline-block;
  padding: 15px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  position: relative;
  margin-bottom: 20px;
}

.qr-container img { width: 180px; height: 180px; }

.qr-overlay {
  position: absolute;
  bottom: 0px;
  right: 0px;
  background: var(--ion-color-primary);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid white;
}

.proof-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 15px; color: #1e2a4a; }
.proof-preview { border-radius: 12px; overflow: hidden; height: 200px; }
.proof-preview img { width: 100%; height: 100%; object-fit: cover; }

.support-btn { margin-top: 10px; font-weight: 600; font-size: 13px; }

.loading-state { text-align: center; padding: 50px 0; color: #8892a0; }

.text-right { text-align: right; }

@media (prefers-color-scheme: dark) {
  .transaction-detail-content { --background: #121212; }
  .info-card, .qr-container { background: #1e1e1e; }
  .amount-row h3, .value, .qr-section h3, .proof-card h3 { color: white; }
  .info-divider { background: #333; }
}
</style>
