import AccountMenu from './AccountMenu';
import NotificationButton from './NotificationButton';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ isLoggedIn = false, isAdmin = false, coinBalance = 0, onLogout }) {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 border-b border-[#eaeaea] bg-white/90 shadow-[0_8px_24px_rgba(17,24,39,0.07)] backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <Link
                    className="flex items-center px-3 py-2 text-base font-extrabold tracking-tight text-[#191919] sm:text-lg"
                    to="/"
                >

                    อ่านการ์ตูนออนไลน์
                </Link>

                <nav
                    className="flex items-center justify-end gap-2"
                >
                    <AccountMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={onLogout} />

                    <Button buttonText="ค้นหาผู้แต่ง" icon="search" onClick={() => navigate('/authors')} className="min-w-0 px-3" />
                    <Button buttonText="ค้นหาการ์ตูน" icon="search" onClick={() => navigate('/comics')} className="min-w-0 px-3" />
                    {isLoggedIn && <NotificationButton />}
                    {isLoggedIn && !isAdmin && (
                        <Button
                            buttonText={coinBalance}
                            icon="coin"
                            variant="subtle"
                            ariaLabel={`เหรียญ ${coinBalance}`}
                            className="min-w-0 px-3"
                            onClick={() => navigate('/coin-purchase')}
                        />
                    )}
                </nav>
            </div>
        </header>
    );
}
