# PROPEL — שפת השרטוט הטכני

The site reads like an engineering document about the client's business:
annotated, measured, numbered. Not a theme pasted on top — a discipline for
how information is presented.

**Why this direction:** the brand promise is "we fix broken processes". An
engineering drawing is what that promise looks like on paper. It grows from
the identity that already exists (ink on paper, zero radius, Frank Ruhl /
Chakra Petch, the deep red) and it cannot be copied from a template, because
its raw material is the client's real flows and real numbers.

## The vocabulary — seven elements, and no eighth

Every visual idea on the site must be one of these. If a new element is
needed, it gets added here first, with its rules.

| # | Element | What it is | Where allowed |
|---|---------|-----------|---------------|
| 1 | **Clause numbers** | `01`, `02.1` — section and subsection numbering, printed at the rule line | Every section heading site-wide |
| 2 | **Leader lines** | A hairline from a label to the thing it names | Hero device callout; case-study screens |
| 3 | **Margin annotations** | Tiny mono labels in the gutter (route codes, real counts) | `lg+` only, hidden below |
| 4 | **Crop marks** | Corner registration marks on inverted/band sections | Section corners, max one pair per section |
| 5 | **Mono data labels** | Chakra Petch small-caps labels for every figure and field | Stat rows, spec tables, diagram nodes |
| 6 | **Flow diagrams** | The client's real process as numbered nodes with connectors | Case studies, the process section |
| 7 | **Spec tables** | Field/value tables replacing chip rows | Case-study stack block, migration outcomes |

## Hard rules

1. **Real data only.** A dimension line, annotation or diagram node carries a
   number or fact that is true and checkable — page counts, branch counts,
   real flow steps from the approved narrative. A made-up value on a
   measurement mark is worse than kitsch: it is a lie drawn as precision.
   Anything still unknown stays `PENDING` in the content file and never
   renders (enforced by `getProjects` + the postbuild check).
2. **Decoration is silent.** Crop marks, leader lines, connectors, clause
   ornaments: `aria-hidden="true"`, zero reading-order cost. A flow diagram
   is a real `<ol>` — the semantics ARE the content; only the connectors are
   decoration.
3. **Density budget.** Per viewport: at most one annotated element in the
   margin, one leader-line callout, one diagram. Below `md` the margin
   annotations disappear entirely — a phone screen has no margins to
   annotate.
4. **RTL first.** Connectors and leader lines use logical properties and
   `direction`-aware percentages only. Nothing is mirrored by hand.
5. **Motion obeys the site's contract.** Diagram connector "draw" happens
   once, under 700ms, honours `prefers-reduced-motion` and the site's own
   pause control. Nothing loops.
6. **The identity is untouched.** The red `#7A1C09`, the paper, zero radius,
   the font stacks, the device frames with real captures — the blueprint
   language is drawn *with* them, not instead of them.
7. **AA is a floor.** Annotation text ≥ 4.5:1 like any text (it is small, so
   it gets `--slate`, never `--line`). Hairlines that only decorate may be
   faint; anything that separates or identifies keeps 3:1.

## The tokens

| Token | Light | Dark | Used by |
|-------|-------|------|---------|
| `--draft-line` | `rgba(31,34,28,0.22)` | `rgba(241,239,234,0.24)` | leader lines, connectors, crop marks |
| `--draft-grid` | `rgba(31,34,28,0.05)` | `rgba(241,239,234,0.055)` | the band sections' hairline grid |

Both defined in `:root`, `[data-theme='dark']`, `.section--invert`, and
`[data-theme='dark'] .section--invert` — the invert scope flips every token
it uses, no exceptions (the `--success` omission was a shipped bug).

## The classes

- `.clause` — the section number at the rule line: `01 ·`
- `.draft-annotation` — margin label, mono, `lg+` only
- `.draft-callout` — label + leader line, one per viewport
- `.draft-marks` — corner registration marks (a positioned pair of pseudos)
- `.spec-table` — field/value table
- `.flow` / `.flow__node` / `.flow__connector` — the diagram
- `.blueprint-band` — `--band` background + the hairline grid

## What was deliberately rejected

- **Fake terminal/log motifs** — we are not a devtools brand, and it lies.
- **Coordinates/lat-long decorations** — precision cosplay, no true value.
- **A blueprint-blue palette** — the identity is ink on paper; blue is the
  most borrowed blueprint cliché and it would replace the brand, not sharpen
  it.
- **Annotating chrome (paddings, grid gaps)** — annotations describe the
  *client's business*, not our own CSS. Self-referential measurements are a
  gimmick with a two-week shelf life.
