# Enhancement Specification: Detailed Editorial Design and Interaction Refinements

**Companion document:** `design.md`  
**Purpose:** Provide precise implementation requirements for the visual refinements and interactive behaviors derived from the supplied reference HTML and CSS.

This document extends `design.md`. It does not replace it.

Read both documents before modifying the codebase:

- `design.md` establishes the overall editorial direction, content hierarchy, page layouts, and implementation constraints.
- `CREATIVE_MODE.md` specifies the detailed design tokens, component geometry, interaction states, animation behavior, responsive rules, and visual refinements.

The implementation is an adaptation of the reference design to the existing portfolio. It is not a rebuild, template replacement, or content-copying exercise.

---

# 1. Scope and implementation priorities

## 1.1 Overall objective

Refine the existing portfolio into a restrained editorial website with a consistent visual system.

The final result should feel like a carefully typeset personal publication rather than a generic developer portfolio, SaaS landing page, dashboard, or collection of cards.

The implementation must preserve:

- Existing framework and build system.
- Existing routes and page structure.
- Existing content and personal identity.
- Existing project data and data sources.
- Existing working interactions.
- Existing theme and localization behavior, where supported.
- Existing accessibility semantics.

Reuse existing components whenever practical. Modify the visual presentation before considering structural changes.

## 1.2 Features covered by this addendum

Apply the following requirements when the corresponding feature already exists or is explicitly part of the current portfolio:

1. Golden proportion typography, spacing, and radius system.
2. Exact portfolio container sizing and section rhythm.
3. Typography refinement by semantic role.
4. Light/dark portrait image crossfade.
5. Creative mode switch and its annotation system.
6. Desktop margin notes and curved annotation arrows.
7. Mobile and tablet annotation layout.
8. Column measurement marks and Creative-mode-only section dividers.
9. Work-item emphasis while Creative mode is active.
10. Horizontal publication shelf and compact book detail dialog.
11. Masthead, section heading, work-list, and contact refinements.
12. Responsive behavior, reduced motion, keyboard accessibility, and print behavior.

Do not add a feature solely because it appears in the reference.

For example, if the current portfolio has no publication shelf, do not invent one. If the current portfolio does not have separate portrait assets for light and dark themes, do not create artificial image variants just to reproduce the crossfade.

## 1.3 Feature priority

When implementation time or existing architecture imposes constraints, prioritize in this order:

**Priority 1: Core visual system**

- Fonts.
- Typography hierarchy.
- Portfolio width.
- Spacing tokens.
- Theme colors.
- Section rhythm.
- Responsive layout.

**Priority 2: Existing component refinement**

- Masthead.
- Intro and portrait.
- Experience and work lists.
- Projects.
- Contact.
- Publications, if present.

**Priority 3: Creative mode**

- Switch.
- Margin notes.
- Annotation arrows.
- Column measurement marks.
- Section dividers.
- Work-item outlines.

**Priority 4: Detail refinement**

- Book dialog surface.
- Small tooltips.
- Optical text alignment.
- Fine animation timing.
- Print-specific cleanup.

Do not sacrifice the core layout, readability, or accessibility to implement decorative details.

## 1.4 Precedence and conflict resolution

Apply the following precedence rules:

1. Preserve the existing application's functionality and content.
2. Use `design.md` for the overall editorial design direction.
3. Use this document for the more specific values and behaviors defined below.
4. Use the selected reference configuration as the visual target:
   - Theme: dark.
   - Heading font: Bricolage Grotesque.
   - Body/interface font: Figtree.
   - Proportion: Golden.
   - Spacing: Balanced.
   - Creative mode: optional and initially off.
5. Do not implement the reference's Style customizer unless the existing product already has one.
6. Creative mode is independent of the Style customizer.
7. Where the supplied CSS has repeated or conflicting declarations, follow the final intended behavior described here rather than reproducing every historical CSS override.

The reference CSS includes some values that are explicitly defined and others that depend on variables declared elsewhere. Do not invent missing values. Reuse the existing application's semantic tokens where the source does not provide an exact value.

---

# 2. Reference configuration and design foundations

## 2.1 Selected reference configuration

The supplied reference declares the following root configuration:

```html
<html
  lang="en"
  data-theme="dark"
  data-proportion="golden"
  data-heading-font="bricolage"
  data-body-font="figtree"
  data-spacing="balanced"
  data-creative-mode="on"
></html>
```

Treat these attributes as evidence of the selected visual configuration, not as a requirement to reproduce the reference's entire customizer system.

The target configuration for this redesign is:

| Setting       | Target                           |
| ------------- | -------------------------------- |
| Primary theme | Dark                             |
| Heading font  | Bricolage Grotesque              |
| Body font     | Figtree                          |
| Proportion    | Golden                           |
| Spacing       | Balanced                         |
| Creative mode | Available, initially off         |
| Main layout   | Narrow centered editorial column |

If the existing site supports light mode, preserve it as an alternate theme. The dark theme remains the primary design target.

## 2.2 Do not implement unrelated reference features

The reference may contain additional functionality such as:

- Live local clock.
- Language selector.
- Style customizer.
- Font selector.
- Proportion selector.
- Spacing selector.
- Motion selector.
- Cursor tracking.
- Gaze-responsive portrait.
- Save/reset customization controls.

These are not automatically in scope.

Preserve them only if they already exist in the current portfolio or are separately required. Do not create new settings merely to imitate the reference's DOM structure.

## 2.3 Design character

The visual result must maintain these qualities:

- Editorial rather than promotional.
- Compact rather than oversized.
- Typography-led rather than card-led.
- Monochromatic with restrained accent use.
- Narrow reading measure.
- Consistent left alignment.
- Thin separators rather than heavy containers.
- Subtle interactions rather than elaborate animations.

Avoid:

- Large gradient backgrounds.
- Glassmorphism.
- Excessive rounded cards.
- Large floating decorative elements.
- Oversized project cards.
- Skill progress bars.
- Animated counters.
- Unnecessary section backgrounds.
- Excessive shadows.
- Generic SaaS-style hero layouts.

---

# 3. Page shell and content geometry

## 3.1 Main portfolio width

The selected Golden configuration uses:

```css
:root[data-proportion="golden"] .folio {
  max-width: 37.5rem;
}
```

At a default 16px root size, this equals 600px.

Requirements:

- Use `rem`, not a fixed pixel value.
- Center the portfolio container.
- Preserve the existing page-level horizontal padding.
- Keep text measures comfortable for reading.
- Do not expand the main content to fill the viewport on wide screens.
- Do not wrap the entire portfolio in a visible card or bordered surface.

The main portfolio container and long-form article container are separate layout concepts.

`design.md` specifies an article width of approximately 648px. Preserve that article-specific measure where long-form pages exist. Do not change the portfolio width to 648px just to make the values match.

## 3.2 Horizontal page padding

Use the existing responsive page padding where possible.

Recommended behavior:

| Viewport           |                                                               Horizontal padding |
| ------------------ | -------------------------------------------------------------------------------: |
| Wide desktop       |                                                             Existing page gutter |
| Tablet             |                                                                             24px |
| Mobile             |                                                                          20–24px |
| Very narrow mobile | Do not reduce below what is needed to prevent content touching the viewport edge |

The main portfolio column should remain centered without creating horizontal overflow.

## 3.3 Bottom spacing

The supplied enhancement defines:

```css
.folio {
  padding-bottom: 100px;
}
```

Apply approximately 100px of bottom padding to the portfolio shell.

This is page-level breathing room after the final content. It is not a section spacing value and must not be repeated on every section.

In print, remove this extra padding.

## 3.4 Section spacing

The supplied CSS uses a shared `--section-gap` variable:

```css
#main > .section {
  position: relative;
  margin-top: var(--section-gap);
}
```

The source excerpt references this variable but does not define its original value.

For the selected Golden configuration, map the section gap to:

```css
:root[data-proportion="golden"] {
  --section-gap: var(--gold-space-6);
}
```

This gives approximately 44.36px at a 16px root size.

Requirements:

- Use one shared section-gap token.
- Do not assign unrelated top margins to individual sections.
- Keep section headings close to their content.
- Do not confuse the section gap with the gap between a heading and its first paragraph.
- Do not use the gap token to position margin notes.
- Preserve any existing structural spacing needed by the application.

