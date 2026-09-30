import api from './client';
import { getCoinPackages, getPaymentMethods } from './coinPurchaseApi';

const unwrap = (payload) => payload?.data ?? payload;

export const getAdminDashboardData = async () => unwrap((await api.get('/admin/statistic')).data);

export const getAdminManagementData = async () => {
    const [categoryResponse, tagResponse, packages, paymentMethods] = await Promise.all([
        api.get('/category'),
        api.get('/tag'),
        getCoinPackages(),
        getPaymentMethods(),
    ]);

    const categoryData = unwrap(categoryResponse.data);
    const tagData = unwrap(tagResponse.data);

    return {
        categories: categoryData?.categories ?? [],
        tags: tagData?.tags ?? [],
        packages,
        paymentMethods,
    };
};

export const createCategory = async (name) => unwrap((await api.post('/category', { name })).data);
export const editCategory = async (categoryId, name) => unwrap((await api.patch(`/category/${categoryId}`, { name })).data);
export const deleteCategory = async (categoryId) => unwrap((await api.delete(`/category/${categoryId}`)).data);
export const createTag = async (name) => unwrap((await api.post('/tag', { name })).data);
export const editTag = async (tagId, name) => unwrap((await api.patch(`/tag/${tagId}`, { name })).data);
export const deleteTag = async (tagId) => unwrap((await api.delete(`/tag/${tagId}`)).data);
export const createCoinPackage = async ({ name, coinAmount, price }) => unwrap((await api.post('/package', {
    name,
    coinAmount: Number(coinAmount),
    price: Number(price),
})).data);
export const editCoinPackage = async (packageId, { name, coinAmount, price }) => unwrap((await api.patch(`/package/${packageId}`, {
    name,
    coinAmount: Number(coinAmount),
    price: Number(price),
})).data);
export const deleteCoinPackage = async (packageId) => unwrap((await api.delete(`/package/${packageId}`)).data);
export const createPaymentMethod = async ({ name, code, promptPayId }) => unwrap((await api.post('/payment-method', {
    name: name.trim(),
    code: code.trim().toUpperCase(),
    promptPayId: promptPayId?.trim() || null,
})).data);
export const editPaymentMethod = async (methodId, { name, code, promptPayId }) => unwrap((await api.patch(`/payment-method/${methodId}`, {
    name: name.trim(),
    code: code.trim().toUpperCase(),
    promptPayId: promptPayId?.trim() || null,
})).data);
export const deletePaymentMethod = async (methodId) => unwrap((await api.delete(`/payment-method/${methodId}`)).data);

export const searchAdminUsers = async (username, page = 1) => unwrap((await api.get('/public/user', {
    params: { username: username.trim(), sort: 'username', page, limit: 20 },
})).data);
export const banUser = async (id) => unwrap((await api.patch(`/admin/users/${encodeURIComponent(id)}/ban`)).data);
export const unbanUser = async (id) => unwrap((await api.patch(`/admin/users/${encodeURIComponent(id)}/unban`)).data);

export const searchAdminComics = async (title, page = 1, approved = '') => unwrap((await api.get('/admin/comics', {
    params: { title: title.trim(), page, limit: 20, ...(approved && { approved }) },
})).data);
export const approveComic = async (id) => unwrap((await api.patch(`/admin/comics/${encodeURIComponent(id)}/approve`)).data);
export const unapproveComic = async (id) => unwrap((await api.patch(`/admin/comics/${encodeURIComponent(id)}/unapprove`)).data);
