import { useCallback, useEffect, useState } from 'react';
import { getSearchFilterOptions, searchComics } from '../../../api/searchApi';

export default function useComicSearch() {
    const [keyword, setKeyword] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedSort, setSelectedSort] = useState('latest');
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [tagOptions, setTagOptions] = useState([]);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const filters = await getSearchFilterOptions();
                setCategoryOptions(filters.categories ?? []);
                setTagOptions(filters.tags ?? []);
            } catch (error) {
                console.error('Unable to load search filter options.', error);
                setCategoryOptions([]);
                setTagOptions([]);
            }
        };

        loadFilterOptions();
    }, []);

    const runSearch = useCallback(async (payload = {}) => {
        setIsLoading(true);

        try {
            const activeSort = payload.sortBy || selectedSort || 'latest';
            const response = await searchComics({
                keyword: payload.keyword ?? keyword,
                categories: payload.categories ?? selectedCategories,
                tags: payload.tags ?? selectedTags,
                sort: activeSort,
                limit: 20,
            });

            const searchResults = Array.isArray(response?.items) ? response.items : [];
            setResults(searchResults);
        } catch (error) {
            console.error('Unable to search comics.', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [keyword, selectedCategories, selectedTags, selectedSort]);

    useEffect(() => {
        const request = window.setTimeout(() => { runSearch(); }, 0);
        return () => window.clearTimeout(request);
    }, [runSearch]);

    const handleCategoryChange = (value) => {
        setSelectedCategories((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
    };

    const handleTagChange = (value) => {
        setSelectedTags((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
    };

    const handleSortChange = (value) => {
        setSelectedSort(value);
    };

    const handleSearch = () => {
        runSearch({
            keyword,
            categories: selectedCategories,
            tags: selectedTags,
            sortBy: selectedSort,
        });
    };

    return {
        keyword, setKeyword, selectedCategories, selectedTags, selectedSort, categoryOptions, tagOptions,
        results, isLoading, handleCategoryChange, handleTagChange, handleSortChange, handleSearch,
    };
}
