import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';

import ProfileContent from './components/ProfileContent';

export default function PublicProfilePage() {
    const { userId } = useParams();
    const location = useLocation();
    const [params] = useSearchParams();
    const user = String(location.state?.user?.id) === userId ? location.state.user : undefined;
    const username = params.get('username') || '';

    return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        <Link to="/authors" className="text-sm font-semibold text-[#213f68]">
            ← ค้นหาผู้แต่ง / ผู้ใช้
        </Link>
        <ProfileContent 
            key={`${userId}:${username}`} 
            userId={userId} 
            initialUser={user} 
            username={username} 
        />
    </main>;
}
