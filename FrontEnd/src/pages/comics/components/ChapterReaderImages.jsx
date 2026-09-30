import imageUrl from '../utils/imageUrl';

export default function ChapterReaderImages({ pages }) {
    return (
        <div className="overflow-hidden bg-white sm:rounded-2xl">
            {pages?.length ? pages.map((page, index) => (
                <img
                    className="block h-auto w-full"
                    src={imageUrl(page.imageUrl)}
                    alt={`หน้าที่ ${index + 1}`}
                    key={page.id ?? page.imageUrl}
                />
            )) : (
                <p className="p-16 text-center text-[#666666]">ไม่มีรูปภาพในตอนนี้</p>
            )}
        </div>
    );
}
