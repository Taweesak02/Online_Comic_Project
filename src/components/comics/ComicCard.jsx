import { Link } from 'react-router-dom';

const formatCount = (value) => value == null ? '—' : Number(value).toLocaleString('th-TH');

export default function ComicCard({ comic }) {
  return (
    <Link className="group block h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#213f68]" to={`/comics/${comic.id}`} aria-label={`ดูรายละเอียด ${comic.title}`}>
        <div className={`relative aspect-[2/3] overflow-hidden bg-gradient-to-br ${comic.coverClass}`}>
            {comic.coverUrl && <img className="absolute inset-0 size-full object-cover" src={comic.coverUrl} alt="" loading="lazy" />}
        </div>
        <div className="space-y-3 p-3">
            <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">{comic.title}</h3>
            <dl className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                <div className="flex items-center gap-1 text-amber-600">
                    <dt><span aria-hidden="true">★</span><span className="sr-only">คะแนนเฉลี่ย</span></dt>
                    <dd>{comic.rating}</dd>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                    <dt>เข้าชม</dt><dd>{formatCount(comic.viewCount)}</dd>
                </div>
                <div className="flex items-center gap-1 text-rose-600">
                    <dt><span aria-hidden="true">♥</span><span className="sr-only">รายการโปรด</span></dt>
                    <dd>{formatCount(comic.favoriteCount)}</dd>
                </div>
            </dl>
        </div>
    </Link>
  );
}
