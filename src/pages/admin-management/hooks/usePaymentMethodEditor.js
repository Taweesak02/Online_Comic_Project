import { useState } from 'react';

const EMPTY_FORM = { name: '', code: '', promptPayId: '' };

export default function usePaymentMethodEditor({ onSave, onDelete }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    const submit = async (event) => {
        event.preventDefault();
        if (await onSave(form, editingId)) resetForm();
    };

    const startEditing = (method) => {
        setEditingId(method.id);
        setForm({ name: method.name ?? '', code: method.code ?? '', promptPayId: method.promptPayId ?? '' });
    };

    const remove = async (method) => {
        if (await onDelete(method) && editingId === method.id) resetForm();
    };
    return { form, setForm, editingId, resetForm, submit, startEditing, remove };
}
