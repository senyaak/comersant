# Documentation Build System

Automated documentation generation system with dynamic navigation for the Comersant platform.

## Features

- 🔄 **Automatic Discovery**: Automatically discovers available documentation sections
- 🧭 **Dynamic Navigation**: Generates navigation links based on what's actually available
- 📦 **Modular**: Easy to add new documentation sections
- 🎨 **Consistent Styling**: Unified look across all documentation pages

## Structure

```
scripts/
├── generate-navigation.mjs  # Core navigation generator utility
├── build-index.mjs          # Builds main documentation index
├── build-architecture.mjs   # Builds architecture diagrams page
├── build-adr.mjs            # Builds ADR pages
└── build-all-docs.mjs       # Master build script
```

## Usage

### Build All Documentation

```bash
node scripts/build-all-docs.mjs
```

### Build Individual Sections

```bash
# Main index page
node scripts/build-index.mjs

# Architecture diagrams
node scripts/build-architecture.mjs

# Architecture Decision Records
node scripts/build-adr.mjs
```

### Test Navigation Generator

```bash
node scripts/generate-navigation.mjs
```

## Adding New Documentation Sections

1. **Create documentation in `documentation/your-section/`**
   - Must include `index.html`

2. **Add section config to `generate-navigation.mjs`**:
   ```javascript
   const DOC_SECTIONS = {
     'your-section': { icon: '🎯', title: 'Your Section' },
     // ... other sections
   };
   ```

3. **Create build script (optional)**:
   - Add `build-your-section.mjs` if needed
   - Add to `build-all-docs.mjs` BUILD_SCRIPTS array

4. **Rebuild**:
   ```bash
   node scripts/build-all-docs.mjs
   ```

The navigation will be automatically updated across all pages!

## How It Works

### Navigation Generation

`generate-navigation.mjs` scans the `documentation/` directory and:
1. Discovers all subdirectories with `index.html`
2. Generates appropriate navigation links
3. Exports functions for use in build scripts

### Build Process

Each build script:
1. Imports `generateNavigation()` from `generate-navigation.mjs`
2. Generates dynamic navigation for its section
3. Replaces `{{NAV_LINKS}}` placeholder in templates
4. Writes final HTML to `documentation/`

### Templates

Templates in `src/static/` use placeholders:
- `{{NAV_LINKS}}` - Dynamic navigation
- `{{DOC_CARDS}}` - Main page cards
- Other section-specific placeholders

## Configuration

Edit `scripts/generate-navigation.mjs` to customize:
- Section icons
- Section titles  
- Navigation order
- Card descriptions

## Benefits

✅ **No Manual Updates**: Add a new doc section, everything updates automatically
✅ **Consistency**: Navigation is identical across all pages
✅ **Maintainability**: Single source of truth for navigation
✅ **Flexibility**: Easy to reorganize or add sections
