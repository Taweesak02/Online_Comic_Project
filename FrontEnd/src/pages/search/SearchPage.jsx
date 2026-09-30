import useComicSearch from './hooks/useComicSearch';
import SearchBox from './components/SearchBox';
import SearchResult from './components/SearchResult';

export default function SearchPage() {
    const {
        keyword, setKeyword, selectedCategories, selectedTags, selectedSort, categoryOptions, tagOptions,
        results, isLoading, handleCategoryChange, handleTagChange, handleSortChange, handleSearch,
    } = useComicSearch();

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
            <SearchBox
                keyword={keyword}
                selectedCategories={selectedCategories}
                selectedTags={selectedTags}
                selectedSort={selectedSort}
                categoryOptions={categoryOptions}
                tagOptions={tagOptions}
                onKeywordChange={setKeyword}
                onCategoryChange={handleCategoryChange}
                onTagChange={handleTagChange}
                onSortChange={handleSortChange}
                onSearch={handleSearch}
            />
            <SearchResult results={results} isLoading={isLoading} />
        </main>
    );
}
