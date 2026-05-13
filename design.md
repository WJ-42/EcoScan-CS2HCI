# EcoScan - Sustainability Shopping Assistant Design

## App Overview

A mobile-first shopping companion that helps supermarket shoppers make environmentally sustainable product choices. The app prioritises speed, clarity, and at-a-glance information because shoppers are time-pressured.

## Color Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| primary | #1B9E5A | #34D87A | Fresh green — sustainability brand accent |
| background | #FFFFFF | #111214 | Clean white / dark base |
| surface | #F4F7F5 | #1A1D1F | Subtle green-tinted card surfaces |
| foreground | #1A1A1A | #F0F0F0 | Primary text |
| muted | #6B7280 | #9CA3AF | Secondary text |
| border | #E2E8F0 | #2D3748 | Dividers and card borders |
| success | #16A34A | #4ADE80 | Excellent sustainability (A rating) |
| warning | #EAB308 | #FACC15 | Moderate sustainability (C rating) |
| error | #DC2626 | #F87171 | Poor sustainability (E rating) |

## Screen List

### Tab Screens
1. **Home** — Quick-access dashboard with recent scans, featured tips, and scan CTA
2. **Scan** — Camera-based barcode scanner with overlay guide
3. **History** — List of previously scanned products with sustainability scores
4. **Profile** — User preferences, saved favorites, and app settings

### Stack Screens (pushed from tabs)
5. **Product Detail** — Full sustainability breakdown for a scanned product
6. **Alternatives** — List of greener alternative products
7. **Reviews** — Customer sustainability reviews for a product
8. **Write Review** — Form to submit a sustainability review

## Primary Content and Functionality

### Home Screen
- Large "Scan a Product" CTA button (center, prominent)
- "Recently Scanned" horizontal scroll of product cards (image, name, score badge)
- "Eco Tips" section with rotating sustainability tips
- Quick stats: "Products scanned this week", "Eco choices made"

### Scan Screen
- Full-screen camera view with barcode scanning overlay
- Translucent scan guide rectangle in center
- Torch toggle button
- "Enter barcode manually" text input fallback
- On successful scan → navigate to Product Detail

### Product Detail Screen
- Product image, name, brand, and price at top
- Large circular sustainability score (A-E letter grade with color)
- Expandable "What this score means" section explaining the A–E rating
- Three impact cards in a row:
  - Carbon Footprint (kg CO2e)
  - Packaging Impact (recyclability %)
  - Sourcing (local/imported indicator)
- "Greener Alternative" card with one-tap navigation
- "Community Reviews" summary (average stars, review count) with tap to expand
- "Leave a Review" button

### Alternatives Screen
- Header showing "Alternatives for [Product Name]"
- List of alternative products, each showing:
  - Product image, name, brand, and price
  - Sustainability score badge (A-E)
  - Key improvement reason (e.g., "30% less CO2")

### Reviews Screen
- Product name header
- Average sustainability rating (1-5 stars)
- Filter chips: All, Most Recent, Highest Rated
- List of reviews: user avatar, name, date, star rating, text comment
- Floating "Write Review" button

### Write Review Screen
- Star rating selector (1-5 tappable stars)
- Text input for review comment
- Category tags: Packaging, Sourcing, Carbon, Overall
- Submit button

### History Screen
- Search bar at top
- FlatList of previously scanned products
- Each item: product image, name, price, sustainability score, scan date
- Swipe to add to favorites
- Filter: All / Favorites

### Profile Screen
- User avatar and display name
- Stats: total scans, eco choices, reviews written
- Preferences: dietary filters, preferred certifications
- High contrast mode toggle
- Dark mode toggle
- About / Help links

## Key User Flows

### Flow 1: Scan and Discover
1. User opens app → Home screen
2. Taps "Scan a Product" button → Scan screen
3. Points camera at barcode → barcode detected
4. Auto-navigates to Product Detail screen
5. Views sustainability score and impact breakdown
6. Taps "Greener Alternative" → Alternatives screen
7. Selects alternative → views its Product Detail

### Flow 2: Leave a Review
1. From Product Detail screen
2. Taps "Leave a Review" button
3. Navigates to Write Review screen
4. Selects star rating, writes comment
5. Taps Submit → navigates to Reviews screen; review appears in list with success message

### Flow 3: Browse History
1. User taps History tab
2. Scrolls through previously scanned products
3. Taps a product → Product Detail screen
4. Can filter by favorites

## UI Components

### Sustainability Score Badge
- Circular badge with letter grade (A, B, C, D, E)
- Color-coded: A=green, B=light-green, C=yellow, D=orange, E=red
- Used consistently across all product cards and detail screens

### Impact Card
- Small card with icon, label, and value
- Three in a row on Product Detail
- Icons: leaf (carbon), recycle (packaging), globe (sourcing)

### Product Card
- Horizontal card with product image thumbnail, name, brand, price, and score badge
- Used in Home recent scans, History list, and Alternatives list

### Star Rating
- 5 tappable/display stars
- Used in reviews display and write review form

## Navigation Structure

```
Tab Navigator
├── Home (index)
├── Scan (scan)
├── History (history)
└── Profile (profile)

Stack Navigator (from any tab)
├── Product Detail (products/[id])
├── Alternatives (products/[id]/alternatives)
├── Reviews (products/[id]/reviews)
└── Write Review (products/[id]/write-review)
```

## Accessibility Considerations
- All scores have text labels (not color-only)
- Touch targets minimum 44x44pt
- High contrast mode toggle in Profile Settings (stronger text/background contrast)
- High contrast text on all backgrounds
- Screen reader labels on all interactive elements
- Haptic feedback on scan success and review submit
