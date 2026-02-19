<template>
  <ion-page>
    <ion-content :fullscreen="true" class="dashboard-content">
      <!-- Header Section -->
      <div class="header-section">
        <div class="user-info">
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
        <p class="balance-label">Solde total</p>
        <h1 class="balance-amount">1,250,000 <span>MGA</span></h1>
        <div class="card-footer">
          <div class="exchange-preview">
            <ion-icon :icon="refreshOutline"></ion-icon>
            <span>≈ {{ exchangeStore.convertMGAtoCNY(1250000) }} CNY</span>
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
            <ion-icon
              :icon="tx.status === 'validated' ? checkmark : (tx.status === 'pending' ? timeOutline : close)"></ion-icon>
          </div>
          <div class="tx-info">
            <h4>Transfert vers {{ tx.beneficiary }}</h4>
            <p>{{ tx.date }} • {{ tx.method }}</p>
          </div>
          <div class="tx-amount">
            <p class="mga">{{ tx.amountMGA.toLocaleString() }} MGA</p>
            <p class="cny">{{ tx.amountCNY }} CNY</p>
          </div>
        </div>

        <div v-if="recentTransactions.length === 0" class="empty-state">
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
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import {
  notificationsOutline,
  refreshOutline,
  trendingUpOutline,
  checkmark,
  timeOutline,
  close,
  receiptOutline
} from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useExchangeStore } from '@/stores/exchange';
import { useTransactionStore } from '@/stores/transactions';
import BottomNav from '@/components/common/BottomNav.vue';

const router = useRouter();
const authStore = useAuthStore();
const exchangeStore = useExchangeStore();
const transactionStore = useTransactionStore();

const storedUser = localStorage.getItem('user')

if (storedUser) {
  authStore.user = JSON.parse(storedUser)
}

// Mock some recent transactions if store is empty for demo
const recentTransactions = ref([
  { id: '1', beneficiary: 'Alibaba Seller', amountMGA: 500000, amountCNY: 750, method: 'Alipay', status: 'validated', date: 'Aujourd\'hui, 09:45' },
  { id: '2', beneficiary: 'Li Wei', amountMGA: 200000, amountCNY: 300, method: 'WeChat', status: 'pending', date: 'Hier, 14:20' },
]);
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

.tx-icon.validated {
  background: rgba(45, 211, 111, 0.1);
  color: #2dd36f;
}

.tx-icon.pending {
  background: rgba(255, 196, 9, 0.1);
  color: #ffc409;
}

.tx-icon.rejected {
  background: rgba(235, 68, 90, 0.1);
  color: #eb445a;
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
