import { Link } from 'react-router-dom';
import { getComicStatusLabel } from '../../../utils/comicUtils';
import ComicStats from '../../../components/comics/ComicStats';
import FavoriteButton from '../../../components/comics/FavoriteButton';
import FollowButton from '../../../components/comics/FollowButton';
import imageUrl from '../utils/imageUrl';

export default function ComicDetailOverview({ comicId, comic, isLoggedIn, updateFavoriteCount, updateFollowerCount }) {
    const labels = [...(comic.categories ?? []).map((item) => item.category?.name), ...(comic.tags ?? []).map((item) => item.tag?.name)].filter(Boolean);

    return (
        <section className="mt-5 grid gap-6 rounded-4xl border border-[#e7e7e9] bg-white p-5 shadow-[0_15px_50px_rgba(27,32,50,0.08)] sm:grid-cols-[220px_1fr] sm:p-8">
            <div className="mx-auto aspect-[2/3] w-full max-w-[13.75rem] overflow-hidden rounded-2xl bg-[#dcdacc] sm:mx-0">
                {comic.coverImage
                    ? <img className="size-full object-cover" src={imageUrl(comic.coverImage)} alt={`ปก ${comic.title}`} />
                    : <span className="grid size-full place-items-center text-sm text-[#666666]">ไม่มีรูปปก</span>}
            </div>
            <div>
                <p className="text-sm font-semibold text-[#213f68]">
                    {getComicStatusLabel(comic.status)}
                </p>
                <h1 className="mt-1 text-3xl font-bold text-[#0d0c22]">
                    {comic.title}
                </h1>
                <p className="mt-2 text-sm text-[#666666]">
                    ผู้แต่ง{' '}
                    {comic.creator?.id ? (
                        <Link
                            className="font-semibold text-[#213f68] underline-offset-4 hover:underline focus-visible:underline"
                            to={`/authors/${comic.creator.id}?username=${encodeURIComponent(comic.creator.username || '')}`}
                            state={{ user: comic.creator }}
                        >
                            {comic.creator.username || 'ไม่ระบุชื่อผู้แต่ง'}
                        </Link>
                    ) : (
                        <span className="font-semibold text-[#213f68]">{comic.creator?.username || 'ไม่ระบุชื่อผู้แต่ง'}</span>
                    )}
                </p>
                <p className="mt-4 whitespace-pre-line leading-7 text-[#666666]">
                    {comic.description || 'ยังไม่มีคำอธิบาย'}
                </p>
                {labels.length > 0 &&
                    <div className="mt-5 flex flex-wrap gap-2">{labels.map((label) =>
                        <span className="rounded-full bg-[#dcdacc]/60 px-3 py-1.5 text-xs font-semibold text-[#0d0c22]" key={label}>
                            {label}
                        </span>)}
                    </div>}
                <FavoriteButton
                    comicId={comicId}
                    isLoggedIn={isLoggedIn}
                    onFavoriteChange={updateFavoriteCount}
                />
                <FollowButton
                    comicId={comicId}
                    followerCount={comic._count?.follows}
                    isLoggedIn={isLoggedIn}
                    onFollowChange={updateFollowerCount}
                />
                <ComicStats
                    score={comic.avgRating}
                    favoriteCount={comic._count?.favorites}
                    viewCount={comic.viewCount}
                />
            </div>
        </section>
    );
}
