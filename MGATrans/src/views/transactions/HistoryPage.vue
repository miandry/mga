<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Mon historique</ion-title>
      </ion-toolbar>
      <ion-toolbar class="search-toolbar">
        <ion-searchbar placeholder="Rechercher un transfert..."></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content class="history-content">
      <div class="filter-section">
        <ion-segment v-model="filterStatus" mode="md">
          <ion-segment-button value="all">
            <ion-label>Tous</ion-label>
          </ion-segment-button>
          <ion-segment-button value="pending">
            <ion-label>En attente</ion-label>
          </ion-segment-button>
          <ion-segment-button value="validated">
            <ion-label>Validés</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <div class="transactions-container">
        <div v-for="tx in filteredTransactions" :key="tx.id" class="history-item" @click="router.push('/transaction/' + tx.id)">
          <div class="item-date">{{ tx.date }}</div>
          <div class="item-main">
            <div class="method-icon" :class="tx.method.toLowerCase()">
              <ion-icon :icon="tx.method === 'WeChat' ? chatbubbleEllipses : card"></ion-icon>
            </div>
            <div class="item-info">
              <h4>Transfert {{ tx.method }}</h4>
              <p>Vers {{ tx.beneficiary }}</p>
            </div>
            <div class="item-amount">
              <p class="mga">{{ tx.amountMGA.toLocaleString() }} MGA</p>
              <div class="status-tag" :class="tx.status">{{ tx.status }}</div>
            </div>
          </div>
        </div>

        <div v-if="filteredTransactions.length === 0" class="empty-history">
          <ion-icon :icon="receiptOutline"></ion-icon>
          <h3>Aucun transfert trouvé</h3>
          <p>Vous n'avez pas encore de transactions correspondant à ce filtre.</p>
          <ion-button fill="outline" @click="router.push('/transfer')">Nouveau transfert</ion-button>
        </div>
      </div>
    </ion-content>

    <BottomNav active="transactions" />
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, 
  IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonLabel, 
  IonIcon, IonButton 
} from '@ionic/vue';
import { 
  chevronBackOutline, chatbubbleEllipses, card, 
  receiptOutline 
} from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactionStore } from '@/stores/transactions';
import BottomNav from '@/components/common/BottomNav.vue';

const router = useRouter();
const transactionStore = useTransactionStore();

const filterStatus = ref('all');

// Mock data for history
const transactions = ref([
  { id: 'TX54321', beneficiary: 'Alibaba Seller', amountMGA: 1250000, amountCNY: 1875, method: 'Alipay', status: 'validated', date: '11 Fév 2026, 10:30' },
  { id: 'TX98765', beneficiary: 'Li Wei', amountMGA: 500000, amountCNY: 750, method: 'WeChat', status: 'pending', date: '10 Fév 2026, 14:20' },
  { id: 'TX12345', beneficiary: 'Wang Shu', amountMGA: 200000, amountCNY: 300, method: 'WeChat', status: 'validated', date: '08 Fév 2026, 09:15' },
  { id: 'TX00001', beneficiary: 'Logistics LTD', amountMGA: 1500000, amountCNY: 2250, method: 'Alipay', status: 'rejected', date: '05 Fév 2026, 11:00' },
]);

const filteredTransactions = computed(() => {
  if (filterStatus.value === 'all') return transactions.value;
  return transactions.value.filter(tx => tx.status === filterStatus.value);
});
</script>

<style scoped>
.history-content {
  --background: #f8f9fc;
}

ion-header ion-toolbar {
  --background: white;
  --color: #1e2a4a;
}

.search-toolbar {
  --padding-bottom: 10px;
}

ion-searchbar {
  --background: #f4f5f8;
  --border-radius: 12px;
  padding: 0 20px;
}

.filter-section {
  padding: 10px 20px 20px;
  background: white;
}

ion-segment {
  --background: #f4f5f8;
  border-radius: 10px;
}

.transactions-container {
  padding: 10px 20px 100px;
}

.history-item {
  margin-bottom: 20px;
}

.item-date {
  font-size: 12px;
  color: #8892a0;
  font-weight: 600;
  margin-bottom: 8px;
  margin-left: 5px;
}

.item-main {
  background: white;
  border-radius: 18px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
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

.wechat { background: #07c160; color: white; }
.alipay { background: #00a0e9; color: white; }

.item-info { flex: 1; }
.item-info h4 { margin: 0 0 2px; font-size: 15px; font-weight: 700; color: #1e2a4a; }
.item-info p { margin: 0; font-size: 12px; color: #8892a0; }

.item-amount { text-align: right; }
.item-amount .mga { margin: 0 0 5px; font-size: 15px; font-weight: 700; color: #1e2a4a; }

.status-tag {
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.status-tag.validated { background: rgba(45, 211, 111, 0.1); color: #2dd36f; }
.status-tag.pending { background: rgba(255, 196, 9, 0.1); color: #ffc409; }
.status-tag.rejected { background: rgba(235, 68, 90, 0.1); color: #eb445a; }

.empty-history {
  text-align: center;
  padding: 60px 20px;
  color: #8892a0;
}

.empty-history ion-icon { font-size: 64px; opacity: 0.2; margin-bottom: 15px; }
.empty-history h3 { font-size: 18px; font-weight: 700; color: #1e2a4a; margin-bottom: 8px; }
.empty-history p { font-size: 14px; margin-bottom: 25px; }

@media (prefers-color-scheme: dark) {
  ion-header ion-toolbar, .filter-section { background: #121212; --color: white; }
  .item-main { background: #1e1e1e; border-color: #2a2a2a; }
  .item-info h4, .item-amount .mga, .empty-history h3 { color: white; }
}
</style>
