<template>
  <ion-page>
    <ion-content :fullscreen="true" class="dashboard-content">
      <!-- Header Section -->
      <div class="header-section">
        <div class="user-info">
          <ion-buttons slot="start">
            <ion-menu-button color="primary"></ion-menu-button>
          </ion-buttons>
          <div class="avatar">JD</div>
          <div>
            <h3>Bonjour, {{ authStore.user?.name || 'Client' }}</h3>
            <p>Ravi de vous revoir</p>
          </div>
        </div>
        <ion-button fill="clear" color="light" @click="router.push('/notifications')">
          <ion-icon slot="icon-only" :icon="notificationsOutline"></ion-icon>
        </ion-button>
      </div>

      <!-- Balance Card -->
      <div class="balance-card">
        <div class="card-glow"></div>
        <p class="balance-label">Total transféré (RMB)</p>
        <h1 class="balance-amount">
          <span v-if="isLoading">...</span>
          <span v-else>{{ totalCNY.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }}</span>
          <span class="currency-unit">CNY</span>
        </h1>
        <div class="card-footer">
          <div class="exchange-preview">
            <ion-icon :icon="refreshOutline"></ion-icon>
            <span>≈ {{ totalMGA.toLocaleString() }} MGA</span>
          </div>
          <div class="status-chip">Compte actif</div>
        </div>
      </div>

      <!-- Quick Actions / Rate -->
      <div class="rate-section">
        <div class="rate-card">
          <div class="rate-info">
            <p>Taux de change actuel</p>
            <h3>1 MGA = {{ exchangeStore.rateMGAtoCNY }} CNY</h3>
          </div>
          <div class="rate-trend">
            <ion-icon :icon="trendingUpOutline"></ion-icon>
            <span>+0.02%</span>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="section-header">
        <h2>Transactions récentes</h2>
        <a @click="router.push('/transactions')">Voir tout</a>
      </div>

      <div class="transactions-list">
        <div v-for="tx in recentTransactions" :key="tx.id" class="tx-item"
          @click="router.push('/transaction/' + tx.id)">
          <div class="tx-icon" :class="tx.status">
            <ion-icon :icon="txIcon(tx.status)"></ion-icon>
          </div>
          <div class="tx-info">
            <h4>Transfert {{ tx.method }}</h4>
            <p>{{ tx.date }} • {{ tx.method }}</p>
          </div>
          <div class="tx-amount">
            <p class="mga">{{ tx.amountMGA.toLocaleString() }} MGA</p>
            <p class="cny">{{ tx.amountCNY }} CNY</p>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Chargement...</p>
        </div>

        <!-- Error -->
        <div v-else-if="loadError" class="empty-state">
          <ion-icon :icon="receiptOutline"></ion-icon>
          <p>{{ loadError }}</p>
        </div>

        <!-- Empty -->
        <div v-else-if="recentTransactions.length === 0" class="empty-state">
          <ion-icon :icon="receiptOutline"></ion-icon>
          <p>Aucune transaction récente</p>
        </div>
      </div>

      <div style="height: 100px;"></div>
    </ion-content>

    <BottomNav active="dashboard" />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonContent, IonButton, IonIcon,
  IonButtons, IonMenuButton, IonSpinner
} from '@ionic/vue';
import {
  notificationsOutline,
  refreshOutline,
  trendingUpOutline,
  checkmarkCircle,
  timeOutline,
  closeCircle,
  receiptOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useExchangeStore } from '@/stores/exchange';
import { useTransactionStore } from '@/stores/transactions';
import { API_BASE_URL } from '@/services/api';
import BottomNav from '@/components/common/BottomNav.vue';

const router = useRouter();
const authStore = useAuthStore();
const exchangeStore = useExchangeStore();
const transactionStore = useTransactionStore();

const recentTransactions = ref<any[]>([]);
const isLoading = ref(false);
const loadError = ref('');

const totalCNY = ref(0);
const totalMGA = ref(0);

/** Helper: pick the right icon per status */
const txIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return checkmarkCircle;
    case 'payer': return checkmarkCircle;
    case 'en_cours': return timeOutline;
    case 'request_transfer': return timeOutline;
    default: return closeCircle; // draft
  }
};

