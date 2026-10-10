# PERC Design System — Reusable CSS & Component Patterns

> Copy-paste these patterns to build websites with the same look and feel.

---

## Required Setup

### Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### Fonts (Next.js)

```ts
// app/layout.tsx
import { Inter, Playfair_Display } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
```

### Packages

```json
"dependencies": {
  "lucide-react": "^1.23.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.6.0",
  "class-variance-authority": "^0.7.1"
}
```

---

## 1. Theme Setup (`globals.css`)

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --font-sans: var(--font-inter), "Inter", "Segoe UI", Arial, sans-serif;
  --font-display: var(--font-playfair), "Playfair Display", Georgia, serif;

  --color-primary: #243252;
  --color-primary-hover: #1b2742;
  --color-background: #f6f5f1;
  --color-surface: #ffffff;
  --color-section: #fcfbf8;
  --color-accent: #c8a44d;
  --color-accent-hover: #b89237;
  --color-heading: #243252;
  --color-text: #5b6472;
  --color-text-light: #8a909c;
  --color-border: #e6e2da;
  --color-destructive: #c44b4b;

  --shadow-soft: 0 8px 30px rgba(36, 50, 82, 0.08);
  --shadow-medium: 0 12px 40px rgba(36, 50, 82, 0.12);

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-xl: 30px;
}
```

### Body & Typography Defaults

```css
body {
  font-family: var(--font-sans);
  background: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-heading);
}
```

### Utility Classes (optional)

```css
.container-custom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section {
  padding: 80px 0;
}

.section:nth-child(even) {
  background: var(--color-section);
}

.section-subtitle {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-accent);
  font-weight: 600;
  margin-bottom: 8px;
}
```

---

## 2. Button Patterns

### Primary Button (navy)

```html
<a
  href="..."
  class="inline-flex items-center justify-center rounded-[8px] bg-[#243252] px-7 py-3 text-sm font-semibold text-white transition-all duration-180 hover:bg-[#1b2742] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(36,50,82,0.12)]"
>
  Book FREE Demo
</a>
```

### Outline Button

```html
<a
  href="..."
  class="inline-flex items-center justify-center rounded-[8px] border border-[#243252] bg-transparent px-7 py-3 text-sm font-semibold text-[#243252] transition-all duration-180 hover:bg-[#243252] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(36,50,82,0.12)]"
>
  Explore Programs
