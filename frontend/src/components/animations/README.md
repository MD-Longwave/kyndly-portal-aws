# Animation Components

This directory contains reusable animation components that provide subtle motion effects throughout the application.

## Components

### FadeIn
A simple fade-in animation for elements appearing on the page.

```jsx
<FadeIn delay={0.2} duration={0.5}>
  <div>Content that fades in</div>
</FadeIn>
```

### SlideIn
Slides elements in from a specified direction.

```jsx
<SlideIn direction="up" delay={0.2} distance={20}>
  <div>Content that slides in from below</div>
</SlideIn>
```

### HoverScale
Provides a subtle scale effect when hovering over interactive elements.

```jsx
<HoverScale scale={1.02}>
  <button>Hover me</button>
</HoverScale>
```

### PageTransition
Handles smooth transitions between pages/routes.

```jsx
<PageTransition>
  <div>Page content</div>
</PageTransition>
```

## Usage Guidelines

- Keep animations subtle and professional
- Use consistent animation durations (0.2-0.5s is recommended)
- For lists, use staggered animations with small delays (0.1-0.2s between items)
- Limit animation distance for slide effects (10-20px is recommended)
- Use hover effects sparingly and keep scale values small (1.01-1.05)

## Implementation

These components are built with Framer Motion and can be easily customized by adjusting their props. 