/** Format a Drupal date (Unix timestamp in seconds or ISO string) to DD/MM/YY */
const formatDate = (raw: any): string => {
  if (!raw) return '';
  const d = typeof raw === 'number' || /^\d+$/.test(String(raw))
    ? new Date(parseInt(String(raw)) * 1000)   // Unix seconds → ms
    : new Date(raw);                            // ISO string
  if (isNaN(d.getTime())) return String(raw);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

/** Map raw API node to local tx model */
const mapNode = (node: any) => {
  const rmb = parseFloat(node.field_montant_rmb ?? 0);

  // field_cours_rmb can be: a number, an object {name, title}, or an array [{name}]
  const raw = node.field_cours_rmb;
  let cours = 0;
  if (typeof raw === 'number') {
    cours = raw;
  } else if (Array.isArray(raw) && raw.length > 0) {
    cours = parseFloat(raw[0]?.name ?? raw[0]?.title ?? 0);
  } else if (raw && typeof raw === 'object') {
    cours = parseFloat(raw.name ?? raw.title ?? 0);
  }

  return {
    id: String(node.nid ?? node.id ?? ''),
    beneficiary: node.title ?? '—',
    amountMGA: cours > 0 ? Math.round(cours * rmb) : 0,
    amountCNY: rmb,
    rate: cours,
    method: (node.field_method_payment === 'WeChat' ? 'WeChat' : 'Alipay') as 'WeChat' | 'Alipay',
    status: (node.field_status_process === 'en_cours' || node.field_status_process === 'in_process' ? 'in_process' :
      node.field_status_process === 'payer' || node.field_status_process === 'payed' ? 'payed' :
        node.field_status_process) as any,
    date: formatDate(node.created ?? node.changed),
    reference: '',
    proofUrl: node.field_image_ariary?.map((img: any) => img.url) || [],
    qrCodeUrl: node.field_image_qrcode?.map((img: any) => img.url) || [],
  };
};

onMounted(async () => {
  await exchangeStore.init();
  isLoading.value = true;
  loadError.value = '';

  // =========================
  // Fetch Summary
  // =========================
  try {
    const summaryResponse = await fetch(
      `${API_BASE_URL}/api/mga/user/summary?token=${authStore.token}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );

    const summaryData = await summaryResponse.json();

    if (summaryData.total_rmb !== undefined) {
      totalCNY.value = summaryData.total_rmb;
      totalMGA.value = summaryData.total_mga;
    }

  } catch (err: any) {
    console.error('Summary load error:', err);
    // loadError.value = 'Impossible de charger le résumé.';
  }

  // =========================
  // Fetch Recent Transactions
  // =========================
  try {
    const response = await fetch(
      `${API_BASE_URL}/api_solutions/api/v2/node/transfer?sort[val]=created&sort[op]=DESC&offset=5&token=${authStore.token}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );

    const data = await response.json();

    const rows = Array.isArray(data) ? data : (data.rows ?? []);

    recentTransactions.value = rows.map(mapNode);

    // Sync to store for detail page
    rows.forEach((n: any) => {
      const tx = mapNode(n);
      const exists = transactionStore.transactions.find(t => t.id === tx.id);
      if (!exists) {
        transactionStore.addTransaction({ ...tx, reference: '', username: authStore.user?.name });
      }
    });

  } catch (err: any) {
    console.error('Transactions load error:', err);
    loadError.value = 'Impossible de charger les transactions récentes.';
  }

  isLoading.value = false;
});

</script>

<style scoped>
.dashboard-content {
  --background: #f8f9fc;
}

.header-section {
  padding: 30px 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 45px;
  height: 45px;
  background: var(--ion-color-primary);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 12px;
  box-shadow: 0 4px 10px rgba(26, 77, 162, 0.2);
}

.user-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e2a4a;
}

.user-info p {
  margin: 0;
  font-size: 12px;
  color: #8892a0;
}

.balance-card {
  background: linear-gradient(135deg, #1a4da2 0%, #315fab 100%);
  margin: 10px 20px 25px;
  padding: 25px;
  border-radius: 28px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(26, 77, 162, 0.3);
}

.card-glow {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(40px);
}

.balance-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.balance-amount {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 20px;
}

.balance-amount span {
  font-size: 16px;
  font-weight: 400;
  opacity: 0.7;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exchange-preview {
  display: flex;
  align-items: center;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 10px;
  backdrop-filter: blur(5px);
}

.exchange-preview ion-icon {
  margin-right: 6px;
}

.status-chip {
  background: #2dd36f;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.rate-section {
  padding: 0 20px 30px;
}

.rate-card {
  background: white;
  padding: 18px;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #edf1f7;
}

.rate-info p {
  margin: 0;
  font-size: 12px;
  color: #8892a0;
  margin-bottom: 4px;
}

.rate-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e2a4a;
}

.rate-trend {
  display: flex;
  align-items: center;
  color: #2dd36f;
  font-size: 14px;
  font-weight: 600;
  background: rgba(45, 211, 111, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
}

.rate-trend ion-icon {
  margin-right: 4px;
}

.section-header {
  padding: 0 20px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1e2a4a;
  margin: 0;
}

.section-header a {
  font-size: 14px;
  color: var(--ion-color-primary);
  font-weight: 600;
  text-decoration: none;
}

.transactions-list {
  padding: 0 20px;
}

.tx-item {
  background: white;
  padding: 15px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  border: 1px solid #edf1f7;
}

.tx-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.tx-icon.confirmed {
  background: rgba(45, 211, 111, 0.12);
  color: #2dd36f;
}

.tx-icon.payed {
  background: rgba(112, 26, 211, 0.12);
  color: #7b2ff7;
}

.tx-icon.in_process {
  background: rgba(56, 128, 255, 0.12);
  color: #3880ff;
}

.tx-icon.request_transfer {
  background: rgba(255, 196, 9, 0.12);
  color: #e0a800;
}

.tx-icon.draft {
  background: rgba(136, 146, 160, 0.15);
  color: #8892a0;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #8892a0;
}

.loading-state ion-spinner {
  font-size: 32px;
  margin-bottom: 8px;
}

.tx-icon ion-icon {
  font-size: 22px;
}

.tx-info {
  flex: 1;
}

.tx-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #1e2a4a;
}

.tx-info p {
  margin: 0;
  font-size: 12px;
  color: #8892a0;
}

.tx-amount {
  text-align: right;
}

.tx-amount .mga {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e2a4a;
}

.tx-amount .cny {
  margin: 0;
  font-size: 12px;
  color: #8892a0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #8892a0;
}

.empty-state ion-icon {
  font-size: 64px;
  margin-bottom: 10px;
  opacity: 0.3;
}

@media (prefers-color-scheme: dark) {
  .dashboard-content {
    --background: #121212;
  }

  .header-section h3 {
    color: white;
  }

  .rate-card,
  .tx-item {
    background: #1e1e1e;
    border-color: #2a2a2a;
  }

  .tx-info h4,
  .tx-amount .mga,
  .section-header h2 {
    color: white;
  }
}
</style>
