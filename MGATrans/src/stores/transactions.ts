import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Transaction {
    id: string;
    amountMGA: number;
    amountCNY: number;
    method: 'WeChat' | 'Alipay';
    status: 'pending' | 'validated' | 'rejected' | 'draft';
    date: string;
    beneficiary: string;
    proofUrl?: string;
    qrCodeUrl?: string | string[];
    reference?: string;
}

export const useTransactionStore = defineStore('transactions', () => {
    const transactions = ref<Transaction[]>([]);

    function addTransaction(tx: Transaction) {
        transactions.value.unshift(tx);
    }

    function updateTransactionStatus(id: string, status: Transaction['status'], qrCodeUrl?: string) {
        const tx = transactions.value.find(t => t.id === id);
        if (tx) {
            tx.status = status;
            if (qrCodeUrl) tx.qrCodeUrl = qrCodeUrl;
        }
    }

    return { transactions, addTransaction, updateTransactionStatus };
});