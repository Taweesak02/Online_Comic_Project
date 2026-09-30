import api from './client';

const normalizeList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value === undefined || value === null || value === '') return [];
    return [value];
};

const toOptionList = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === 'string') return { value: item, label: item };
                if (item && typeof item === 'object') {
                    const label = item.label ?? item.name ?? item.title ?? item.slug ?? item.value ?? '';
                    const valueKey = item.value ?? item.id ?? item.slug ?? item.name ?? item.title ?? label;
                    return label ? { value: String(valueKey), label: String(label) } : null;
                }
                return null;
            })
            .filter(Boolean);
    }

    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([key, item]) => {
                const label = typeof item === 'string' ? item : item?.label ?? item?.name ?? item?.title ?? item?.slug ?? key;
                const selectedValue = typeof item === 'string' ? item : item?.value ?? item?.id ?? item?.slug ?? item?.name ?? item?.title ?? key;
                return label ? { value: String(selectedValue), label: String(label) } : null;
            })
            .filter(Boolean);
    }

    return typeof value === 'string' ? [{ value, label: value }] : [];
};

export const getSearchFilterOptions = async () => {
    const [categoryResponse, tagResponse] = await Promise.all([
        api.get('/category'),
        api.get('/tag'),
    ]);
    const categories = categoryResponse.data?.data ?? categoryResponse.data;
    const tags = tagResponse.data?.data ?? tagResponse.data;
    return {
        categories: toOptionList(categories?.categories ?? categories),
        tags: toOptionList(tags?.tags ?? tags),
    };
};

export const searchComics = async ({
    keyword = '',
    categories = [],
    tags = [],
    sort = 'latest',
    page,
    limit,
} = {}) => {
    const params = {};

    const cleanKeyword = String(keyword || '').trim();
    if (cleanKeyword) params.title = cleanKeyword;

    const categoryList = normalizeList(categories);
    if (categoryList.length > 0) params.category = categoryList;

    const tagList = normalizeList(tags);
    if (tagList.length > 0) params.tag = tagList;

    params.sort = sort;

    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await api.get('/public', { params, paramsSerializer: { indexes: null } });
    const payload = response.data?.data ?? response.data;

    const getSearchItems = () => {
        if (Array.isArray(payload?.comics)) {
            return payload.comics;
        }
        if (Array.isArray(payload?.items)) {
            return payload.items;
        }
        if (Array.isArray(payload?.results)) {
            return payload.results;
        }
        if (Array.isArray(payload)) {
            return payload;
        }
        return [];
    };

    const items = getSearchItems();
    const detailedItems = await Promise.all(items.map(async (comic) => {
        try {
            const response = await api.get(`/public/${comic.id}`);
            return { ...comic, ...(response.data?.data ?? response.data) };
        } catch {
            // Keep the search result visible if its statistics cannot be loaded.
            return comic;
        }
    }));
    return {
        items: detailedItems,
        pagination: payload?.pagination ?? null,
    };
};
