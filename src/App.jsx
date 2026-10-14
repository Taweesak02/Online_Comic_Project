import SavedComicsPage from './pages/library/SavedComicsPage';
import PublicProfilePage from './pages/profile/PublicProfilePage';
import AuthorSearchPage from './pages/author-search/AuthorSearchPage';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/home/HomePage';
import SearchPage from './pages/search/SearchPage';
import ComicManagementPage from './pages/comic-management/ComicManagementPage';
import ChapterManagementPage from './pages/comic-management/ChapterManagementPage';
import ComicDetailPage from './pages/comics/ComicDetailPage';
import ChapterReaderPage from './pages/comics/ChapterReaderPage';
import CoinPurchasePage from './pages/wallet/CoinPurchasePage';
import AdminManagementPage from './pages/admin-management/AdminManagementPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ReadingHistoryPage from './pages/library/ReadingHistoryPage';
import WalletTransactionPage from './pages/wallet/WalletTransactionPage';
import PaymentPage from './pages/wallet/PaymentPage';
import api, { refreshAccessToken } from './api/client';
import { getWallet } from './api/coinPurchaseApi';

const PlaceholderPage = ({ title }) => <main className="mx-auto max-w-6xl px-4 py-16"><h1 className="text-2xl font-semibold text-slate-900">{title}</h1></main>;

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [coinBalance, setCoinBalance] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const isAdmin = currentUser?.roleName?.toLowerCase() === 'admin';
    const clearSession = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        setCoinBalance(0);
        setCurrentUser(null);
    };

    useEffect(() => {
        let isMounted = true;

        const validateSession = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!accessToken && !refreshToken) return;
            if (!refreshToken) {
                if (isMounted) clearSession();
                return;
            }

            const refreshSession = async () => {
                try {
                    await refreshAccessToken();
                    const response = await api.get('/auth/me');
                    if (isMounted) {
                        const result = response.data?.data ?? response.data;
                        setCurrentUser(result?.user ?? result);
                        setIsLoggedIn(true);
                    }
                } catch (refreshError) {
                    const refreshStatus = refreshError.response?.status;
                    if (isMounted && (refreshStatus === 401 || refreshStatus === 403)) clearSession();
                }
            };

            if (!accessToken) {
                await refreshSession();
                return;
            }

            try {
                // A normal browser refresh only validates the existing access token;
                // it does not rotate or remove a valid stored session.
                const response = await api.get('/auth/me');
                if (isMounted) {
                    const result = response.data?.data ?? response.data;
                    setCurrentUser(result?.user ?? result);
                    setIsLoggedIn(true);
                }
            } catch (accessError) {
                const accessStatus = accessError.response?.status;
                if (accessStatus !== 401 && accessStatus !== 403) return;
                await refreshSession();
            }
        };

        validateSession().finally(() => {
            if (isMounted) setAuthReady(true);
        });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;
        let active = true;
        getWallet()
            .then((wallet) => {
                if (active) setCoinBalance(wallet?.balance ?? 0);
            })
            .catch(() => {
                if (active) setCoinBalance(0);
            });
        return () => { active = false; };
    }, [isLoggedIn]);

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await api.post('/auth/logout', { refreshToken });
        } catch {
            // The local session still needs to be removed if the request fails.
        } finally {
            clearSession();
        }
    };

    const handleAuthenticated = (user) => {
        setCurrentUser(user ?? null);
        setIsLoggedIn(true);
        setAuthReady(true);
    };

    return <BrowserRouter>
        <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} coinBalance={coinBalance} onLogout={logout} />
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onAuthenticated={handleAuthenticated} />} />
            <Route path="/register" element={<RegisterPage onAuthenticated={handleAuthenticated} />} />
            <Route path="/authors/:userId" element={<PublicProfilePage />} />
            <Route path="/authors" element={<AuthorSearchPage />} />
            <Route path="/comics" element={<SearchPage />} />
            <Route path="/comics/:comicId" element={<ComicDetailPage isLoggedIn={isLoggedIn} onBalanceChange={setCoinBalance} />} />
            <Route path="/comics/:comicId/chapters/:chapterId" element={<ChapterReaderPage isLoggedIn={isLoggedIn} currentUser={currentUser} />} />
            <Route path="/comic-management" element={<ComicManagementPage />} />
            <Route path="/comic-management/:comicId/chapters" element={<ChapterManagementPage />} />
            <Route path="/coin-purchase" element={<CoinPurchasePage isLoggedIn={isLoggedIn} authReady={authReady} />} />
            <Route path="/payment" element={<PaymentPage isLoggedIn={isLoggedIn} authReady={authReady} onBalanceChange={setCoinBalance} />} />
            <Route path="/admin" element={<AdminManagementPage isAdmin={isAdmin} authReady={authReady} />} />
            <Route path="/profile" element={<ProfilePage isLoggedIn={isLoggedIn} authReady={authReady} onUserChange={setCurrentUser} />} />
            <Route path="/notifications" element={<NotificationsPage isLoggedIn={isLoggedIn} authReady={authReady} />} />
            <Route path="/favorites" element={<SavedComicsPage kind="favorites" isLoggedIn={isLoggedIn} authReady={authReady} />} />
            <Route path="/followed" element={<SavedComicsPage kind="followed" isLoggedIn={isLoggedIn} authReady={authReady} />} />
            <Route path="/history" element={<ReadingHistoryPage isLoggedIn={isLoggedIn} authReady={authReady} />} />
            <Route path="/wallet/transactions" element={<WalletTransactionPage isLoggedIn={isLoggedIn} authReady={authReady} />} />
            <Route path="*" element={<PlaceholderPage title="ไม่พบหน้าที่ต้องการ" />} />
        </Routes>
    </BrowserRouter>;
}
