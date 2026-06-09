# Xpressmen Logistics — Technical Specification

## Dependencies

### Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0 | UI framework |
| react-dom | ^19.0 | DOM renderer |
| react-router-dom | ^7.0 | Two-page routing (Home, Booking) with fade transitions |
| zustand | ^5.0 | Lightweight wizard state persistence across 8 steps |
| framer-motion | ^12.0 | All page animations, scroll reveals, step transitions, message loops |
| react-hook-form | ^7.54 | Booking wizard form validation |
| @hookform/resolvers | ^4.0 | Zod resolver for react-hook-form |
| zod | ^3.25 | Schema validation for all form inputs |
| date-fns | ^4.0 | Calendar date arithmetic, slot generation, timezone handling |
| react-day-picker | ^9.0 | Calendar widget in Step 6 scheduling |
| react-dropzone | ^14.3 | Drag-and-drop photo upload in Step 3 |

### Dev

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^6.0 | Build tool |
| @vitejs/plugin-react | ^4.0 | React Fast Refresh + JSX |
| tailwindcss | ^4.0 | Utility-first CSS |
| @tailwindcss/vite | ^4.0 | Tailwind Vite integration |
| typescript | ^5.7 | Type safety |
| @types/react | ^19.0 | React type definitions |
| @types/react-dom | ^19.0 | ReactDOM type definitions |

---

## Component Inventory

### Layout (shared)

| Component | Source | Reuse | Notes |
|-----------|--------|-------|-------|
| Navigation | Custom | Both pages | Fixed top, blur backdrop, mobile hamburger drawer |
| Footer | Custom | Both pages | 4-col grid + disclaimer bar + back-to-top button |
| PageTransitionWrapper | Custom | Both pages | Wraps each route, orchestrates cross-fade exit/enter (200ms/300ms) |

### Home Sections

| Component | Source | Notes |
|-----------|--------|-------|
| HeroSection | Custom | Orchestrated 5-step entrance sequence on mount |
| ServicesSection | Custom | 3 service cards with hover reveal thumbnails |
| HowItWorksSection | Custom | 4-step process + floating phone mockup |
| InteractivePreviewSection | Custom | Simulated chat UI with 8s looping message bubble sequence |
| TestimonialsSection | Custom | 3 testimonial cards with subtle parallax translateY |
| ServiceAreasSection | Custom | Stylized map + pulsing pin + city checklist |
| FAQSection | Custom | Two-column layout + accordion (one-open-at-a-time) |
| CTABannerSection | Custom | `background-attachment: fixed` parallax with dark overlay |

### Booking Sections

| Component | Source | Notes |
|-----------|--------|-------|
| BookingWizardShell | Custom | Fixed step indicator bar + horizontal slide transition container + nav bar |
| StepIndicator | Custom | 8-step horizontal progress bar, clickable completed steps |

### Booking Steps (each is a standalone form panel)

