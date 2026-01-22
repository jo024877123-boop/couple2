import React from 'react';
import Icon from './Icon';

const PostCard = ({ post, settings, getMoodInfo, onClick, isEditMode, onEdit, onDelete, coupleUsers = [] }) => {
    const moodInfo = getMoodInfo(post.mood);
    const hasMedia = post.media && post.media.length > 0;
    const thumbnail = hasMedia ? (post.media[post.thumbnailIndex] || post.media[0]) : null;
    const dateStr = new Date(post.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

    // Find author info from coupleUsers
    const authorInfo = coupleUsers.find(u => u.uid === post.author);
    const authorName = authorInfo?.name || (post.author === 'me' ? settings.myName : settings.partnerName);
    const authorPhoto = authorInfo?.photoURL;

    return (
        <div className={`card-bg rounded-[2rem] shadow-sm border border-theme-100 overflow-hidden ${!isEditMode && 'card-hover cursor-pointer'}`}
            onClick={onClick}>
            <div className="p-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        {/* Author Photo or Mood Emoji */}
                        {authorPhoto ? (
                            <img src={authorPhoto} alt={authorName} className="w-10 h-10 rounded-xl object-cover border border-theme-100" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-theme-100 flex items-center justify-center text-xl">{moodInfo.emoji}</div>
                        )}
                        <div>
                            <p className="text-sm font-bold text-primary">{authorName}</p>
                            <p className="text-xs text-secondary">{dateStr} · {post.location}</p>
                        </div>
                    </div>
                    {isEditMode && (
                        <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-theme-500 hover:bg-theme-100 rounded-xl transition-all btn-bounce">
                                <Icon name="pencil" size={18} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all btn-bounce">
                                <Icon name="trash-2" size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {hasMedia && (
                    <div className="relative rounded-2xl overflow-hidden aspect-[3/2] mb-4 group bg-gray-100">
                        {thumbnail?.type === 'video' ? (
                            <video src={thumbnail.url} className="w-full h-full object-cover" muted />
                        ) : (
                            <img src={thumbnail?.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        )}
                        {post.media.length > 1 && (
                            <div className="absolute top-3 right-3 glass px-3 py-1.5 rounded-full text-xs font-bold text-primary">
                                +{post.media.length - 1}
                            </div>
                        )}
                        {thumbnail?.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                                    <Icon name="play" size={24} className="text-white ml-1" fill />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <p className={`font-medium leading-relaxed text-primary whitespace-pre-wrap ${hasMedia ? 'text-base line-clamp-2' : 'text-lg line-clamp-6'}`}>{post.content}</p>
            </div>
        </div>
    );
};
export default PostCard;
