import re

def main():
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()

        match = re.search(r'<script type="text/babel">(.*?)</script>', content, re.DOTALL)
        if not match:
            print("No script found")
            return

        script = match.group(1)

        # 1. React destructuring 제거
        script = re.sub(r'const\s+\{.*?\}\s*=\s*React;', '', script)
        
        # 2. ReactDOM 렌더링 로직 제거 (끝부분)
        script = re.sub(r'const root =\s*ReactDOM\.createRoot.*', '', script, flags=re.DOTALL)
        script = re.sub(r'root\.render\(.*', '', script, flags=re.DOTALL)

        # 3. Imports 추가
        # Icon 컴포넌트가 내부 정의되어 있으므로 lucide-react만 import해서 쓰도록 유도해야 함.
        # 기존 코드: <script src="...lucide..."></script> -> window.lucide 사용했을 것.
        # 하지만 코드 내에서 Icon 컴포넌트가 직접 구현되어 있었음 (Step 2279 참고)
        # const Icon = ... 내부에서 icons[pascalName] 접근.
        # 여기서 icons는 window.lucide 였을 것.
        # 따라서 import * as icons from 'lucide-react' 를 추가하고
        # 코드 내에서 window.lucide 참조가 없다면 icons[...]로 동작하게 변수명을 맞춰야 함.
        # 기존: const { ... } = React; 아래에 Icon 정의 있음.
        
        # App.jsx 상단에 imports 추가
        imports = "import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';\nimport * as icons from 'lucide-react';\nimport './styles/index.css';\n\n"
        
        final_content = imports + script + "\nexport default App;"
        
        with open('src/App.jsx', 'w', encoding='utf-8') as f:
            f.write(final_content)
        print("Extracted App.jsx")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
