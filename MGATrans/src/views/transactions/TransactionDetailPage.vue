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
            <ion-icon :icon="statusIcon"></ion-icon>
          </div>
          <h2>{{ statusLabel }}</h2>
          <p>{{ statusDescription }}</p>
        </div>

        <!-- Segments -->
        <div class="segment-container">
          <ion-segment v-model="activeTab" mode="ios">
            <ion-segment-button value="details">
              <ion-label>Détails</ion-label>
            </ion-segment-button>
            <ion-segment-button value="proofs">
              <ion-label>Justificatifs</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <!-- Details Tab -->
        <div v-if="activeTab === 'details'">

          <!-- Transfer Card -->
          <!-- <div class="info-card main-info" v-show="tx.status == 'cancel_requested' || tx.status == 'canceled'">
            <div class="info-row amount-row">
              <div>
                <p class="label">Motif du demande d'annulation</p>
                <p>{{ tx.reason }}</p>
              </div>
            </div>
          </div> -->

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

          <!-- QR Code Section (Only if confirmed) -->
          <div v-if="tx.status === 'confirmed' && tx.qrCodeUrl && tx.qrCodeUrl.length > 0" class="qr-section">
            <h3>Votre QR Code de réception</h3>
            <p>Présentez ce code ou partagez-le avec le bénéficiaire en Chine.</p>

            <div class="qr-carousel" :class="{ 'single': tx.qrCodeUrl.length === 1 }">
              <div v-for="(obj, idx) in tx.qrCodeUrl" :key="idx" class="qr-container"
                @click="router.push('/transaction/qr/' + tx.id)">
                <img :src="obj.url" :alt="obj.alt" />
                <div class="qr-overlay">
                  <ion-icon :icon="expandOutline"></ion-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Proof Section (Details Tab) -->
          <!-- Si c'est un array -->
          <div v-if="Array.isArray(tx.proofUrl) && tx.proofUrl.length > 0" class="info-card proof-card">
            <h3>Justificatif envoyé</h3>
            <div v-for="(obj, idx) in tx.proofUrl" :key="idx" class="proof-preview">
              <img :src="obj.url" :alt="obj.alt || 'Proof'" />
            </div>
          </div>

          <!-- Help Button -->
          <!-- <ion-button expand="block" fill="clear" color="medium" class="support-btn">
            <ion-icon slot="start" :icon="helpCircleOutline"></ion-icon>
            Besoin d'aide avec ce transfert ?
          </ion-button> -->
        </div>

        <!-- Proofs Tab -->
        <div v-if="activeTab === 'proofs'" class="proofs-tab">
          <!-- Ariary Proof -->
          <div class="upload-section">
            <h3 class="section-title">Preuve de paiement Ariary</h3>
            <p class="section-desc">Capture d'écran du transfert Mobile Money ou reçu bancaire.</p>

            <div class="upload-grid">
              <div class="upload-grid">
                <!-- Array -->
                <div v-if="Array.isArray(tx.proofUrl) && tx.proofUrl.length > 0" class="upload-grid">
                  <div v-for="(obj, idx) in tx.proofUrl" :key="idx" class="uploaded-thumb">
                    <img :src="obj.url" />
                    <p class="alt-text">{{ obj.alt }}</p>
                  </div>
                </div>
              </div>
              <div class="upload-grid">
                <div v-for="(img, idx) in ariaryProofs" :key="idx" class="uploaded-thumb mt-card">
                  <img :src="img.preview" />
                  <div class="remove-overlay" @click="removeImage('ariary', idx)">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </div>
                  <!-- Nouveau champ texte alternatif -->
                  <div class="alt-input-container">
                    <ion-input v-model="img.alt" placeholder="Ex: MM2401..." class="alt-input" mode="ios"></ion-input>
                  </div>
                </div>
              </div>
              <div v-if="canUploadAriary && tx.username === authStore.user.name" class="upload-btn-box"
                @click="triggerUpload('ariary')">
                <ion-icon :icon="cloudUploadOutline"></ion-icon>
                <span>Uploader</span>
              </div>
            </div>
            <input type="file" ref="ariaryInput" style="display:none" accept="image/*"
              @change="e => handleFileUpload('ariary', e)" />
          </div>

          <!-- QR Code Proof -->
          <div class="upload-section">
            <h3 class="section-title">Codes QR de réception</h3>
            <p class="section-desc">Images des codes WeChat ou Alipay du bénéficiaire.</p>

            <div class="upload-grid">
              <div v-if="tx.qrCodeUrl && tx.qrCodeUrl.length > 0" class="upload-grid">
                <div v-for="(obj, idx) in tx.qrCodeUrl" :key="idx" class="uploaded-thumb">
                  <img :src="obj.url" :alt="obj.alt || 'QR Code'" />
                  <p class="alt-text">{{ obj.alt }}</p>
                </div>
              </div>
              <div class="upload-grid">
                <div v-for="(img, idx) in qrProofs" :key="idx" class="uploaded-thumb mt-card">
                  <img :src="img.preview" />
                  <div class="remove-overlay" @click="removeImage('qr', idx)">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </div>
                  <!-- Nouveau champ texte alternatif -->
                  <div class="alt-input-container">
                    <ion-input v-model="img.alt" placeholder="Ex: 3000..." class="alt-input" mode="ios"></ion-input>
                  </div>
                </div>
              </div>
              <div v-if="canUploadQr && tx.username === authStore.user.name" class="upload-btn-box"
                @click="triggerUpload('qr')">
                <ion-icon :icon="cloudUploadOutline"></ion-icon>
                <span>Uploader</span>
              </div>
            </div>
            <input type="file" ref="qrInput" style="display:none" accept="image/*"
              @change="e => handleFileUpload('qr', e)" />
          </div>

          <div class="info-note">
            <ion-icon :icon="informationCircleOutline"></ion-icon>
            <p>Ces documents sont nécessaires pour que nos agents puissent valider votre transfert.</p>
          </div>
        </div>
      </div>

      <div v-else class="loading-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement des détails...</p>
      </div>
    </ion-content>

    <!-- Fixed Footer with Actions -->
    <ion-footer v-if="tx" class="ion-no-border shadow-footer">
      <ion-toolbar class="action-toolbar">
        <div class="button-stack">
          <!-- Sequential Action -->
          <ion-button v-if="tx.status === 'request_transfer' && authStore.hasRole('administrator')" expand="block"
            mode="ios" class="main-action-btn" :disabled="isUpdating" @click="updateStatus('in_process')">
            <ion-spinner v-if="isUpdating" name="crescent"></ion-spinner>
            <span v-else>Démarrer le transfert</span>
          </ion-button>

          <div v-if="tx.status === 'in_process' && authStore.hasRole('administrator')" class="dual-action-row">
            <!-- @click="updateStatus('request_transfer')" -->
            <ion-button expand="block" mode="ios" fill="outline" class="cancel-action-btn" :disabled="isUpdating"
              @click="updateStatus('canceled')">
              Annuler
            </ion-button>
            <ion-button expand="block" mode="ios" class="main-action-btn" :disabled="isUpdating"
              @click="updateStatus('payed')">
              <ion-spinner v-if="isUpdating" name="crescent"></ion-spinner>
              <span v-else>Confirmer</span>
            </ion-button>
          </div>

          <div v-if="tx.status === 'cancel_requested' && authStore.hasRole('administrator')" class="dual-action-row">
            <ion-button expand="block" mode="ios" class="main-action-btn" :disabled="isUpdating"
              @click="updateStatus('canceled')">
              <ion-spinner v-if="isUpdating" name="crescent"></ion-spinner>
              <span v-else>Accepter</span>
            </ion-button>
          </div>

          <!-- Authenticated User: Request Cancel avec modal -->
          <ion-button
            v-if="tx.status === 'in_process' && authStore.hasRole('authenticated_user') && !authStore.hasRole('administrator')"
            expand="block" mode="ios" fill="outline" color="danger" class="cancel-action-btn" :disabled="isUpdating"
            @click="openCancelModal">
            <ion-spinner v-if="isUpdating" name="crescent"></ion-spinner>
            <span v-else>Demander une annulation</span>
          </ion-button>

          <ion-button v-if="tx.status === 'payed' && authStore.hasRole('administrator')" expand="block" mode="ios"
            class="main-action-btn confirmed-btn" :disabled="isUpdating" @click="updateStatus('confirmed')">
            <ion-spinner v-if="isUpdating" name="crescent"></ion-spinner>
            <span v-else>Valider définitivement</span>
          </ion-button>

          <ion-button v-if="tx.status === 'draft'" expand="block" mode="ios" class="main-action-btn"
            :disabled="isUpdating || !canSubmit" @click="updateStatus('in_process')">
            <ion-spinner v-if="isUpdating" name="crescent"></ion-spinner>
            <span v-else>Envoyer la demande</span>
          </ion-button>
          <p v-if="tx.status === 'draft' && !canSubmit" class="validation-error">
            Uploadez la preuve Ariary et le QR code pour continuer.
          </p>

          <!-- Manual Override -->
          <ion-button expand="block" fill="clear" color="medium" size="small" class="manual-action-btn"
            @click="presentActionSheet">
            <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
            Forcer le changement de statut
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>

    <!-- Modal de raison d'annulation -->
    <ion-modal :is-open="isCancelModalOpen" @didDismiss="closeCancelModal" class="cancel-reason-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Raison de l'annulation</h2>
          <ion-button fill="clear" @click="closeCancelModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </div>
        <div class="modal-body">
          <ion-item lines="none" class="form-item">
            <ion-label position="stacked">Pourquoi vous souhaitez annuler ce transfert</ion-label>
            <ion-textarea v-model="cancelReason" placeholder="Ex: Erreur de montant..." :rows="5" :maxlength="500"
              counter="true" class="custom-textarea" auto-grow>
            </ion-textarea>
          </ion-item>
          <p class="char-count">{{ cancelReason.length }}/500</p>
        </div>
        <div class="modal-footer">
          <ion-button :disabled="!cancelReason.trim() || isUpdating" @click="submitCancelRequest"
            class="modal-btn confirm-btn">
            <ion-spinner v-if="isUpdating" name="crescent"></ion-spinner>
            <span v-else>Envoyer la demande</span>
          </ion-button>
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonIcon, IonButton, IonSpinner, IonFooter, IonSegment, IonSegmentButton, IonLabel, IonInput,
  IonModal, IonItem, IonTextarea,
  actionSheetController
} from '@ionic/vue';
import {
  chevronBackOutline, shareSocialOutline, checkmarkCircle,
  time, closeCircle, arrowForward, chatbubbleEllipses, card,
  qrCodeOutline, expandOutline, helpCircleOutline, settingsOutline,
  cloudUploadOutline, trashOutline, informationCircleOutline, closeOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTransactionStore } from '@/stores/transactions';
