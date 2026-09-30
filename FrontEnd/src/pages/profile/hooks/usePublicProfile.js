import { useEffect, useState } from 'react';
import { getPublicUserComics, searchPublicUsers } from '../../../api/publicUserApi';

export default function usePublicProfile({ userId, initialUser, username }) {
    const [state, setState] = useState({ loading: true, comics: [], user: initialUser, error: '' });
    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const comics = await getPublicUserComics(userId, controller.signal);
                let user = initialUser || comics[0]?.creator;
                // Resolve public details on a shared link as well as in-app navigation.
                const name = username || user?.username;
                if (name) {
                    try {
                        let page = 1;
                        let result;
                        do {
                            result = await searchPublicUsers({ username: name, page, signal: controller.signal });
                            const match = result.users?.find((item) => String(item.id) === userId);
                            if (match) { user = match; break; }
                            page += 1;
                        } while (page <= (result.pagination?.totalPages ?? 1));
                    } catch {
                        // Comics and the available creator details remain usable.
                    }
                }
                if (!controller.signal.aborted) setState({ loading: false, comics, user, error: '' });
            } catch (error) {
                if (!controller.signal.aborted) setState({ loading: false, comics: [], user: initialUser, error: error.response?.data?.message || 'ไม่สามารถโหลดโปรไฟล์ได้' });
            }
        };
        load();
        return () => controller.abort();
    }, [userId, initialUser, username]);

    return { state };
}
