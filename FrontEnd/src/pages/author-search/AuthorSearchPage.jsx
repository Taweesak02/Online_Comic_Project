import AuthorSearchForm from './components/AuthorSearchForm';
import useAuthorSearch from './hooks/useAuthorSearch';
import AuthorSearchResults from './components/AuthorSearchResults';

export default function AuthorSearchPage() {
    const { username, sort, page, state, navigateSearch, submit } = useAuthorSearch();

    const handlePageChange = (nextPage) => {
        navigateSearch({ username, sort, page: String(nextPage) });
    };

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
            <h1 className="text-2xl font-bold text-[#213f68]">ค้นหาผู้แต่ง / ผู้ใช้</h1>
            <p className="mt-2 text-sm text-slate-600">ค้นหาบัญชีสาธารณะด้วยชื่อผู้ใช้</p>
            <AuthorSearchForm
                username={username}
                sort={sort}
                navigateSearch={navigateSearch}
                submit={submit}
            />
            <AuthorSearchResults
                state={state}
                page={page}
                onPageChange={handlePageChange}
            />
        </main>
    );
}
