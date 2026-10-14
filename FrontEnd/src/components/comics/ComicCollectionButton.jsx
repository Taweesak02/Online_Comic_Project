import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ComicCollectionButton({ comicId, isLoggedIn, onChange, config, count }) {
    const [selected, setSelected] = useState(false);
    const [loadedComicId, setLoadedComicId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) return;

        let active = true;
        config.load()
            .then((favorites) => {
                if (!active) return;
                const found = favorites.some((favorite) => String(favorite.comicId ?? favorite.comic?.id) === String(comicId));
                setSelected(found);
                setLoadedComicId(String(comicId));
                setError('');
            })
            .catch((requestError) => {
                if (active) {
                    setLoadedComicId(String(comicId));
                    setError(requestError.response?.data?.message || config.loadError);
                }
            });

        return () => { active = false; };
    }, [comicId, isLoggedIn, config]);

    const toggle = async () => {
        setSaving(true);
        setError('');
        try {
            if (selected) {
                await config.remove(comicId);
                setSelected(false);
                onChange?.(-1);
            } else {
                await config.add(comicId);
                setSelected(true);
                onChange?.(1);
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || config.saveError);
        } finally {
            setSaving(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <Link className={`${config.spacing} inline-flex items-center gap-2 rounded-full border border-[#213f68] px-5 py-2.5 text-sm font-semibold text-[#213f68] transition hover:bg-[#213f68]/5`} to="/login">
                <span aria-hidden="true">{config.offIcon}</span> {config.loginLabel}
            </Link>
        );
    }

    const loading = loadedComicId !== String(comicId);

    const getLabel = () => {
        if (loading) {
            return 'กำลังตรวจสอบ...';
        }
        if (saving) {
            return 'กำลังบันทึก...';
        }
        if (selected) {
            return config.selectedLabel;
        }
        return config.label;
    };

    return (
        <div className={config.spacing}>
            <button
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${selected ? config.selectedClass : 'border border-[#213f68] text-[#213f68] hover:bg-[#213f68]/5'}`}
                type="button"
                disabled={loading || saving}
                onClick={toggle}
                aria-pressed={selected}
            >
                <span className={config.iconClass} aria-hidden="true">{selected ? config.onIcon : config.offIcon}</span>
                {getLabel()}
                {count != null && <span className={selected ? 'text-white/70' : 'text-[#666666]'}>· {count}</span>}
            </button>
            {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
        </div>
    );
}
