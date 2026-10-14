import { useMemo, useState } from 'react';

const normalizeOption = (option, index) => {
    if (typeof option === 'string') {
        return { value: option, label: option };
    }

    const value = option?.value ?? option?.id ?? option?.slug ?? option?.name ?? option?.title ?? `${option?.label ?? 'option'}-${index}`;
    const label = option?.label ?? option?.name ?? option?.title ?? String(value ?? '');

    return { value: String(value), label: String(label) };
};

export default function FilterGroup({
    title,
    options = [],
    selectedValues = [],
    onSelect,
    emptyMessage = 'ไม่มีข้อมูล',
    multiSelect = false,
    variant = 'default',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const validOptions = useMemo(
        () =>
            (Array.isArray(options) ? options : []).map((option, index) => normalizeOption(option, index)).filter(({ label }) => {
                return Boolean(label?.trim() && label.toLowerCase() !== 'unnamed');
            }),
        [options],
    );

    const hasOptions = validOptions.length > 0;

    return (
        <div className="relative min-w-[160px] flex-1">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className={[
                    'flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-[11px] font-medium transition',
                    variant === 'sort'
                        ? 'border-[#d1d5db] bg-[#f8fafc] text-slate-700 hover:border-[#a5b4fc]'
                        : 'border-[#e5e7eb] bg-white text-slate-700 hover:border-[#cbd5e1]',
                ].join(' ')}
            >
                <span className="truncate">{title}</span>
                <svg className={`h-3.5 w-3.5 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M5.25 7.5 10 12.25 14.75 7.5H5.25Z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 z-20 mt-2 rounded-lg border border-[#e5e7eb] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                    {!hasOptions ? (
                        <div className="px-2 py-2 text-xs text-slate-500">{emptyMessage}</div>
                    ) : (
                        <div className="space-y-1">
                            {multiSelect ? (
                                validOptions.map(({ value, label }) => {
                                    const isSelected = selectedValues.includes(value);

                                    return (
                                        <label
                                            key={value}
                                            className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
                                        >
                                            <span className="truncate">{label}</span>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onSelect(value)}
                                                className="h-3.5 w-3.5 rounded border-slate-300 text-[#0057ff] focus:ring-[#0057ff]"
                                            />
                                        </label>
                                    );
                                })
                            ) : (
                                validOptions.map(({ value, label }) => {
                                    const isSelected = selectedValues.includes(value);

                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => onSelect(value)}
                                            className={[
                                                'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition',
                                                isSelected ? 'bg-[#eef4ff] text-[#0057ff]' : 'text-slate-700 hover:bg-slate-50',
                                            ].join(' ')}
                                        >
                                            <span className="truncate">{label}</span>
                                            {isSelected && <span>✓</span>}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