## 3.5 Section divider behavior

When Creative mode is active, the reference displays subtle section dividers at the midpoint of the section gap.

The divider is positioned absolutely and must not occupy layout space:

```css
.notes-open #main > .section::before,
.notes-open #main .colophon::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  top: calc(var(--section-gap) / -2);
  background: var(--line);
  pointer-events: none;
}
```

Requirements:

- Visible only when Creative mode is active.
- Use the existing `--line` token.
- Height: 1px.
- Position: midpoint of the section gap.
- Do not create additional markup solely for these separators.
- Do not let the pseudo-element change section dimensions.
- Do not add separators between every work item.

The divider should be visually subtle and should not compete with the content.

---

# 4. Golden proportion system

## 4.1 Selected proportion

The supplied reference uses:

```html
data-proportion="golden"
```

Implement this as the selected design scale.

The ratio is:

\[
\varphi = 1.618034
\]

The reference uses a spacing sequence based on 4px and powers of φ. Typography uses the corresponding intermediate values.

Do not implement a visual proportion selector unless one already exists in the application. The Golden configuration should simply be the active design system.

## 4.2 Required spacing tokens

Define the following values centrally:

```css
:root[data-proportion="golden"] {
  --phi: 1.618034;

  --gold-space-1: 0.25rem;
  --gold-space-2: 0.4045rem;
  --gold-space-3: 0.6545rem;
  --gold-space-4: 1.059rem;
  --gold-space-5: 1.7135rem;
  --gold-space-6: 2.7725rem;
  --gold-space-7: 4.486rem;
}
```

Reference values at a 16px root size:

| Token            |       Rem | Approximate pixels | Intended usage                        |
| ---------------- | --------: | -----------------: | ------------------------------------- |
| `--gold-space-1` |   0.25rem |                4px | Fine gaps, borders, tiny offsets      |
| `--gold-space-2` | 0.4045rem |             6.47px | Compact controls and internal spacing |
| `--gold-space-3` | 0.6545rem |            10.47px | Small component gaps                  |
| `--gold-space-4` |  1.059rem |            16.94px | Paragraph/control separation          |
| `--gold-space-5` | 1.7135rem |            27.42px | Work/list item spacing                |
| `--gold-space-6` | 2.7725rem |            44.36px | Section spacing                       |
| `--gold-space-7` |  4.486rem |            71.78px | Large page-level separation           |

Requirements:

- Reuse these tokens instead of retyping equivalent values.
- Preserve `rem` units so text zoom and user preferences remain effective.
- Use smaller exceptions only where geometry requires it, such as 1px borders or 44px touch targets.
- Do not force every margin and padding value into the scale if doing so makes a component harder to use.

## 4.3 Required typography tokens

```css
:root[data-proportion="golden"] {
  --gold-type-small: 0.7862rem;
  --gold-type-body: 1rem;
  --gold-type-subtitle: 1.618rem;
  --gold-type-title: 2.618rem;
}
```

Reference values:

| Token                  |       Rem | Approximate pixels |
| ---------------------- | --------: | -----------------: |
| `--gold-type-small`    | 0.7862rem |            12.58px |
| `--gold-type-body`     |      1rem |               16px |
| `--gold-type-subtitle` |  1.618rem |            25.89px |
| `--gold-type-title`    |  2.618rem |            41.89px |

Use these as the foundation of the selected type scale. Individual components may require smaller sizes for metadata, cover labels, or compact controls.

## 4.4 Required radius tokens

```css
:root[data-proportion="golden"] {
  --gold-radius-control: var(--gold-space-2);
  --gold-radius-surface: var(--gold-space-3);
  --gold-radius-dialog: var(--gold-space-4);
}
```

Apply them as follows:

| Token                   | Intended usage                          |
| ----------------------- | --------------------------------------- |
| `--gold-radius-control` | Compact controls and menus              |
| `--gold-radius-surface` | Small preview surfaces and work artwork |
| `--gold-radius-dialog`  | Dialog surface                          |

The portrait remains circular.

Book-cover artwork should retain its designed cover geometry. Do not round the printed-cover silhouette merely because the surrounding preview frame uses a radius.

## 4.5 Component mapping

Apply these Golden values:

| Component                      | Required styling                   |
| ------------------------------ | ---------------------------------- |
| `.folio`                       | `max-width: 37.5rem`               |
| `h1`                           | `clamp(2.058rem, 5vw, 2.618rem)`   |
| `h1` line-height               | `1.15`                             |
| `h1` letter spacing            | `-0.045em`                         |
| `.role`                        | `clamp(1.272rem, 3.4vw, 1.618rem)` |
| `.role` line-height            | `1.272`                            |
| `.role` letter spacing         | `-0.03em`                          |
| `h2`                           | `1.272rem`                         |
| `h2` line-height               | `1.272`                            |
| Intro/about/contact paragraphs | `1rem`, line-height `1.618`        |
| `.text-stack > p`              | line-height `1.618`                |
| `.work-title`                  | `1rem`                             |
| `.work-description`            | `0.875rem`, line-height `1.618`    |
| `.publication-title`           | `0.875rem`, line-height `1.618`    |
| Section aside and metadata     | `0.7862rem`                        |
| Work preview radius            | `--gold-radius-surface`            |
| Book dialog radius             | `--gold-radius-dialog`             |

Do not create a second conflicting set of values elsewhere in the stylesheet.

---

# 5. Typography system

## 5.1 Default font pairing

Use:

- **Bricolage Grotesque** for headings and display text.
- **Figtree** for body copy and interface text.

Load both fonts once at the document level.

Use:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
  rel="stylesheet"
/>
```

Define tokens:

```css
:root {
  --font-heading: "Bricolage Grotesque", sans-serif;
  --font-body: "Figtree", sans-serif;
}
```

Apply:

```css
body {
  font-family: var(--font-body);
}

#main :is(h1, h2, h3, h4, h5, h6) {
  font-family: var(--font-heading);
}
```

Requirements:

- Load the font stylesheet once.
- Do not use CSS `@import` for the primary Google Fonts request.
- Do not allow Roboto or Inter declarations to override the selected fonts.
- Keep sensible system fallbacks.
- Do not load font files inside individual components.
- Do not use the handwritten annotation font for normal body content.

The reference CSS uses Inter in a tooltip declaration, but the selected pairing is Bricolage Grotesque and Figtree. Use Figtree for the tooltip unless an existing, verified implementation constraint requires otherwise.

## 5.2 Line-height tokens

The supplied reference defines line-height by role and font family.

For the selected Bricolage Grotesque and Figtree pairing, use:

```css
:root {
  --leading-display: 1.15;
  --leading-heading: 1.3;
  --leading-title: 1.4;
  --leading-subtitle: 1.35;
  --leading-body: 1.55;
  --leading-small: 1.5;
}
```

These are the default role values.

The Golden preset intentionally overrides selected elements:

| Element                        | Golden line-height |
| ------------------------------ | -----------------: |
| Main `h1`                      |               1.15 |
| Role/subtitle                  |              1.272 |
| Section `h2`                   |              1.272 |
| Intro/about/contact paragraphs |              1.618 |
| `.text-stack > p`              |              1.618 |
| Work description               |              1.618 |
| Publication title              |              1.618 |

Do not apply `1.618` to all text. It is not a universal line-height value.

## 5.3 Typography by role

### Main title

- Font: Bricolage Grotesque.
- Size: `clamp(2.058rem, 5vw, 2.618rem)`.
- Weight: appropriate medium-to-bold weight, preferably 600–700.
- Line-height: `1.15`.
- Letter spacing: `-0.045em`.
- Wrapping: `text-wrap: balance`.
- Keep the title visually dominant without making it an oversized hero headline.

### Role or subtitle

- Font: Bricolage Grotesque.
- Size: `clamp(1.272rem, 3.4vw, 1.618rem)`.
- Line-height: `1.272`.
- Letter spacing: `-0.03em`.
- Wrapping: `text-wrap: balance`.

### Section headings

- Font: Bricolage Grotesque.
- Size: `1.272rem` in the Golden preset.
- Line-height: `1.272`.
- Weight: medium or semibold.
- Avoid excessive tracking or uppercase styling.

### Body text

- Font: Figtree.
- Base size: `1rem`.
- Color: `var(--secondary)`.
- Golden line-height: `1.618`.
- Letter spacing: approximately `-0.01em` where it improves the selected font's texture.
- Do not use negative tracking indiscriminately on every text element.

### Work title

- Size: `1rem`.
- Weight: 550–650 where supported, or the nearest available weight.
- Keep it compact.

### Work description

- Size: `0.875rem`.
- Color: `var(--secondary)`.
- Line-height: `1.618`.
- Keep each description concise and readable.

### Publication title

- Size: `0.875rem`.
- Line-height: `1.618`.
- Maximum three lines in the shelf presentation.
- Full title must remain available in the detail dialog or accessible text.

### Metadata

Use the small type token:

- Date.
- Period.
- Project kind.
- Publication metadata.
- Section aside.
- Colophon.
- Language and compact controls.
- Creative mode labels.

Use `font-variant-numeric: tabular-nums` for dates, counters, years, and other aligned numerical values.

## 5.4 Selector-level line-height mapping

Adapt the following to the existing class names:

```css
#main {
  line-height: var(--leading-small);
}