| Component | Notes |
|-----------|-------|
| Step1ServiceType | 3 selectable cards, multi-select (Delivery/Removal/Both) |
| Step2OrderDetails | Conditional — skipped if Removal-only. Store name, order#, item description |
| Step3PhotoUpload | Dropzone + photo grid with AI description simulation + remove |
| Step4RoomSelection | Room type selector + diagram with clickable hotspots + placement tags + checklist toggles |
| Step5AdditionalDetails | Home type select, parking, access notes, special requests |
| Step6Schedule | react-day-picker calendar + time slot grid + live indicator |
| Step7ContactInfo | Name/phone/email/address + communication preferences checkboxes |
| Step8ReviewConfirm | Summary card with 5 sections + edit links + terms modal + confirm CTA |
| ConfirmationScreen | Success animation + booking reference + next steps + action buttons |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| ButtonPrimary | Custom | All pages — Primary CTA |
| ButtonSecondary | Custom | All pages — Secondary CTA |
| CardDark | Custom | Home sections (Services, Testimonials) |
| CardLight | Custom | Booking wizard, ServiceAreas, HowItWorks |
| ScrollReveal | Custom | Wrapper used across all home sections for entrance animations |
| AccordionItem | Custom | FAQSection — expand/collapse with max-height transition |
| UploadZone | Custom | Step3 — dashed drop area with drag states |
| PhotoCard | Custom | Step3 — thumbnail + AI description overlay + remove button |
| RoomDiagram | Custom | Step4 — diagram image + positioned hotspot overlays |
| ToggleSwitch | Custom | Step4 checklist — 44×24px animated toggle |
| CustomCheckbox | Custom | Step7, Step8 — 20px square with Red Accent fill |
| CalendarWidget | Custom | Step6 — wraps react-day-picker with custom styling |
| TimeSlotCard | Custom | Step6 — slot with availability badge |
| SummarySection | Custom | Step8 — repeated layout for each review category |
| ModalOverlay | Custom | Step8 terms modal, Step3 photo lightbox |
| FloatingStatsBar | Custom | Hero — 3-stat card overlapping into next section |
| ChatBubble | Custom | InteractivePreview — animated message bubble |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Hero entrance sequence (5-step orchestrated) | Framer Motion | `useAnimation` + staggered `start()` calls with explicit delays: bg → image (scale 1.1→1, 1200ms, 400ms delay) → headline clip-path (polygon, 1000ms, staggered 100ms per line) → subheadline (fade+translateY, 600ms, 500ms delay) → CTA (500ms, 700ms delay) → stats bar (translateY+fade, 800ms, 900ms, ease-out-back) | 🔒 High |
| Headline clip-path reveal | Framer Motion | `clipPath` from `polygon(0 100%, 100% 100%, 100% 100%, 0 100%)` to `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, 1000ms, ease-out-quart. Reusable for section headlines via ScrollReveal wrapper. | Medium |
| Floating elements (hero image, phone mockup) | Framer Motion | `animate` with `repeat: Infinity, repeatType: "reverse"`, translateY ±12px/±10px, 6s/5s | Low |
| Stats bar entrance | Framer Motion | translateY(60px→0) + opacity, ease-out-back overshoot | Low |
| Scroll-triggered section entrances | Framer Motion | `whileInView` + `viewport={{ once: true, amount: 0.15 }}`, fade+translateY(40px→0), 600ms, ease-out-quart. `staggerChildren` on parent grids (150ms). Encapsulated in ScrollReveal component. | Medium |
| Service card hover reveal | CSS transitions | Thumbnail overlay fades in (opacity 0→1, 300ms). Card border → Red Accent. Pure CSS. | Low |
| Interactive chat message loop | Framer Motion | 8s `repeat` cycle: `useAnimation` sequence that staggers bubble entrances (translateY 20px→0 + fade, 400ms, 600ms apart), holds, then restarts. Typing dots: CSS keyframes (scale pulse, staggered). | 🔒 High |
| Chat interface slide-in | Framer Motion | translateX(40px→0) + opacity, 800ms, `whileInView` | Low |
| Testimonial parallax | Framer Motion | Different `useScroll` + `useTransform` rates per card (0.9x, 1.0x, 1.1x translateY) | Medium |
| Map pin pulse | CSS keyframes | Scale 1→1.3→1, 2s infinite. Pure CSS animation. | Low |
| FAQ accordion expand/collapse | Framer Motion | `AnimatePresence` + `motion.div` with dynamic height (auto-detected via ref), 400ms. Plus icon rotates 45°. | Medium |
| CTA banner parallax | CSS | `background-attachment: fixed` — pure CSS, no library | Low |
| **Wizard step transitions** | Framer Motion | Horizontal flex container. Active step: `animate={{ x: 0, opacity: 1 }}`. Entering (next): starts `x: 60`, animates to `x: 0`. Exiting: `x: 0` → `x: -60`, opacity → 0. `AnimatePresence` with `mode="wait"`. | 🔒 High |
| Step indicator progress fill | Framer Motion | `layoutId` on the connecting line segments, or `animate={{ scaleX }}` with `originX: 0`, 500ms transition | Medium |
| Hotspot entrance on diagram | Framer Motion | Scale 0→1, staggered 100ms, ease-out-back. Triggered on room type change. | Medium |
| Placement tag add/remove | Framer Motion | `AnimatePresence`: enter scale(0.9→1) + fade 200ms, exit slide-up collapse 300ms | Low |
| Photo upload shimmer | CSS keyframes | Animated gradient sweep (background-position) over description area, 1.5s. Pure CSS. | Low |
| Photo card entrance | Framer Motion | Stagger: fade + scale(0.95→1), 300ms each, 100ms stagger | Low |
| Calendar month transition | Framer Motion | Days fade+translateX(-20px→0), 300ms on month change | Medium |
| Time slot stagger entrance | Framer Motion | `staggerChildren: 0.05`, fade+translateY(10px→0) | Low |
| Success icon draw | Framer Motion | SVG checkmark: `pathLength` 0→1, 600ms. Circle: scale 0.8→1, 500ms ease-out-back. Sequential orchestration. | 🔒 High |
| Confirmation entrance sequence | Framer Motion | `useAnimation` sequence: spinner out (200ms) → icon draws (800ms) → title clip-reveal (800ms) → message fade (500ms) → reference fade (500ms) → steps stagger (200ms × 3) → buttons fade (500ms). ~3.5s total. | 🔒 High |
| Page cross-fade transition | Framer Motion | `AnimatePresence` wrapping route outlet: exit opacity 1→0 (200ms), enter opacity 0→1 (300ms) | Low |
| Back-to-top button | Framer Motion | `whileInView` after 400px scroll, opacity 0→1, 300ms | Low |

---

## State & Logic Plan

### Booking Wizard State (Zustand)

A single Zustand store holds all wizard data across 8 steps. This prevents data loss on navigation, supports "go back to edit" from the review screen, and enables step transitions without re-rendering the entire shell.

Store shape:
```typescript
interface BookingStore {
  currentStep: number;           // 1–8, + confirmation screen
  serviceType: ('delivery' | 'removal')[];
  orderDetails: { storeName: string; orderNumber?: string; itemDescription: string } | null;
  photos: Array<{ id: string; file: File; url: string; aiDescription: string; status: 'uploading' | 'analyzing' | 'complete' }>;
  roomSelection: { roomType: string; placements: string[]; considerations: string[]; description?: string } | null;
  additionalDetails: { homeType: string; parking?: string; accessNotes?: string; specialRequests?: string } | null;
  schedule: { date: Date; timeSlot: string } | null;
  contactInfo: { firstName: string; lastName: string; phone: string; email: string; address: string; communicationPrefs: string[] } | null;
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: (section: string, data: any) => void;
  reset: () => void;
}
```

### Step-Conditional Navigation

Step 2 (Order Details) is **conditional**: if the user selected Removal-only in Step 1, the wizard must skip Step 2 entirely. Implement this in the `nextStep` action:

```
nextStep() {
  if (currentStep === 1 && serviceType.includes('delivery') === false) {
    setCurrentStep(3); // skip to photo upload
  } else {
    setCurrentStep(currentStep + 1);
  }
}
```

Similarly, when navigating backward from Step 3, if Removal-only, go to Step 1 instead of Step 2.

### Photo Upload & AI Description Flow

Photos are managed via Zustand store (not form state). Flow:

1. User drops/selects files via `react-dropzone`
2. Each file is added to the store with `status: 'uploading'`
3. `URL.createObjectURL(file)` generates a preview URL immediately
4. A `setTimeout` (1–2s) simulates AI processing, then updates `status` to `'analyzing'` → `'complete'` with a generated description string
5. Photo cards render from store; `AnimatePresence` handles add/remove animations
6. Remove action: revoke object URL + filter from store

No actual AI API is called — descriptions are pre-written templates based on file metadata (dimensions, file name keywords) or randomly selected from a pool of realistic descriptions.

### Room Diagram Hotspots

Hotspots are absolutely-positioned circular divs overlaid on the room diagram image. Each diagram has a static array of hotspot coordinates (percent-based x/y) and labels. Clicking a hotspot:

1. Appends the label to `roomSelection.placements[]` in store (max 3)
2. Visual feedback: hotspot fills solid (no pulse), brief Red Accent pulse
3. Placement tag appears below diagram via `AnimatePresence`

### Calendar & Dynamic Slots

Slot data is computed, not fetched:

1. `date-fns` generates a 3-month calendar view
2. For the selected date, slots are generated as static data with randomized availability counts (e.g., "3 spots left", "Almost full")
3. Past dates and dates >14 days out are marked unavailable
4. A `setInterval` (every 30s) shuffles the availability numbers on the currently displayed date's slots to simulate "dynamic updates"
5. The "live indicator" green dot pulses via CSS keyframes

### Phone Input Auto-Formatting

As the user types in the phone field, a custom onChange handler formats the raw digits into `(XXX) XXX-XXXX` pattern. Store the raw digits in a hidden ref, display the formatted string.

### Terms Modal

Step 8's terms link opens a full-screen modal overlay (ModalOverlay component) displaying the complete disclaimer text. No external routing — pure component toggle in local state.

---

## Other Key Decisions

### Routing

React Router with two routes: `/` (Home) and `/booking`. The booking wizard is a **single-page flow** — no sub-routes for individual steps. Step navigation is entirely client-side via Zustand state + Framer Motion transitions. This avoids URL sync complexity and keeps the back button behavior simple (browser back exits the wizard entirely, which is acceptable for a 2-page site).

### Room Diagrams

Five room diagram images (living room, bedroom, dining room, home office, entryway) are static PNG assets. Hotspot positions are hardcoded per-diagram as percentage arrays. No SVG interactivity or canvas — simple `position: absolute` divs on top of the image.

### Mobile-First Form Layout

The booking wizard container is `max-width: 720px` centered. On mobile, this fills most of the viewport width. Room diagram hotspots must be touch-friendly: minimum 44px tap target (the 32px hotspot + padding/transparent expansion). The room type selector on Step 4 scrolls horizontally with CSS `overflow-x: auto` and fade indicators.

### Performance

- Use `will-change: transform` on hero image and floating elements
- Lazy load room diagram images (below the fold in step flow)
- Use `viewport={{ once: true }}` on all scroll-triggered animations to prevent re-animation
- `react-dropzone` handles file preview via `URL.createObjectURL` — must `URL.revokeObjectURL` on unmount/remove to prevent memory leaks
