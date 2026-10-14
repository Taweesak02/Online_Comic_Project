import api from './client';

const unwrap = (payload) => payload?.data ?? payload;

export const getProfile = async () => {
    const result = unwrap((await api.get('/auth/me')).data);
    return result?.user ?? result;
};

export const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const result = unwrap((await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })).data);
    return result?.url;
};

export const updateProfile = async ({ username, profileImage }) => unwrap((await api.patch('/auth/update-profile', {
    username,
    ...(profileImage !== undefined ? { profileImage } : {}),
})).data);

export const updateEmail = async ({ currentPassword, newEmail }) => unwrap((await api.patch('/auth/update-email', {
    currentPassword,
    newEmail,
})).data);

export const changePassword = async ({ currentPassword, newPassword }) => unwrap((await api.patch('/auth/change-password', {
    currentPassword,
    newPassword,
})).data);