</a>
```

### CTA Banner Button (on navy bg)

```html
<a
  href="..."
  class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c8a44d] px-7 py-3 text-sm font-medium text-white shadow transition-all hover:bg-[#b89237] hover:-translate-y-0.5 hover:shadow-lg"
>
  Book a Demo
</a>
```

### "Contact Us" Button (in navbar)

```html
<a
  href="/contact"
  class="rounded-full bg-[#243252] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1b2742]"
>
  Contact Us
</a>
```

---

## 3. Card Patterns

### Default Card

```html
<div
  class="rounded-[14px] border border-[#e6e2da] bg-white shadow-[0_8px_30px_rgba(36,50,82,0.08)]"
>
  <!-- content -->
</div>
```

### Hover Card (with lift)

```html
<div
  class="rounded-[14px] border border-[#e6e2da] bg-white shadow-[0_8px_30px_rgba(36,50,82,0.08)] transition-all duration-180 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(36,50,82,0.12)]"
>
  <!-- content -->
</div>
```

### Clickable Card (Link wrapper)

```html
<a
  href="..."
  class="group block rounded-[14px] border border-[#e6e2da] bg-white shadow-[0_8px_30px_rgba(36,50,82,0.08)] transition-all duration-180 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(36,50,82,0.12)]"
>
  <!-- Card content -->
</a>
```

### Card with Image + Content

```html
<div
  class="rounded-[14px] border border-[#e6e2da] bg-white shadow-[0_8px_30px_rgba(36,50,82,0.08)] transition-all duration-180 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(36,50,82,0.12)]"
>
  <!-- Image -->
  <div class="aspect-[4/3] overflow-hidden rounded-t-[14px] bg-[#e8e4dc]">
    <img
      src="..."
      alt="..."
      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  </div>
  <!-- Content -->
  <div class="p-5">
    <h3 class="font-heading text-lg font-medium text-[#243252]">Title</h3>
    <p class="mt-1 text-sm text-[#5b6472]">Description</p>
  </div>
</div>
```

### Small Stat Card

```html
<div
  class="rounded-[14px] border border-[#e6e2da] bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(36,50,82,0.08)]"
>
  <div class="flex items-center gap-4">
    <div
      class="w-11 h-11 rounded-full bg-[#fcfbf8] flex items-center justify-center text-[#c8a44d]"
    >
      <Icon />
    </div>
    <div>
      <div class="font-display text-2xl sm:text-3xl font-bold text-[#243252]">125+</div>
      <div class="text-xs sm:text-sm text-[#5b6472]">Google Reviews</div>
    </div>
  </div>
</div>
```

### Coming Soon Feature Card

```html
<div
  class="rounded-[14px] border border-[#e6e2da] bg-white p-4 text-center shadow-[0_8px_30px_rgba(36,50,82,0.08)] transition-all duration-180 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(36,50,82,0.12)] sm:p-6"
>
  <span
    class="mb-2.5 inline-block rounded-full bg-[#c8a44d] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white sm:mb-3 sm:px-3 sm:py-1 sm:text-xs"
  >
    Coming Soon
  </span>
  <h4 class="font-heading text-sm font-medium text-[#243252] sm:text-base">Feature Title</h4>
  <p class="mt-1.5 text-xs leading-relaxed text-[#5b6472] sm:text-sm">Feature description</p>
</div>
```

---

## 4. Navbar Pattern

### Desktop Pill Navbar (centered)

```html
<nav
  class="fixed left-1/2 top-5 z-50 flex h-[72px] w-[95%] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full border border-[#e6e2da] bg-white/90 px-6 lg:px-8 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.08)]"
>
  <!-- Logo (left) -->
  <a href="/" class="flex shrink-0 items-center">
    <div class="relative h-[46px] w-[46px]">
      <img src="/images/logo.jpg" alt="Logo" class="object-contain rounded-full" />
    </div>
  </a>

  <!-- Links (center) -->
  <ul class="hidden items-center gap-8 lg:flex">
    <li>
      <a
        href="/"
        class="text-[15px] font-medium text-[#5b6472] transition-colors duration-200 hover:text-[#243252]"
        >Home</a
      >
    </li>
    <li>
      <a
        href="/about"
        class="text-[15px] font-medium text-[#5b6472] transition-colors duration-200 hover:text-[#243252]"
        >About</a
      >
    </li>
    <!-- ... more links -->
  </ul>

  <!-- Right side -->
  <div class="flex items-center gap-4">
    <!-- Announcements Bell -->
    <!-- Contact button -->
    <a
      href="/contact"
      class="hidden rounded-full bg-[#243252] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1b2742] lg:inline-flex"
      >Contact Us</a
    >
    <!-- Hamburger (mobile) -->
    <button
      aria-label="Toggle navigation"
      class="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full lg:hidden"
    >
      <span class="h-0.5 w-6 rounded-full bg-[#243252] transition-all duration-300"></span>
      <span class="h-0.5 w-6 rounded-full bg-[#243252] transition-all duration-300"></span>
      <span class="h-0.5 w-6 rounded-full bg-[#243252] transition-all duration-300"></span>
    </button>
  </div>
</nav>
```

### More Dropdown (hover)

```html
<li class="relative" onMouseEnter="{()" ="">
  setOpen(true)} onMouseLeave={() => setOpen(false)} >
  <button
    class="flex items-center gap-1 text-[15px] font-medium text-[#5b6472] transition-colors duration-200 hover:text-[#243252]"
  >
    More
    <ChevronDown size="{16}" class="transition-transform duration-200" />
  </button>
  <div
    class="absolute left-1/2 top-12 w-56 -translate-x-1/2 rounded-2xl border border-[#e6e2da] bg-white p-2 shadow-xl transition-all duration-200"
  >
    <a
      href="/faq"
      class="block rounded-xl px-4 py-3 text-sm font-medium text-[#5b6472] transition-all duration-150 hover:bg-[#f7f5f1] hover:text-[#243252]"
      >FAQ</a
    >
    <!-- ... more links -->
  </div>
