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
        <!-- Total Principal -->
        <div class="total-main">
          <p class="balance-label">Total transféré (RMB)</p>
          <h1 class="balance-amount">
            <span v-if="isLoading">...</span>
            <span v-else>{{ totalCNY.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }}</span>
            <span class="currency-unit">CNY</span>
          </h1>
        </div>

        <!-- Footer avec les infos existantes -->
        <div class="card-footer">
          <div class="exchange-preview">
            <ion-icon :icon="refreshOutline"></ion-icon>
            <span>≈ {{ totalMGA.toLocaleString() }} MGA</span>
          </div>
          <div class="status-chip">Compte actif</div>
        </div>

        <!-- Stats par statut -->
        <div class="status-stats">
          <!-- En cours -->
          <div class="stat-item">
            <div class="stat-label">
              <span class="dot in_process"></span>
              En cours
            </div>
            <div class="stat-values">
              <span class="stat-cny">15,750 CNY</span>
              <span class="stat-mga">2.36M MGA</span>
            </div>
          </div>

          <!-- Payé -->
          <div class="stat-item">
            <div class="stat-label">
              <span class="dot payed"></span>
              Payé
            </div>
            <div class="stat-values">
              <span class="stat-cny">8,420 CNY</span>
              <span class="stat-mga">1.26M MGA</span>
            </div>
          </div>

          <!-- Confirmé -->
          <div class="stat-item">
            <div class="stat-label">
              <span class="dot confirmed"></span>
              Confirmé
            </div>
            <div class="stat-values">
              <span class="stat-cny">32,500 CNY</span>
              <span class="stat-mga">4.88M MGA</span>
            </div>
          </div>
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
        <div v-for="tx in recentTransactions" :key="tx.id" class="history-item"
          @click="router.push('/transaction/' + tx.id)">
          <div class="item-main">
            <div class="method-icon" :class="tx.method.toLowerCase()">
              <ion-icon :icon="tx.method === 'WeChat' ? chatbubbleEllipses : card"></ion-icon>
            </div>
            <div class="item-info">
              <p v-if="authStore.hasRole('administrator')" class="payment-method"><span class="username-owner">{{
                  tx.username }}</span>
                - Via {{ tx.method }}</p>
              <p v-else class="payment-method">Via {{ tx.method }}</p>
              <h4>{{ tx.amountCNY.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }} <span>CNY</span></h4>
              <p class="rate">Cours: {{ tx.rate.toLocaleString() }} MGA</p>
            </div>
            <div class="item-amounts">
              <p class=""></p>
              <p class="mga">≈ {{ tx.amountMGA.toLocaleString() }} MGA</p>
              <div class="status-tag" :class="tx.status">{{ statusLabel(tx.status) }}</div>
            </div>
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
  alertCircleOutline,
  chatbubbleEllipses,
  card
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
    case 'payed': return checkmarkCircle;
    case 'in_process': return timeOutline;
    case 'request_transfer': return timeOutline;
    case 'canceled': return alertCircleOutline;
    default: return closeCircle; // draft
  }
};

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    in_process: 'En cours',
    payed: 'Payé',
    confirmed: 'Confirmé',
    request_transfer: 'Demande',
    canceled: 'Annulé'
  };
  return labels[status] ?? status;
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
    username: node.uid.name,
    amountMGA: cours > 0 ? Math.round(cours * rmb) : 0,
    amountCNY: rmb,
    rate: cours,
    method: (node.field_method_payment === 'WeChat' ? 'WeChat' : 'Alipay') as 'WeChat' | 'Alipay',
    status: (node.field_status_process === 'en_cours' || node.field_status_process === 'in_process' ? 'in_process' :
      node.field_status_process === 'payer' || node.field_status_process === 'payed' ? 'payed' :
        node.field_status_process === 'canceled' ? 'canceled' :
          node.field_status_process) as any,
    date: formatDate(node.created ?? node.changed),
    proofUrl: (node.field_image_ariary || []).map((img: any) => ({
      id: String(img.id ?? img.target_id ?? ''),
      url: img.url,
      alt: img.alt ?? ''
    })),
    qrCodeUrl: (node.field_image_qrcode || []).map((img: any) => ({
      id: String(img.id ?? img.target_id ?? ''),
      url: img.url,
      alt: img.alt ?? ''
    })),
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
    let url = '';
    if (authStore.hasRole('administrator')) {
      url = `${API_BASE_URL}/api_solutions/api/v2/node/transfer?sort[val]=created&sort[op]=DESC&offset=5&token=${authStore.token}`;
    } else if (authStore.hasRole('authenticated_user')) {
      url = `${API_BASE_URL}/api_solutions/api/v2/node/transfer?sort[val]=created&sort[op]=DESC&offset=5&filters[uid][val]=${authStore.user.id}`;
    }
    const response = await fetch(url, {
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
        transactionStore.addTransaction({ ...tx });
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

.balance-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.balance-amount {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.balance-amount span {
  font-size: 16px;
  font-weight: 400;
  opacity: 0.7;
}

.total-main {
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
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
  text-align: center;
}

/* Stats par statut */
.status-stats {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.dot.in_process {
  background: #ffb259;
  box-shadow: 0 0 10px #ffb259;
}

.dot.payed {
  background: #a259ff;
  box-shadow: 0 0 10px #a259ff;
}

.dot.confirmed {
  background: #2dd36f;
  box-shadow: 0 0 10px #2dd36f;
}

.stat-values {
  text-align: right;
}

.stat-cny {
  font-size: 14px;
  font-weight: 700;
  display: block;
  line-height: 1.3;
}

.stat-mga {
  font-size: 10px;
  opacity: 0.7;
  display: block;
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
  cursor: pointer;
}

/* Transactions List - Style harmonisé avec l'historique */
.transactions-list {
  padding: 0 20px;
}

.history-item {
  margin-bottom: 20px;
  cursor: pointer;
}

.item-main {
  background: white;
  border-radius: 18px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #edf1f7;
}

.method-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 15px;
}

.method-icon.wechat {
  background: #07c160;
  color: white;
}

.method-icon.alipay {
  background: #00a0e9;
  color: white;
}

.item-info {
  flex: 1;
}

.payment-method {
  margin: 0 0 4px;
  font-size: 12px;
  color: #8892a0;
}

.username-owner {
  color: var(--ion-color-primary) !important;
  font-weight: 600;
}

.item-info h4 {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 700;
  color: #1e2a4a;
}

.item-info h4 span {
  font-size: 10px;
  color: #8892a0;
  margin-left: 2px;
}

.item-info .rate {
  margin: 0;
  font-size: 11px;
  color: #8892a0;
}

.item-amounts {
  text-align: right;
}

.item-amounts .mga {
  margin: 0 0 5px 0;
  font-size: 11px;
  font-weight: 600;
  color: #8892a0;
}

.status-tag {
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.status-tag.confirmed {
  background: rgba(45, 211, 111, 0.12);
  color: #2dd36f;
}

.status-tag.in_process {
  background: rgba(56, 128, 255, 0.12);
  color: #3880ff;
}

.status-tag.request_transfer {
  background: rgba(255, 196, 9, 0.12);
  color: #e0a800;
}

.status-tag.payed {
  background: rgba(112, 26, 211, 0.12);
  color: #7b2ff7;
}

.status-tag.draft {
  background: rgba(136, 146, 160, 0.15);
  color: #8892a0;
}

.status-tag.canceled {
  background: rgba(235, 68, 90, 0.12);
  color: #eb445a;
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

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .dashboard-content {
    --background: #121212;
  }

  .header-section h3 {
    color: white;
  }

  .rate-card {
    background: #1e1e1e;
    border-color: #2a2a2a;
  }

  .rate-info h3,
  .section-header h2 {
    color: white;
  }

  .item-main {
    background: #1e1e1e;
    border-color: #2a2a2a;
  }

  .item-info h4 {
    color: white;
  }

  .user-info h3 {
    color: white;
  }
}
</style>