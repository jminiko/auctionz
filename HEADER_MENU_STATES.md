# Header Menu States Guide

This document describes the different header menu states implemented in the AuctionZ application, providing distinct navigation experiences based on user authentication status and preferences.

## Overview

The header menu system provides three distinct states:

1. **Logged-in User Menu** - Personalized menu for authenticated users
2. **Guest Menu (with Login/Signup)** - Menu with authentication options for new users
3. **Guest Menu (without Login/Signup)** - Menu with only informational links

## Menu States

### 1. Logged-in User Menu

**When shown**: User is authenticated and logged in

**Features**:

- **User Avatar**: Displays user initials in a circular avatar
- **User Name**: Shows the user's first name
- **Role-based Dashboard Links**:
  - Admin users: "Admin Dashboard"
  - Seller users: "Seller Dashboard"
  - Buyer users: "Buyer Dashboard"
  - Default: "Dashboard"
- **User-specific Actions**:
  - Sellers: "My Auctions", "Create Auction"
  - Buyers: "My Bids"
- **Profile & Settings**:
  - Profile management
  - Session management
  - Logout options
- **Quick Logout**: Direct logout button

**Visual Elements**:

```vue
<div class="user-menu">
  <button class="user-menu-button">
    <div class="user-avatar">{{ userInitials }}</div>
    <span class="user-name">{{ authStore.user?.first_name }}</span>
    <span class="dropdown-arrow">▼</span>
  </button>

  <div class="user-dropdown">
    <!-- Role-based dashboard links -->
    <!-- User-specific actions -->
    <!-- Profile & settings -->
    <!-- Logout options -->
  </div>
</div>
```

### 2. Guest Menu (with Login/Signup)

**When shown**: User is not authenticated and authentication options are enabled

**Features**:

- **Login Button**: Styled as outline button
- **Sign Up Button**: Styled as primary button
- **Clear Call-to-Action**: Encourages user registration

**Visual Elements**:

```vue
<div class="auth-links">
  <router-link to="/login" class="btn btn-outline">Login</router-link>
  <router-link to="/register" class="btn btn-primary">Sign Up</router-link>
</div>
```

### 3. Guest Menu (without Login/Signup)

**When shown**: User is not authenticated and authentication options are disabled

**Features**:

- **About Link**: Information about the platform
- **Contact Link**: Contact information
- **Help Link**: Help and support resources
- **Informational Focus**: No authentication pressure

**Visual Elements**:

```vue
<div class="guest-links">
  <router-link to="/about" class="nav-link">About</router-link>
  <router-link to="/contact" class="nav-link">Contact</router-link>
  <router-link to="/help" class="nav-link">Help</router-link>
</div>
```

## Implementation Details

### State Control

The header menu state is controlled by the `showAuthOptions` reactive variable:

```typescript
const showAuthOptions = ref(true) // Control whether to show login/signup options
```

### Conditional Rendering

The menu uses Vue's conditional rendering to show different states:

```vue
<!-- Logged-in User Menu -->
<div v-if="authStore.isAuthenticated" class="user-menu">
  <!-- User menu content -->
</div>

<!-- Non-authenticated User Menu (with auth options) -->
<div v-else-if="showAuthOptions" class="auth-links">
  <!-- Login/Signup buttons -->
</div>

<!-- Non-authenticated User Menu (without auth options) -->
<div v-else class="guest-links">
  <!-- Informational links -->
</div>
```

### Role-based Navigation

For authenticated users, the menu provides role-specific navigation:

```vue
<!-- Role-based dashboard links -->
<router-link v-if="authStore.isAdmin" to="/admin-dashboard" class="dropdown-item">
  Admin Dashboard
</router-link>
<router-link v-else-if="authStore.isSeller" to="/seller-dashboard" class="dropdown-item">
  Seller Dashboard
</router-link>
<router-link v-else-if="authStore.isBuyer" to="/buyer-dashboard" class="dropdown-item">
  Buyer Dashboard
</router-link>
```

## Mobile Menu States

The mobile menu provides the same three states with responsive design:

### Mobile Logged-in User Section

