import React, { memo } from 'react';
import * as icons from 'lucide-react';

const Icon = memo(({ name, size = 20, className = "" }) => {
    const getCatIcon = (originalName) => {
        if (typeof document === 'undefined') return originalName;
        const isCatTheme = document.documentElement.getAttribute('data-theme') === 'cat';
        if (!isCatTheme) return originalName;

        const map = {
            'layout-grid': 'paw-print',
            'image': 'cat',
            'check-square': 'fish',
            'calendar-days': 'calendar',
            'plus': 'plus-circle',
            'settings': 'settings-2',
            'heart': 'heart-handshake',
            'smile': 'smile',
            'meh': 'meh',
            'laugh': 'laugh',
            'frown': 'frown',
            'cloud-rain': 'cloud-rain',
            'droplet': 'droplet',
            'sparkles': 'sparkles'
        };
        return map[originalName] || originalName;
    };

    const finalName = getCatIcon(name);

    const pascalName = finalName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    // Fallback to HelpCircle if icon not found
    const LucideIcon = icons[pascalName] || icons[name.charAt(0).toUpperCase() + name.slice(1)] || icons.HelpCircle;

    return <LucideIcon size={size} className={className} />;
});

export default Icon;
