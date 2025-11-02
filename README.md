This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Important Development Notes

### Responsive Design Approach

**⚠️ IMPORTANT: This project does NOT use Tailwind responsive prefixes (sm:, md:, lg:)**

Instead, this project uses **CSS media queries directly** in the `src/app/global.css` file for responsive design.

**When creating or modifying components:**
- Do NOT use Tailwind responsive prefixes like `sm:`, `md:`, `lg:`
- Use custom CSS classes and add responsive styles in `global.css` with `@media` queries
- Follow mobile-first approach: base styles for mobile, then override with `@media (min-width: XXXpx)` for larger screens

**Common breakpoints used in this project:**
- `@media (max-width: 576px)` - Mobile
- `@media (max-width: 768px)` - Tablet
- `@media (max-width: 991px)` - Small desktop
- `@media (min-width: 640px)` - Desktop (equivalent to Tailwind's `sm:`)
- `@media (min-width: 768px)` - Desktop
- `@media (min-width: 992px)` - Large desktop
- `@media (min-width: 1024px)` - Large desktop
- `@media (min-width: 1400px)` - Extra large desktop

**Example pattern:**
```css
/* Mobile-first base styles */
.my-component {
  width: 100%;
  font-size: 14px;
}

/* Desktop override */
@media (min-width: 640px) {
  .my-component {
    width: 320px;
    font-size: 16px;
  }
}
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
