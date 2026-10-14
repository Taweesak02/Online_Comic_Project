import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useComicData from './useComicData';
import useComicReview from './useComicReview';

export default function useComicManagement() {
    const {
        comics, overview, overviewError, loading, error, setError,
        loadOverview, refreshData, updateComic,
    } = useComicData();
    const [message, setMessage] = useState('');
    const { resubmittingId, submitForReview } = useComicReview({
        updateComic, loadOverview, setError, setMessage,
    });
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const activeSection = ['dashboard', 'comics', 'review', 'inactive'].includes(params.get('section')) ? params.get('section') : 'dashboard';
    const changeSection = (section) => {
        setParams({ section });
        setError('');
        setMessage('');
    };
    const [editingComic, setEditingComic] = useState(null);
    const [formOpen, setFormOpen] = useState(false);

    const openCreate = () => {
        setEditingComic(null);
        setError('');
        setMessage('');
        setFormOpen(true);
    };
    const closeForm = () => {
        setEditingComic(null);
        setFormOpen(false);
    };
    const openEdit = (comic) => {
        setEditingComic(comic);
        setError('');
        setMessage('');
        setFormOpen(true);
    };
    const handleEditorSuccess = async (successMessage) => {
        closeForm();
        setError('');
        setMessage(successMessage);
        await refreshData();
    };
    const reviewComics = comics.filter((comic) => comic.isActive !== false && ['UNAPPROVED', 'RESUBMIT'].includes(comic.approved));
    const inactiveComics = comics.filter((comic) => comic.isActive === false);
    const manageChapters = (comic) => navigate(`/comic-management/${comic.id ?? comic._id}/chapters`);

    return {
        activeSection,
        changeSection,
        comics,
        overview,
        overviewError,
        formOpen,
        editingComic,
        handleEditorSuccess,
        resubmittingId,
        loading,
        error,
        message,
        loadOverview,
        openCreate,
        closeForm,
        openEdit,
        submitForReview,
        reviewComics,
        inactiveComics,
        manageChapters,
    };
}
