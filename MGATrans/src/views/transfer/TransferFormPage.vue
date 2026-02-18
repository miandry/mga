<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons v-if="!token" slot="start">
          <ion-back-button default-href="/dashboard" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouveau transfert</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="!isValidToken" class="error-banner">
        <ion-icon :icon="closeCircleOutline"></ion-icon>
        <p>Lien invalide ou expiré. Veuillez demander un nouvel accès.</p>
      </div>

      <div class="stepper">
        <div class="step active">1</div>
        <div class="line"></div>
        <div class="step">2</div>
      </div>

      <div class="form-section">
        <div class="currency-switch-container">
          <ion-segment v-model="inputCurrency" @ion-change="handleCurrencyChange">
            <ion-segment-button value="MGA">
              <ion-label>Ariary (MGA)</ion-label>
            </ion-segment-button>
            <ion-segment-button value="CNY">
              <ion-label>RMB (CNY)</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <label class="input-label">Montant à envoyer ({{ inputCurrency }})</label>
        <div class="amount-container">
          <ion-input 
            type="number" 
            :placeholder="inputCurrency === 'MGA' ? '0' : '0.00'" 
            v-model="amountInput" 
            @ion-input="handleInputChange"
            class="main-amount-input"
          ></ion-input>
          <span class="currency">{{ inputCurrency }}</span>
        </div>

        <div class="conversion-banner">
          <ion-icon :icon="swapVerticalOutline"></ion-icon>
          <div class="conv-info">
            <p v-if="inputCurrency === 'MGA'">Le bénéficiaire recevra environ</p>
            <p v-else>Cela vous coûtera environ</p>
            
            <h3 v-if="inputCurrency === 'MGA'">{{ amountCNY }} <span>CNY</span></h3>
            <h3 v-else>{{ amountMGA_Display }} <span>MGA</span></h3>
          </div>
        </div>

        <label class="input-label">Mode de réception</label>
        <div class="method-grid">
          <div 
            class="method-card" 
            :class="{ selected: method === 'WeChat' }"
            @click="method = 'WeChat'"
          >
            <div class="method-icon wechat">
              <ion-icon :icon="chatbubbleEllipsesOutline"></ion-icon>
            </div>
            <p>WeChat Pay</p>
            <div class="radio-check"></div>
          </div>
          <div 
            class="method-card" 
            :class="{ selected: method === 'Alipay' }"
            @click="method = 'Alipay'"
          >
            <div class="method-icon alipay">
              <ion-icon :icon="cardOutline"></ion-icon>
            </div>
            <p>Alipay</p>
            <div class="radio-check"></div>
          </div>
        </div>

        </div>

      <div class="info-note">
        <ion-icon :icon="informationCircleOutline"></ion-icon>
        <p>Vérifiez bien le montant et le mode de réception. Les transferts sont définitifs après validation.</p>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <ion-toolbar class="footer-toolbar">
        <ion-button expand="block" class="next-btn" @click="handleContinue" :disabled="!isValid">
          Continuer
          <ion-icon slot="end" :icon="arrowForwardOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, 
  IonContent, IonInput, IonList, IonItem, IonIcon, IonFooter, IonButton,
  IonSegment, IonSegmentButton, IonLabel
} from '@ionic/vue';
import { 
  chevronBackOutline, swapVerticalOutline, chatbubbleEllipsesOutline, 
  cardOutline, informationCircleOutline, arrowForwardOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useExchangeStore } from '@/stores/exchange';
import { API_BASE_URL } from '@/services/api';

const router = useRouter();
const route = useRoute();
const exchangeStore = useExchangeStore();

const amountInput = ref<number | null>(null);
const inputCurrency = ref('MGA');
const amountCNY = ref('0');
const amountMGA_Display = ref('0');
const method = ref('WeChat');
const token = ref<string | null>(null);
const isValidToken = ref(true);

onMounted(async () => {
  token.value = route.query.token as string || null;
  if (token.value) {
    try {
      const response = await fetch(`${API_BASE_URL}/transfer?token=${token.value}`);
      const data = await response.json();
      if (data.status !== 'success') {
        isValidToken.value = false;
        console.error('Invalid token');
      }
    } catch (err) {
      console.error('Token validation error:', err);
    }
  }
  await exchangeStore.init();
});

