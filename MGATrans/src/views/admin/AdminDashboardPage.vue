<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Admin Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="authStore.logout(); router.push('/auth/login')">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="admin-content ion-padding">
      <!-- Stats Summary -->
      <div class="stats-grid">
        <div class="stat-card">
          <p>En attente</p>
          <h2>{{ pendingCount }}</h2>
        </div>
        <div class="stat-card">
          <p>Total MGA</p>
          <h2>{{ totalMGA.toLocaleString() }}</h2>
        </div>
        <div class="stat-card">
          <p>Validés (24h)</p>
          <h2>14</h2>
        </div>
      </div>

      <div class="section-header">
        <h2>Transferts à valider</h2>
        <div class="header-actions">
          <ion-button fill="clear" size="small" @click="router.push('/admin/generate-visitor')">
            <ion-icon slot="icon-only" :icon="personAddOutline"></ion-icon>
          </ion-button>
          <ion-badge color="warning">{{ pendingTransactions.length }}</ion-badge>
        </div>
      </div>

      <div class="admin-list">
        <div v-for="tx in pendingTransactions" :key="tx.id" class="admin-item" @click="selectedTx = tx">
          <div class="admin-item-info">
            <div class="user-tag">
              <ion-icon :icon="personCircleOutline"></ion-icon>
              <span>User ID: 1042</span>
            </div>
            <h4>#{{ tx.id }} - {{ tx.beneficiary }}</h4>
            <p>{{ tx.amountMGA.toLocaleString() }} MGA -> {{ tx.amountCNY }} CNY</p>
            <div class="method-tag" :class="tx.method.toLowerCase()">{{ tx.method }}</div>
          </div>
          <div class="admin-item-action">
            <ion-button fill="clear">
              <ion-icon slot="icon-only" :icon="eyeOutline"></ion-icon>
            </ion-button>
          </div>
        </div>

        <div v-if="pendingTransactions.length === 0" class="empty-admin">
          <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
          <p>Tous les transferts sont à jour !</p>
        </div>
      </div>

      <!-- Validation Modal -->
      <ion-modal :is-open="!!selectedTx" @didDismiss="selectedTx = null">
        <ion-header class="ion-no-border">
          <ion-toolbar>
            <ion-title>Validation #{{ selectedTx?.id }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="selectedTx = null">Fermer</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div v-if="selectedTx">
            <h3 class="modal-label">Justificatif de paiement</h3>
            <div class="proof-full">
              <img :src="selectedTx.proofUrl || 'https://placehold.co/600x400?text=Preuve'" alt="Proof" />
            </div>

            <ion-list lines="none">
              <ion-item class="modal-input">
                <ion-textarea label="Commentaire (optionnel)" placeholder="ex: Reçu illisible, veuillez renvoyer..." v-model="adminComment"></ion-textarea>
              </ion-item>
            </ion-list>

            <div class="modal-actions">
              <ion-button expand="block" color="danger" fill="outline" @click="handleReject">
                <ion-icon slot="start" :icon="closeCircleOutline"></ion-icon>
                Rejeter
              </ion-button>
              <ion-button expand="block" color="success" @click="handleValidate">
                <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
                Valider & Générer QR
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>

    <ion-loading :is-open="isLoading" message="Mise à jour du statut..."></ion-loading>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonContent, IonBadge, IonModal, IonList, IonItem, 
  IonTextarea, IonLoading, IonMenuButton 
} from '@ionic/vue';
import { 
  logOutOutline, personCircleOutline, eyeOutline, 
  shieldCheckmarkOutline, closeCircleOutline, checkmarkCircleOutline,
  personAddOutline
} from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTransactionStore } from '@/stores/transactions';

const router = useRouter();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();

const selectedTx = ref<any>(null);
const adminComment = ref('');
const isLoading = ref(false);

const pendingTransactions = computed(() => {
  return transactionStore.transactions.filter(tx => tx.status === 'request_transfer');
});

const pendingCount = computed(() => pendingTransactions.value.length);
const totalMGA = computed(() => {
  return pendingTransactions.value.reduce((acc, tx) => acc + tx.amountMGA, 0);
});

const handleValidate = () => {
  if (!selectedTx.value) return;
  isLoading.value = true;
  setTimeout(() => {
    transactionStore.updateTransactionStatus(selectedTx.value.id, 'confirmed', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MGATrans-CONFIRMED');
    isLoading.value = false;
    selectedTx.value = null;
  }, 1500);
};

const handleReject = () => {
  if (!selectedTx.value) return;
  isLoading.value = true;
  setTimeout(() => {
    transactionStore.updateTransactionStatus(selectedTx.value.id, 'draft');
    isLoading.value = false;
    selectedTx.value = null;
  }, 1500);
};
</script>

<style scoped>
.admin-content {
  --background: #f0f2f5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  padding: 15px 10px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.stat-card p { margin: 0 0 5px; font-size: 10px; color: #8892a0; font-weight: 700; text-transform: uppercase; }
.stat-card h2 { margin: 0; font-size: 18px; font-weight: 800; color: #1e2a4a; }

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h2 { margin: 0 10px 0 0; font-size: 18px; font-weight: 700; color: #1e2a4a; }

.header-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.header-actions ion-button {
  margin-right: 5px;
}

.admin-list {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.admin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.admin-item:last-child { border-bottom: none; }

.user-tag {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #8892a0;
  margin-bottom: 4px;
}

.user-tag ion-icon { margin-right: 4px; }

.admin-item-info h4 { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #1e2a4a; }
.admin-item-info p { margin: 0 0 8px; font-size: 12px; color: #5d6d7e; }

.method-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  color: white;
}

.wechat { background: #07c160; }
.alipay { background: #00a0e9; }

.empty-admin {
  text-align: center;
  padding: 40px 20px;
  color: #8892a0;
}

.empty-admin ion-icon { font-size: 48px; margin-bottom: 10px; color: #2dd36f; }

.modal-label { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
.proof-full { border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
.proof-full img { width: 100%; height: auto; }

.modal-input { --background: #f8f9fc; --border-radius: 12px; margin-bottom: 20px; }

.modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; }
.modal-actions ion-button { --border-radius: 12px; height: 50px; font-weight: 700; }

@media (prefers-color-scheme: dark) {
  .admin-content { --background: #000; }
  .stat-card, .admin-list { background: #1c1c1e; }
  .stat-card h2, .section-header h2, .admin-item-info h4 { color: white; }
  .admin-item { border-color: #2c2c2e; }
  .modal-input { --background: #2c2c2e; }
}
</style>