import { API_BASE_URL } from '@/services/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();

const tx = ref<any>(null);
const isUpdating = ref(false);
const activeTab = ref('details');

const ariaryProofs = ref<{ fid: number, preview: string, url: string, alt: string }[]>([]);
const qrProofs = ref<{ fid: number, preview: string, url: string, alt: string }[]>([]);
const ariaryInput = ref<HTMLInputElement | null>(null);
const qrInput = ref<HTMLInputElement | null>(null);

// État du modal
const isCancelModalOpen = ref(false);
const cancelReason = ref('');

const canSubmit = computed(() => {
  const hasAriary = ariaryProofs.value.length > 0 || (tx.value && tx.value.proofUrl);
  const hasQR = qrProofs.value.length > 0 || (tx.value && tx.value.qrCodeUrl && tx.value.qrCodeUrl.length > 0);
  return hasAriary && hasQR;
});

onMounted(() => {
  const id = String(route.params.id);
  tx.value = transactionStore.transactions.find(t => t.id === id);
  console.log('Loaded transaction:', tx.value);
  console.log(transactionStore.transactions);
});

const statusIcon = computed(() => {
  switch (tx.value?.status) {
    case 'confirmed': return checkmarkCircle;
    case 'payed': return checkmarkCircle;
    case 'in_process': return time;
    case 'request_transfer': return time;
    default: return closeCircle;
  }
});

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    request_transfer: 'Demande reçue',
    in_process: 'En cours de traitement',
    payed: 'Paiement effectué',
    confirmed: 'Transfert Validé',
    canceled: 'Transfert Annulé',
    cancel_requested: 'Demande d\'annulation',
  };
  return labels[tx.value?.status] ?? 'Statut inconnu';
});