const handleInputChange = (event: any) => {
  const val = parseFloat(event.target.value);
  if (!val) {
    amountCNY.value = '0';
    amountMGA_Display.value = '0';
    return;
  }

  if (inputCurrency.value === 'MGA') {
    amountCNY.value = exchangeStore.convertMGAtoCNY(val);
  } else {
    amountMGA_Display.value = exchangeStore.convertCNYtoMGA(val);
  }
};

const handleCurrencyChange = () => {
  // Clear input when switching for better UX
  amountInput.value = null;
  amountCNY.value = '0';
  amountMGA_Display.value = '0';
};

const isValid = computed(() => {
  return amountInput.value && amountInput.value > 0;
});

const handleContinue = () => {
  let finalMGA, finalCNY;
  
  if (inputCurrency.value === 'MGA') {
    finalMGA = amountInput.value;
    finalCNY = amountCNY.value;
  } else {
    finalCNY = amountInput.value;
    finalMGA = amountMGA_Display.value;
  }

  router.push({
    path: '/transfer/upload',
    query: {
      amountMGA: finalMGA,
      amountCNY: finalCNY,
      method: method.value,
      token: token.value
    }
  });
};
</script>

<style scoped>
.error-banner {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.error-banner ion-icon {
  font-size: 24px;
  margin-right: 12px;
}

.error-banner p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

ion-header ion-toolbar {
  --background: white;
  --color: #1e2a4a;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 30px;
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

.currency-switch-container {
  margin-bottom: 20px;
}

ion-segment {
  background: #f4f5f8;
  border-radius: 12px;
  padding: 4px;
}

ion-segment-button {
  --indicator-color: var(--ion-color-primary);
  --color: #8892a0;
  --color-checked: white;
  --border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  min-height: 40px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e2a4a;
  margin: 20px 0 10px;
}

.amount-container {
  background: white;
  border: 1px solid #edf1f7;
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding: 5px 20px;
}

.main-amount-input {
  --padding-start: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.currency {
  font-weight: 700;
  color: #8892a0;
  margin-left: 10px;
}

.conversion-banner {
  background: rgba(26, 77, 162, 0.05);
  margin-top: 15px;
  padding: 15px;
  border-radius: 18px;
  display: flex;
  align-items: center;
}

.conversion-banner ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
  margin-right: 15px;
}

.conv-info p {
  margin: 0 0 4px;
  font-size: 12px;
  color: #8892a0;
}

.conv-info h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e2a4a;
}

.conv-info span {
  font-size: 14px;
  color: #8892a0;
  font-weight: 400;
}

.method-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.method-card {
  background: white;
  border: 2px solid #edf1f7;
  border-radius: 18px;
  padding: 15px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.method-card.selected {
  border-color: var(--ion-color-primary);
  background: rgba(26, 77, 162, 0.02);
}

.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.wechat { background: #07c160; color: white; }
.alipay { background: #00a0e9; color: white; }

.method-card p {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  color: #1e2a4a;
}

.radio-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 18px;
  height: 18px;
  border: 2px solid #edf1f7;
  border-radius: 50%;
}

.method-card.selected .radio-check {
  background: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
  box-shadow: inset 0 0 0 3px white;
}

.custom-item {
  --background: white;
  --border-radius: 14px;
  border: 1px solid #edf1f7;
  margin-bottom: 15px;
}

.info-note {
  background: #fff8e1;
  padding: 12px 15px;
  border-radius: 14px;
  display: flex;
  margin-top: 25px;
}

.info-note ion-icon {
  color: #fbb03b;
  font-size: 20px;
  margin-right: 10px;
}

.info-note p {
  margin: 0;
  font-size: 12px;
  color: #5d4037;
  line-height: 1.4;
}

.footer-toolbar {
  padding: 10px 20px 20px;
  --background: transparent;
}

.next-btn {
  --border-radius: 16px;
  height: 56px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

@media (prefers-color-scheme: dark) {
  ion-header ion-toolbar { --background: #121212; --color: white; }
  .amount-container, .method-card, .custom-item { background: #1e1e1e; border-color: #2a2a2a; }
  .input-label, .conv-info h3, .method-card p { color: white; }
  .main-amount-input { color: #428cff; }
}
</style>
