<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" :icon="chevronBackOutline"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouveau transfert</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="stepper">
        <div class="step active">1</div>
        <div class="line"></div>
        <div class="step">2</div>
      </div>

      <div class="form-section">
        <label class="input-label">Montant à envoyer (MGA)</label>
        <div class="amount-container">
          <ion-input 
            type="number" 
            placeholder="0" 
            v-model="amountMGA" 
            @ion-input="handleConvert"
            class="main-amount-input"
          ></ion-input>
          <span class="currency">MGA</span>
        </div>

        <div class="conversion-banner">
          <ion-icon :icon="swapVerticalOutline"></ion-icon>
          <div class="conv-info">
            <p>Le bénéficiaire recevra environ</p>
            <h3>{{ amountCNY }} <span>CNY</span></h3>
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

        <label class="input-label">Informations du bénéficiaire</label>
        <ion-list lines="none">
          <ion-item class="custom-item">
            <ion-input label-placement="stacked" label="Compte ou ID bénéficiaire" v-model="beneficiaryId" placeholder="ex: wxid_12345..."></ion-input>
          </ion-item>
          <ion-item class="custom-item">
            <ion-input label-placement="stacked" label="Nom du bénéficiaire" v-model="beneficiaryName" placeholder="ex: Li Wei"></ion-input>
          </ion-item>
        </ion-list>
      </div>

      <div class="info-note">
        <ion-icon :icon="informationCircleOutline"></ion-icon>
        <p>Vérifiez bien les informations du bénéficiaire. Les transferts sont définitifs après validation.</p>
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
  IonContent, IonInput, IonList, IonItem, IonIcon, IonFooter, IonButton 
} from '@ionic/vue';
import { 
  chevronBackOutline, swapVerticalOutline, chatbubbleEllipsesOutline, 
  cardOutline, informationCircleOutline, arrowForwardOutline 
} from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useExchangeStore } from '@/stores/exchange';

const router = useRouter();
const exchangeStore = useExchangeStore();

const amountMGA = ref<number | null>(null);
const amountCNY = ref('0');
const method = ref('WeChat');
const beneficiaryId = ref('');
const beneficiaryName = ref('');

const handleConvert = (event: any) => {
  const val = event.target.value;
  if (val) {
    amountCNY.value = exchangeStore.convertMGAtoCNY(parseFloat(val));
  } else {
    amountCNY.value = '0';
  }
};

const isValid = computed(() => {
  return amountMGA.value && amountMGA.value > 0 && beneficiaryId.value && beneficiaryName.value;
});

const handleContinue = () => {
  // Pass data to next step via router state or store
  router.push({
    path: '/transfer/upload',
    query: {
      amountMGA: amountMGA.value,
      amountCNY: amountCNY.value,
      method: method.value,
      beneficiaryId: beneficiaryId.value,
      beneficiaryName: beneficiaryName.value
    }
  });
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
