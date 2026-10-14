import { Link } from 'react-router-dom';

const formatCount = (value) => value == null ? '—' : Number(value).toLocaleString('th-TH');

export default function ComicCard({ comic }) {
  return (
    <Link className="group block h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#213f68]" to={`/comics/${comic.id}`} aria-label={`ดูรายละเอียด ${comic.title}`}>
        <div className={`relative aspect-2/3 overflow-hidden bg-linear-to-br ${comic.coverClass}`}>
            {comic.coverUrl && <img className="absolute inset-0 size-full object-cover" src={comic.coverUrl} alt="" loading="lazy" />}
        </div>
        <div className="p-3">
            <h3 className="line-clamp-2 min-h-10 text-2xl font-semibold text-slate-900">{comic.title}</h3>
            <dl className="flex flex-wrap items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-600 text-base">
                    <dt><span aria-hidden="true">★</span><span className="sr-only">คะแนนเฉลี่ย</span></dt>
                    <dd>{comic.rating}</dd>
                </div>
                <div className='w-[50%]'>
                    <div className="flex items-center gap-1 text-rose-600">
                        <dt><span aria-hidden="true">♥</span><span className="sr-only">รายการโปรด</span></dt>
                        <dd>{formatCount(comic.favoriteCount)}</dd>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                        <dt>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
                                <path d="M0 0h32v32H0z" fill="none" />
                                <path fill="currentColor" d="M30.94 15.66A16.69 16.69 0 0 0 16 5A16.69 16.69 0 0 0 1.06 15.66a1 1 0 0 0 0 .68A16.69 16.69 0 0 0 16 27a16.69 16.69 0 0 0 14.94-10.66a1 1 0 0 0 0-.68M16 25c-5.3 0-10.9-3.93-12.93-9C5.1 10.93 10.7 7 16 7s10.9 3.93 12.93 9C26.9 21.07 21.3 25 16 25" />
                                <path fill="currentColor" d="M16 10a6 6 0 1 0 6 6a6 6 0 0 0-6-6m0 10a4 4 0 1 1 4-4a4 4 0 0 1-4 4" />
                            </svg>
                        </dt><dd>{formatCount(comic.viewCount)}</dd>
                    </div>
                </div>
            </dl>
        </div>
    </Link>
  );
}
