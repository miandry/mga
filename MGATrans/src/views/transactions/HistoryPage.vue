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
        <ion-searchbar v-model="searchQuery" placeholder="Rechercher un transfert..."></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content class="history-content">
      <div class="filter-section">
        <ion-segment v-model="filterStatus" mode="md" scrollable>
          <ion-segment-button value="all">
            <ion-label>Tous</ion-label>
          </ion-segment-button>
          <ion-segment-button value="in_process">
            <ion-label>En cours</ion-label>
          </ion-segment-button>
          <ion-segment-button value="payed">
            <ion-label>Payé</ion-label>
          </ion-segment-button>
          <ion-segment-button value="draft">
            <ion-label>Brouillon</ion-label>
          </ion-segment-button>
          <ion-segment-button value="confirmed">
            <ion-label>Confirmé</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <div class="transactions-container">
        <!-- Loading State (Skeleton) -->
        <div v-if="isLoading" class="skeleton-container">
          <div v-for="i in 5" :key="i" class="history-item skeleton">
            <div class="item-date">
              <ion-skeleton-text animated style="width: 80px; height: 12px;"></ion-skeleton-text>
            </div>
            <div class="item-main">
              <div class="method-icon skeleton-avatar">
                <ion-skeleton-text animated></ion-skeleton-text>
              </div>
              <div class="item-info">
                <h4><ion-skeleton-text animated style="width: 120px;"></ion-skeleton-text></h4>
                <p><ion-skeleton-text animated style="width: 80px;"></ion-skeleton-text></p>
                <p><ion-skeleton-text animated style="width: 60px;"></ion-skeleton-text></p>
              </div>
              <div class="item-amounts">
                <p class="cny"><ion-skeleton-text animated style="width: 70px; margin-left: auto;"></ion-skeleton-text></p>
                <p class="mga"><ion-skeleton-text animated style="width: 50px; margin-left: auto;"></ion-skeleton-text></p>
                <div class="status-skeleton">
                  <ion-skeleton-text animated style="width: 60px; height: 18px; border-radius: 4px; margin-left: auto;"></ion-skeleton-text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="state-container error">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
          <p>{{ loadError }}</p>
          <ion-button fill="clear" @click="fetchTransactions">Réessayer</ion-button>
        </div>

        <!-- Transactions List -->
        <template v-else>
          <div v-for="tx in filteredTransactions" :key="tx.id" class="history-item" @click="router.push('/transaction/' + tx.id)">
            <div class="item-date">{{ tx.date }}</div>
            <div class="item-main">
              <div class="method-icon" :class="tx.method.toLowerCase()">
                <ion-icon :icon="tx.method === 'WeChat' ? chatbubbleEllipses : card"></ion-icon>
              </div>
              <div class="item-info">
                <h4>{{ tx.amountCNY.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) }} <span>CNY</span></h4>
                <p class="payment-method">Via {{ tx.method }}</p>
                <p class="rate">Cours: {{ tx.rate.toLocaleString() }} MGA</p>
              </div>
              <div class="item-amounts">
                <p class="mga">≈ {{ tx.amountMGA.toLocaleString() }} MGA</p>
                <div class="status-tag" :class="tx.status">{{ statusLabel(tx.status) }}</div>
              </div>
            </div>
          </div>

          <div v-if="filteredTransactions.length === 0" class="empty-history">
            <ion-icon :icon="receiptOutline"></ion-icon>
            <h3>Aucun transfert trouvé</h3>
            <p>Vous n'avez pas encore de transactions correspondant à ce filtre.</p>
            <ion-button fill="outline" @click="router.push('/transfer')">Nouveau transfert</ion-button>
          </div>
        </template>

        <ion-infinite-scroll @ionInfinite="handleInfinite" :disabled="!hasMore">
          <ion-infinite-scroll-content loading-spinner="bubbles" loading-text="Chargement..."></ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </div>
    </ion-content>

    <BottomNav active="transactions" />
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, 
  IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonLabel, 
  IonIcon, IonButton, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent,
  IonSkeletonText
} from '@ionic/vue';
import { 
  chevronBackOutline, chatbubbleEllipses, card, 
  receiptOutline, alertCircleOutline
} from 'ionicons/icons';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTransactionStore, type Transaction } from '@/stores/transactions';
import { API_BASE_URL } from '@/services/api';
import BottomNav from '@/components/common/BottomNav.vue';

const router = useRouter();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();

const filterStatus = ref('all');
const searchQuery = ref('');
const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const loadError = ref('');

