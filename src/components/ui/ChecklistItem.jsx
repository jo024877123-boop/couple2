import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

const ChecklistItem = ({ item, onToggle, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editText.trim()) {
            onEdit(editText.trim());
        } else {
            setEditText(item.text);
        }
        setIsEditing(false);
    };

    if (showDeleteConfirm) {
        return (
            <div className="card-bg rounded-2xl p-4 border-2 border-red-200 bg-red-50 flex items-center gap-4 animate-scaleIn">
                <div className="flex-1">
                    <p className="font-bold text-red-600 text-sm">정말 삭제하시겠습니까?</p>
                    <p className="text-red-400 text-xs mt-1">"{item.text}"</p>
                </div>
                <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-secondary font-medium text-sm btn-bounce"
                >
                    취소
                </button>
                <button
                    onClick={() => { onDelete(); setShowDeleteConfirm(false); }}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium text-sm btn-bounce"
                >
                    삭제
                </button>
            </div>
        );
    }

    return (
        <div className={`card-bg rounded-2xl p-4 border border-theme-100 flex items-center gap-4 transition-all ${item.checked ? 'opacity-60' : ''}`}>
            <button
                onClick={onToggle}
                className={`w-8 h-8 rounded-xl flex items-center justify-center btn-bounce transition-all flex-shrink-0 ${item.checked ? 'gradient-theme text-white' : 'bg-theme-50 text-theme-300 border-2 border-theme-200'
                    }`}
            >
                {item.checked && <Icon name="check" size={16} />}
            </button>

            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') { setEditText(item.text); setIsEditing(false); }
                    }}
                    className="flex-1 bg-theme-50 border-2 border-theme-300 rounded-xl px-3 py-2 text-primary focus:ring-0 focus:border-theme-400"
                />
            ) : (
                <span
                    className={`flex-1 font-medium cursor-pointer ${item.checked ? 'line-through text-secondary' : 'text-primary'}`}
                    onDoubleClick={() => !item.checked && setIsEditing(true)}
                >
                    {item.text}
                </span>
            )}

            <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 bg-theme-100 text-theme-600 hover:bg-theme-200 rounded-xl flex items-center gap-1.5 transition-all flex-shrink-0 btn-bounce text-sm font-medium"
            >
                <Icon name="pencil" size={14} />
                <span>수정</span>
            </button>
            <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl flex items-center gap-1.5 transition-all flex-shrink-0 btn-bounce text-sm font-medium"
            >
                <Icon name="trash-2" size={14} />
                <span>삭제</span>
            </button>
        </div>
    );
};

export default ChecklistItem;