#main p {
  line-height: var(--leading-body);
}

#main h1 {
  line-height: var(--leading-display);
}

#main :is(h2, h3, h4, h5, h6) {
  line-height: var(--leading-heading);
}

#main :is(.work-title, .publication-title) {
  line-height: var(--leading-title);
}

#main .role {
  line-height: var(--leading-subtitle);
}
```

Specific content selectors:

```css
#main
  :is(
    .text-stack > p,
    .intro-copy p,
    .about-section > p,
    .contact-section > p,
    .inspection-copy p
  ) {
  line-height: var(--leading-body);
}
```

Compact text selectors:

```css
#main
  :is(
    .section-intro,
    .work-description,
    .publication-meta,
    .work-kind,
    .colophon,
    .section-aside,
    .byline
  ) {
  line-height: var(--leading-small);
}
```

Apply the Golden-specific overrides after the base role rules.

Keep all selectors scoped to the portfolio. Do not unintentionally change typography on unrelated routes.

## 5.5 Language-specific leading

The supplied CSS gives Chinese text a line-height of `1.8`.

If the existing portfolio has a Chinese localization, retain:

```css
:root[lang="zh"]
  #main
  :is(
    .text-stack > p,
    .intro-copy p,
    .about-section > p,
    .contact-section > p,
    .inspection-copy p,
    .role,
    h2,
    h3
  ) {
  line-height: 1.8;
}
```

Do not add a language switcher just to use this rule. It applies only if the application already supports the relevant language.

## 5.6 Text wrapping and clamping

Use:

- `text-wrap: balance` for headings and role statements.
- `text-wrap: pretty` for handwritten annotations and selected longer item text.
- `overflow-wrap: anywhere` for long book titles and URLs where needed.

Do not apply `white-space: nowrap` to paragraphs or entire descriptions.

Use three-line clamping only for compact shelf titles and cover labels:

```css
.publication-title,
.cover-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
```

The detail view must expose the complete title.

## 5.7 Optional text-box trimming

The supplied CSS uses optical text-box trimming only on single-line UI controls where the browser supports it.

Use feature detection:

```css
@supports (text-box-trim: trim-both) and (text-box-edge: cap alphabetic) {
  /* Single-line controls only. */
}
```

Potential targets:

- Language toggle.
- Language menu buttons.
- Customizer trigger, if it already exists.
- Compact select controls.
- Segmented controls.
- Dialog close label.
- Read-article action.
- Cover edition label.

Never apply it to paragraphs, multi-line headings, or long descriptions.

Unsupported browsers should use normal line boxes without breaking layout.

---

# 6. Color and semantic token system

## 6.1 Semantic variables

The supplied CSS references:

- `--paper`
- `--ink`
- `--secondary`
- `--muted`
- `--soft`
- `--line`
- `--annotation`
- `--card-accent`

The original `design.md` uses more generic roles such as `--background`, `--surface`, and `--accent`.

Map the existing application's tokens to these roles rather than maintaining two separate color systems.

Suggested semantic mapping:

| Reference token | Meaning                                            |
| --------------- | -------------------------------------------------- |
| `--paper`       | Main surface/background or paper-like surface      |
| `--ink`         | Strong foreground text and dark control background |
| `--secondary`   | Body copy and secondary content                    |
| `--muted`       | Metadata and low-emphasis information              |
| `--soft`        | Subtle control background                          |
| `--line`        | Thin dividers and low-contrast outlines            |
| `--annotation`  | Creative mode accent                               |
| `--card-accent` | Optional publication-dialog accent                 |

Do not invent exact values for tokens that are not included in the supplied CSS.

## 6.2 Annotation accent

The supplied CSS explicitly defines:

```css
:root {
  --annotation: #4668ce;
}

:root[data-theme="dark"] {
  --annotation: #9bb1ff;
}
```

Use:

| Theme | Annotation value |
| ----- | ---------------- |
| Light | `#4668ce`        |
| Dark  | `#9bb1ff`        |

This accent is for Creative mode annotations and controls.

Do not turn it into a general brand color for every link, heading, button, or project preview.

Check contrast against the actual theme surfaces.

## 6.3 Surface hierarchy

Use the following hierarchy:

1. Main page background: flat and quiet.
2. Main text surface: no separate card required.
3. Section boundaries: thin `--line` separators.
4. Controls: subtle surface distinction.
5. Dialog: distinct focused surface with shadow and backdrop.

Do not put every portfolio section inside a bordered box.

---

# 7. Portrait theme behavior

## 7.1 Two-layer portrait

If both portrait theme assets already exist, place them in the same portrait container.

Expected structure, adapted to the current implementation:

```html
<div class="portrait">
  <img class="portrait-theme portrait-light" ... />
  <img class="portrait-theme portrait-dark" ... />
</div>
```

The two images must occupy the same geometry.

## 7.2 Container styling

```css
.portrait {
  background: transparent;
  isolation: isolate;
}

.portrait .portrait-theme {
  transition: opacity 260ms ease;
}
```

The visibility state is controlled by the existing theme attribute.

| Theme | Light image opacity | Dark image opacity |
| ----- | ------------------: | -----------------: |
| Light |                   1 |                  0 |
| Dark  |                   0 |                  1 |

Reference behavior:

```css
.portrait .portrait-light {
  display: block;
  opacity: 1;
}

.portrait .portrait-dark {
  display: block;
  opacity: 0;
}

:root[data-theme="dark"] .portrait .portrait-light {
  opacity: 0;
}

:root[data-theme="dark"] .portrait .portrait-dark {
  opacity: 1;
}
```

Do not create another theme state just for the portrait.

## 7.3 Portrait constraints

- Preserve the image's intended crop.
- Preserve the existing portrait dimensions.
- Preserve existing gaze behavior only if it already exists.
- Do not apply blend modes.
- Do not apply feathered masks.
- Do not introduce a decorative background behind a normal photograph.
- Ensure the inactive image does not intercept pointer events.
- Avoid announcing duplicate theme images to screen readers.

If both images represent the same portrait, use one meaningful accessible description and mark the duplicate visual layer decorative.

## 7.4 Motion

- Crossfade duration: `260ms`.
- Easing: `ease`.
- Reduced motion: transition disabled.

Theme switching must still work when transitions are disabled.

---

# 8. Creative mode: feature definition

## 8.1 Purpose

Creative mode is an optional editorial annotation layer.

When enabled, it reveals:

- Handwritten margin notes.
- Curved annotation arrows.
- Column measurement marks.
- Section-gap dividers.
- Thin outlines around work items.

It adds an editorial reading layer to the existing page. It does not modify the underlying portfolio content.

## 8.2 What Creative mode is not

Creative mode is not:

- The Style customizer.
- A typography selector.
- A spacing selector.
- A theme selector.
- A settings page.
- A replacement for the normal content.
- A mandatory default presentation.

Do not combine Creative mode with the Style customizer.

## 8.3 Initial state

Creative mode should initially be off unless the existing application already saves and restores a visitor's preference.

Off state:

