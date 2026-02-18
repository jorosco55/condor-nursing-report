---
name: building-capacitor-ui
description: Expert UI/UX developer for Capacitor by Ionic apps. Use this skill when the user asks about mobile UI design, Capacitor plugins, Ionic components, responsive layouts, native device features, cross-platform UI patterns, or building hybrid mobile interfaces.
---

# Capacitor UI/UX Expert

## When to use this skill
- User asks to build, design, or improve a mobile UI using Capacitor/Ionic
- User needs help with Ionic components, theming, or layout
- User wants to integrate native device features (camera, haptics, status bar, keyboard) into the UI
- User asks about cross-platform UI patterns for iOS and Android
- User needs responsive or adaptive design for hybrid apps
- User mentions Capacitor plugins that affect the user experience

## Core Principles

- **Mobile-first**: Always design for the smallest viewport first, then scale up.
- **Platform-aware**: Use `ion-platform` classes and Ionic's adaptive styling to respect iOS and Material Design conventions automatically.
- **Performance over polish**: Prefer CSS-based animations and virtual scrolling over heavy JS-driven UI. Target 60fps.
- **Accessible by default**: Use semantic Ionic components (`ion-label`, `ion-button`, `ion-item`) which include ARIA roles. Never skip `aria-label` on icon-only buttons.

## Workflow

- [ ] Clarify target platforms (iOS, Android, PWA)
- [ ] Identify required native features (camera, geolocation, push, haptics, etc.)
- [ ] Scaffold or locate the page/component to modify
- [ ] Implement UI using Ionic components
- [ ] Wire up Capacitor plugins for native functionality
- [ ] Test platform-specific rendering differences
- [ ] Validate accessibility and responsive behavior

## Ionic Component Selection Guide

| Need | Component | Notes |
|---|---|---|
| Navigation | `ion-tabs`, `ion-menu`, `ion-nav` | Tabs for flat nav, menu for deep hierarchies |
| Lists | `ion-list` + `ion-item` | Use `ion-virtual-scroll` for 100+ items |
| Forms | `ion-input`, `ion-select`, `ion-toggle`, `ion-datetime` | Wrap in `ion-item` for consistent spacing |
| Feedback | `ion-toast`, `ion-alert`, `ion-loading`, `ion-action-sheet` | Toast for non-blocking, alert for decisions |
| Layout | `ion-grid` + `ion-row` + `ion-col` | 12-column responsive grid |
| Cards | `ion-card` + `ion-card-header` + `ion-card-content` | Use for grouped content blocks |
| Pull-to-refresh | `ion-refresher` | Place as first child of `ion-content` |
| Infinite scroll | `ion-infinite-scroll` | Place as last child of `ion-content` |

## Capacitor Plugin Integration Patterns

### Camera / Photo UI
```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt,
  });
  return image.webPath;
};
```

### Haptic Feedback on UI Actions
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const onButtonTap = async () => {
  await Haptics.impact({ style: ImpactStyle.Light });
};
```

### Status Bar Styling
```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// Match status bar to app theme
const setDarkStatusBar = async () => {
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#1a1a2e' });
};
```

### Keyboard Handling
```typescript
import { Keyboard } from '@capacitor/keyboard';

// Adjust layout when keyboard appears
Keyboard.addListener('keyboardWillShow', (info) => {
  document.body.style.setProperty('--keyboard-offset', `${info.keyboardHeight}px`);
});

Keyboard.addListener('keyboardWillHide', () => {
  document.body.style.setProperty('--keyboard-offset', '0px');
});
```

## Theming

Use CSS custom properties for consistent theming across platforms:

```css
:root {
  --ion-color-primary: #3880ff;
  --ion-color-secondary: #3dc2ff;
  --ion-background-color: #ffffff;
  --ion-text-color: #1a1a2e;
  --ion-toolbar-background: #f8f9fa;
}

/* Dark mode via prefers-color-scheme or .dark class */
body.dark {
  --ion-background-color: #1a1a2e;
  --ion-text-color: #f0f0f0;
  --ion-toolbar-background: #16213e;
  --ion-item-background: #1a1a2e;
  --ion-card-background: #16213e;
}
```

## Platform-Specific UI Adjustments

- Use `isPlatform('ios')` or `isPlatform('android')` from `@ionic/core` for conditional rendering.
- Safe area insets: always apply `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)` on full-screen layouts.
- Use `ion-header` with `translucent` on iOS for the native blur effect.
- Avoid custom back buttons — let `ion-back-button` handle platform-appropriate behavior.

## Common Pitfalls

- **Scroll issues**: Never nest scrollable containers. One `ion-content` per page.
- **Gesture conflicts**: Capacitor's swipe-back gesture on iOS can conflict with custom swipe handlers. Use `swipeGesture` property on `ion-nav` to control this.
- **Image sizing**: Always set explicit `width`/`height` or use `object-fit: cover` to prevent layout shifts.
- **Splash screen flash**: Call `SplashScreen.hide()` only after the first meaningful paint, not on `app.component` init.
- **Plugin availability**: Always check `Capacitor.isNativePlatform()` before calling native-only plugins in PWA mode.

## Resources
- [Capacitor Plugin APIs](https://capacitorjs.com/docs/apis)
- [Ionic Component Docs](https://ionicframework.com/docs/components)
