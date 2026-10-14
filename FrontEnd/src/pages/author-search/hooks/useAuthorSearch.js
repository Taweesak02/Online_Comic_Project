import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchPublicUsers } from '../../../api/publicUserApi';

export default function useAuthorSearch() {
    const [params, setParams] = useSearchParams();
    const [retry, setRetry] = useState(0);
    const username = params.get('username') || '';
    const sort = ['latest', 'oldest', 'username'].includes(params.get('sort')) ? params.get('sort') : 'latest';
    const requestedPage = Number(params.get('page'));
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const [state, setState] = useState({ loading: true, users: [], pagination: null, error: '' });

    useEffect(() => {
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            searchPublicUsers({ username, sort, page, signal: controller.signal })
            .then((result) => {
                if (!controller.signal.aborted) setState({ loading: false, users: result.users ?? [], pagination: result.pagination, error: '' });
            })
            .catch((error) => {
                if (!controller.signal.aborted) setState({ loading: false, users: [], pagination: null, error: error.response?.data?.message || 'ไม่สามารถค้นหาผู้ใช้ได้ กรุณาลองอีกครั้ง' });
            });
        }, 300);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [username, sort, page, retry]);

    const navigateSearch = (next, options) => {
        setState({ loading: true, users: [], pagination: null, error: '' });
        setParams(next, options);
    };
    const submit = (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const usernameValue = form.get('username');
        const sortValue = form.get('sort');
        const nextUsername = typeof usernameValue === 'string' ? usernameValue.trim() : '';
        const nextSort = typeof sortValue === 'string' ? sortValue : 'latest';
        if (nextUsername === username && nextSort === sort && page === 1) {
            setState({ loading: true, users: [], pagination: null, error: '' });
            setRetry((value) => value + 1);
            return;
        }
        navigateSearch({ username: nextUsername, sort: nextSort, page: '1' });
    };

    return { username, sort, page, state, navigateSearch, submit };
}
