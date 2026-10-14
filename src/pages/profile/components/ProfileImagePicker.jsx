export default function ProfileImagePicker({ username, preview, imageFile, setImageFile }) {
    return (
        <aside className="rounded-4xl border border-[#e7e7e9] bg-white p-6 text-center shadow-[0_12px_35px_rgba(27,32,50,0.07)]">
            <div className="mx-auto grid size-40 place-items-center overflow-hidden rounded-full border-2 border-[#dcdacc] bg-[#f8f8f8]">
                {preview ? <img className="size-full object-cover" src={preview} alt="รูปโปรไฟล์" /> : <span className="text-5xl font-bold uppercase text-[#213f68]">{username.slice(0, 1) || '?'}</span>}
            </div>
            <label className="mt-5 inline-flex cursor-pointer rounded-full bg-[#213f68] px-5 py-2.5 text-sm font-semibold text-white">
                <span>เลือกรูปโปรไฟล์</span>
                <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
            </label>
            {imageFile && <p className="mt-2 truncate text-xs text-[#666666]">{imageFile.name}</p>}
        </aside>
    );
}
