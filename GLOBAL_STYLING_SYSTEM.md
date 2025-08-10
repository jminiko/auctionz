# Global Styling System

This document describes the consistent styling system implemented across the AuctionZ application, based on the design patterns from HomeView.

## Overview

The global styling system provides a consistent, maintainable approach to styling across all views and components. It's built on CSS custom properties (variables) and utility classes that can be reused throughout the application.

## Color System

### CSS Variables

All colors are defined as CSS custom properties in `src/assets/main.css`:

```css
:root {
  --color-primary: #3498db;
  --color-primary-hover: #2980b9;
  --color-heading: #2c3e50;
  --color-text: #7f8c8d;
  --color-background: #f3f4f6;
  --color-background-soft: #f8fafc;
  --color-border: #e2e8f0;
  --color-white: #ffffff;
  --color-success: #27ae60;
  --color-warning: #f39c12;
  --color-danger: #e74c3c;
  --color-info: #3498db;
}
```

### Usage

Instead of hardcoding colors, use the CSS variables:

```css
/* ❌ Don't do this */
color: #3498db;

/* ✅ Do this */
color: var(--color-primary);
```

## Layout System

### Page Container

```html
<div class="page-container">
  <!-- Page content -->
</div>
```

### Page Header

```html
<div class="page-header">
  <h1>Page Title</h1>
  <p>Page description</p>
</div>
```

### Sections

```html
<div class="section">
  <div class="section-header">
    <h3>Section Title</h3>
    <button class="btn btn-outline">Action</button>
  </div>
  <div class="section-content">
    <!-- Section content -->
  </div>
</div>
```

## Card System

### Basic Card

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Stats Cards

```html
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-icon">📊</div>
    <div class="stat-content">
      <h3>1,234</h3>
      <p>Total Items</p>
    </div>
  </div>
</div>
```

## Grid System

### Auto-fit Grids

```html
<!-- Small items -->
<div class="grid-auto-fit-sm">
  <!-- Items with min-width: 200px -->
</div>

<!-- Medium items -->
<div class="grid-auto-fit">
  <!-- Items with min-width: 250px -->
</div>

<!-- Large items -->
<div class="grid-auto-fit-lg">
  <!-- Items with min-width: 300px -->
</div>
```

## Form System

### Form Grid

```html
<div class="form-grid">
  <div class="form-group">
    <label>Field Label</label>
    <input class="form-input" type="text" />
  </div>
  <div class="form-group full-width">
    <label>Full Width Field</label>
    <textarea class="form-input"></textarea>
  </div>
</div>
```

## Button System

### Button Variants

```html
<!-- Primary button -->
<button class="btn btn-primary">Primary Action</button>

<!-- Outline button -->
<button class="btn btn-outline">Secondary Action</button>

<!-- Secondary button -->
<button class="btn btn-secondary">Tertiary Action</button>

<!-- Large button -->
<button class="btn btn-primary btn-lg">Large Button</button>
```

## Status Badges

```html
<div class="status-badge active">Active</div>
<div class="status-badge ended">Ended</div>
<div class="status-badge pending">Pending</div>
```

## Modal System

### Modal Structure

```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3>Modal Title</h3>
      <button class="close-btn">×</button>
    </div>
    <div class="modal-content">
      <!-- Modal content -->
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

## Loading States

```html
<div class="loading-container">
  <div class="loading-spinner"></div>
  <p>Loading...</p>
</div>
```

## Responsive Design

The system includes responsive breakpoints that automatically adjust layouts for mobile devices:

- **Desktop**: Full grid layouts
- **Mobile (≤768px)**: Single column layouts, stacked buttons, adjusted padding

## Implementation Guidelines

### 1. Use Global Classes First

Always try to use the global classes before creating custom styles:

```html
<!-- ✅ Use global classes -->
<div class="section">
  <div class="section-header">
    <h3>Title</h3>
  </div>
</div>

<!-- ❌ Don't create custom classes unnecessarily -->
<div class="custom-section">
  <div class="custom-header">
    <h3>Title</h3>
  </div>
</div>
```

### 2. Extend with Scoped Styles

When you need component-specific styles, extend the global system:

```vue
<style scoped>
/* Component-specific styles that extend the global system */
.custom-component {
  /* Use CSS variables for consistency */
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
}

/* Override global styles when needed */
.section-header {
  /* Component-specific overrides */
  background: var(--color-primary);
  color: var(--color-white);
}
</style>
```

### 3. Maintain Consistency

- Always use CSS variables for colors
- Follow the established spacing patterns (1rem, 1.5rem, 2rem)
- Use consistent border-radius (8px, 12px, 1.5rem)
- Maintain consistent shadows and transitions

## Migration Guide

### From Custom Styles to Global System

**Before:**

```vue
<template>
  <div class="custom-page">
    <div class="custom-header">
      <h1>Title</h1>
    </div>
    <div class="custom-content">
      <div class="custom-card">
        <h3>Card Title</h3>
        <p>Content</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.custom-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.custom-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}
</style>
```

**After:**

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Title</h1>
    </div>
    <div class="section">
      <h3>Card Title</h3>
      <p>Content</p>
    </div>
  </div>
</template>

<style scoped>
/* Only component-specific styles remain */
</style>
```

## Benefits

1. **Consistency**: All views follow the same design patterns
2. **Maintainability**: Changes to the design system affect all components
3. **Performance**: Reduced CSS bundle size through reuse
4. **Developer Experience**: Faster development with pre-built components
5. **Accessibility**: Consistent focus states and interactions

## Future Enhancements

- Add more utility classes for spacing and typography
- Implement dark mode support
- Add animation utilities
- Create component-specific design tokens
- Add CSS-in-JS support for dynamic theming