const statusDescription = computed(() => {
  const desc: Record<string, string> = {
    draft: 'Ce transfert est sauvegardé comme brouillon.',
    request_transfer: 'Nous avons bien reçu votre demande. Elle est en attente de traitement.',
    in_process: 'Nos agents traitent actuellement votre transfert.',
    payed: 'Le paiement a été effectué. Nous validons les fonds.',
    confirmed: 'Transfert validé avec succès ! Les fonds sont prêts.',
    canceled: 'Transfert annulé par l\'utilisateur.',
    cancel_requested: 'En attente de validation par un administrateur.',
  };
  return desc[tx.value?.status] ?? '';
});

// Ouvrir le modal
const openCancelModal = () => {
  cancelReason.value = '';
  isCancelModalOpen.value = true;
};

// Fermer le modal
const closeCancelModal = () => {
  isCancelModalOpen.value = false;
  cancelReason.value = '';
};

// Soumettre la demande d'annulation avec raison
const submitCancelRequest = async () => {
  if (!cancelReason.value.trim()) return;

  // raison d'annulation 
  try {
    await fetch(`${API_BASE_URL}/api_solutions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity_type: 'node',
        bundle: 'cancellation_request',
        title: `Demande d'annulation pour le transfert #${tx.value.id}`,
        field_reason: cancelReason.value.trim(), // Ajouter la raison dans le payload
        field_transaction: tx.value.id,
        token: authStore.token,
        status: 1,
      }),
    });
    await updateStatus('cancel_requested', cancelReason.value.trim());
  } catch (error) {
    console.error('Erreur lors de la soumission de la demande d\'annulation:', error);
    alert('Erreur lors de l\'envoi de la demande d\'annulation. Veuillez réessayer.');
  }
  closeCancelModal();
};

