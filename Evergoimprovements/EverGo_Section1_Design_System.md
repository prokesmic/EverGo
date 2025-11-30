# EverGo Section 1: UI/UX Design System

## Overview
Implement a comprehensive design system with consistent styling, typography, colors, and components across the entire app.

---

## Color System

Define these CSS variables in your global styles:

```css
:root {
  /* Primary Brand Colors */
  --primary: #0078D4;
  --primary-dark: #005A9E;
  --primary-light: #4BA0E0;
  
  /* Accent Colors */
  --accent: #00A651;
  --accent-dark: #008C45;
  
  /* Backgrounds */
  --bg-page: #E8E8E8;
  --bg-card: #FFFFFF;
  --bg-input: #F5F5F5;
  
  /* Text Colors */
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --text-muted: #999999;
  --text-inverse: #FFFFFF;
  
  /* Borders */
  --border-light: #E5E5E5;
  --border-medium: #CCCCCC;
  
  /* Status Colors */
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Rankings */
  --gold: #FFD700;
  --silver: #C0C0C0;
  --bronze: #CD7F32;
  
  /* Sport Colors (for icons/badges) */
  --sport-running: #FF6B35;
  --sport-cycling: #3B82F6;
  --sport-swimming: #06B6D4;
  --sport-golf: #22C55E;
  --sport-tennis: #EAB308;
  --sport-football: #10B981;
  --sport-basketball: #F97316;
  --sport-fitness: #8B5CF6;
  --sport-climbing: #EC4899;
  --sport-triathlon: #6366F1;
}
```

---

## Typography Scale

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Heading Styles */
.text-display {
  font-size: 2.5rem;    /* 40px */
  font-weight: 700;
  line-height: 1.2;
}

.text-h1 {
  font-size: 1.875rem;  /* 30px */
  font-weight: 700;
  line-height: 1.3;
}

