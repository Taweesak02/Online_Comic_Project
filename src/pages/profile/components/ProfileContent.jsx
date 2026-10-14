import usePublicProfile from '../hooks/usePublicProfile';
import { Link } from 'react-router-dom';

export default function ProfileContent({ userId, initialUser, username }) {
    const { state } = usePublicProfile({ userId, initialUser, username });

    if (state.loading) return <output className="block py-16 text-center text-slate-600">กำลังโหลดโปรไฟล์...</output>;
    if (state.error) return <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{state.error}</p>;
    const name = state.user?.username || `ผู้ใช้ #${userId}`;
    return <>
        <header className="mt-6 flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-3xl font-bold text-[#213f68]" aria-hidden="true">
                {state.user?.profileImage ? <img src={state.user.profileImage} alt="" className="size-full object-cover" /> : name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0"><h1 className="break-all text-2xl font-bold text-[#213f68]">{name}</h1><p className="mt-2 text-sm text-slate-600">การ์ตูนสาธารณะ {state.comics.length} เรื่อง</p></div>
        </header>
        <section className="mt-8" aria-labelledby="author-comics">
            <h2 id="author-comics" className="text-xl font-bold">ผลงานการ์ตูน</h2>
            <p className="mt-1 text-sm text-slate-600">เรียงจากใหม่ไปเก่า</p>
            {state.comics.length === 0 ? <p className="py-12 text-center text-slate-600">ยังไม่มีผลงานการ์ตูนสาธารณะ</p> :
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {state.comics.map((comic) => <li key={comic.id}>
                        <Link to={`/comics/${comic.id}`} className="flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#213f68]">
                            <div className="h-36 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                {comic.coverImage && <img src={comic.coverImage} alt="" className="size-full object-cover" />}
                            </div>
                            <div className="min-w-0"><h3 className="break-words font-bold text-[#213f68]">{comic.title}</h3>
                                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{comic.description}</p>
                                <p className="mt-3 text-xs text-slate-500">{comic.chapterCount ?? 0} ตอน · {Number(comic.viewCount ?? 0).toLocaleString('th-TH')} เข้าชม</p>
                            </div>
                        </Link>
                    </li>)}
                </ul>}
        </section>
    </>;
}

