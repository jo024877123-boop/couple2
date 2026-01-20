const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');
lines.forEach((line, i) => {
    if (line.includes('const CalendarView =')) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
    }
});
