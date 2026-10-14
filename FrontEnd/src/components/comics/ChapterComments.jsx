import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addChapterComment, deleteChapterComment, editChapterComment, getChapterComments } from '../../api/comicReaderApi';
import { getCoverUrl } from '../../utils/comicUtils';

const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export default function ChapterComments({ chapterId, isLoggedIn, currentUser }){
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');

    const loadComments = async () => {
        try {
            setComments(await getChapterComments(chapterId));
            setError('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถโหลดความคิดเห็นได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        getChapterComments(chapterId)
            .then((result) => {
                if (active) {
                    setComments(result);
                    setError('');
                }
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || 'ไม่สามารถโหลดความคิดเห็นได้');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [chapterId]);

    const submitComment = async (event) => {
        event.preventDefault();
        const trimmedContent = content.trim();
        if (!trimmedContent) return;

        setSubmitting(true);
        setError('');
        try {
            await addChapterComment(chapterId, trimmedContent);
            setContent('');
            await loadComments();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถเพิ่มความคิดเห็นได้');
        } finally {
            setSubmitting(false);
        }
    };

    const canManage = (comment) => (
        String(comment.user?.id ?? comment.userId) === String(currentUser?.id)
        || currentUser?.roleName?.toLowerCase() === 'admin'
    );

    const startEditing = (comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
        setError('');
    };

    const saveEdit = async (event) => {
        event.preventDefault();
        const trimmedContent = editContent.trim();
        if (!trimmedContent || !editingId) return;
        setSavingId(editingId);
        setError('');
        try {
            await editChapterComment(editingId, trimmedContent);
            setComments((current) => current.map((comment) => (
                comment.id === editingId ? { ...comment, content: trimmedContent, updatedAt: new Date().toISOString() } : comment
            )));
            setEditingId(null);
            setEditContent('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถแก้ไขความคิดเห็นได้');
        } finally {
            setSavingId(null);
        }
    };

    const removeComment = async (comment) => {
        if (!window.confirm('ยืนยันการลบความคิดเห็นนี้หรือไม่?')) return;
        setSavingId(comment.id);
        setError('');
        try {
            await deleteChapterComment(comment.id);
            setComments((current) => current.filter((item) => item.id !== comment.id));
            if (editingId === comment.id) setEditingId(null);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'ไม่สามารถลบความคิดเห็นได้');
        } finally {
            setSavingId(null);
        }
    };

    const renderComments = () => {
        if (loading) {
            return <p className="py-8 text-center text-sm text-[#666666]">กำลังโหลดความคิดเห็น...</p>;
        }
        if (comments.length) {
            return (
            <>{comments.map((comment) => (
                <article className="py-5 first:pt-0" key={comment.id}>
                    <div className="flex gap-3">
                        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#dcdacc] text-sm font-bold uppercase text-[#213f68]">
                            {comment.user?.profileImage
                                ? <img className="size-full object-cover" src={getCoverUrl(comment.user.profileImage)} alt={`รูปโปรไฟล์ของ ${comment.user?.username || 'ผู้ใช้งาน'}`} />
                                : (comment.user?.username?.slice(0, 1) || '?')}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <strong className="text-sm text-[#0d0c22]">{comment.user?.username || 'ผู้ใช้งาน'}</strong>
                                <div className="flex items-center gap-3">
                                    <time className="text-xs text-[#666666]" dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                                    {canManage(comment) && editingId !== comment.id && (
                                        <span className="flex gap-2">
                                            <button className="text-xs font-semibold text-[#213f68] hover:underline disabled:opacity-50" type="button" onClick={() => startEditing(comment)} disabled={savingId === comment.id}>แก้ไข</button>
                                            <button className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50" type="button" onClick={() => removeComment(comment)} disabled={savingId === comment.id}>ลบ</button>
                                        </span>
                                    )}
                                </div>
                            </div>
                            {editingId === comment.id ? (
                                <form className="mt-3" onSubmit={saveEdit}>
                                    <textarea className="min-h-24 w-full resize-y rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-3 py-2 text-sm outline-none focus:border-[#213f68]" value={editContent} onChange={(event) => setEditContent(event.target.value)} maxLength={1000} required autoFocus />
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <span className="text-xs text-[#666666]">{editContent.length}/1000</span>
                                        <div className="flex gap-2">
                                            <button className="rounded-full border border-[#e2e6e6] px-4 py-2 text-xs font-semibold" type="button" onClick={() => setEditingId(null)} disabled={savingId === comment.id}>ยกเลิก</button>
                                            <button className="rounded-full bg-[#213f68] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" type="submit" disabled={savingId === comment.id || !editContent.trim()}>{savingId === comment.id ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#444444]">{comment.content}</p>
                            )}
                        </div>
                    </div>
                </article>
            ))}</>
        );
        }
        return <p className="py-8 text-center text-sm text-[#666666]">ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นได้เลย</p>;
    };

    return (
        <section className="mt-8 rounded-2xl border border-[#e7e7e9] bg-white p-5 sm:p-7" aria-labelledby="chapter-comments-title">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-[#0d0c22]" id="chapter-comments-title">ความคิดเห็น</h2>
                <span className="text-sm text-[#666666]">{comments.length} ความคิดเห็น</span>
            </div>

            {isLoggedIn ? (
                <form className="mt-5" onSubmit={submitComment}>
                    <label className="sr-only" htmlFor="chapter-comment">เขียนความคิดเห็น</label>
                    <textarea
                        className="min-h-28 w-full resize-y rounded-xl border border-[#e2e6e6] bg-[#f8f8f8] px-4 py-3 text-sm outline-none transition focus:border-[#213f68] focus:ring-2 focus:ring-[#213f68]/10"
                        id="chapter-comment"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="เขียนความคิดเห็นเกี่ยวกับตอนนี้..."
                        maxLength={1000}
                        required
                    />
                    <div className="mt-2 flex items-center justify-between gap-4">
                        <span className="text-xs text-[#666666]">{content.length}/1000</span>
                        <button className="rounded-full bg-[#213f68] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={submitting || !content.trim()}>
                            {submitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
                        </button>
                    </div>
                </form>
            ) : (
                <p className="mt-4 rounded-xl bg-[#f8f8f8] px-4 py-3 text-sm text-[#666666]">
                    กรุณา <Link className="font-semibold text-[#213f68] hover:underline" to="/login">เข้าสู่ระบบ</Link> เพื่อแสดงความคิดเห็น
                </p>
            )}

            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

            <div className="mt-6 divide-y divide-[#e7e7e9]">
                {renderComments()}
            </div>
        </section>
    );
};
