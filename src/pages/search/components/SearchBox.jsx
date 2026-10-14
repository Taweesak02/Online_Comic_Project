import FilterGroup from './FilterGroup';
import SearchBar from './SearchBar';
import SortFilterGroup from './SortFilterGroup';

const sortOptions = [
    { value: 'latest', label: 'ล่าสุด' },
    { value: 'popular', label: 'ยอดอ่านสูงสุด' },
    { value: 'title', label: 'ชื่อเรื่อง A-Z' },
    { value: 'oldest', label: 'เก่าสุด' },
];

export default function SearchBox({
    keyword = '',
    selectedCategories = [],
    selectedTags = [],
    selectedSort = 'latest',
    categoryOptions = [],
    tagOptions = [],
    onKeywordChange,
    onCategoryChange,
    onTagChange,
    onSortChange,
    onSearch,
}) {
    const handleCategoryToggle = (value) => {
        onCategoryChange?.(value);
    };

    const handleTagToggle = (value) => {
        onTagChange?.(value);
    };

    return (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
                <FilterGroup
                    title="Category"
                    options={categoryOptions}
                    selectedValues={selectedCategories}
                    onSelect={handleCategoryToggle}
                    multiSelect
                />
                <FilterGroup
                    title="Tag"
                    options={tagOptions}
                    selectedValues={selectedTags}
                    onSelect={handleTagToggle}
                    multiSelect
                />
                <SortFilterGroup
                    title="Sort"
                    options={sortOptions}
                    selectedValues={[selectedSort]}
                    onSelect={onSortChange}
                    variant="sort"
                    multiSelect={false}
                />
                <SearchBar value={keyword} onChange={onKeywordChange} onSearch={onSearch} />
            </div>
        </div>
    );
}
