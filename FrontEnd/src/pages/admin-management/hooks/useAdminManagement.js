import { useState } from 'react';
import { createCategory, createCoinPackage, createPaymentMethod, createTag, deleteCategory, deleteCoinPackage, deletePaymentMethod, deleteTag, editCategory, editCoinPackage, editPaymentMethod, editTag } from '../../../api/adminManagementApi';
import useAdminData from './useAdminData';

export default function useAdminManagement(isAdmin) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [submitting, setSubmitting] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const { data, dashboardData, loading, loadData } = useAdminData(isAdmin, setError);

    const saveItem = async (type, action, value, mode = 'เพิ่ม') => {
        setSubmitting(type); setError(''); setMessage('');
        try {
            await action(value); await loadData(); setMessage(`${mode}${type}สำเร็จ`); return true;
        } catch (requestError) {
            setError(requestError.response?.data?.message || `ไม่สามารถ${mode}${type}ได้`); return false;
        } finally { setSubmitting(''); }
    };

    const deleteItem = async (type, item, action) => {
        if (!window.confirm(`ยืนยันการลบ${type} “${item.name}” หรือไม่?`)) return false;
        setSubmitting(type); setError(''); setMessage('');
        try {
            await action(item.id); await loadData(); setMessage(`ลบ${type}สำเร็จ`); return true;
        } catch (requestError) {
            setError(requestError.response?.data?.message || `ไม่สามารถลบ${type}ได้`); return false;
        } finally { setSubmitting(''); }
    };

    const actions = {
        createCategory: (name) => saveItem('หมวดหมู่', createCategory, name),
        editCategory: (id, name) => saveItem('หมวดหมู่', (value) => editCategory(id, value), name, 'แก้ไข'),
        deleteCategory: (item) => deleteItem('หมวดหมู่', item, deleteCategory),
        createTag: (name) => saveItem('แท็ก', createTag, name),
        editTag: (id, name) => saveItem('แท็ก', (value) => editTag(id, value), name, 'แก้ไข'),
        deleteTag: (item) => deleteItem('แท็ก', item, deleteTag),
    };

    const savePackage = (form, id) => saveItem('แพ็กเกจ', id ? (value) => editCoinPackage(id, value) : createCoinPackage, form, id ? 'แก้ไข' : 'เพิ่ม');
    const deletePackage = (item) => deleteItem('แพ็กเกจ', item, deleteCoinPackage);
    const savePaymentMethod = (form, id) => saveItem('ช่องทางชำระเงิน', id ? (value) => editPaymentMethod(id, value) : createPaymentMethod, form, id ? 'แก้ไข' : 'เพิ่ม');
    const removePaymentMethod = (item) => deleteItem('ช่องทางชำระเงิน', item, deletePaymentMethod);

    const changeSection = (section) => { setActiveSection(section); setError(''); setMessage(''); };

    return { activeSection, changeSection, data, dashboardData, loading, submitting, error, message, actions, savePackage, deletePackage, savePaymentMethod, removePaymentMethod };
}
