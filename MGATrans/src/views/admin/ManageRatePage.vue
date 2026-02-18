<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Gestion du Taux</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="rate-card">
        <div class="header">
          <ion-icon :icon="trendingUpOutline"></ion-icon>
          <h2>Taux de change actuel</h2>
        </div>
        
        <div class="rate-display">
          <span class="mga">1CNY =</span>
          <div class="input-wrapper">
            <ion-input 
              type="number" 
              v-model="newRate" 
              placeholder="700"
              class="rate-input"
            ></ion-input>
          </div>
          <span class="rmb">MGA</span>
        </div>

        <ion-button expand="block" class="save-btn" @click="handleSave" :disabled="isLoading">
          <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
          <span v-else>Mettre à jour le taux</span>
        </ion-button>
        
        <p class="last-updated" v-if="exchangeStore.lastUpdated">
          Dernière mise à jour : {{ new Date(exchangeStore.lastUpdated).toLocaleString() }}
        </p>

        <div v-if="exchangeStore.rateHistory.length > 1" class="chart-container">
          <Line :data="chartData" :options="(chartOptions as any)" />
        </div>
      </div>

      <div class="info-section">
        <h3><ion-icon :icon="informationCircleOutline"></ion-icon> À propos du taux</h3>
        <p>Le taux de change défini ici est utilisé pour tous les nouveaux transferts initiés par les clients. Les transferts en cours ne sont pas affectés par la modification du taux.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, 
  IonTitle, IonContent, IonInput, IonButton, IonIcon, IonSpinner,
  toastController
} from '@ionic/vue';
import { trendingUpOutline, informationCircleOutline } from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useExchangeStore } from '@/stores/exchange';
import { useAuthStore } from '@/stores/auth';
import { Line } from 'vue-chartjs';
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  LinearScale, 
  PointElement, 
  CategoryScale,
  Filler
} from 'chart.js';

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  LinearScale, 
  PointElement, 
  CategoryScale,
  Filler
);

const exchangeStore = useExchangeStore();
const authStore = useAuthStore();
const newRate = ref('');
const isLoading = ref(false);
const showSuccess = ref(false);

const chartData = computed(() => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const cutoffTimestamp = Math.floor(threeMonthsAgo.getTime() / 1000);

  const history = [...exchangeStore.rateHistory]
    .filter(item => parseInt(item.changed) >= cutoffTimestamp)
    .reverse(); // Oldest first for chart

  return {
    labels: history.map(item => new Date(item.changed * 1000).toLocaleDateString()),
    datasets: [
      {
        label: 'Taux CNY/MGA',
        backgroundColor: 'rgba(56, 128, 255, 0.1)',
        borderColor: '#3880ff',
        data: history.map(item => parseFloat(item.name)),
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        display: true,
        color: 'rgba(0,0,0,0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};

onMounted(async () => {
  isLoading.value = true;
  await exchangeStore.init();
  newRate.value = exchangeStore.rateMGAtoCNY.toString();
  isLoading.value = false;
});

const handleSave = async () => {
  const rate = parseFloat(newRate.value);
  if (isNaN(rate) || rate <= 0) {
    const toast = await toastController.create({
      message: 'Veuillez entrer un taux valide.',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    return;
  }

  isLoading.value = true;
  showSuccess.value = false;
  try {
    await exchangeStore.updateRate(rate, authStore.token || '');
    showSuccess.value = true;
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);

    const toast = await toastController.create({
      message: 'Le taux a été mis à jour avec succès.',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    const toast = await toastController.create({
      message: 'Erreur lors de la mise à jour du taux.',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.chart-container {
  height: 250px;
  margin: 20px 0;
  padding: 10px;
  background: white;
  border-radius: 16px;
}

.rate-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  color: var(--ion-color-primary);
}

.header ion-icon {
  font-size: 28px;
  margin-right: 12px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.rate-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.mga, .rmb {
  font-weight: 600;
  color: #8892a0;
  font-size: 16px;
}

.input-wrapper {
  background: #f4f7fa;
  border-radius: 12px;
  padding: 5px 15px;
  width: 150px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--ion-color-primary);
  background: white;
}

.rate-input {
  --padding-start: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e2a4a;
  text-align: center;
}

.conversion-preview {
  background: rgba(var(--ion-color-primary-rgb), 0.05);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 25px;
}

.conversion-preview p {
  margin: 0;
  font-size: 14px;
  color: #616e7e;
}

.save-btn {
  --border-radius: 14px;
  height: 54px;
  font-weight: 700;
  margin-top: 10px;
}

.last-updated {
  text-align: center;
  font-size: 12px;
  color: #a0aec0;
  margin-top: 15px;
}

.info-section {
  background: #fff8e1;
  padding: 20px;
  border-radius: 18px;
}

.info-section h3 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: #b7791f;
  display: flex;
  align-items: center;
}

.info-section h3 ion-icon {
  margin-right: 8px;
  font-size: 20px;
}

.info-section p {
  margin: 0;
  font-size: 13px;
  color: #744210;
  line-height: 1.6;
}

@media (prefers-color-scheme: dark) {
  .rate-card { background: #1e1e1e; box-shadow: none; }
  .input-wrapper { background: #2d2d2d; }
  .rate-input { color: white; }
  .info-section { background: #2d2715; color: #f6e05e; }
  .info-section h3 { color: #f6e05e; }
  .info-section p { color: #ecc94b; }
}
</style>
