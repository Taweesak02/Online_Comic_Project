const imageUrl = (image) => {
    if (image?.startsWith('/uploads/') && import.meta.env.DEV) return image;
    if (image?.startsWith('/')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        return `${apiUrl.replace(/\/api\/?$/, '')}${image}`;
    }
    return image;
};

export default imageUrl;
