import ComicCard from './ComicCard';

export default function ComicSection({ title, comics = [], loading = false, error = '', onRetry }) {
  const renderComics = () => {
      if (loading) {
          return <output className="block py-8 text-center text-sm text-slate-500">กำลังโหลดการ์ตูน...</output>;
      }
      if (error) {
          return (
              <div className="py-8 text-center">
                  <p role="alert" className="text-sm text-red-700">{error}</p>
                  {onRetry && <button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-[#213f68] px-4 py-2 text-sm font-semibold text-white">ลองอีกครั้ง</button>}
              </div>
          );
      }
      if (comics.length > 0) {
          return (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {comics.map((comic) => <ComicCard key={comic.id} comic={comic} />)}
              </div>
          );
      }
      return <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีการ์ตูนให้แสดง</p>;
  };

  return (
    <section aria-labelledby={title}>
        <h2 id={title} className="rounded-t-lg bg-[#7fa356] px-4 py-2.5 text-base font-semibold text-white sm:px-5">
            {title}
        </h2>
        <div className="rounded-b-lg border border-slate-200 bg-slate-100 p-3 sm:p-4">
            {renderComics()}
        </div>
    </section>
  );
}