.text-h2 {
  font-size: 1.5rem;    /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

.text-h3 {
  font-size: 1.25rem;   /* 20px */
  font-weight: 600;
  line-height: 1.4;
}

.text-h4 {
  font-size: 1.125rem;  /* 18px */
  font-weight: 600;
  line-height: 1.5;
}

/* Body Text */
.text-body {
  font-size: 1rem;      /* 16px */
  font-weight: 400;
  line-height: 1.6;
}

.text-body-sm {
  font-size: 0.875rem;  /* 14px */
  font-weight: 400;
  line-height: 1.5;
}

/* Small/Caption Text */
.text-caption {
  font-size: 0.75rem;   /* 12px */
  font-weight: 400;
  line-height: 1.4;
  color: var(--text-muted);
}

.text-overline {
  font-size: 0.625rem;  /* 10px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

/* Stats/Numbers (use monospace for alignment) */
.text-stat {
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
}

.text-stat-sm {
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 1rem;
  font-weight: 600;
}
```

---

## Spacing System (8px Base)

Use consistent spacing throughout:

```css
/* Spacing Scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

/* Tailwind equivalents: p-1, p-2, p-3, p-4, p-5, p-6, p-8, p-10, p-12, p-16 */
```

Standard usage:
- Card padding: 16px (p-4)
- Section gaps: 24px (gap-6)
- Widget header padding: 12px 16px (py-3 px-4)
- List item padding: 12px 16px (py-3 px-4)
- Button padding: 8px 16px (py-2 px-4)

---

## Core UI Components

### Button Variants

```jsx
// Primary Button
<button className="bg-[#0078D4] hover:bg-[#005A9E] text-white font-medium py-2 px-4 rounded transition-colors">
  Primary Action
</button>

// Secondary Button
<button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition-colors">
  Secondary
</button>

// Outline Button
<button className="border border-[#0078D4] text-[#0078D4] hover:bg-[#0078D4] hover:text-white font-medium py-2 px-4 rounded transition-colors">
  Outline
</button>

// Ghost Button
<button className="text-[#0078D4] hover:bg-blue-50 font-medium py-2 px-4 rounded transition-colors">
  Ghost
</button>

// Danger Button
<button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors">
  Delete
</button>

// Icon Button
<button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
  <Icon className="w-5 h-5" />
</button>
```

### Card Component

```jsx
// Base Card
<div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
  {children}
</div>

// Card with Header
<div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
    <h3 className="font-semibold text-gray-800">Card Title</h3>
    <div className="flex gap-1">
      <button className="p-1 text-gray-400 hover:text-gray-600">
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <button className="p-1 text-gray-400 hover:text-gray-600">
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
  <div className="p-4">
    {content}
  </div>
</div>
```

### Input Fields

```jsx
// Text Input
<div className="space-y-1">
  <label className="text-sm font-medium text-gray-700">Label</label>
  <input 
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
    placeholder="Placeholder text"
  />
</div>

// Select Dropdown
<select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

// Search Input
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input 
    type="search"
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
    placeholder="Search..."
  />
</div>
```

### Avatar Component

```jsx
// Avatar with initials fallback
function Avatar({ src, name, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  };
  
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  return (
    <div className={`${sizes[size]} rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center overflow-hidden`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
```

### Badge/Tag Component

```jsx
// Sport Badge
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
  🏃 Running
</span>

// Status Badge
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
  ● Active
</span>

// Rank Badge
<span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold">
  🏆 #32
</span>
```

---

## Page Layout Structure

### Three-Column Dashboard Layout

```jsx
<div className="min-h-screen bg-[#E8E8E8]">
  {/* Header */}
  <Header />
  
  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 py-6">
    <div className="grid grid-cols-12 gap-6">
      {/* Left Sidebar - 3 columns */}
      <aside className="col-span-12 lg:col-span-3 space-y-4">
        <LeftWidget1 />
        <LeftWidget2 />
      </aside>
      
      {/* Main Content - 6 columns */}
      <div className="col-span-12 lg:col-span-6 space-y-4">
        <MainContent />
      </div>
      
      {/* Right Sidebar - 3 columns */}
      <aside className="col-span-12 lg:col-span-3 space-y-4">
        <RightWidget1 />
        <RightWidget2 />
      </aside>
    </div>
  </main>
</div>
```

### Mobile Responsive Behavior

```jsx
// On mobile (< 1024px):
// - Sidebars stack below main content OR
// - Sidebars become horizontal scrollable sections OR
// - Sidebars move to separate tabs

// Use these responsive classes:
// hidden lg:block - Hide on mobile, show on desktop
// lg:col-span-3 col-span-12 - Full width on mobile, sidebar on desktop
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Small tablets, large phones landscape */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops, tablets landscape */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Mobile Navigation

```jsx
// Bottom Tab Bar for Mobile
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
  <div className="flex justify-around py-2">
    <NavItem icon={HomeIcon} label="Home" href="/" />
    <NavItem icon={TrophyIcon} label="Rankings" href="/rankings" />
    <NavItem icon={PlusCircleIcon} label="Log" href="/activity/new" />
    <NavItem icon={UsersIcon} label="Teams" href="/teams" />
    <NavItem icon={UserIcon} label="Profile" href="/profile" />
  </div>
</nav>

function NavItem({ icon: Icon, label, href }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 px-3 py-1 text-gray-600 hover:text-blue-600">
      <Icon className="w-6 h-6" />
      <span className="text-xs">{label}</span>
    </a>
  );
}
```

---

## Accessibility Requirements

1. **Color Contrast**: All text must have 4.5:1 contrast ratio minimum
2. **Touch Targets**: Minimum 44x44px for all interactive elements on mobile
3. **Focus States**: Visible focus rings on all interactive elements
4. **Labels**: All form inputs must have associated labels
5. **Alt Text**: All images must have descriptive alt text
6. **Keyboard Navigation**: All features accessible via keyboard

```jsx
// Focus ring example
className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
```

---

## Icons

Use Lucide React icons throughout:

```jsx
import { 
  Home, Trophy, Users, User, Search, Bell, MessageCircle,
  ChevronLeft, ChevronRight, Plus, Heart, Share2, MapPin,
  Calendar, Clock, Route, Flame, Award, Target, TrendingUp
} from 'lucide-react';
```

Sport icons can use emoji or custom SVGs:
- 🏃 Running
- 🚴 Cycling
- 🏊 Swimming
- ⛳ Golf
- 🎾 Tennis
- ⚽ Football
- 🏀 Basketball
- 💪 Fitness
- 🧗 Climbing
- 🏊🚴🏃 Triathlon
