# Rule-Based Random Blog Layout Engine  
**Internal Resolution Version (8×2 Grid System)**

---

## 1. Objective

Design a **rule-constrained random grid layout system** for a blog main page.

The layout must:

- Change on each visit (non-deterministic)
- Feel intentionally designed, not chaotic
- Prevent visual clustering or repetition bias
- Maintain rhythm, contrast, and breathing space
- Produce an “editorially composed” structure rather than a mechanical grid

All layout decisions must be computed via **pure TypeScript functions**.  
React (or any UI layer) acts only as a renderer.

---

## 2. Grid System

| Property | Value |
|----------|-------|
| **Visual Columns** | 4 |
| **Internal Columns** | **8** |
| Internal Row Unit | 1 |
| Layout Height | Dynamic (rows grow as needed) |

> The layout engine operates on an **8-column internal grid** for higher compositional resolution.  
> UI maps this to 4 visual columns (2 internal cells = 1 visual column).

---

## 3. Card Types (Internal Units)

| Type | Size (w × h) | Visual Role |
|------|--------------|-------------|
| `S`  | 2 × 2 | Small card |
| `MX` | 4 × 2 | Medium horizontal |
| `MY` | 2 × 4 | Medium vertical |
| `L`  | 4 × 4 | Large feature card |

---

## 4. Randomness Philosophy

Randomness is **constraint-driven**, not pure.

> The system generates layouts that are always different,  
> but never visually unstable.

---

## 5. Core Layout Rules (Critical)

### 5.1 Density & Breathing Space

- At least **10% of total internal cells must remain empty**
- Empty cells are **design elements**, not leftover artifacts
- Empty cells may form clusters up to **4 connected cells**

---

### 5.2 Large Card (`L`) Rules

1. Maximum **1 L per visual row block** (every 4 internal rows)
2. L cards **cannot be orthogonally adjacent** to another L
3. L cards must represent **10%–25%** of total cards
4. L cards cannot align in the same column more than twice consecutively

---

### 5.3 Medium Cards (`MX`, `MY`) Rules

1. MX and MY **cannot touch orthogonally**
2. Same-type medium cards cannot form chains longer than 2
3. In any 4-row band:
   - Maximum **2 MX**
   - Maximum **2 MY**
4. Medium cards together must be **30%–50%** of total cards

---

### 5.4 Small Cards (`S`) Rules

- Fill structural gaps
- Must represent **≥ 30%** of cards
- Avoid forming perfect rectangular blocks larger than 2×2

---

### 5.5 Empty Space Rules

1. Every **6 internal rows** must contain at least one empty cell
2. Empty cells cannot occupy more than 40% of any single column
3. Empty clusters preferred near transitions between large and small cards

---

### 5.6 Anti-Mechanical Rules

These patterns are **forbidden**:

- Perfect bilateral symmetry
- Identical row patterns repeating
- All L cards aligned to same edge
- Full-width medium rows forming stripes

---

### 5.7 Adjacency Definition

“Adjacent” means:

- Up
- Down
- Left
- Right

Diagonal does not count.

---

## 6. Placement Strategy

### Step 1 — Assign Card Types

```ts
function getCardType(post): 'S' | 'MX' | 'MY' | 'L'

```

Based on:
-	Content length
-	Weighting rules
-	Global proportion constraints

⸻

### Step 2 — Placement Order

L → MX/MY → S → Empty

Larger cards placed first to reduce collision deadlocks.

⸻

### Step 3 — Position Search

For each card:
	1.	Scan grid from top-left
	2.	Collect all valid candidate positions
	3.	Randomly select from valid positions

⸻

### Step 4 — Constraint Checks

A candidate placement must pass:
	•	Grid bounds
	•	No overlap
	•	Adjacency rules
	•	Row/column limits
	•	Global proportion viability

⸻

### Step 5 — Failure Handling

If placement fails:
	•	Try alternate positions
	•	Skip card if necessary
	•	Optionally restart layout if density constraints fail

⸻

## 7. Output Structure

```ts
type Placement = {
  postId: string
  row: number
  col: number
  w: number
  h: number
}

type LayoutResult = {
  cols: 8
  placements: Placement[]
}

UI layer maps:

visualCol = internalCol / 2
```

⸻

## 8. Validation Criteria

A generated layout is valid only if:
	•	No large cards touching
	•	Medium chains not formed
	•	Breathing space present
	•	No visual edge bias
	•	Layout differs across executions

⸻

## 9. Non-Responsibilities

This module does NOT handle:
	•	Styling
	•	Color systems
	•	Animations
	•	Responsive breakpoints

Only spatial computation.

⸻

## 10. System Philosophy

This is not a random grid.
It is a constraint-shaped ecosystem of content blocks.

Goal:

Each visit feels like a new editorial composition.