- Notes hidden.
- Notes occupy no visible layout space.
- Arrows hidden.
- Column measurement marks hidden.
- Creative section dividers hidden.
- Work outlines removed.

On state:

- Notes visible.
- Arrows visible.
- Column measurement marks visible.
- Section dividers visible.
- Work-item outlines visible.

The state must be reversible without reloading the page.

## 8.4 State synchronization

Use one source of truth for the active state.

The following must always agree:

- Switch `aria-checked`.
- Root class such as `.notes-open`.
- Any root data attribute already used by the project.
- Actual visibility of annotation elements.

Do not maintain independent boolean states that can drift out of sync.

---

# 9. Creative mode control

## 9.1 Semantic markup

Use a real button with switch semantics:

```html
<button
  type="button"
  class="creative-switch selection-control"
  role="switch"
  aria-label="Creative mode"
  aria-checked="false"
  aria-controls="creative-note-1 creative-note-2"
>
  <span class="creative-switch-track">
    <span></span>
  </span>
</button>
```

This is a markup example. The IDs in `aria-controls` must match the actual annotation elements.

If annotations are generated dynamically, generate the ID list from the actual elements rather than hard-coding nonexistent IDs.

Requirements:

- Native button keyboard behavior.
- `type="button"` to avoid form submission.
- Accessible name.
- Correct `aria-checked` state.
- Toggle on activation.
- No requirement to hover before understanding the control.
- No use of a decorative `div` as the interactive control.

## 9.2 Placement

Place Creative mode beside the existing primary contact action, if the current hero layout supports it.

Do not create a new toolbar or settings card.

Action-row layout:

```css
.hero-message-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  max-width: 100%;
}
```

The portrait atmosphere container may use:

```css
.portrait-atmosphere {
  min-width: 0;
  flex: 1 1 0;
  container: portrait-actions / inline-size;
}
```

When the container is 13rem or narrower:

```css
@container portrait-actions (max-width: 13rem) {
  .hero-message-actions {
    flex-direction: column-reverse;
    align-items: flex-end;
  }
}
```

This is a container query, not a viewport breakpoint.

If the existing component structure cannot support this exact query container, implement equivalent behavior using the nearest suitable container.

## 9.3 Control dimensions

The hit area is larger than the visible switch track.

| Element              |         Exact value |
| -------------------- | ------------------: |
| Button width         |                44px |
| Button height        |                44px |
| Track width          |                32px |
| Track height         |                20px |
| Track border         |                 1px |
| Track radius         |               999px |
| Indicator width      |                12px |
| Indicator height     |                12px |
| Indicator top        |                 3px |
| Indicator left, off  |                 3px |
| Indicator travel     |                12px |
| Off track background |       `var(--soft)` |
| Off track border     |      `var(--muted)` |
| Off indicator        |  `var(--secondary)` |
| On track background  | `var(--annotation)` |
| On track border      | `var(--annotation)` |
| On indicator         |      `var(--paper)` |

Reference geometry:

```css
.creative-switch-group {
  position: relative;
  display: inline-flex;
  flex: 0 0 44px;
}

.creative-switch {
  width: 44px;
  height: 44px;
  padding: 0;
}

.creative-switch-track {
  display: block;
  position: relative;
  width: 32px;
  height: 20px;
  border: 1px solid var(--muted);
  border-radius: 999px;
  background: var(--soft);
}

.creative-switch-track > span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
}

.creative-switch[aria-checked="true"] .creative-switch-track {
  background: var(--annotation);
  border-color: var(--annotation);
}

.creative-switch[aria-checked="true"] .creative-switch-track > span {
  translate: 12px 0;
  background: var(--paper);
}
```

Keep the interactive target 44×44px even though the visible track is 32×20px.

## 9.4 Switch animation

| Property              | Duration | Easing                         |
| --------------------- | -------: | ------------------------------ |
| Track background      |    240ms | ease                           |
| Track border          |    240ms | ease                           |
| Indicator translation |    280ms | `cubic-bezier(.22, 1, .36, 1)` |
| Indicator background  |    240ms | ease                           |
| Tooltip               |    140ms | ease                           |

The indicator must travel exactly 12px. Do not use spring or bounce effects.

## 9.5 Focus style

```css
.creative-switch:focus-visible {
  outline: 2px solid var(--annotation);
  outline-offset: 2px;
}
```

Do not remove this focus treatment.

## 9.6 Tooltip

The reference tooltip appears above the switch.

| Property                | Value             |
| ----------------------- | ----------------- |
| Position                | Absolute          |
| Horizontal anchor       | Center            |
| Vertical offset         | 8px above control |
| Width                   | `max-content`     |
| Padding                 | `7px 10px`        |
| Radius                  | `6px`             |
| Background              | `var(--ink)`      |
| Text                    | `var(--paper)`    |
| Font                    | Figtree           |
| Font size               | 12px              |
| Line-height             | 1.5               |
| Initial opacity         | 0                 |
| Initial visibility      | hidden            |
| Initial vertical offset | 3px               |
| Visible vertical offset | 0                 |
| Pointer events          | none              |

Reference structure:

```css
.creative-switch-tooltip {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: calc(100% + 8px);
  width: max-content;
  padding: 7px 10px;
  border-radius: 6px;
  background: var(--ink);
  color: var(--paper);
  font: 12px/1.5 var(--font-body);
  opacity: 0;
  visibility: hidden;
  translate: -50% 3px;
  pointer-events: none;
}
```

Show it on keyboard focus-visible and hover on hover-capable devices.

The tooltip must not be the only accessible label.

## 9.7 Touch and narrow-screen behavior

- Preserve the 44×44px hit target.
- Do not rely on hover.
- Do not let the tooltip extend beyond the viewport.
- Do not let the switch force the action row to overflow.
- Allow the action row to stack when its container becomes too narrow.

---

# 10. Creative annotation typography and content

## 10.1 Handwritten font

The supplied CSS uses Caveat locally:

```css
@font-face {
  font-family: CreativeHand;
  font-style: normal;
  font-weight: 400;
  src: url("./vendor/caveat/caveat-regular.woff2") format("woff2");
  font-display: swap;
}
```

Before using this path, inspect the current project and confirm the file exists.

If missing:

- Do not reference a broken asset.
- Use a sensible cursive fallback temporarily.
- Add the correct local font asset only if it is available and suitable for the project.
- Do not use the handwritten font for regular headings or paragraph text.

## 10.2 Note text styling

```css
#main .margin-note {
  font-family: CreativeHand, cursive;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: 0;
  text-wrap: pretty;
  color: var(--annotation);
}
```

Emphasized lead-in:

```css
#main .margin-note b {
  font: inherit;
  font-size: 22px;
  line-height: 1.2;
  margin-bottom: 6px;
  text-transform: none;
  letter-spacing: 0;
}
```

Requirements:

- Note body: 20px.
- Note body line-height: 1.35.
- Emphasized lead-in: 22px.
- Lead-in line-height: 1.2.
- Lead-in bottom margin: 6px.
- No uppercase transformation.
- No added tracking.
- Color: `var(--annotation)`.

Notes should feel handwritten, but they must remain legible and secondary to the main text.

## 10.3 Annotation content

Preserve existing annotation wording exactly.

Do not:

- Invent new annotations.
- Invent missing note numbers.
- Change personal claims.
- Add explanatory paragraphs that are not in the existing source.
- Make an annotation contradict the actual content.

The supplied HTML contains notes with visible identifiers such as `01 / Hello`, `02 / Room to read`, `04 / A closer look`, and `05 / It starts here`. Do not fabricate a missing `03` annotation.

Each note should remain associated with its actual section or content block.

## 10.4 Accessibility

When Creative mode is off, hidden notes should not be read as visible content by assistive technology if the product treats them as optional supplementary commentary.

When Creative mode is on:

- Notes should have a meaningful relationship to the relevant content.
- Keep source order logical.
- Do not make the notes essential to understanding the main page.
- Do not use color as the only way to distinguish the note layer.

---

# 11. Desktop margin-note layout

## 11.1 Desktop breakpoint

At `min-width: 1200px`, notes appear outside the main reading column.

Exact values:

| Property                   | Value |
| -------------------------- | ----: |
| Note width                 | 170px |
| Offset from content column |  62px |
| Arrow width                |  58px |
| Arrow height               |  44px |
| Arrow top offset           |  20px |
| Arrow opacity              |   0.7 |

