const apiBaseUrl = () => {
    const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    try { return new URL(rawUrl, window.location.origin).origin; }
    catch { return 'http://localhost:3000'; }
};

export const getCoverUrl = (value) => {
    const image = typeof value === 'object' ? value?.url ?? value?.path ?? value?.coverImage ?? value?.image : value;
    if (!image) return '';
    const clean = String(image).trim().replaceAll('\\', '/');
    if (!clean || clean.startsWith('data:') || /^https?:\/\//.test(clean)) return clean;
    const publicPath = clean.startsWith('/') ? clean : `/${clean}`;
    // In development, use Vite's /uploads proxy. It avoids CORS/CORP image
    // blocking for local files returned by the backend.
    if (import.meta.env.DEV && publicPath.startsWith('/uploads/')) return publicPath;
    return `${apiBaseUrl()}${publicPath}`;
};

export const extractRelationIds = (items) => (Array.isArray(items) ? items : [])
    .map((item) => item?.id ?? item?.categoryId ?? item?.tagId ?? item?.value ?? item?.category?.id ?? item?.tag?.id)
    .map(Number)
    .filter((id) => Number.isFinite(id) && id > 0);

export const comicStatusLabels = {
    ONGOING: 'กำลังเผยแพร่',
    COMPLETED: 'จบแล้ว',
    HIATUS: 'พักการเผยแพร่',
    CANCELLED: 'ยกเลิกการเผยแพร่',
};

export const getComicStatusLabel = (status) => comicStatusLabels[status] ?? 'ไม่ทราบสถานะ';