const updateStatus = async (newStatus: string, reason?: string) => {
  if (!tx.value) return;
  isUpdating.value = true;

  try {
    let backendStatus = newStatus;

    const payload: any = {
      entity_type: 'node',
      bundle: 'transfer',
      title: `Transfert ${new Date().toLocaleDateString()}`,
      nid: tx.value.id,
      field_status_process: backendStatus,
      token: authStore.token,
      status: 1,
    };

    // Ajouter seulement si reason existe
    if (reason && reason.trim() !== '') { 
      payload.field_cancel_reason = reason;
    }

    // ---- ARIARY ----
    const existingAriary = Array.isArray(tx.value.proofUrl)
      ? tx.value.proofUrl.map(p => ({
        target_id: p.id,
        alt: p.alt,
        title: p.alt,
      }))
      : [];

    const newAriary = ariaryProofs.value.map(p => ({
      target_id: p.fid,
      alt: p.alt || '',
      title: p.alt || '',
    }));

    payload.field_image_ariary = [
      ...existingAriary,
      ...newAriary
    ];


    // ---- QR CODE ----
    const existingQr = Array.isArray(tx.value.qrCodeUrl)
      ? tx.value.qrCodeUrl.map(p => ({
        target_id: p.id,
        alt: p.alt,
        title: p.alt,
      }))
      : [];

    const newQr = qrProofs.value.map(p => ({
      target_id: p.fid,
      alt: p.alt || '',
      title: p.alt || ''
    }));

    payload.field_image_qrcode = [
      ...existingQr,
      ...newQr
    ];

    payload.status = 1;

    const response = await fetch(`${API_BASE_URL}/api_solutions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.status === true) {
      tx.value.status = newStatus;
      const storeTx = transactionStore.transactions.find(t => t.id === tx.value.id);
      if (storeTx) {
        storeTx.status = newStatus as any;

        const existingAriary = Array.isArray(storeTx.proofUrl)
          ? storeTx.proofUrl
          : [];

        const newAriary = ariaryProofs.value.map(p => ({
          id: String(p.fid),
          url: p.url,
          alt: p.alt || ''
        }));

        storeTx.proofUrl = [
          ...existingAriary,
          ...newAriary
        ];


        const existingQr = Array.isArray(storeTx.qrCodeUrl)
          ? storeTx.qrCodeUrl
          : [];

        const newQr = qrProofs.value.map(p => ({
          id: String(p.fid),
          url: p.url,
          alt: p.alt || ''
        }));

        storeTx.qrCodeUrl = [
          ...existingQr,
          ...newQr
        ];
        ariaryProofs.value = [];
        qrProofs.value = [];

        if (reason  && reason.trim() !== '') {
          storeTx.reason = reason;
        }
      }
      activeTab.value = 'details';
    } else {
      alert('Erreur: ' + (data.message || 'Échec de la mise à jour.'));
    }
  } catch (err) {
    console.error('Update status error:', err);
    alert('Erreur réseau lors de la mise à jour.');
  } finally {
    isUpdating.value = false;
  }
};

const triggerUpload = (type: 'ariary' | 'qr') => {
  if (type === 'ariary') ariaryInput.value?.click();
  else qrInput.value?.click();
};

const handleFileUpload = async (type: 'ariary' | 'qr', event: any) => {
  const file = event.target.files[0];
  if (!file) return;

  isUpdating.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Preview
    const reader = new FileReader();
    const preview = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    const response = await fetch(`${API_BASE_URL}/api_solutions/action/uploader`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();

    if (data.status && data.fid) {
      if (type === 'ariary') {
        ariaryProofs.value.push({ fid: data.fid, preview, url: data.url, alt: '' });
      } else {
        qrProofs.value.push({ fid: data.fid, preview, url: data.url, alt: '' });
      }
    } else {
      alert('Erreur: ' + (data.message || 'Upload échoué.'));
    }
  } catch (err) {
    console.error('Upload error:', err);
    alert('Erreur lors de l\'upload.');
  } finally {
    isUpdating.value = false;
    if (ariaryInput.value) ariaryInput.value.value = '';
    if (qrInput.value) qrInput.value.value = '';
  }
};

const removeImage = (type: 'ariary' | 'qr', index: number) => {
  if (type === 'ariary') ariaryProofs.value.splice(index, 1);
  else qrProofs.value.splice(index, 1);
};

const presentActionSheet = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Changer le statut (Manuel)',
    subHeader: 'Attention: cela contourne le cycle normal.',
    buttons: [
      { text: 'Brouillon', handler: () => updateStatus('draft') },
      { text: 'Demande reçue', handler: () => updateStatus('request_transfer') },
      { text: 'En cours', handler: () => updateStatus('in_process') },
      { text: 'Payé', handler: () => updateStatus('payed') },
      { text: 'Confirmé / Validé', handler: () => updateStatus('confirmed') },
      { text: 'Annuler', role: 'cancel' },
    ],
  });
  await actionSheet.present();
};

const maxUploads = 3;

// Compter les images existantes pour Ariary et QR
const existingAriaryCount = computed(() => {
  // tx.proofUrl peut être un array d'objets { url, alt }
  return Array.isArray(tx.value?.proofUrl) ? tx.value.proofUrl.length : 0;
});

const existingQrCount = computed(() => {
  return Array.isArray(tx.value?.qrCodeUrl) ? tx.value.qrCodeUrl.length : 0;
});

// Compter toutes les images (existantes + ajoutées)
const totalAriaryCount = computed(() => {
  return existingAriaryCount.value + ariaryProofs.value.length;
});

const totalQrCount = computed(() => {
  return existingQrCount.value + qrProofs.value.length;
});

// Déterminer si on peut encore uploader
const canUploadAriary = computed(() => {
  return totalAriaryCount.value < maxUploads && tx.value.status === 'draft';
});

const canUploadQr = computed(() => {
  return totalQrCount.value < maxUploads && tx.value.status === 'draft';
});

const handleShare = () => {
  // Share logic
};
</script>

<style>
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

.status-banner.draft {
  background: linear-gradient(135deg, #8892a0 0%, #616e7e 100%);
}

.status-banner.request_transfer {
  background: linear-gradient(135deg, #fbb03b 0%, #f7931e 100%);
}

.status-banner.in_process {
  background: linear-gradient(135deg, #3880ff 0%, #2150c9 100%);
}

.status-banner.payed {
  background: linear-gradient(135deg, #7b2ff7 0%, #5a18cc 100%);
}

.status-banner.confirmed {
  background: linear-gradient(135deg, #2dd36f 0%, #28ba62 100%);
}

.status-banner.canceled {
  background: linear-gradient(135deg, #eb445a 0%, #c62e44 100%);
}

.status-banner.cancel_requested {
  background: linear-gradient(135deg, #ff6b6b 0%, #d90429 100%);
}

.status-icon {
  font-size: 56px;
  margin-bottom: 10px;
}

.status-banner h2 {
  margin: 0 0 5px;
  font-size: 22px;
  font-weight: 800;
}

.status-banner p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.segment-container {
  margin-bottom: 20px;
}

ion-segment {
  --background: transparent;
}

.upload-section {
  margin-bottom: 25px;
  background: white;
  padding: 20px;
  padding-bottom: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e2a4a;
  margin: 0 0 4px;
}

.section-desc {
  font-size: 13px;
  color: #8892a0;
  margin: 0 0 15px;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.upload-btn-box,
.uploaded-thumb {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  position: relative;
  /* overflow: hidden; */
}

.alt-text {
  color: black;
  font-size: 10px;
  text-align: center;
  margin: 0;
}

.upload-btn-box {
  border: 2px dashed #d1d9e6;
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8892a0;
  cursor: pointer;
}

.upload-btn-box ion-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

.upload-btn-box span {
  font-size: 10px;
  font-weight: 600;
}

.uploaded-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.remove-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(235, 68, 90, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  border-radius: 14px;
}

.alt-input-container {
  margin-top: 4px;
  width: 100%;
}

.alt-input {
  height: 20px;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
}

.info-note {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eef4ff;
  padding: 12px 15px;
  border-radius: 12px;
  color: #3880ff;
}

.info-note ion-icon {
  font-size: 20px;
}

.info-note p {
  margin: 0;
  font-size: 12px;
}

.validation-error {
  color: #eb445a;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  margin-top: 5px;
}

.dual-action-row {
  display: flex;
  align-content: center;
  gap: 10px;
}

.dual-action-row ion-button {
  flex: 1;
}

.cancel-action-btn {
  --border-radius: 14px;
  height: 54px;
  font-weight: 700;
  font-size: 16px;
}

.shadow-footer {
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
  background: white;
  padding: 10px 10px 20px;
}

.action-toolbar {
  --background: transparent;
  --padding-top: 0;
  --padding-bottom: 0;
}

.main-action-btn {
  --border-radius: 14px;
  --box-shadow: none;
  height: 54px;
  font-weight: 700;
  font-size: 16px;
  margin: 0;
  --background: linear-gradient(135deg, #1e2a4a 0%, #3a4b7a 100%);
}

.confirmed-btn {
  --background: linear-gradient(135deg, #2dd36f 0%, #28ba62 100%);
}

.main-action-btn ion-spinner {
  width: 28px;
  height: 28px;
}

.button-stack {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.manual-action-btn {
  font-size: 11px;
  --padding-top: 0;
  --padding-bottom: 0;
  margin-top: 5px;
  opacity: 0.7;
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.amount-row h3 {
  margin: 5px 0 0;
  font-size: 20px;
  font-weight: 800;
  color: #1e2a4a;
}

.amount-row h3 span {
  font-size: 12px;
  font-weight: 400;
  color: #8892a0;
}

.arrow {
  font-size: 24px;
  color: #d1d9e6;
}

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

.label {
  font-size: 12px;
  color: #8892a0;
  margin: 0 0 4px;
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: #1e2a4a;
  margin: 0;
}

.method-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.wechat {
  background: #07c160;
}

.alipay {
  background: #00a0e9;
}

.method-chip ion-icon {
  margin-right: 5px;
}

.qr-section {
  text-align: center;
  padding: 20px;
  margin-bottom: 25px;
}

.qr-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e2a4a;
  margin-bottom: 10px;
}

.qr-section p {
  font-size: 13px;
  color: #8892a0;
  margin-bottom: 20px;
}

.qr-container {
  flex: 0 0 auto;
  scroll-snap-align: center;
  padding: 15px;
  background: white;
  border-radius: 20px;
  position: relative;
}

.qr-container img {
  width: 250px;
  height: 250px;
  object-fit: cover;
}

.qr-carousel {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding: 10px 15px;
  scroll-snap-type: x mandatory;
}

.qr-carousel::-webkit-scrollbar {
  display: none;
}

.qr-carousel.single {
  justify-content: center;
}

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

.proof-card h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 15px;
  color: #1e2a4a;
}

.proof-preview {
  border-radius: 12px;
  overflow: hidden;
  height: 200px;
  margin-bottom: 10px;
}

.proof-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.support-btn {
  margin-top: 10px;
  font-weight: 600;
  font-size: 13px;
}

.loading-state {
  text-align: center;
  padding: 50px 0;
  color: #8892a0;
}

.text-right {
  text-align: right;
}

/* Styles du modal */
.cancel-reason-modal {
  --height: auto;
  --border-radius: 28px;
  --width: 90%;
  --max-width: 400px;
}

.cancel-reason-modal .modal-content {
  background: white;
  border-radius: 28px;
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1e2a4a;
  margin: 0;
}

.modal-header ion-button {
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  color: #8892a0;
}

.modal-body {
  margin-bottom: 25px;
}

.form-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 5px;
}

.form-item ion-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e2a4a;
  margin-bottom: 8px;
}

.custom-textarea {
  --background: #f4f5f8;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  border-radius: 14px;
  font-size: 14px;
  border: 1px solid #edf1f7;
  margin-top: 8px;
}

.char-count {
  font-size: 11px;
  color: #8892a0;
  text-align: right;
  margin: 5px 0 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  height: 48px;
  font-weight: 600;
  font-size: 14px;
  margin: 0;
  --border-radius: 14px;
}

.cancel-btn {
  --border-color: #edf1f7;
  --color: #8892a0;
}

.confirm-btn {
  --background: #eb445a;
  --background-hover: #c62e44;
  color: white;
}

.confirm-btn:disabled {
  opacity: 0.5;
}

@media (prefers-color-scheme: dark) {
  .transaction-detail-content {
    --background: #121212;
  }

  .info-card,
  .qr-container {
    background: #1e1e1e;
  }

  .amount-row h3,
  .value,
  .qr-section h3,
  .proof-card h3 {
    color: white;
  }

  .info-divider {
    background: #333;
  }

  .cancel-reason-modal .modal-content {
    background: #1e1e1e;
  }

  .modal-header h2 {
    color: white;
  }

  .form-item ion-label {
    color: white;
  }

  .custom-textarea {
    --background: #2a2a2a;
    border-color: #333;
    color: white;
  }

  .char-count {
    color: #666;
  }

  .cancel-btn {
    --border-color: #333;
    --color: #8892a0;
  }
}

.alt-input-container {
  margin-top: 4px;
  width: 100%;
}

.alt-input-container ion-input {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-start: 0;
  --inner-padding-end: 0;
  --border-width: 0;
  --border-color: transparent;
  --highlight-height: 0;
  min-height: 24px;
  height: 24px;
}

.alt-input-container ion-input .native-input {
  padding: 2px 4px !important;
  font-size: 10px !important;
  border: 1px solid #ccc !important;
  border-radius: 4px !important;
  background: white;
  height: 20px !important;
  min-height: 20px !important;
  width: 100%;
  box-sizing: border-box;
}

/* Pour le mode sombre */
@media (prefers-color-scheme: dark) {
  .alt-input-container ion-input .native-input {
    border-color: #444 !important;
    background: #1e1e1e;
    color: white;
  }

  .alt-input-container ion-input .native-input::placeholder {
    color: #666 !important;
  }
}
</style>