Reference placement:

```css
@media (min-width: 1200px) {
  #main .margin-note {
    width: 170px;
  }

  #main .note-left {
    right: calc(100% + 62px);
  }

  #main .note-right {
    left: calc(100% + 62px);
  }
}
```

## 11.2 Note positioning requirements

- Left notes appear outside the left edge of the main reading column.
- Right notes appear outside the right edge.
- Notes must be anchored to the relevant content, not the entire page.
- Notes must not overlap the content column.
- Notes must not overlap each other.
- Notes must not create page-level horizontal scrolling.
- Preserve the note's existing semantic and document order.

At 1200px exactly, verify that the actual main column, side notes, arrows, and page gutters fit. A media query alone does not guarantee this.

## 11.3 Arrow geometry

The reference uses a curved hand-drawn arrow as an SVG mask.

Reference SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
  <path
    d="M3 39C8 10 34 6 59 17M49 7Q55 13 59 17Q53 18 48 23"
    fill="none"
    stroke="black"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
```

Apply the following:

- Width: 58px.
- Height: 44px.
- Top: 20px.
- Color: `currentColor`.
- Opacity: 0.7 when visible.
- Stroke width: 1.6.
- Rounded line caps.
- Rounded line joins.

The arrow should use a mask or inline SVG so that its color follows `var(--annotation)`.

## 11.4 Arrow orientation

For a left-side note:

```css
#main .note-left::before {
  right: -62px;
}
```

For a right-side note:

```css
#main .note-right::before {
  left: -62px;
  transform: scaleX(-1);
}
```

The arrow must point toward the content the note describes.

If the existing layout needs the opposite orientation, mirror the graphic while preserving its curved, hand-drawn appearance.

---

# 12. Creative annotation reveal and interaction

## 12.1 Desktop off state

When Creative mode is off:

```css
#main .margin-note {
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  filter: blur(2px);
}
```

Notes must not appear visually, receive pointer input, or obstruct the reading experience.

## 12.2 Desktop active state

When Creative mode is on:

```css
.notes-open #main .margin-note {
  opacity: 1;
  visibility: visible;
  transform: none;
  filter: none;
  transition-delay: 0s;
}
```

Notes should appear softly without shifting the main content.

## 12.3 Transition values

| Property        |       Duration | Easing                         |
| --------------- | -------------: | ------------------------------ |
| Opacity         |          220ms | ease                           |
| Transform       |          320ms | `cubic-bezier(.22, 1, .36, 1)` |
| Blur            |          280ms | ease                           |
| Hide visibility | 0s after 320ms | delayed hide                   |

The visibility delay should allow the exit transition to finish.

## 12.4 Arrow reveal

The arrow fades in quickly after the annotation begins appearing.

Reference animation:

```css
@keyframes note-arrow-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.7;
  }
}
```

Duration: 120ms, `ease-out`.

Do not animate the arrow with a long path-drawing effect.

If existing JavaScript reveals measured text lines after the arrow, preserve that behavior. The supplied CSS alone does not implement that JavaScript, so do not invent a new line-by-line animation without confirming it exists.

## 12.5 Column measurements

When Creative mode is active, reveal the existing `.column-measure` element if it exists.

Reference values:

```css
#main .column-measure {
  left: -12px;
  right: -12px;
}

#main .column-measure span {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
```

Requirements:

- Measurements are subtle.
- Numbers use tabular numerals.
- Measurements do not change content width.
- They are hidden when Creative mode is off.
- They are hidden in print.

## 12.6 Work-item outline

When Creative mode is active:

```css
.notes-open #main .work-item {
  outline: 1px solid var(--line);
  outline-offset: 8px;
}
```

When off, remove the outline.

Requirements:

- Use an outline, not a border.
- Do not change item dimensions.
- Do not create a background surface.
- Do not add a shadow.
- Keep the outline low contrast.
- Do not confuse this decorative state with keyboard focus or selection.

---

# 13. Tablet and mobile annotation behavior

## 13.1 Breakpoint transition

Use:

- `min-width: 1200px`: desktop side-margin annotation layout.
- `max-width: 1199px`: in-flow annotation layout.

At 1199px and below, do not try to preserve the 170px side-note layout.

## 13.2 In-flow note geometry

At tablet and mobile widths:

- `position: relative`.
- Reset `inset`.
- Width: auto.
- Maximum width: none.
- Left padding: 42px.
- Arrow width: 32px.
- Arrow height: 36px.
- Arrow left: 0.
- Arrow top: 0.
- Arrow rotation: `-90deg`.

Reference behavior:

```css
@media (max-width: 1199px) {
  #main .margin-note {
    position: relative;
    inset: auto;
    width: auto;
    max-width: none;
    margin: 0;
    padding: 0 0 0 42px;
    border: 0;
  }

  #main .margin-note::before {
    left: 0;
    right: auto;
    top: 0;
    width: 32px;
    height: 36px;
    transform: rotate(-90deg);
  }
}
```

The note appears below the relevant content. It must not float over or obscure the main text.

## 13.3 Portrait-row behavior

When Creative mode is active at 1199px and below:

- The portrait line may wrap.
- A note belonging to the portrait row takes a full row.
- The portrait and primary actions must not collide.
- Preserve alignment between the portrait and the action group.

At 480px and below, use a 16px column gap for the portrait line.

## 13.4 Collapsed mobile state

Unlike desktop side notes, mobile annotations participate in normal document flow. Hiding them with opacity alone would leave blank vertical space.

When off, collapse their layout:

- Height: `0`.
- Minimum height: `0`.
- Vertical margins: `0`.
- Overflow: clipped.
- Opacity: `0`.
- Visibility: hidden.
- Transform: translate down by 6px.
- Blur: 2px.

When on:

- Height: auto.
- Overflow: visible.
- Opacity: 1.
- Visibility: visible.
- Transform: none.
- Filter: none.
- Restore the appropriate vertical margins.

Use `interpolate-size: allow-keywords` only when supported.

If it is unsupported, provide a fallback that still reveals the entire note. A max-height transition may be used if its maximum is sufficient for the longest existing note. Never permanently clip annotation content.

## 13.5 Mobile margins

When active:

- General note top margin: 16px.
- Section note vertical margins: `16px 0 24px`.
- Contact note bottom margin: 0.
- Left padding: 42px.

When off, collapse vertical margins to zero.

## 13.6 Starting style

If supported, use `@starting-style` to ensure a newly revealed note begins from the collapsed state:

```css
@starting-style {
  .notes-open #main .margin-note {
    height: 0;
    margin-block: 0;
    opacity: 0;
    filter: blur(2px);
    transform: translateY(6px);
  }
}
```

This is progressive enhancement. The feature must still work in browsers that do not support `@starting-style`.

---

# 14. Publication shelf

Implement this section only when a publication or book shelf already exists in the current portfolio.

## 14.1 General presentation

The shelf should feel like a compact curated collection.

Do not turn it into a large store catalog or dashboard grid.

Preserve:

- Existing publication records.
- Existing cover images.
- Existing metadata.
- Existing destinations.
- Existing ordering.

## 14.2 Horizontal scrolling

The supplied CSS defines a horizontal shelf:

```css
.book-stage {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}

.book-stage::-webkit-scrollbar {
  display: none;
}

