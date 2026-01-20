const fs = require('fs');

try {
    let content = fs.readFileSync('src/App.jsx', 'utf8');

    // 1. Remove duplicate constants (imported from constants/index.js)
    content = content.replace(/const THEMES = \[[\s\S]*?\];\s*/, '');
    content = content.replace(/const MOOD_OPTIONS = \[[\s\S]*?\];\s*/, '');
    content = content.replace(/const SAMPLE_POSTS = \[[\s\S]*?\];\s*/, '');
    // MEMO_COLORS might be defined simply as const MEMO_COLORS = [...];
    content = content.replace(/const MEMO_COLORS = \[[\s\S]*?\];\s*/, '');

    // 2. Remove Icon component definition (using imported one)
    // Pattern based on original index.html content
    content = content.replace(/const Icon = \(\{[\s\S]*?return <span ref=\{ref\}[\s\S]*?\};\s*/, '');

    fs.writeFileSync('src/App.jsx', content);
    console.log("Fixed App.jsx");

} catch (e) { console.error(e); }
