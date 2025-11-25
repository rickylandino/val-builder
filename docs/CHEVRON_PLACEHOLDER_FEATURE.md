# Chevron Placeholder Feature

## Overview
Implemented inline chevron placeholder (`<< >>` or `<<>>`) editing with visual highlighting and protection.

## Features Implemented

### 1. **Visual Highlighting**
- Chevron placeholders are highlighted with a yellow background (#fff9c4)
- Golden border (#fbc02d) for clear visibility
- Hover effect with enhanced glow
- Monospace font for technical appearance
- "Click to edit" tooltip appears on hover

### 2. **Protection Mechanism**
- Users **cannot delete** `<<` or `>>` characters
- Backspace/Delete keys are intercepted when near chevrons
- Chevron characters are protected from accidental removal

### 3. **Smart Editing Behavior**
- **Click**: Clicking anywhere on a chevron placeholder automatically selects the content between the chevrons (excluding the `<<` and `>>`)
- **Type**: When typing inside a placeholder, only the content between chevrons is replaced
- **Replace**: Selected placeholder text can be replaced by simply typing

### 4. **User Experience**
- Clear visual feedback with yellow highlighting
- Cursor changes to pointer on hover
- Tooltip guidance ("Click to edit")
- Smooth transitions and animations
- Works with both `<< >>` (with spaces) and `<<>>` (without spaces)

## Example Usage

**Before editing:**
```
Based on the census data provided by <<client name>>, the plan year for <<plan year>> has been completed.
```

**User clicks on `<<client name>>`:**
- The text "client name" becomes selected (highlighted)
- User types "ABC Corporation"
- Result: `Based on the census data provided by <<ABC Corporation>>, the plan year...`

**Protection in action:**
- User tries to delete the `<<` characters → Prevented
- User presses Backspace at the `<` character → Selection jumps to content inside
- Chevrons remain intact ✓

## CSS Classes Applied

```css
.chevron-placeholder {
  background-color: #fff9c4;    /* Yellow highlight */
  border: 1px solid #fbc02d;    /* Golden border */
  border-radius: 3px;
  padding: 2px 4px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
}

.chevron-placeholder:hover {
  background-color: #fff59d;    /* Lighter yellow on hover */
  box-shadow: 0 0 0 2px rgba(251, 192, 45, 0.3);  /* Glow effect */
}
```

## Technical Implementation

### Extension: `ChevronPlaceholder.ts`
- TipTap Mark extension with custom ProseMirror plugin
- Regex pattern: `/<<\s*(.+?)\s*>>/g` matches both formats
- Decorations applied to highlight matches
- Event handlers:
  - `handleClick`: Select content on click
  - `handleTextInput`: Replace content while preserving chevrons
  - `handleKeyDown`: Prevent deletion of chevron characters

### Integration
- Added to RichTextEditor extensions array
- Works seamlessly with existing TipTap features
- No conflicts with other formatting

## Testing Scenarios

✓ Enter `<< test >>` in editor → Highlighted yellow  
✓ Click on placeholder → "test" is selected  
✓ Type "new value" → Becomes `<< new value >>`  
✓ Try to delete `<<` → Prevented, content selected instead  
✓ Backspace inside placeholder → Only content affected  
✓ Multiple placeholders in same paragraph → All work independently  
✓ Copy/paste placeholders → Highlighting preserved  

## Benefits Over Dialog Approach

1. **Faster workflow**: No need to open/close dialogs
2. **Contextual**: Edit in place without losing context
3. **Visual clarity**: See all placeholders at once
4. **Fewer clicks**: Direct manipulation vs. dialog flow
5. **Better UX**: Matches modern inline editing patterns

## Migration from Old Approach

If you have existing dialog-based chevron editing:
- The new inline approach is more intuitive
- Users can still see what needs to be filled
- Protection prevents accidental deletion
- No need for separate UI elements

## Future Enhancements (Optional)

- [ ] Add placeholder autocomplete suggestions
- [ ] Validate filled content (e.g., date formats)
- [ ] Track which placeholders have been filled vs. empty
- [ ] Bulk find/replace for similar placeholders
- [ ] Keyboard shortcuts (Tab to jump to next placeholder)