.publication {
  scroll-snap-align: start;
}
```

Requirements:

- Horizontal scrolling must work.
- Scroll snap must align each publication to its start.
- Scrollbar may be visually hidden.
- Do not disable keyboard or touch scrolling.
- Use `overscroll-behavior-x: contain`.
- Do not create page-level horizontal scrolling.

## 14.3 Desktop lineup

The reference uses column-based horizontal auto-flow:

```css
.book-lineup {
  grid-template-columns: none;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 2 * var(--space-group, 20px)) / 3);
}
```

This represents an approximate three-item visible lineup, not a fixed static three-column grid.

The shelf should be horizontally scrollable where content exceeds its visible width.

## 14.4 Mobile shelf

At 680px and below:

```css
@media (max-width: 680px) {
  .book-lineup {
    grid-template-columns: none;
    grid-auto-columns: 174px;
  }
}
```

Requirements:

- Each item width: 174px.
- Horizontal overflow remains enabled.
- Scroll snap remains enabled.
- Do not squeeze the shelf into multiple narrow columns.
- Ensure the next item can be discovered through scrolling.

## 14.5 Cover presentation

- Preserve cover aspect ratio.
- Use `object-fit: cover` only where appropriate for the existing image frame.
- Do not stretch cover artwork.
- Keep cover title typography compact.
- Keep metadata muted.
- Avoid excessive decorative shadows.
- Do not use the three-line shelf title clamp in the detail dialog.

---

# 15. Publication detail dialog

## 15.1 Purpose

When a publication is activated, show a compact reading card over the existing shelf.

The shelf remains behind the dialog.

Use the existing dialog implementation if it already works. Do not replace it just to imitate the reference's appearance.

## 15.2 Desktop dimensions

Reference values:

| Property       | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| Width          | `min(440px, calc(100% - 32px))`                             |
| Maximum height | `calc(100dvh - 40px)`                                       |
| Border         | `1px solid color-mix(in srgb, var(--ink) 12%, transparent)` |
| Overflow       | hidden on outer surface                                     |
| Overscroll     | contained                                                   |
| Backdrop       | `#00000040`                                                 |
| Backdrop blur  | 6px                                                         |
| Shadow         | `0 32px 100px #00000040, 0 4px 16px #00000018`              |
| Radius         | Golden `--gold-radius-dialog`                               |

The generic CSS includes a 24px dialog radius. The selected Golden configuration overrides this value. Use the Golden token in the final implementation.

## 15.3 Inner scrolling region

The dialog inner region owns vertical scrolling:

```css
.book-dialog-inner {
  position: relative;
  isolation: isolate;
  padding: 20px 28px 28px;
  max-height: inherit;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

Golden override:

```css
[data-proportion="golden"] .book-dialog-inner {
  padding: var(--gold-space-5);
}
```

At 680px and below:

```css
[data-proportion="golden"] .book-dialog-inner {
  padding: var(--gold-space-4);
}
```

Do not allow the outer dialog and inner content to compete for scrolling.

## 15.4 Dialog surface decoration

The reference uses:

- A subtle radial accent based on `--card-accent`.
- A paper-grain texture.
- A restrained shadow.
- A blurred backdrop.

The supplied texture path is:

```text
/assets/images/writing/paper-grain.svg
```

Check whether the asset exists before using it.

If missing, omit the texture. Do not reference a broken asset path or generate a substitute automatically.

The decorative background must:

- Not intercept pointer input.
- Remain behind dialog content.
- Preserve text contrast.
- Use low opacity.
- Avoid looking like a bright gradient card.

## 15.5 Close control

Position the close control at:

- Top: 16px.
- Right: 16px.
- Width: 40px.
- Height: 40px.

Use:

- Centered icon.
- Circular generic geometry, or the selected control radius where appropriate.
- Subtle translucent paper background.
- More opaque background on hover.
- Active scale: `0.96`.
- Visible keyboard focus.
- Accessible label such as “Close”.

Ensure the close control does not cover the dialog title at narrow widths.

## 15.6 Book inspection stage

The reference uses a compact, non-rotating book preview.

Desktop geometry:

```css
.inspection-stage {
  --book-w: 142px;
  --book-h: 196px;
  --book-depth: 10px;
  min-height: 218px;
  padding-left: 0;
  cursor: default;
}
```

Additional details:

| Element                     |                Value |
| --------------------------- | -------------------: |
| Stage width of book         |                142px |
| Stage height of book        |                196px |
| Book depth                  |                 10px |
| Stage minimum height        |                218px |
| Cover edition font          |                  6px |
| Standard cover image height |                 83px |
| Cover title                 |                 16px |
| Cover title padding         | `11px 10px 5px 13px` |
| Bottom cover metadata       |                  6px |

Illustrated covers may fill their available image region.

The dialog inspection layout should:

- Stack vertically.
- Center the book.
- Center the copy.
- Use a 12px gap.
- Keep rotation controls hidden.

The supplied CSS sets:

```css
.rotate-actions {
  display: none;
}
```

Do not expose rotation actions in this compact reading dialog.

## 15.7 Dialog typography

| Element      | Size | Other treatment                                    |
| ------------ | ---: | -------------------------------------------------- |
| Kicker       | 10px | Uppercase, `.08em` letter spacing, secondary color |
| Dialog title | 25px | Line-height 1.16, tracking `-.035em`               |
| Description  | 14px | Line-height 1.55, secondary color                  |
| Byline       | 11px | Line-height 1.5                                    |

Dialog title:

- Uses Bricolage Grotesque.
- Has approximately 10px top margin.
- May use the Golden override of `1.618rem` and line-height `1.272`.

Description:

- Uses Figtree.
- Has approximately 18px top margin.
- Uses the body color token.

Byline:

- Uses Figtree.
- Has approximately 12px top margin.

Do not clamp the full detail title.

## 15.8 Read-article action

Use the existing article destination and behavior.

Reference dimensions:

| Property       | Value          |
| -------------- | -------------- |
| Width          | 100%           |
| Minimum height | 46px           |
| Top margin     | 24px           |
| Padding        | `10px 18px`    |
| Background     | `var(--ink)`   |
| Text           | `var(--paper)` |
| Font size      | 13px           |
| Line-height    | 1.2            |

The generic reference shape is pill-like. In the selected Golden configuration, use the control radius token if it overrides that geometry.

Hover should reduce opacity to approximately `0.85`, without changing to a new color.

Do not invent publication links.

## 15.9 Mobile dialog dimensions

At 680px and below:

| Property             | Value                                |
| -------------------- | ------------------------------------ |
| Width                | `calc(100% - 24px)`                  |
| Maximum height       | `calc(100dvh - 24px)`                |
| Generic radius       | 22px, overridden by Golden token     |
| Inner padding        | Golden `--gold-space-4`              |
| Book width           | 128px                                |
| Book height          | 177px                                |
| Stage minimum height | 196px                                |
| Standard cover image | 73px                                 |
| Cover title          | 14px                                 |
| Dialog title         | 23px, unless Golden override applies |

Verify the layout at 320px. The close control, title, content, and primary action must not overlap.

## 15.10 Dialog accessibility and behavior

Preserve or implement:

- Focus moves into the dialog when opened.
- Focus remains within the modal while open.
- Escape closes the dialog.
- The close button closes the dialog.
- Focus returns to the publication that opened it.
- Dialog title is programmatically associated.
- Description is associated when appropriate.
- Background content is not accidentally interactive while the modal is active.
- The dialog remains scrollable on short screens.

The supplied CSS disables open and closing animations. Do not add a new animation unless the existing implementation specifically requires one.

---

# 16. Masthead and controls

## 16.1 Masthead wrapping

The masthead must wrap when necessary:

```css
.masthead {
  flex-wrap: wrap;
  row-gap: 10px;
}

.page-controls {
  margin-left: auto;
}
```

Do not force all masthead content onto a single line on mobile.

## 16.2 Control sizing

The supplied enhancement gives several compact controls a minimum height of 44px:

```css
.socials a,
.theme-control,
.language-toggle,
.notes-toggle {
  min-height: 44px;
}