</li>
```

### Mobile Nav (slide-in overlay)

```html
<div
  class="fixed top-0 right-0 z-99 h-screen w-full bg-white transition-transform duration-300 ease-in-out flex flex-col items-center pt-20"
>
  <!-- Close button -->
  <button
    aria-label="Close navigation"
    class="absolute top-5 right-6 cursor-pointer bg-transparent border-none text-[#243252]"
  >
    <X class="h-6 w-6" />
  </button>
  <!-- Logo -->
  <div class="relative h-[48px] w-[48px]">
    <img src="/images/logo.jpg" alt="Logo" class="object-contain" />
  </div>
  <!-- Links -->
  <div class="flex flex-col gap-6 overflow-y-auto max-h-[60vh] pb-8">
    <a
      href="/"
      class="text-xl font-medium text-black no-underline transition-all duration-200 hover:text-[#243252] hover:translate-x-2"
      >Home</a
    >
    <a
      href="/about"
      class="text-xl font-medium text-black no-underline transition-all duration-200 hover:text-[#243252] hover:translate-x-2"
      >About</a
    >
    <!-- ... -->
  </div>
</div>
```

---

## 5. Footer Pattern

### 4-Column Footer

```html
<footer class="bg-[#243252] px-4 sm:px-6 py-8 md:py-14 text-[rgba(255,255,255,0.8)]">
  <div class="mx-auto grid max-w-6xl grid-cols-2 gap-6 lg:grid-cols-4">
    <!-- Column 1: Brand -->
    <div>
      <div class="relative mb-4 h-[45px] w-[48px]">
        <img src="/images/logo.jpg" alt="Logo" class="object-contain brightness-0 invert" />
      </div>
      <p class="text-sm leading-relaxed">Company description...</p>
      <div class="mt-4 flex gap-3">
        <!-- Social icon SVGs -->
      </div>
    </div>
    <!-- Column 2: Quick Links -->
    <div>
      <h4 class="mb-4 text-base text-white font-display font-semibold">Quick Links</h4>
      <ul class="flex list-none flex-col gap-2 text-sm">
        <li>
          <a
            href="/"
            class="text-sm text-white/70 no-underline transition-colors duration-180 hover:text-white"
            >Home</a
          >
        </li>
        <li>
          <a
            href="/about"
            class="text-sm text-white/70 no-underline transition-colors duration-180 hover:text-white"
            >About</a
          >
        </li>
      </ul>
    </div>
    <!-- Column 3: More Links -->
    <!-- Column 4: Contact -->
  </div>
  <!-- Map -->
  <div
    class="mx-auto mt-8 flex h-[200px] max-w-6xl items-center justify-center overflow-hidden rounded-[14px] bg-white/10"
  >
    <iframe
      src="https://www.google.com/maps/embed?..."
      width="100%"
      height="100%"
      style="border:0"
      allowfullscreen=""
      loading="lazy"
    />
  </div>
  <!-- Copyright -->
  <div
    class="mx-auto mt-8 max-w-6xl border-t border-white/15 pt-6 text-center text-sm text-white/70"
  >
    © 2026 Company Name. All rights reserved.
  </div>
</footer>
```

### Social Icon SVGs

```html
<!-- Facebook -->
<svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
  <path
    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
  />
</svg>

<!-- Instagram -->
<svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
  <path
    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
  />
</svg>

<!-- YouTube -->
<svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
  <path
    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
  />
</svg>

<!-- LinkedIn -->
<svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
  <path
    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
  />
</svg>

<!-- X / Twitter -->
<svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
  <path
    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
  />
</svg>
```

---

## 6. Animations

Add to `globals.css`:

```css
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes waFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Testimonials Marquee

