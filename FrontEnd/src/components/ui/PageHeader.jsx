export default function PageHeader({ title, className = '' }) {
    return (
        <header className={`rounded-4xl bg-[#95C06B] p-6 text-black sm:p-8 ${className}`}>
            <h1 className="text-3xl font-bold">{title}</h1>
        </header>
    );
}