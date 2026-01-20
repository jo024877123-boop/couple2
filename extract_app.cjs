const fs = require('fs');

try {
    const content = fs.readFileSync('index.html', 'utf8');
    const match = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

    if (match) {
        let script = match[1];
        script = script.replace(/const\s+\{.*?\}\s*=\s*React;/, '');
        // Remove ReactDOM render logic at the end
        script = script.replace(/const root =\s*ReactDOM\.createRoot[\s\S]*/, '');
        script = script.replace(/root\.render\([\s\S]*/, '');

        const imports = "import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';\nimport * as icons from 'lucide-react';\nimport './styles/index.css';\n\n";

        fs.writeFileSync('src/App.jsx', imports + script + "\nexport default App;");
        console.log("Success");
    } else {
        console.log("No script found");
    }
} catch (e) {
    console.error(e);
}