.theme-control {
  min-width: 44px;
}
```

Apply this to existing interactive controls where appropriate.

Do not make purely decorative metadata 44px high.

## 16.3 Narrow masthead behavior

At 400px and below:

- Masthead gap: 12px.
- Page-control gap: 4px.
- Place/location group gap: 6px.
- Colophon changes to a vertical layout.

At 360px and below:

- Masthead text may reduce to `0.75rem`.
- Language-toggle horizontal padding may reduce to 4px.

Do not make text smaller than necessary. Confirm that it remains readable.

---

# 17. Section heading refinements

When a section heading contains an aside or subtitle, use a two-column grid:

```css
.section-heading.has-subtitle {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.section-heading-copy {
  min-width: 0;
}

.section-heading.has-subtitle > .section-aside {
  justify-self: end;
}
```

At 480px and below:

```css
.section-heading.has-subtitle {
  grid-template-columns: minmax(0, 1fr);
}

.section-heading.has-subtitle > .section-aside {
  justify-self: start;
}
```

Requirements:

- Heading content occupies the flexible column.
- Aside occupies the secondary column.
- Aside aligns to the end on desktop.
- Aside aligns to the start on mobile.
- `min-width: 0` prevents long heading content from forcing overflow.
- The heading stays close to the section content.

Do not apply this grid to section headings without subtitles or asides.

---

# 18. Work list and preview refinements

## 18.1 Normal work-item state

The supplied enhancement removes normal work-item borders and padding:

```css
#main .work-item {
  border: 0;
  padding-block: 0;
}
```

Requirements:

- Work items are presented as a compact list.
- No card border in the normal state.
- No separate card background.
- No large shadow.
- Section rhythm controls vertical spacing.
- Work descriptions remain compact.
- Project title and metadata are easy to scan.

## 18.2 Work preview

The local enhancement initially uses square preview corners. The later Golden rule applies a surface radius.

For the selected Golden configuration:

```css
[data-proportion="golden"] .work-preview {
  border-radius: var(--gold-radius-surface);
}
```

Requirements:

- Preserve source image aspect ratio.
- Use `object-fit: cover` where the preview uses a fixed frame.
- Do not stretch images.
- Do not introduce decorative gradients over images unless already part of the asset or existing visual design.

## 18.3 Creative mode outline

When Creative mode is active:

```css
.notes-open #main .work-item {
  outline: 1px solid var(--line);
  outline-offset: 8px;
}
```

When off, remove it.

This is an optional editorial outline, not the normal work-list container style.

---

# 19. Contact and email-copy behavior

Apply this section only if the current portfolio has a copy-to-clipboard email control.

## 19.1 Button behavior

Keep the control semantic:

```html
<button type="button" class="email-link">...</button>
```

Requirements:

- Preserve copy-to-clipboard behavior.
- Do not replace the copy button with a fake navigation anchor.
- Minimum height: 44px.
- No visible border in the resting state.
- No filled background in the resting state.
- Text aligns to the left.
- Long email addresses can wrap.
- Icon must not shrink.
- Hover may underline the address with a 4px underline offset.

## 19.2 Copy feedback tooltip

Reference values:

| Property            | Value                            |
| ------------------- | -------------------------------- |
| Position            | Absolute above control           |
| Bottom offset       | 10px                             |
| Horizontal anchor   | Center                           |
| Padding             | `7px 10px`                       |
| Radius              | 6px                              |
| Background          | `var(--ink)`                     |
| Text                | `var(--paper)`                   |
| Font size           | 0.75rem                          |
| Line-height         | 1.5                              |
| Maximum width       | `min(260px, calc(100vw - 48px))` |
| Initial translation | `-50% 4px`                       |
| Visible translation | `-50% 0`                         |
| Transition          | 140ms ease                       |

The tooltip must not affect document layout.

Use accessible status feedback as appropriate. The tooltip must not be the only confirmation for screen-reader users.

Under reduced motion, remove the transition.

---

# 20. Responsive breakpoint matrix

Use the reference-specific breakpoints below while preserving the existing page breakpoints from `design.md`.

| Breakpoint          | Behavior                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `min-width: 1200px` | Desktop margin notes, 170px width, 62px offset                                            |
| `max-width: 1199px` | Notes move into document flow and collapse when off                                       |
| `max-width: 680px`  | Publication shelf becomes horizontal with 174px items; dialog switches to mobile geometry |
| `max-width: 480px`  | Section heading aside stacks; portrait-line gap becomes 16px                              |
| `max-width: 400px`  | Masthead gaps tighten and colophon stacks                                                 |
| `max-width: 360px`  | Masthead typography may reduce to 0.75rem; language-toggle padding reduces                |

The base `design.md` also references 440px for other page grids. Preserve that breakpoint for experience and project-facts layouts if already used. Do not replace it with 480px merely because the additional reference refinements use 480px for different components.

## 20.1 Required viewport tests

Verify at:

- 1440px.
- 1200px.
- 1199px.
- 1024px.
- 768px.
- 680px.
- 480px.
- 400px.
- 360px.
- 320px.

At every width, check:

- No horizontal page overflow.
- No collisions between portrait, actions, and annotations.
- No clipped note text.
- No blank space left by hidden mobile notes.
- No overlap between dialog close control and dialog title.
- No distorted cover images.
- No clipped email address.
- No overflowing section headings.
- No inaccessible or off-screen controls.

---

# 21. Reduced-motion behavior

All motion added by this enhancement must respect:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable nonessential movement. */
}
```

At minimum, disable:

| Component        | Motion to disable                    |
| ---------------- | ------------------------------------ |
| Portrait         | 260ms theme crossfade                |
| Creative switch  | Track and indicator transitions      |
| Annotation notes | Opacity, transform, blur transitions |
| Annotation arrow | 120ms entrance fade                  |
| Email feedback   | Tooltip transition                   |
| Book dialog      | Open/close animation                 |
| Reveal states    | Nonessential page movement           |

Reduced motion must not disable functionality.

The following must still work:

- Theme switching.
- Creative mode switching.
- Note visibility.
- Dialog opening and closing.
- Copy-to-clipboard.
- Shelf scrolling.

Avoid `transition: all`. Target only specific properties.

---

# 22. Keyboard and accessibility requirements

## 22.1 Global

- Preserve semantic HTML.
- Keep a single primary `h1`.
- Maintain logical heading hierarchy.
- Use meaningful link labels.
- Keep visible keyboard focus.
- Do not use color alone to communicate state.
- Maintain adequate contrast in both themes.

## 22.2 Creative mode

- Switch must be keyboard-operable.
- Switch has an accessible name.
- `aria-checked` reflects the current state.
- Tooltip appears on keyboard focus.
- Switch hit area remains 44×44px.
- Notes must not obstruct normal reading order.

## 22.3 Publication dialog

- Dialog receives focus on open.
- Focus is contained while modal.
- Escape closes.
- Close button works.
- Focus returns to the activating publication.
- Dialog title and description have appropriate relationships.
- Underlying page interaction is blocked while modal.

## 22.4 Images

- Informative images need meaningful alt text.
- Decorative texture and visual-only duplicates use empty alt text or are hidden from assistive technology.
- Theme-specific portrait layers must not create duplicate announcements.

---

# 23. Print behavior

When printing:

Hide:

- Margin notes.
- Column measurement marks.
- Creative mode toggle.
- Creative-only section dividers.
- Creative-only work outlines.
- Existing Style customizer, if present.

Restore:

- Main content visibility if the application has a boot/reveal state.
- Normal text colors suitable for printing.
- Normal page flow.

Remove the extra 100px portfolio bottom padding.

Do not hide:

- Projects.
- Experience.
- Biography.
- Contact information.
- Publication content.
- Actual content descriptions.

Print styles should remove interface decoration, not useful content.

---

# 24. CSS architecture and implementation constraints

## 24.1 Inspect the repository first

Before editing, inspect:

1. Framework and routing.
2. Main portfolio layout component.
3. Global stylesheet imports.
4. Theme attributes and token definitions.
5. Existing font loading.
6. Existing spacing and type scales.
7. Portrait markup and image assets.
8. Creative mode markup and JavaScript, if present.
9. Publication shelf and detail dialog, if present.
10. Existing breakpoints.
11. Reduced-motion support.
12. Focus styles and accessibility behavior.

Do not assume selectors such as `#main`, `.folio`, `.book-dialog`, or `.margin-note` exist in the target project.

Map the specification to the actual component tree.

## 24.2 One source of truth

Organize styles so each concern has one clear owner:

| Concern           | Preferred location                          |
| ----------------- | ------------------------------------------- |
| Theme colors      | Theme token layer                           |
| Font loading      | Document head or global font layer          |
| Typography tokens | Global typography layer                     |
| Golden tokens     | Design-token layer                          |
| Portfolio shell   | Portfolio layout styles                     |
| Portrait          | Portrait component styles                   |
| Creative switch   | Control component styles                    |
| Margin notes      | Annotation styles                           |
| Publication shelf | Publication component styles                |
| Dialog            | Dialog component styles                     |
| Reduced motion    | One coherent global/component strategy      |
| Print             | Print stylesheet or one clear print section |

Do not append repeated override blocks indefinitely.

