const fs = require('fs');

try {
    const content = fs.readFileSync('index.backup.html', 'utf8');
    const match = content.match(/<style>([\s\S]*?)<\/style>/);

    if (match) {
        let css = match[1];
        // Tailwind base styles
        const tailwindHeader = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n";
        fs.writeFileSync('src/styles/index.css', tailwindHeader + css);
        console.log("Extracted CSS");
    } else {
        console.log("No style tag found");
    }
} catch (e) {
    console.error(e);
}