- User avatar and information
- Role-based dashboard links
- User-specific actions
- Profile and session management
- Logout options

### Mobile Guest Section (with auth)

- Login and signup links
- Clean, focused design

### Mobile Guest Section (without auth)

- About, contact, and help links
- Informational navigation

## Header State Controller

A demonstration component (`HeaderStateController.vue`) is included to showcase the different menu states:

### Features

- **Radio Button Selection**: Choose between menu states
- **State Descriptions**: Clear explanations of each state
- **Current State Info**: Shows active state and details
- **Action Buttons**: Reset and toggle functionality

### Usage

```vue
<template>
  <HeaderStateController />
</template>

<script setup lang="ts">
import HeaderStateController from '@/components/HeaderStateController.vue'
</script>
```

## Styling

### CSS Classes

```css
/* User menu styles */
.user-menu {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* ... */
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  /* ... */
}

/* Auth links styles */
.auth-links {
  display: flex;
  gap: 1rem;
}

/* Guest links styles */
.guest-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}
```

### Responsive Design

The menu adapts to different screen sizes:

```css
@media (max-width: 768px) {
  .nav-menu {
    display: none; /* Hide desktop menu */
  }

  .mobile-menu {
    display: block; /* Show mobile menu */
  }
}
```

## Use Cases

### 1. E-commerce Platform

- **Logged-in**: Personalized shopping experience
- **Guest with auth**: Encourage account creation
- **Guest without auth**: Allow browsing without pressure

### 2. Content Platform

- **Logged-in**: Access to premium content and features
- **Guest with auth**: Sign up for full access
- **Guest without auth**: Browse public content

### 3. SaaS Application

- **Logged-in**: Full application access
- **Guest with auth**: Trial or demo access
- **Guest without auth**: Marketing and information pages

## Configuration

### Environment-based Control

You can control the default state based on environment:

```typescript
// Development: Show auth options by default
const showAuthOptions = ref(import.meta.env.DEV)

// Production: Show auth options by default
const showAuthOptions = ref(true)

// Custom: Control via configuration
const showAuthOptions = ref(config.showAuthOptions)
```

### Dynamic State Changes

The state can be changed programmatically:

```typescript
// Hide auth options
showAuthOptions.value = false

// Show auth options
showAuthOptions.value = true

// Toggle state
showAuthOptions.value = !showAuthOptions.value
```

## Best Practices

### 1. User Experience

- **Clear Visual Hierarchy**: Different states should be visually distinct
- **Consistent Navigation**: Core navigation (Home, Auctions) remains consistent
- **Progressive Disclosure**: Show more options as user engagement increases

### 2. Accessibility

- **Keyboard Navigation**: All menu items should be keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators and logical tab order

### 3. Performance

- **Conditional Loading**: Only load components when needed
- **Efficient Rendering**: Use Vue's reactivity system effectively
- **Minimal Re-renders**: Optimize component updates

### 4. Security

- **Authentication Checks**: Verify user state before showing sensitive options
- **Role Validation**: Ensure role-based access is properly enforced
- **Session Management**: Integrate with session management system

## Future Enhancements

### Planned Features

1. **A/B Testing Support**
   - Different menu states for testing
   - Analytics integration
   - Conversion tracking

2. **Personalization**
   - User preference-based menu customization
   - Learning algorithms for menu optimization
   - Contextual menu items

3. **Advanced States**
   - Premium user menus
   - Trial user menus
   - Suspended user menus

4. **Internationalization**
   - Multi-language menu support
   - Cultural menu adaptations
   - RTL language support

## Conclusion

The header menu state system provides a flexible, user-friendly navigation experience that adapts to different user contexts and preferences. By offering three distinct states, the application can serve various use cases while maintaining a consistent and professional appearance.

The implementation is:

- **Flexible**: Easy to configure and customize
- **Responsive**: Works across all device sizes
- **Accessible**: Follows web accessibility guidelines
- **Maintainable**: Clean, well-structured code
- **Extensible**: Ready for future enhancements

This system ensures that users have the appropriate navigation experience based on their authentication status and the application's requirements.
