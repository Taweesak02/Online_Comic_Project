import api from '../../api/client';

const coverClasses = [
    'from-red-700 via-amber-500 to-slate-900',
    'from-slate-950 via-rose-700 to-amber-300',
    'from-emerald-700 via-pink-300 to-stone-100',
    'from-teal-800 via-emerald-500 to-rose-400',
    'from-blue-800 via-cyan-400 to-slate-100',
];

const getCoverUrl = (image) => {
    if (!image) return undefined;
    const origin = new URL(api.defaults.baseURL, window.location.origin).href.replace(/\/api\/?$/, '');
    const url = new URL(image, `${origin}/`);
    if (import.meta.env.DEV && url.origin === origin && url.pathname.startsWith('/uploads/')) {
        return `${url.pathname}${url.search}${url.hash}`;
    }
    return url.href;
};

export const toComicCard = (comic, index = 0) => ({
    id: comic.id ?? comic._id,
    title: comic.title ?? comic.name ?? 'Untitled Comic',
    rating: comic.avgRating == null && comic.rating == null ? '—' : Number(comic.avgRating ?? comic.rating).toFixed(1),
    ratingCount: comic.ratingCount ?? comic.ratings ?? '—',
    viewCount: comic.viewCount,
    favoriteCount: comic._count?.favorites ?? comic.favoriteCount,
    coverUrl: getCoverUrl(comic.coverImage ?? comic.cover ?? comic.image),
    coverClass: coverClasses[index % coverClasses.length],
});
