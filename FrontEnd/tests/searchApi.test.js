import { beforeEach, expect, test, vi } from 'vitest';
import api from '../src/api/client';
import { getSearchFilterOptions, searchComics } from '../src/api/searchApi';

vi.mock('../src/api/client', () => ({ default: { get: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());

test.each(['comics', 'items', 'results', 'array'])('search accepts the %s response shape and enriches results', async shape => {
    const items = [{ id: 1, title: 'Original' }, { id: 2, title: 'Unavailable details' }];
    api.get.mockImplementation(async path => {
        if (path === '/public') return { data: { data: shape === 'array' ? items : { [shape]: items, pagination: { page: 2 } } } };
        if (path === '/public/1') return { data: { data: { title: 'Detailed', viewCount: 10 } } };
        throw new Error('offline');
    });
    const result = await searchComics({ keyword: ' comic ', categories: ['1', null, '2'], tags: 'tag', sort: 'oldest', page: 2, limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/public', {
        params: { title: 'comic', category: ['1', '2'], tag: ['tag'], sort: 'oldest', page: 2, limit: 10 },
        paramsSerializer: { indexes: null },
    });
    expect(result.items).toEqual([{ id: 1, title: 'Detailed', viewCount: 10 }, items[1]]);
    expect(result.pagination).toEqual(shape === 'array' ? null : { page: 2 });
});

test.each([undefined, null, '', {}])('empty search results and filters are normalized (%s)', async payload => {
    api.get.mockResolvedValue({ data: payload });
    expect(await searchComics({ categories: null, tags: '' })).toEqual({ items: [], pagination: null });
    expect(api.get).toHaveBeenCalledWith('/public', { params: { sort: 'latest' }, paramsSerializer: { indexes: null } });
    expect(await searchComics()).toEqual({ items: [], pagination: null });
});

test('filter options normalize common API shapes and discard invalid list entries', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { categories: ['Action', { id: 2, name: 'Drama' }, { slug: 'fun', title: 'Fun' }, { value: 'v', label: 'Label' }, null, 5, {}] } } })
        .mockResolvedValueOnce({ data: { tags: { a: 'Popular', b: { id: 3, name: 'New' }, c: { slug: 'classic' }, d: null, e: { label: '' } } } });
    expect(await getSearchFilterOptions()).toEqual({
        categories: [{ value: 'Action', label: 'Action' }, { value: '2', label: 'Drama' }, { value: 'fun', label: 'Fun' }, { value: 'v', label: 'Label' }],
        tags: [{ value: 'Popular', label: 'Popular' }, { value: '3', label: 'New' }, { value: 'classic', label: 'classic' }, { value: 'd', label: 'd' }],
    });
});

test.each([['Action', [{ value: 'Action', label: 'Action' }]], [null, []], [4, []]])('scalar filter options (%s)', async (input, expected) => {
    api.get.mockResolvedValue({ data: input });
    expect(await getSearchFilterOptions()).toEqual({ categories: expected, tags: expected });
});

test('search and filter request failures propagate for the UI to handle', async () => {
    api.get.mockRejectedValue(new Error('offline'));
    await expect(searchComics()).rejects.toThrow('offline');
    await expect(getSearchFilterOptions()).rejects.toThrow('offline');
});
