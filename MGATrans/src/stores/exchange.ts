import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useExchangeStore = defineStore('exchange', () => {
    const rateMGAtoCNY = ref(0.0015); // Example initial rate: 1 MGA = 0.0015 CNY
    const lastUpdated = ref(new Date().toISOString());

    const convertMGAtoCNY = (amountMGA: number) => {
        return (amountMGA * rateMGAtoCNY.value).toFixed(2);
    };

    const convertCNYtoMGA = (amountCNY: number) => {
        return (amountCNY / rateMGAtoCNY.value).toFixed(0);
    };

    function updateRate(newRate: number) {
        rateMGAtoCNY.value = newRate;
        lastUpdated.value = new Date().toISOString();
    }

    return { rateMGAtoCNY, lastUpdated, convertMGAtoCNY, convertCNYtoMGA, updateRate };
});
