const iconPaths = {
    chevron: <path d="m7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z" />,
    coin: <><path d="M8 3a5 5 0 1 1 0 10A5 5 0 0 1 8 3M7 5v6h2V5z" /><path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1m0 1a6 6 0 1 0 0 12A6 6 0 0 0 8 2" /></>,
    search: <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1S492.1 112 412 112s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6M570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4" />,
    user: <><path d="M16 9a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-2 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0" /><path fillRule="evenodd" clipRule="evenodd" d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11s11-4.925 11-11S18.075 1 12 1M3 12c0 2.09.713 4.014 1.908 5.542A8.99 8.99 0 0 1 12.065 14a8.98 8.98 0 0 1 7.092 3.458A9 9 0 1 0 3 12m9 9a8.96 8.96 0 0 1-5.672-2.012A6.99 6.99 0 0 1 12.065 16a6.99 6.99 0 0 1 5.689 2.92A8.96 8.96 0 0 1 12 21" /></>,
};

export function Icon({ name, className = 'size-4 shrink-0' }) {
    const path = iconPaths[name];
    if (!path) return null;
    const getViewBox = () => {
        if (name === 'coin') {
            return '0 0 16 16';
        }
        if (name === 'search') {
            return '0 0 1024 1024';
        }
        return '0 0 24 24';
    };

    const viewBox = getViewBox();
    return <svg className={className} viewBox={viewBox} fill="currentColor" aria-hidden="true" focusable="false">{path}</svg>;
}

const variantStyles = {
    neutral: 'border border-[#e8e8e8] bg-white text-[#191919] hover:bg-[#f0f0f0] focus:ring-[#0057ff]',
    primary: 'border border-transparent bg-[#0057ff] text-white hover:bg-[#0048d1] focus:ring-[#0057ff]',
    subtle: 'border border-[#e0eaff] bg-[#f5f8ff] text-[#0057ff] hover:bg-[#eaf1ff] focus:ring-[#0057ff]',
};

export default function Button({ buttonText, icon, onClick, ariaLabel, ariaExpanded, variant = 'neutral', className = '' }) {
  return (
    <button
        type="button"
        className={`inline-flex min-h-9 min-w-28 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]} ${className}`}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
    >
        <span>{buttonText}</span>
        <Icon name={icon} />
    </button>
  );
}
