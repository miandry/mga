import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { API_BASE_URL } from '@/services/api';

export const useExchangeStore = defineStore('exchange', () => {
    const rateMGAtoCNY = ref(700); // 1 CNY = X MGA
    const lastUpdated = ref(new Date().toISOString());
    const rateHistory = ref<any[]>([]);

    const convertMGAtoCNY = (amountMGA: number) => {
        return (amountMGA / rateMGAtoCNY.value).toFixed(2);
    };

    const convertCNYtoMGA = (amountCNY: number) => {
        return (amountCNY * rateMGAtoCNY.value).toFixed(0);
    };

    async function init() {
        await fetchHistory();
        if (rateHistory.value.length > 0) {
            rateMGAtoCNY.value = parseFloat(rateHistory.value[0].name);
            lastUpdated.value = rateHistory.value[0].changed || new Date().toISOString();
        }
    }

    async function fetchHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/api_solutions/api/v1/term/cours_rmb`);
            const data = await response.json();
            if (Array.isArray(data)) {
                // Sort by tid DESC to get latest first
                rateHistory.value = data.sort((a: any, b: any) => parseInt(b.tid) - parseInt(a.tid));
            }
        } catch (error) {
            console.error('Failed to fetch rate history:', error);
        }
    }

    async function updateRate(newRate: number, token: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/api_solutions/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entity_type: 'taxonomy_term',
                    bundle: 'cours_rmb',
                    name: newRate.toString(),
                    token: token
                })
            });
            const data = await response.json();
            if (data.status === true || data.status === 'success') {
                await fetchHistory();
                rateMGAtoCNY.value = newRate;
                lastUpdated.value = new Date().toISOString();
            } else {
                throw new Error(data.message || 'Failed to update rate');
            }
        } catch (error) {
            console.error('Failed to update exchange rate:', error);
            throw error;
        }
    }

    return { rateMGAtoCNY, lastUpdated, rateHistory, convertMGAtoCNY, convertCNYtoMGA, updateRate, init, fetchHistory };
});
