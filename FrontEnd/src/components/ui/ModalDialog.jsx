import { useEffect, useRef } from 'react';

export default function ModalDialog({ children, label, onClose }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            aria-label={label}
            className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-y-auto bg-transparent p-4 py-8 backdrop:bg-[#0d0c22]/45 backdrop:backdrop-blur-sm"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
            {children}
        </dialog>
    );
}
