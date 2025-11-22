# VAL Builder - Development Notes

## Project Structure

```
src/
├── config/
│   └── theme.ts              # Centralized theme configuration
├── components/
│   ├── ValBuilder.tsx        # Main component
│   ├── ValBuilder.css
│   ├── Header.tsx            # Top header with client info
│   ├── Header.css
│   ├── SectionNavigation.tsx # Section selector & navigation
│   ├── SectionNavigation.css
│   ├── SectionContent.tsx    # Two-panel content area
│   ├── SectionContent.css
│   ├── RichTextEditor.tsx    # TipTap editor wrapper
│   └── RichTextEditor.css
├── App.tsx                   # App entry point
├── App.css
├── main.tsx
└── index.css
```

## Theme Customization

All colors and styling variables are centralized in `src/config/theme.ts`. To change the color scheme:

1. Open `src/config/theme.ts`
2. Modify the colors in the `theme` object:
   - `primary`: Main green color (#8BC34A)
   - `primaryDark`: Darker green for hover states
   - `primaryLight`: Light green for backgrounds
   - And other color variables...

## Components

### ValBuilder (Main Component)
The main component that orchestrates the entire application. Contains:
- Mock data structure (to be replaced with database queries)
- State management for sections and content
- Navigation logic

### Header
Top header bar displaying:
- Client name
- VAL description
- Plan year date range
- Action buttons (Comments, PDF, SAFA, Billing)

### SectionNavigation
Section selector with:
- Dropdown for section selection
- Previous/Next navigation buttons

### SectionContent
Two-panel layout:
- **Left Panel**: Main content area with TipTap editor
- **Right Panel**: Mode selector, tabs, and comments section

### RichTextEditor
TipTap-based rich text editor with:
- Bold, Italic, Underline formatting
- Bullet and numbered lists
- Extensible for future formatting needs

## Data Structure

Currently using mock data in `ValBuilder.tsx`:
```typescript
const mockSections = ['Section 1 - Greeting', ...]
const mockSectionContent = {
  'Section 1 - Greeting': {
    left: '<p>...</p>',
    right: '<p>...</p>'
  }
}
```

### Future Database Integration
When connecting to a database, replace:
1. `mockSections` with database query for sections list
2. `mockSectionContent` with database query for section content
3. Add save/update mutations for content changes

## Running the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Next Steps

- [ ] Connect to database API
- [ ] Implement save functionality
- [ ] Add comments and tasks functionality
- [ ] Implement PDF generation
- [ ] Add SAFA editing capabilities
- [ ] Implement billing info management
- [ ] Add user authentication
- [ ] Add form validation
- [ ] Implement auto-save
