export default function ComicStats({ score = 0, favoriteCount = 0, viewCount = 0 }) {
    const stats = [
        { label: 'คะแนน', icon: '★', value: Number(score).toFixed(1) },
        { label: 'รายการโปรด', icon: '♥', value: favoriteCount },
        { label: 'ยอดอ่าน', icon: '◉', value: viewCount },
    ];

    return (
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            {stats.map(({ label, icon, value }) => (
                <div className="rounded-2xl bg-[#f8f8f8] p-3" key={label}>
                    <strong className="block text-lg">
                        <span aria-hidden="true">{icon}</span> {value}
                    </strong>
                    <span>{label}</span>
                </div>
            ))}
        </div>
    );
}
