# Design Specification: Editorial Portfolio Redesign

## Purpose

Redesign the existing portfolio to follow the visual language and layout of the supplied reference page. This is an adaptation task, not a rebuild from scratch.

Keep the current framework, routes, content, data sources, and working interactions unless a change is necessary to achieve the design. Reuse existing components where practical. Do not copy the reference site's name, wording, project data, images, or identity. Re-skin and reorganize the existing site using the design rules below.

The goal is a restrained, editorial portfolio: typography-led, compact, information-dense without feeling crowded, and closer to a well-typeset personal publication than a generic software-developer landing page.

## Design direction

- Minimal, editorial, and monochromatic. Avoid the appearance of a SaaS landing page, dashboard, startup template, or collection of oversized cards.
- Use a dark appearance as the primary reference. The supplied page declares `data-theme="dark"` and `theme-color="#080808"`. If the existing site already supports light mode, retain it as an alternate theme rather than removing it.
- Use a near-black page background, restrained surface separation, muted secondary text, and thin low-contrast borders. Keep accent colors rare and purposeful.
- Favor whitespace, alignment, typography, and thin rules over shadows, gradients, rounded cards, and decorative containers.
- Keep the main reading column relatively narrow. The reference's article layout uses a maximum width of 648px, while its wider portfolio sections can use a slightly larger measure where required.
- Use simple, consistent transitions. Motion should support state changes, not become a visual feature in itself.

## Typography

### Font pairing

The supplied reference HTML identifies the selected pairing as:

- **Headings:** Bricolage Grotesque
- **Body text and interface:** Figtree

Use these Google Fonts. The HTML contains a Roboto stylesheet link and a local Inter preload, but its selected design attributes explicitly specify Bricolage Grotesque and Figtree. Do not use Roboto or Inter as the primary pairing for this redesign.

Add the following to the document `<head>` (prefer `<link>` over CSS `@import` so the browser can discover the font requests early):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
```

Define reusable font tokens rather than assigning font names ad hoc:

```css
:root {
  --font-heading: "Bricolage Grotesque", sans-serif;
  --font-body: "Figtree", sans-serif;
}

body {
  font-family: var(--font-body);
}

h1, h2, h3, h4, .display-text {
  font-family: var(--font-heading);
}
```

### Type treatment

- Headings should be distinctive but not oversized. Use tight tracking and compact line-height.
- Body text should be easy to read over longer passages. Use a line-height around 1.65–1.8.
- Use medium weights for most headings and labels. Reserve bold weights for the page title and important emphasis.
- Use smaller, muted text for dates, locations, metadata, category labels, and supporting information.
- Use tabular numerals for dates, periods, counters, and other aligned numeric metadata.
- Use balanced or pretty text wrapping for display headings and longer list items where supported.
- Avoid applying uppercase transformations to every label. Use case naturally and consistently.

Suggested type scale (adjust to the existing layout rather than forcing every value):

| Role | Suggested size | Treatment |
|---|---:|---|
| Page title | `clamp(2rem, 6vw, 3rem)` | Bricolage Grotesque, 1.1–1.2 line-height |
| Section heading | `1.4rem–1.75rem` | Bricolage Grotesque, medium/semibold |
| Item/project heading | `0.875rem–1rem` | Bricolage Grotesque or Figtree, weight 550–650 |
| Body copy | `0.875rem–1rem` | Figtree, 1.7–1.8 line-height |
| Supporting copy | `0.8125rem–0.875rem` | Figtree, muted |
| Metadata | `0.6875rem–0.75rem` | Figtree, muted, tabular numerals where relevant |

## Color and surface system

The supplied CSS references semantic variables named `--ink`, `--secondary`, `--muted`, and `--line`. Preserve this semantic approach. Define the actual color values centrally and reuse them throughout the application.

Required roles:

- `--background`: primary page background; near-black in dark mode.
- `--surface`: subtle raised surface for the few areas that need separation.
- `--ink`: primary text and headings; strongest contrast.
- `--secondary`: body copy and supporting descriptions.
- `--muted`: metadata, dates, labels, and low-priority information.
- `--line`: subtle dividers, borders, and separators.
- `--accent`: optional restrained interaction/focus accent. Do not introduce a bright brand color unless the existing identity requires it.

Use borders to separate content instead of placing every section inside a card. Cards should be reserved for content that genuinely benefits from grouping, such as a small set of writing categories or project facts.

Do not invent a new palette if the current site already has usable brand colors. Map the existing colors to these semantic roles and tune them to the low-contrast editorial treatment. The provided source exposes the dark theme and semantic variable names, but not the original stylesheet's complete color values.

## Layout and spacing

- Center the primary content and constrain its reading width. For article-like pages, use `max-width: 648px`, `margin-inline: auto`, and horizontal padding of approximately `24px`.
- Use a wider container only for layouts that need it, such as project grids or a two-column expertise section. Keep text measures narrower than the overall container.
- Use consistent vertical rhythm. The reference uses approximately `28px` gaps between list items and larger section spacing around `48px` or more.
- Keep section headings close to their content. Avoid excessive empty space between a heading and the first paragraph.
- Prefer thin horizontal rules and subtle borders to visually mark section boundaries.
- Keep content aligned to a shared left edge. Avoid arbitrary offsets and decorative asymmetry that makes the page harder to scan.

### Article layout

For long-form writing pages, use an article shell similar to:

```css
.article-shell {
  max-width: 648px;
  margin: 0 auto;
  padding: 56px 24px 100px;
}