// Pagination state
const currentPage = ref(0);
const itemsPerPage = 5;
const hasMore = ref(true);

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
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yy}, ${hours}:${mins}`;
};

/** Map raw API node to local tx model */
const mapNode = (node: any): Transaction => {
  const rmb = parseFloat(node.field_montant_rmb ?? 0);
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
    id:          String(node.nid ?? node.id ?? ''),
    beneficiary: node.title ?? '—',
    amountMGA:   cours > 0 ? Math.round(cours * rmb) : 0,
    amountCNY:   rmb,
    rate:        cours,
    method:      (node.field_method_payment === 'WeChat' ? 'WeChat' : 'Alipay') as 'WeChat' | 'Alipay',
    status:      (node.field_status_process === 'en_cours' || node.field_status_process === 'in_process' ? 'in_process' : 
                  node.field_status_process === 'payer' || node.field_status_process === 'payed' ? 'payed' : 
                  node.field_status_process) as Transaction['status'],
    date:        formatDate(node.created ?? node.changed),
    reference:   '',
    proofUrl:    node.field_image_ariary?.[0]?.url || '',
    qrCodeUrl:   node.field_image_qrcode?.map((img: any) => img.url) || [],
  };
};

const fetchTransactions = async (isLoadMore = false) => {
  if (!isLoadMore) {
    isLoading.value = true;
    currentPage.value = 0;
    hasMore.value = true;
    transactions.value = [];
  }
  
  loadError.value = '';
  
  try {
    let url = `${API_BASE_URL}/api_solutions/api/v2/node/transfer?sort[val]=created&sort[op]=DESC&offset=${itemsPerPage}&pager=${currentPage.value}&token=${authStore.token}`;
    
    // Add backend status filter if not "all"
    if (filterStatus.value !== 'all') {
      let backendStatus = filterStatus.value;
      // No mapping needed if backend already uses in_process/payed
      // But keeping a loose mapping for robustness
      if (backendStatus === 'in_process') backendStatus = 'in_process'; 
      if (backendStatus === 'payed') backendStatus = 'payed';
      
      url += `&filters[field_status_process][val]=${backendStatus}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    const rows = Array.isArray(data) ? data : (data.rows ?? []);
    
    const mapped = rows.map(mapNode);
    
    if (isLoadMore) {
      transactions.value = [...transactions.value, ...mapped];
    } else {
      transactions.value = mapped;
    }

    // Check if we have more
    if (mapped.length < itemsPerPage) {
      hasMore.value = false;
    }
    
    // Sync to store
    mapped.forEach((tx: Transaction) => {
      const exists = transactionStore.transactions.find(t => t.id === tx.id);
      if (!exists) transactionStore.addTransaction({ ...tx, reference: '' });
    });
  } catch (err) {
    console.error('History load error:', err);
    loadError.value = 'Impossible de charger l\'historique.';
  } finally {
    isLoading.value = false;
  }
};

const handleInfinite = async (ev: any) => {
  if (!hasMore.value || isLoading.value) {
    ev.target.complete();
    return;
  }
  
  currentPage.value++;
  await fetchTransactions(true);
  ev.target.complete();
};

// Reset search and filters
watch([filterStatus, searchQuery], () => {
  fetchTransactions();
});

onMounted(() => {
  fetchTransactions();
});

const filteredTransactions = computed(() => {
  let list = transactions.value;
  
  // Status filter (Now handled by backend, so this is technically redundant but kept safe 
  // in case of race conditions during filter change, though fetchTransactions() is watched)
  // if (filterStatus.value !== 'all') {
  //   list = list.filter((tx: Transaction) => tx.status === filterStatus.value);
  // }
  
  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((tx: Transaction) => 
      tx.beneficiary.toLowerCase().includes(q) || 
      tx.id.toLowerCase().includes(q) ||
      tx.method.toLowerCase().includes(q)
    );
  }
  
  return list;
});

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    in_process: 'En cours',
    payed: 'Payé',
    confirmed: 'Confirmé',
    request_transfer: 'Demande'
  };
  return labels[status] ?? status;
};
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
  padding: 10px 0 15px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

ion-segment {
  --background: transparent;
  padding: 0 10px;
}

ion-segment-button {
  --color: #8892a0;
  --color-checked: #1e2a4a;
  --indicator-color: #1e2a4a;
  font-weight: 500;
  min-width: 90px;
}

.transactions-container {
  padding: 10px 20px 20px;
}

.skeleton-container {
  width: 100%;
}

.history-item.skeleton {
  pointer-events: none;
}

.skeleton-avatar {
  background: transparent !important;
  border: none !important;
}

.skeleton-avatar ion-skeleton-text {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  margin: 0;
}

.status-skeleton {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
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

.item-amounts { text-align: right; }
.item-amounts .cny { margin: 0; font-size: 16px; font-weight: 800; color: #1e2a4a; }
.item-amounts .cny span { font-size: 10px; color: #8892a0; margin-left: 2px; }
.item-amounts .mga { margin: 0 5px 5px 0; font-size: 11px; font-weight: 600; color: #8892a0; }

.status-tag {
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.status-tag.confirmed    { background: rgba(45, 211, 111, 0.12); color: #2dd36f; }
.status-tag.en_cours     { background: rgba(56, 128, 255, 0.12); color: #3880ff; }
.status-tag.request_transfer { background: rgba(255, 196, 9, 0.12); color: #e0a800; }
.status-tag.payer        { background: rgba(112, 26, 211, 0.12); color: #7b2ff7; }
.status-tag.draft        { background: rgba(136, 146, 160, 0.15); color: #8892a0; }

.empty-history {
  text-align: center;
  padding: 60px 20px;
  color: #8892a0;
}

.empty-history ion-icon { font-size: 64px; opacity: 0.2; margin-bottom: 15px; }
.empty-history h3 { font-size: 18px; font-weight: 700; color: #1e2a4a; margin-bottom: 8px; }
.empty-history p { font-size: 14px; margin-bottom: 25px; }

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8892a0;
}

.state-container ion-spinner {
  margin-bottom: 10px;
}

.state-container.error {
  color: #eb445a;
}

.state-container.error ion-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

@media (prefers-color-scheme: dark) {
  ion-header ion-toolbar, .filter-section { background: #121212; --color: white; }
  .item-main { background: #1e1e1e; border-color: #2a2a2a; }
  .item-info h4, .item-amount .mga, .empty-history h3 { color: white; }
}
</style>