The supplied CSS includes overlapping revisions. Merge them into the final intended state rather than copying every duplicate selector.

## 24.3 CSS quality

- Prefer semantic variables over repeated literal colors.
- Prefer shared spacing tokens over duplicate values.
- Scope page-specific changes.
- Avoid global element overrides that affect unrelated routes.
- Avoid `!important` unless an existing architectural constraint makes it necessary.
- Avoid adding dependencies for simple CSS interactions.
- Keep existing component state logic when it already works.
- Do not duplicate state in CSS and JavaScript unnecessarily.
- Do not add broken asset references.
- Do not add unused font declarations.

## 24.4 Existing architecture takes precedence

This is a visual adaptation task.

Do not:

- Replace the framework.
- Replace routing.
- Rebuild the entire page from a new template.
- Replace existing data models.
- Remove working interactions.
- Rename data fields unnecessarily.
- Copy reference project content.
- Copy the reference identity.
- Add features that are outside the current product scope.
- Introduce a new component library solely for styling.

---

# 25. Implementation sequence

Follow this sequence.

## Phase 1: Audit

1. Inspect project structure.
2. Identify the actual portfolio shell.
3. Identify existing design tokens.
4. Identify font loading and conflicting declarations.
5. Identify current theme behavior.
6. Find portrait assets.
7. Find annotation elements and toggle logic.
8. Find publication shelf and dialog.
9. Record existing responsive breakpoints.
10. Capture baseline desktop and mobile screenshots.

Do not rewrite styles before the audit.

## Phase 2: Foundation

1. Load Bricolage Grotesque and Figtree once.
2. Define semantic font tokens.
3. Define Golden spacing tokens.
4. Define Golden typography tokens.
5. Define Golden radius tokens.
6. Map current colors to semantic roles.
7. Set the portfolio maximum width.
8. Set shared section spacing.
9. Establish typography by semantic role.
10. Check the page in its normal state with Creative mode off.

## Phase 3: Main components

1. Refine masthead wrapping.
2. Refine intro and portrait geometry.
3. Refine section headings.
4. Refine work and experience lists.
5. Refine project previews.
6. Refine contact behavior.
7. Refine publication shelf if present.
8. Refine book dialog if present.

## Phase 4: Creative mode

1. Confirm the existing annotation content.
2. Confirm the handwritten font asset.
3. Implement the semantic switch.
4. Synchronize state and accessibility attributes.
5. Implement exact switch geometry.
6. Implement tooltip and focus behavior.
7. Implement annotation typography.
8. Implement desktop side-note positioning.
9. Implement curved arrows.
10. Implement tablet/mobile in-flow notes.
11. Implement the collapsed off state.
12. Implement column measurement marks.
13. Implement section dividers.
14. Implement work-item outlines.
15. Implement reduced-motion behavior.
16. Implement print behavior.
17. Test repeated on/off switching.

## Phase 5: Verification

1. Test all required widths.
2. Test dark theme.
3. Test light theme if supported.
4. Test Creative mode off.
5. Test Creative mode on.
6. Test keyboard interaction.
7. Test reduced motion.
8. Test publication dialog behavior.
9. Test print output.
10. Check console and build errors.
11. Check missing fonts and images.
12. Compare before/after screenshots.
13. Remove only styles confirmed to be unused.

---

# 26. Acceptance criteria

The implementation is complete only when the applicable criteria below are satisfied.

## 26.1 Design foundation

- [ ] Bricolage Grotesque is used for headings.
- [ ] Figtree is used for body and interface text.
- [ ] Fonts load once at document/application level.
- [ ] Golden tokens are defined centrally.
- [ ] Portfolio width is `37.5rem` in the selected Golden configuration.
- [ ] Article layout retains its separate 648px measure where applicable.
- [ ] Shared section-gap token is used.
- [ ] Dark theme is the primary visual target.
- [ ] Existing light theme remains functional if supported.
- [ ] Normal page content is not wrapped in generic cards.

## 26.2 Typography

- [ ] Main title uses the specified Golden scale.
- [ ] Role uses the specified Golden scale.
- [ ] Section headings use the specified Golden scale.
- [ ] Body text uses Figtree and role-specific leading.
- [ ] Work descriptions use 14px and φ leading.
- [ ] Publication titles clamp only in shelf presentation.
- [ ] Long text wraps without horizontal overflow.
- [ ] Metadata uses small muted typography.
- [ ] Numeric metadata uses tabular numerals.

## 26.3 Portrait

- [ ] Portrait theme layers share the same geometry.
- [ ] One image is visible per theme.
- [ ] Crossfade is 260ms when motion is allowed.
- [ ] Reduced-motion preference disables the transition.
- [ ] Portrait and actions do not collide at mobile widths.

## 26.4 Creative mode control

- [ ] Switch hit area is 44×44px.
- [ ] Track is 32×20px.
- [ ] Indicator is 12×12px.
- [ ] Indicator travel is 12px.
- [ ] Off/on colors use semantic tokens.
- [ ] Focus outline is visible and 2px.
- [ ] Tooltip appears on keyboard focus.
- [ ] Tooltip appears on hover-capable devices.
- [ ] Switch has an accessible name.
- [ ] `aria-checked` reflects the true state.
- [ ] Root state class reflects the true state.
- [ ] Repeated toggling works without reloading.

## 26.5 Creative mode annotations

- [ ] Existing note text is preserved.
- [ ] No annotations are invented.
- [ ] Caveat is used when its local asset exists.
- [ ] Note body uses 20px and line-height 1.35.
- [ ] Emphasized lead-in uses 22px and line-height 1.2.
- [ ] Notes use the annotation color token.
- [ ] Desktop notes are 170px wide.
- [ ] Desktop notes use a 62px offset.
- [ ] Desktop arrows are 58×44px.
- [ ] Mobile arrows are 32×36px.
- [ ] Desktop notes are outside the main content column.
- [ ] Notes move into document flow below 1200px.
- [ ] Hidden mobile notes do not leave blank space.
- [ ] Section dividers appear only while Creative mode is active.
- [ ] Column measurements appear only while active.
- [ ] Work-item outlines appear only while active.

## 26.6 Publication shelf and dialog

- [ ] Shelf scrolls horizontally.
- [ ] Shelf uses scroll snapping.
- [ ] Mobile item width is 174px at 680px and below.
- [ ] Cover proportions remain correct.
- [ ] Dialog uses the specified width and height constraints.
- [ ] Inner dialog content scrolls independently.
- [ ] Dialog close control remains accessible.
- [ ] Escape closes the dialog.
- [ ] Focus returns to the activating publication.
- [ ] Missing texture assets are not referenced.
- [ ] Full publication titles remain available in detail view.

## 26.7 Responsive and accessibility

- [ ] No horizontal overflow at required widths.
- [ ] No collisions at 320px.
- [ ] All interactive elements have visible keyboard focus.
- [ ] Creative mode is keyboard-operable.
- [ ] Dialog focus behavior is correct.
- [ ] Reduced motion is respected.
- [ ] Print output excludes decorative enhancements.
- [ ] Contrast is checked in both themes.
- [ ] No unsupported content or project claims are added.

---

# 27. Final instructions to the coding agent

Read `design.md` and `CREATIVE_MODE.md` as a single combined specification.

First inspect the existing implementation. Then adapt it.

Do not begin by replacing the website with a new template. Do not introduce unrelated reference features. Do not change content, identity, routes, data, or existing product behavior without a concrete implementation reason.

Implement the exact values and state behavior above where the corresponding features exist. Where a feature does not exist, preserve the current product scope.

Before finishing, provide a factual implementation report with:

1. Files and components changed.
2. Design tokens and typography updated.
3. Components restyled.
4. Creative mode behavior implemented, if applicable.
5. Publication shelf/dialog changes, if applicable.
6. Responsive widths actually tested.
7. Themes actually tested.
8. Keyboard and reduced-motion behavior actually tested.
9. Missing assets or fonts.
10. Known deviations or remaining issues.

Do not claim that a test passed unless it was actually executed. Do not report a feature as implemented merely because CSS for it was added; verify the feature in the running application.

**The final result should preserve the existing portfolio while applying the reference's editorial visual system and interaction details consistently.**
