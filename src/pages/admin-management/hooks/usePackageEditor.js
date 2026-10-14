import { useState } from 'react';

const emptyForm = { name: '', coinAmount: '', price: '' };

export default function usePackageEditor({ onSave, onDelete }) {
    const [form, setForm] = useState(emptyForm); const [editingId, setEditingId] = useState(null);
    const reset = () => { setForm(emptyForm); setEditingId(null); };
    const submit = async (event) => { event.preventDefault(); if (await onSave(form, editingId)) reset(); };
    const startEditing = (item) => {
        setEditingId(item.id);
        setForm({ name: item.name, coinAmount: String(item.coinAmount), price: String(item.price) });
    };
    const remove = async (item) => {
        if (await onDelete(item) && editingId === item.id) reset();
    };
    return { form, setForm, editingId, reset, submit, startEditing, remove };
}