```html
<div class="relative overflow-hidden rounded-[30px] border border-[#e6e2da] bg-white py-6">
  <div
    class="flex w-max gap-4 animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused]"
  >
    <!-- Duplicate items for seamless loop -->
    {items.map((item, i) => (
    <div key="{i}" class="w-[320px] shrink-0 rounded-[14px] border border-[#e6e2da] p-5 bg-white">
      <div class="flex items-center gap-1 text-[#c8a44d] mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
        <svg key="{i}" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
        ))}
      </div>
      <p class="text-sm leading-relaxed text-[#5b6472]">"{item.content}"</p>
      <div class="mt-4 pt-4 border-t border-[#e6e2da]">
        <div class="font-semibold text-[#243252]">{item.name}</div>
        <div class="text-xs text-[#8a909c]">{item.position}</div>
      </div>
    </div>
    ))}
  </div>
</div>
```

### WhatsApp Float

```html
<a
  href="https://wa.me/917259941873"
  target="_blank"
  rel="noopener noreferrer"
  class="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-transform duration-180 hover:scale-105"
  style="animation:waFloat 2.5s ease-in-out infinite"
  aria-label="Chat on WhatsApp"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    class="lucide lucide-message-circle h-7 w-7"
  >
    <path
      d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
    />
  </svg>
</a>
```

---

## 7. BrandFloat (Right Side Social Strip)

```html
<div
  class="fixed right-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-2.5 md:flex"
>
  <!-- Logo -->
  <a href="/"
    ><div class="relative h-8 w-8">
      <img src="/images/logo.jpg" alt="Logo" class="object-contain rounded-full" /></div
  ></a>
  <!-- Social icons (same SVGs as footer, smaller: h-7 w-7) -->
  <a
    href="#"
    class="flex h-7 w-7 items-center justify-center rounded-full text-[#8a909c] transition-all duration-180 hover:bg-[#c8a44d] hover:text-white"
  >
    <svg class="h-4 w-4">...</svg>
  </a>
  <!-- ... -->
</div>
```

---

## 8. Accordion (FAQ)

Using `@base-ui/react` (NOT Radix):

```tsx
import { Accordion } from "@base-ui/react/accordion";
```

```html
<Accordion.Root class="flex flex-col gap-3 max-w-[700px] mx-auto">
  {items.map((item, i) => (
  <Accordion.Item
    key="{i}"
    value="{`faq-${i}`}"
    class="rounded-[14px] border border-[#e6e2da] bg-white px-6 py-1 shadow-[0_8px_30px_rgba(36,50,82,0.08)]"
  >
    <Accordion.Header>
      <Accordion.Trigger
        class="flex flex-1 items-center justify-between py-3 text-sm font-medium text-[#243252]"
      >
        {item.question}
        <ChevronDown class="w-4 h-4 transition-transform group-aria-expanded:rotate-180" />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel class="text-sm leading-relaxed text-[#5b6472] pb-3">
      {item.answer}
    </Accordion.Panel>
  </Accordion.Item>
  ))}
</Accordion.Root>
```

---

## 9. Dialog (Modal Overlay)

Using `@base-ui/react`:

```tsx
import { Dialog } from "@base-ui/react/dialog";
```

```html
<Dialog.Root open="{!!selected}" onOpenChange="{(open)" ="">
  !open && setSelected(null)}> {selected && (
  <Dialog.Portal>
    <Dialog.Backdrop class="fixed inset-0 bg-black/40 z-40" />
    <Dialog.Popup
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-1.5rem)] max-w-md z-50 rounded-[30px] border border-[#e6e2da] bg-white p-6 shadow-[0_12px_40px_rgba(36,50,82,0.12)]"
    >
      <Dialog.Title class="font-display text-lg text-[#243252]">{selected.name}</Dialog.Title>
      <Dialog.Description class="text-sm text-[#c8a44d]">{selected.title}</Dialog.Description>
      <p class="mt-4 text-sm leading-relaxed text-[#5b6472]">{selected.content}</p>
      <Dialog.Close
        class="absolute top-4 right-4 text-[#8a909c] hover:text-[#243252] cursor-pointer"
      >
        <X class="h-5 w-5" />
      </Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
  )}
</Dialog.Root>
```

