# RLL

## Project Structure

### Tech Stack
- **React** + **TypeScript** + **Vite** - Core framework and build tool
- **Tailwind CSS v4** - Utility-first styling with custom theme variables
- **ShadCN UI** - Component library with Button, Input, and Select components
- **TipTap** - Rich text editor with drag-handle and comment extensions
- **Vitest** + **React Testing Library** - Unit testing and component testing

### Components
- **ValBuilder** - Main application container managing sections and state
- **Header** - Application header with client info, VAL description, and plan year dates
- **SectionNavigation** - Section selector with prev/next navigation
- **SectionContent** - Main content area with card library, editor, and comment sidebar
- **CardLibrary** - Draggable card library for content templates
- **DraggableCard** - Individual draggable content cards
- **RichTextEditor** - TipTap-based rich text editor with toolbar and comment support
- **EditorToolbar** - Separated toolbar component with formatting and list controls
- **CommentSidebar** - Comment thread management sidebar
- **UI Components** (ShadCN):
  - `Button` - Default and inverse variants with icon/sm sizes
  - `Input` - Form input component
  - `Select` - Dropdown select component

### Styling & Theme
- Custom theme variables in `src/index.css` using Tailwind v4 `@theme` directive
- Color scheme: Green primary (`#16a34a`), with muted backgrounds and borders
- All components converted to Tailwind utility classes (no custom CSS files)
- Consistent spacing, rounded corners, and shadow styles

### Testing
- Vitest configuration with jsdom environment
- Example test: `EditorToolbar.test.tsx`
- Test scripts: `npm test`, `npm run test:ui`, `npm run test:coverage`

### Key Features
- Drag-and-drop content cards into rich text editor
- Section-based content management with navigation
- Comment threading on editor content
- Accessible components with ARIA labels and keyboard navigation
- Customizable components via className props

### Installation
```sh
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-drag-handle @tiptap/extension-drag-handle-react
npm install tailwindcss@next @tailwindcss/postcss
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

### Directory Structure
```
val-builder/
├── public/
├── src/
│   ├── assets/
│   ├── components/          # Feature-based component organization
│   │   ├── cards/           # Card-related components
│   │   ├── comments/        # Comment sidebar and threading
│   │   ├── editor/          # Rich text editor and toolbar
│   │   │   └── extensions/  # TipTap custom extensions
│   │   ├── header/          # Application header
│   │   ├── sections/        # Section navigation and content
│   │   ├── ui/              # ShadCN UI components
│   │   └── ValBuilder.tsx   # Main app container
│   ├── config/              # Configuration files
│   ├── lib/                 # Utility functions
│   │   └── utils.ts
│   ├── test/                # Test files and setup
│   │   ├── components/      # Component tests
│   │   └── setup.ts
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css            # Global styles and Tailwind theme
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

# End RLL


____________________________

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
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
