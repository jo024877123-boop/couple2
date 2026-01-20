import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

const BucketItem = ({ item, onToggle, onEdit, onDelete, onEmojiChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) inputRef.current.focus();
    }, [isEditing]);

    const handleSave = () => {
        if (editText.trim() && editText !== item.text) onEdit(editText.trim());
        setIsEditing(false);
    };

    const emojiOptions = [
        '✈️', '🏠', '🚗', '⛺', '🏖️', '🏰', '🗺️', '🗽',
        '🎨', '🎸', '📷', '🍳', '📚', '🎮', '🎬', '🎹',
        '🏃', '💪', '🧘', '🚲', '🏊', '🎾', '⚽', '🏀',
        '❤️', '💍', '👶', '🎂', '💐', '🎁', '🥂', '💌',
        '🎓', '💰', '🏆', '⭐', '🌈', '🚀', '🔮', '💎'
    ];

    if (showDeleteConfirm) {
        return (
            <div className="card-bg rounded-2xl p-4 border-2 border-red-200 animate-scaleIn">
                <p className="text-center text-primary font-medium mb-3">정말 삭제하시겠습니까?</p>
                <p className="text-center text-sm text-secondary mb-4 line-clamp-1">"{item.text}"</p>
                <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-theme-100 text-theme-600 rounded-xl font-medium">취소</button>
                    <button onClick={() => { onDelete(); setShowDeleteConfirm(false); }} className="flex-1 py-2 bg-red-500 text-white rounded-xl font-medium">삭제</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`card-bg rounded-2xl p-4 border transition-all ${item.checked ? 'border-green-200 bg-green-50/50' : 'border-theme-100'} flex items-center gap-3 hover:shadow-md z-10 relative`}>
            <div className="relative">
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-12 h-12 rounded-xl bg-theme-50 flex items-center justify-center text-2xl hover:bg-theme-100 transition-all hover:scale-110"
                >
                    {item.emoji || '⭐'}
                </button>
                {showEmojiPicker && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setShowEmojiPicker(false)} />
                        <div className="absolute top-full left-0 mt-2 bg-white card-bg rounded-2xl shadow-2xl p-4 grid grid-cols-4 gap-2 z-[101] animate-scaleIn border border-theme-100 w-64 max-h-60 overflow-y-auto custom-scrollbar">
                            {emojiOptions.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => { onEmojiChange(emoji); setShowEmojiPicker(false); }}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-theme-100 rounded-xl transition-all text-2xl btn-bounce"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={onToggle}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.checked
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-theme-300 hover:border-theme-500'
                    }`}
            >
                {item.checked && <Icon name="check" size={14} />}
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
                className="p-2 bg-theme-100 text-theme-600 hover:bg-theme-200 rounded-lg transition-all hover:scale-110"
            >
                <Icon name="pencil" size={14} />
            </button>
            <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all hover:scale-110"
            >
                <Icon name="minus" size={14} />
            </button>
        </div>
    );
};

export default BucketItem;
