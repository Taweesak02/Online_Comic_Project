import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export default function AccountMenu({ isLoggedIn = false, isAdmin = false, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const closeMenu = (event) => {
            if (event.type === 'keydown' && event.key !== 'Escape') return;
            if (event.type !== 'keydown' && menuRef.current?.contains(event.target)) return;
            setIsOpen(false);
        };

        document.addEventListener('mousedown', closeMenu);
        document.addEventListener('keydown', closeMenu);
        return () => {
            document.removeEventListener('mousedown', closeMenu);
            document.removeEventListener('keydown', closeMenu);
        };
    }, []);

    const close = () => setIsOpen(false);

    const goToProfile = () => {
        close();
        navigate('/profile');
    };

    const goToComicManagement = () => {
        close();
        navigate('/comic-management');
    };

    const goToReadingHistory = () => {
        close();
        navigate('/history');
    };

    const goToWalletTransactions = () => {
        close();
        navigate('/wallet/transactions');
    };

    const goToAdminManagement = () => {
        close();
        navigate('/admin');
    };

    const goToNotifications = () => {
        close();
        navigate('/notifications');
    };

    const logout = () => {
        close();
        onLogout?.();
        navigate('/');
    };

    return (
        <div className="relative" ref={menuRef}>
            {
            //เข้าสู่ระบบเพื่อเริ่มอ่านการ์ตูน           
            isLoggedIn ? (
                <Button
                    buttonText="บัญชีของฉัน"
                    icon="user"
                    ariaLabel="เปิดเมนูบัญชีผู้ใช้"
                    ariaExpanded={isOpen}
                    onClick={() => setIsOpen((open) => !open)}
                    className="min-w-0 px-3"
                />
            )
            //ไม่ได้เข้าสู่ระบบ 
            : (
                <Button
                    buttonText="ลงชื่อเข้าใช้"
                    icon="chevron"
                    variant="primary"
                    ariaLabel="เปิดเมนูบัญชี"
                    ariaExpanded={isOpen}
                    onClick={() => setIsOpen((open) => !open)}
                />
            )}
            {isOpen && isLoggedIn && (
                <div
                    className="absolute left-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white py-1.5 shadow-[0_3px_6px_rgba(25,25,25,0.16)]"
                    role="menu"
                >
                    <button
                        className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#191919] transition hover:bg-[#f5f8ff]"
                        type="button"
                        role="menuitem"
                        onClick={goToProfile}
                    >
                        ข้อมูลผู้ใช้
                    </button>
                    <button
                        className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#191919] transition hover:bg-[#f5f8ff]"
                        type="button"
                        role="menuitem"
                        onClick={goToNotifications}
                    >
                        การแจ้งเตือน
                    </button>
                    <button
                        className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#191919] transition hover:bg-[#f5f8ff]"
                        type="button" role="menuitem"
                        onClick={() => { close(); navigate('/favorites'); }}
                    >
                        การ์ตูนที่ชื่นชอบ
                    </button>
                    <button
                        className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#191919] transition hover:bg-[#f5f8ff]"
                        type="button" role="menuitem"
                        onClick={() => { close(); navigate('/followed'); }}
                    >
                        การ์ตูนที่ติดตาม
                    </button>
                    {!isAdmin && (
                        <>
                            <button
                                className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#191919] transition hover:bg-[#f5f8ff]"
                                type="button"
                                role="menuitem"
                                onClick={goToReadingHistory}
                            >
                                ประวัติการอ่าน
                            </button>
                            <button
                                className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#191919] transition hover:bg-[#f5f8ff]"
                                type="button"
                                role="menuitem"
                                onClick={goToWalletTransactions}
                            >
                                ประวัติ Wallet
                            </button>
                        </>
                    )}
                    <button
                        className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#191919] transition hover:bg-[#f5f8ff]"
                        type="button"
                        role="menuitem"
                        onClick={goToComicManagement}
                    >
                        Comic Management
                    </button>
                    {isAdmin && (
                        <button
                            className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#213f68] transition hover:bg-[#f5f8ff]"
                            type="button"
                            role="menuitem"
                            onClick={goToAdminManagement}
                        >
                            Admin Management
                        </button>
                    )}
                    <button
                        className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-red-600 transition hover:bg-red-50"
                        type="button"
                        role="menuitem"
                        onClick={logout}
                    >
                        ออกจากระบบ
                    </button>
                </div>
            )}

            {isOpen && !isLoggedIn && (
                <div
                    className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-[0_3px_6px_rgba(25,25,25,0.16)]"
                    role="menu"
                >
                    <h2 className="text-sm font-medium text-[#191919]">ลงชื่อเข้าใช้ระบบ</h2>
                    <p className="mt-1 text-xs text-[#666666]">เข้าสู่ระบบเพื่อเริ่มอ่านการ์ตูน</p>
                    <Link
                        className="mt-3.5 block rounded-full bg-[#0057ff] px-3 py-2.5 text-center text-[13px] font-medium text-white transition hover:bg-[#0048d1]"
                        to="/login"
                        role="menuitem"
                        onClick={close}
                    >
                        ลงชื่อเข้าใช้ระบบ
                    </Link>
                    <p className="mt-3.5 text-center text-xs text-[#666666]">
                        ยังไม่มีบัญชี?{' '}
                        <Link
                            className="font-medium text-[#0057ff] hover:underline"
                            to="/register"
                            role="menuitem"
                            onClick={close}
                        >
                            สมัครสมาชิก
                        </Link>
                    </p>
                </div>
            )}
        </div>
    );
}
