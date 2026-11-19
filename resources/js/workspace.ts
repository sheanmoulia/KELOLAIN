export type Food = {
    id: number;
    version: number;
    name: string;
    category: string;
    qty: number;
    unit: string;
    price: number;
    buyDate: string;
    expiryDate: string;
    storage: string;
    daysLeft: number;
    urgency: number;
    riskScore: number;
    icon: string;
};

export type Waste = {
    id: number;
    name: string;
    category: string;
    qty: number;
    unit: string;
    loss: number;
    date: string;
    reason: string;
};

export type Owner = {
    name: string;
    email: string | null;
    isGuest: boolean;
    emailReminders: boolean;
    joinedAt: string;
};

export type ShelfRules = Record<string, Record<string, number>>;
export type InventoryOptions = {
    today: string;
    shelf: ShelfRules;
    categories: string[];
    storageOptions: string[];
    units: string[];
    reasons: string[];
};

export type DialogState =
    | { kind: 'add' }
    | { kind: 'edit' | 'use' | 'waste'; food: Food };

export const money = (amount: number) =>
    'Rp ' + Math.round(amount).toLocaleString('id-ID');
export const dateLabel = (date: string) =>
    new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(date + 'T00:00:00Z'));

export function remainingLabel(days: number) {
    if (days < 0) return `${Math.abs(days)} hari lewat`;
    return days === 0 ? 'Hari ini' : `${days} hari lagi`;
}

export function riskLabel(urgency: number) {
    if (urgency === 3) return { label: 'Tinggi', tone: 'danger' };
    if (urgency === 2) return { label: 'Sedang', tone: 'warning' };
    return { label: 'Rendah', tone: 'safe' };
}

export function estimateExpiry(buyDate: string, shelfDays: number) {
    const date = new Date(buyDate + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + shelfDays);
    return date.toISOString().slice(0, 10);
}