.article-shell header {
  margin-bottom: 48px;
}

.article-shell h1 {
  margin: 16px 0 24px;
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 1.15;
  text-wrap: balance;
}

.article-shell p {
  margin: 0 0 24px;
  color: var(--secondary);
  line-height: 1.8;
}

.article-shell .article-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  margin: 24px 0;
  border-radius: 8px;
}
```

## Component patterns

### Intro / hero

- Use a compact masthead for location, local time, language, and theme controls if those features already exist in the project.
- Keep the portrait or profile image as a supporting focal point, not a full-screen hero background.
- Use a concise, two-line positioning statement. It should explain what the person builds or works on, not rely on generic claims such as “passionate innovator.”
- Keep primary contact or navigation actions understated and close to the introduction.
- If using a real portrait, display it as a crisp circular crop. Do not apply blend modes, feathered masks, or sprite effects to a normal photograph.

### Experience list

Use a compact timeline/list rather than large experience cards:

- Two-column desktop layout: date/period column of approximately `118px`, followed by the role and details.
- Use a `24px` column gap and approximately `28px` between entries.
- Put the period and location in small muted text.
- Put company/organization and role near the top of the content column.
- Describe work through concrete responsibilities, implementation details, and outcomes where known.
- Use short, plain-text highlights with small line markers rather than decorative bullet icons.
- Display technology stacks as small outlined pills only when they help explain the work. Keep them visually secondary.
- Recommendations or testimonials should be understated blockquotes with a thin left border, not prominent quote cards.

### Expertise / skills

- Use a two-column grid on desktop with roughly `28px` vertical and `32px` horizontal gaps.
- Each item should have a short heading and a compact explanation.
- Group skills by capability or work area, not by an exhaustive list of technology logos.
- Avoid progress bars, skill percentages, star ratings, or self-assessed proficiency meters.

### Projects and project details

- Use a simple grid or list with consistent spacing. A work list can use a `28px` gap.
- Project imagery should fill its frame using `object-fit: cover`; avoid arbitrary image distortion.
- Keep project title, role, short description, and relevant metadata easy to scan.
- For project detail pages, use a two-column facts grid where space permits. Labels should be small and muted; values should remain readable.
- Contributions should be a plain list with comfortable line-height and clear spacing between items.
- Explain what the project does, what was implemented, and who it helps. Do not describe a project only by listing its stack.

### Books / curated items

If the existing site has a book or resource shelf, keep the objects visually compact and consistent. Use a `38px` row gap. On screens below `680px`, use a horizontal overflow row with fixed-width items around `174px` rather than squeezing several covers into narrow columns.

### Writing / articles

- Present writing as a simple list or restrained collection, not a news-feed dashboard.
- Article titles should have clear hierarchy; dates and categories should be muted.
- Long-form content should follow the article layout above.
- Links should have a visible underline or another clear affordance, with an underline offset of around `4px`.

### Links, controls, and disclosure text

- Keep controls visually quiet and consistent with the surrounding typography.
- Use visible keyboard focus states. Do not remove outlines without replacing them with an accessible focus indicator.
- Disclosure text, such as demo limitations or project notes, should be small but readable (`0.75rem`, line-height around `1.7`).
- Hover and focus states should usually shift text or border contrast rather than introduce large animations or color fills.

## Responsive behavior

Use the supplied reference breakpoints as starting points:

- At `680px` and below, avoid multi-column book layouts; use a horizontal shelf with approximately `174px` item widths.
- At `440px` and below, stack experience period and content vertically. Collapse expertise and project-facts grids to one column.
- Preserve comfortable horizontal padding on small screens (normally `20px–24px`).
- Prevent long headings, URLs, and metadata from causing horizontal overflow.
- Keep interactive controls large enough to use on touch screens.
- Do not simply scale desktop typography down. Reflow the layout where needed.

## Motion and accessibility

- Keep motion restrained and optional. Respect `prefers-reduced-motion: reduce` and disable nonessential movement when the user requests reduced motion.
- Do not introduce cursor-following effects, animated portraits, star fields, or other decorative motion unless the existing site already has them and they serve a clear purpose.
- Preserve semantic HTML: one primary `h1`, logical section headings, meaningful link text, and appropriate landmarks.
- Provide meaningful alternative text for informative images; use empty alt text for purely decorative images.
- Maintain sufficient contrast between primary, secondary, and muted text in both themes.
- Ensure every interactive element is keyboard-operable and has a visible focus state.
- Do not use color alone to communicate status.

## Implementation guidance for the existing site

1. Inspect the current project structure, global styles, font loading, theme tokens, and reusable components before changing anything.
2. Keep the existing framework and routing. Do not replace the site architecture or introduce a new component library just to achieve this visual style.
3. Map current color variables to the semantic roles in this document. Avoid scattering raw color values across components.
4. Load Bricolage Grotesque and Figtree once at the application/document level. Remove or stop using conflicting primary font declarations such as Roboto or Inter where they override the intended pairing. Keep a sensible system sans-serif fallback.
5. Update shared typography, container widths, spacing, borders, and component primitives first. Then adapt individual pages to those primitives.
6. Replace card-heavy layouts with lists, grids, dividers, and compact metadata where appropriate. Do not flatten components that genuinely need a surface or grouping.
7. Preserve existing page content and functionality. Do not invent biography details, project outcomes, metrics, testimonials, or new features.
8. Check the result at desktop, tablet, and narrow mobile widths. Confirm there is no horizontal overflow and that the reading column remains comfortable.
9. Verify dark and light themes if both are supported, including contrast, borders, form controls, and focus states.
10. Remove obsolete styles only after confirming they are no longer used. Avoid broad CSS rewrites that risk breaking unrelated pages.

## Out of scope

This document defines the visual system and layout patterns. It does not require copying the reference site's customizer, language picker, live clock, cursor-tracking portrait, creative mode, animations, or JavaScript behavior. Implement or retain those features only when they already belong to the existing product requirements.

It also does not authorize changing the site's content, personal identity, project claims, or navigation structure. Those should remain intact unless separately requested.

## Acceptance criteria

- The existing website retains its routes, content, and working interactions.
- Bricolage Grotesque is used for headings and Figtree for body/interface text, loaded from Google Fonts or an equivalent reliable font source.
- The result has a restrained editorial appearance, with a dark near-black primary theme if consistent with the existing theme support.
- Content is organized around narrow reading measures, clear hierarchy, muted metadata, thin dividers, and consistent spacing.
- Experience, expertise, project, article, and resource sections reflow cleanly at the reference breakpoints.
- The design does not rely on excessive cards, gradients, shadows, decorative animation, or generic dashboard patterns.
- Mobile layout, keyboard navigation, reduced-motion preferences, and text contrast are checked before completion.
- No unsupported claims, metrics, or content are added during the redesign.