---

## 10. Section Hero with Background Image

```tsx
<section id="home" class="relative pt-[100px] pb-[60px] overflow-hidden">
  {/* Background Image */}
  {bgImage && (
    <div
      class="absolute inset-0 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    />
  )}
  {/* Gradient Overlay */}
  <div class="absolute inset-0 bg-gradient-to-r from-[#f6f5f1]/95 via-[#f6f5f1]/85 to-[#f6f5f1]/70" />
  {/* Content */}
  <div class="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
    <div class="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <h1 class="font-display text-4xl font-bold leading-tight text-[#243252] md:text-5xl lg:text-[3.5rem]">
          {title}
        </h1>
        <p class="mt-4 max-w-[540px] text-lg leading-relaxed text-[#5b6472]">{subtitle}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a
            href={cta_link}
            class="inline-flex items-center justify-center rounded-[8px] bg-[#243252] px-7 py-3 text-sm font-semibold text-white transition-all duration-180 hover:bg-[#1b2742] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(36,50,82,0.12)]"
          >
            {cta_text}
          </a>
        </div>
      </div>
      <div class="aspect-[4/5] overflow-hidden rounded-[30px] border border-[#e6e2da] bg-white shadow-[0_12px_40px_rgba(36,50,82,0.12)]">
        <img src={image} alt="Hero" class="h-full w-full object-cover" />
      </div>
    </div>
  </div>
</section>
```

---

## 11. Responsive Guidelines

- **`< 640px` (mobile)**: 1-col grids, padding 16px, section padding 48px, stat font 1.25rem, heading 1.75rem
- **`640-1024px` (tablet)**: 2-col grids
- **`> 1024px` (desktop)**: 3-4 col grids, desktop nav visible
- **Section padding**: 80px desktop → 48px mobile
- **Container padding**: 24px desktop → 16px mobile
- **Stat card icons**: 44px desktop → 36px mobile

```css
@media (max-width: 900px) {
  .hero h1 {
    font-size: 2.25rem;
  }
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .section {
    padding: 48px 0;
  }
  .container-custom {
    padding: 0 16px;
  }
  .hero h1 {
    font-size: 1.75rem;
  }
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .section-header h2 {
    font-size: 1.75rem;
  }
  .stat-value {
    font-size: 1.25rem;
  }
  .stat-icon {
    width: 36px;
    height: 36px;
  }
}
```

---

## Quick Reference: All Tailwind Classes Used

| Purpose          | Classes                                              |
| ---------------- | ---------------------------------------------------- |
| Primary bg       | `bg-[#243252]`                                       |
| Primary hover bg | `bg-[#1b2742]`                                       |
| Accent bg        | `bg-[#c8a44d]`                                       |
| Accent hover     | `bg-[#b89237]`                                       |
| Page bg          | `bg-[#f6f5f1]`                                       |
| Section bg       | `bg-[#fcfbf8]`                                       |
| Card bg          | `bg-white`                                           |
| Text primary     | `text-[#243252]`                                     |
| Text body        | `text-[#5b6472]`                                     |
| Text light       | `text-[#8a909c]`                                     |
| Border           | `border-[#e6e2da]`                                   |
| Radius default   | `rounded-[14px]`                                     |
| Radius large     | `rounded-[30px]`                                     |
| Shadow soft      | `shadow-[0_8px_30px_rgba(36,50,82,0.08)]`            |
| Shadow medium    | `shadow-[0_12px_40px_rgba(36,50,82,0.12)]`           |
| Font display     | `font-display` (Playfair Display)                    |
| Transition       | `transition-all duration-180`                        |
| Hover lift       | `hover:-translate-y-0.5`                             |
| Card image       | `aspect-[4/3]` (content) or `aspect-[4/5]` (faculty) |
