
# VAL Builder

## Documentation & Maintenance
- All components follow [components.build](https://www.components.build/) guidelines for composition, accessibility, and maintainability.
- Dialogs use visible descriptions (`DialogDescription`) for accessibility compliance.
- All structural changes and new features are reflected in this documentation.
- Unit tests are kept up to date for all features and context methods.


## Tech Stack & Tooling
- **React** + **TypeScript** + **Vite**: Core framework and build tool
- **Tailwind CSS v4**: Utility-first styling with custom theme variables
- **ShadCN UI**: Accessible, composable UI primitives (Button, Input, Select, Dialog, etc.)
- **TipTap**: Rich text editor with custom extensions (drag-handle, cusstom icons, etc)
- **Vitest** + **React Testing Library**: Unit and integration testing
- **Node.js v18+**: Required runtime for Vite, Vitest, and modern JS features
- **SonarQube Integration**: Static code analysis for maintainability, reliability, and security
  - SonarQube config in `sonar-project.properties`
  - IDE integration for live code quality feedback
  - Run analysis with SonarQube CLI or IDE plugin

## Quality & Tooling
- **SonarQube**: Integrated for static code analysis, security hotspots, and maintainability checks
  - Main branch commits are analyzed for code quality
  - IDE plugin provides live feedback and highlights issues in VS Code
- **Node.js v18+**: Project requires Node v18 or newer for full compatibility with Vite, Vitest, and modern ECMAScript features
- **ESLint**: Custom config for React, TypeScript, and accessibility linting
- **Prettier**: Enforced code formatting for consistency

## Accessibility & Components.build Compliance
- All dialogs include visible descriptions for screen readers
- All form fields have associated labels
- ARIA attributes and keyboard navigation are implemented where required
- Table and list components use semantic markup

## Styling & Theme
- Tailwind v4 with custom theme variables in `src/index.css`
- Customizable primary (currently green: `#16a34a`), muted backgrounds, and border colors
- All components use Tailwind utility classes (no custom CSS files)
- Consistent spacing, rounded corners, and shadow styles

## Testing
- Vitest with jsdom environment
- Test scripts: `npm test`, `npm run test:ui`, `npm run test:coverage`

## Features
- Drag-and-drop content cards into rich text editor
- Section-based content management and navigation
- Threaded comments on editor content
- Accessible dialogs and forms
- Customizable UI via props and theme

## Installation
```sh
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-drag-handle @tiptap/extension-drag-handle-react
npm install tailwindcss@next @tailwindcss/postcss
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

## Directory Structure
```
val-builder/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── cards/
│   │   ├── comments/
│   │   ├── editor/
│   │   │   └── extensions/
│   │   ├── header/
│   │   ├── sections/
│   │   ├── ui/
│   │   ├── val-builder/
│   │   ├── val-attachments/
│   │   ├── vals/
│   │   └── ...
│   ├── config/
│   ├── lib/
│   ├── test/
│   ├── types/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

____________________________

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules. It uses swc for compilation and bundling rather than something like Babel.

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
