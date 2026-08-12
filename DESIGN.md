# Design

## Source of truth
- Status: Implemented
- Last refreshed: 2026-08-12
- Primary product surfaces: Static cigar import tax calculator in `index.html`
- Evidence reviewed: `index.html`, `wireframes.html`

## Brand
- Personality: compact, practical, calculation-first
- Trust signals: visible exchange rates, separated tax lines, conservative wording
- Avoid: marketing layout, decorative visuals, unclear tax assumptions

## Product goals
- Goals: let users estimate Korean cigar import taxes across direct shipping and forwarding-service purchases
- Non-goals: final customs ruling, full import declaration workflow
- Success signals: user can separate item/local costs from Korea-bound shipping and still read one total expected payment

## Personas and jobs
- Primary personas: Korean cigar buyers estimating overseas direct-purchase tax
- User jobs: enter weight, total paid amount, and 50-stick status; read estimated taxes
- Key contexts of use: mobile-first, quick check before purchase

## Information architecture
- Primary navigation: none
- Core routes/screens: single calculator screen
- Content hierarchy: purchase mode, inputs, total expected payment, threshold basis, tax breakdown

## Design principles
- Principle 1: Separate inputs only where they materially change the 150 USD threshold or taxable value
- Principle 2: Tax assumptions should appear near the affected input/result
- Principle 3: The final total expected payment is the primary result; tax total is supporting detail
- Tradeoffs: extra shipping fields add friction but avoid overstating the 150 USD threshold when Korea-bound shipping is separable

## Visual language
- Color: thermal-paper ivory, graphite ink, and restrained neutral grays
- Typography: dense mobile-readable Korean labels
- Spacing/layout rhythm: two-column desktop, stacked mobile
- Shape/radius/elevation: receipt-like dashed rules, square input fields, and one restrained paper shadow
- Motion: none beyond button hover
- Dark mode: supported through `prefers-color-scheme: dark`; preserve the same hierarchy with dark ink surfaces and muted teal accents
- Imagery/iconography: none required

## Components
- Existing components to reuse: finance panel, input panel, result panel, action buttons
- New/changed components: direct/forwarding mode selector, goods/local-cost amount field, Korea-bound shipping field with a weight-based US forwarding estimate
- Variants and states: loading exchange rates, invalid numeric input, result visible
- Token/component ownership: single-file CSS variables in `index.html`

## Accessibility
- Target standard: practical keyboard and readable contrast
- Keyboard/focus behavior: native inputs, select, checkbox, buttons
- Contrast/readability: preserve current dark text on light surfaces
- Screen-reader semantics: keep label-for associations
- Reduced motion and sensory considerations: no required animation

## Responsive behavior
- Supported breakpoints/devices: mobile phones and narrow desktop
- Layout adaptations: input grid becomes one column below 480px
- Touch/hover differences: large touch targets, hover only decorative

## Interaction states
- Loading: exchange rate cards show loading text
- Empty: result panel hidden until calculation
- Error: invalid numeric input message
- Success: result panel displays separated taxes
- Disabled: share button disables during capture
- Offline/slow network: exchange rate failure message

## Content voice
- Tone: direct, practical Korean
- Terminology: use "상품가+현지비용" or "상품가+현지배송비" for threshold basis and "한국 배송비" for Korea-bound international shipping; mark weight-derived forwarding charges as estimates
- Microcopy rules: assumptions must be short and adjacent to fields

## Implementation constraints
- Framework/styling system: single static HTML file
- Design-token constraints: use existing CSS variables
- Performance constraints: no build step or new dependency
- Compatibility constraints: browser-native controls
- Test/screenshot expectations: static HTTP preview and calculation smoke checks

## Selected Layout
- D, thermal receipt:
  `[Header/currency] -> [Primary total] -> [Purchase mode and inputs] -> [Tax detail]`
- HTML preview: `ui-samples-v2.html#d`
