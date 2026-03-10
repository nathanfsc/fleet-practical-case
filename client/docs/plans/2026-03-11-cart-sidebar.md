# Cart Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal cart sidebar backed only by `localStorage`, plus an `Add to cart` button in `CatalogTab`.

**Architecture:** Keep the cart state in `App` so the sidebar and `CatalogTab` share one source of truth. Read from `localStorage` on startup, persist on cart updates, and pass a single `onAddToCart` callback down to `CatalogTab`.

**Tech Stack:** React, React Testing Library, browser `localStorage`

---

### Task 1: Define the cart state flow

**Files:**
- Modify: `src/app/App.js`
- Modify: `src/app/App.css`

**Step 1: Write the failing integration expectation**

Add an app-level test case proving that persisted cart items render in a sidebar when the catalog tab is opened.

**Step 2: Run test to verify it fails**

Run: `CI=true npm test -- --runInBand --runTestsByPath src/app/__tests__/App.test.js`
Expected: FAIL because the cart sidebar does not exist.

**Step 3: Write minimal implementation**

Load cart items from `localStorage` in `App`, render a simple sidebar listing item names, and persist updates back to `localStorage`.

**Step 4: Run test to verify it passes**

Run: `CI=true npm test -- --runInBand --runTestsByPath src/app/__tests__/App.test.js`
Expected: PASS

### Task 2: Add catalog cart action

**Files:**
- Modify: `src/features/catalog/components/CatalogTab.js`
- Create: `src/features/catalog/components/__tests__/CatalogTab.test.js`

**Step 1: Write the failing test**

Add a `CatalogTab` test that loads products, clicks `Add to cart`, and verifies the callback receives the clicked product.

**Step 2: Run test to verify it fails**

Run: `CI=true npm test -- --runInBand --runTestsByPath src/features/catalog/components/__tests__/CatalogTab.test.js`
Expected: FAIL because there is no button or callback wiring.

**Step 3: Write minimal implementation**

Add an `Actions` column with an `Add to cart` button per product row that calls `onAddToCart(product)`.

**Step 4: Run test to verify it passes**

Run: `CI=true npm test -- --runInBand --runTestsByPath src/features/catalog/components/__tests__/CatalogTab.test.js`
Expected: PASS

### Task 3: Verify the final behavior

**Files:**
- Modify: `src/app/__tests__/App.test.js`

**Step 1: Run focused verification**

Run: `CI=true npm test -- --runInBand --runTestsByPath src/app/__tests__/App.test.js src/features/catalog/components/__tests__/CatalogTab.test.js`
Expected: PASS

**Step 2: Run broader safety check**

Run: `CI=true npm test -- --runInBand --watch=false`
Expected: PASS if the existing suite is unaffected
