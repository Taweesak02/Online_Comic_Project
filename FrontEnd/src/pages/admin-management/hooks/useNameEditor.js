import { useState } from "react";

export default function useNameEditor({ onCreate, onEdit }) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const submit = async (event) => {
    event.preventDefault();
    if (name.trim() && (await onCreate(name.trim()))) setName("");
  };
  const submitEdit = async (event) => {
    event.preventDefault();
    if (editing.name.trim() && (await onEdit(editing.id, editing.name.trim())))
      setEditing(null);
  };
  return { name, setName, editing, setEditing, submit, submitEdit };
}
