const fs = require('fs');
const path = 'src/App.jsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const newLines = [];
let importsAdded = false;
let skip = false;

for (const line of lines) {
    if (!importsAdded && !line.includes('import') && line.trim() !== '') {
        newLines.push("import PostCard from './components/ui/PostCard';");
        newLines.push("import ChecklistItem from './components/ui/ChecklistItem';");
        newLines.push("import BucketItem from './components/ui/BucketItem';");
        newLines.push("import CalendarView from './components/features/CalendarView';");
        importsAdded = true;
    }

    if (line.includes('const PostCard =')) skip = true;
    if (line.includes('const ImageZoom =')) skip = false;

    if (!skip) newLines.push(line);
}

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
