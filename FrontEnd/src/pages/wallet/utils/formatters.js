export const formatPrice = (price) => new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
}).format(Number(price));

export const formatNumber = (value) => new Intl.NumberFormat('th-TH').format(Number(value) || 0);

export const formatDate = (value) => {
    if (!value) return 'ไม่ทราบเวลา';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'ไม่ทราบเวลา';

    return new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

