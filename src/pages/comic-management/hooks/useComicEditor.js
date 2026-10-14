import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchFilterOptions } from '../../../api/searchApi';
import { createComic, deleteComic, editComic, uploadCoverImage } from '../../../api/comicManagementApi';
import { extractRelationIds, getCoverUrl } from '../../../utils/comicUtils';

const toggleId = (values, value) => values.includes(value)
    ? values.filter((id) => id !== value)
    : [...values, value];

export default function useComicEditor(comic, onSuccess) {
    const navigate = useNavigate();
    const editingId = comic?.id ?? comic?._id;
    const [form, setForm] = useState(() => ({
        title: comic?.title ?? comic?.name ?? '',
        description: comic?.description ?? '',
        status: comic?.status ?? 'ONGOING',
        coverImage: null,
        coverImageUrl: comic ? getCoverUrl(comic.coverImage ?? comic.cover ?? comic.image) : '',
    }));
    const [categoryIds, setCategoryIds] = useState(() => extractRelationIds(comic?.categories ?? comic?.category));
    const [tagIds, setTagIds] = useState(() => extractRelationIds(comic?.tags ?? comic?.tag));
    const [filters, setFilters] = useState({ categories: [], tags: [] });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        getSearchFilterOptions()
            .then((options) => { if (active) setFilters(options); })
            .catch(() => { if (active) setFilters({ categories: [], tags: [] }); });
        return () => { active = false; };
    }, []);

    const updateForm = ({ target }) => {
        setForm((current) => ({ ...current, [target.name]: target.value }));
    };
    const changeImage = ({ target }) => {
        const file = target.files?.[0] ?? null;
        setForm((current) => ({ ...current, coverImage: file }));
    };
    const toggleCategory = (id) => setCategoryIds((current) => toggleId(current, id));
    const toggleTag = (id) => setTagIds((current) => toggleId(current, id));
    const manageChapters = () => navigate(`/comic-management/${editingId}/chapters`);

    const save = async (event) => {
        event.preventDefault();
        if (submitting) return;
        if (!form.title.trim()) return setError('กรุณากรอกชื่อเรื่องก่อนบันทึก');
        setSubmitting(true);
        setError('');
        try {
            const coverImage = form.coverImage
                ? await uploadCoverImage(form.coverImage)
                : form.coverImageUrl || undefined;
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                coverImage,
                categoryIds: categoryIds.map(Number),
                tagIds: tagIds.map(Number),
                ...(editingId ? { status: form.status } : {}),
            };
            if (editingId) await editComic(editingId, payload);
            else await createComic(payload);
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message || 'ไม่สามารถบันทึกการ์ตูนได้');
            setSubmitting(false);
            return;
        }
        setSubmitting(false);
        await onSuccess(editingId ? 'อัปเดตการ์ตูนสำเร็จ' : 'สร้างการ์ตูนสำเร็จ');
    };

    const removeComic = async () => {
        if (submitting || !editingId || !window.confirm(`ปิดใช้งาน “${form.title}” หรือไม่? ข้อมูลการ์ตูน ตอน และไฟล์จะยังถูกเก็บไว้`)) return;
        setSubmitting(true);
        setError('');
        try {
            await deleteComic(editingId);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถปิดใช้งานการ์ตูนได้');
            setSubmitting(false);
            return;
        }
        setSubmitting(false);
        await onSuccess('ปิดใช้งานการ์ตูนสำเร็จ');
    };

    return {
        form,
        imageName: form.coverImage?.name ?? '',
        categories: filters.categories,
        tags: filters.tags,
        selectedCategoryIds: categoryIds,
        selectedTagIds: tagIds,
        editMode: Boolean(editingId),
        submitting,
        error,
        updateForm,
        changeImage,
        toggleCategory,
        toggleTag,
        manageChapters,
        save,
        removeComic,
    };
}
