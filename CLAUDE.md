# CarbonLoop — Frontend Engineering & Design System Instructions

## 0. PRIMARY OBJECTIVE

CarbonLoop must NOT look AI-generated, template-generated, or like a generic SaaS website.

The frontend should feel intentionally designed by a human product designer and frontend engineer who understand visual hierarchy, typography, interaction, spacing, composition, and visual storytelling.

The goal is NOT:

"Make a modern website."

The goal is:

"Build a distinctive, coherent, memorable interface whose visual decisions feel intentional and specific to CarbonLoop."

Prioritize:

1. Product clarity
2. Visual identity
3. Typography
4. Layout and composition
5. Interaction quality
6. Motion
7. Micro-details
8. Decorative effects

Do NOT reverse this order.

A beautiful interface with weak hierarchy is still bad UI.

The existing project may contain an existing frontend, but the existing frontend is NOT automatically the design reference.

When the user requests a new frontend, treat the existing application primarily as a source of functionality, architecture, APIs, data models, authentication, and technical constraints.

The frontend may be redesigned from scratch.


# 1. MANDATORY WORKFLOW

## IMPORTANT

NEVER immediately start generating a major frontend implementation.

For a new frontend, first understand the application and then develop the visual direction.

For an existing frontend modification, first analyze the current implementation before changing it.

The default workflow is:

DISCOVER → DEFINE → CONCEPT → STRUCTURE → IMPLEMENT → REVIEW


## Phase 1 — DISCOVER

Before writing substantial frontend code, inspect the repository.

Inspect:

- package.json
- existing dependencies
- framework and routing
- app/page structure
- layout files
- globals.css
- Tailwind configuration
- existing components
- existing design tokens
- existing fonts
- existing animation utilities
- existing reusable UI components
- responsive breakpoints
- API routes
- backend functionality
- authentication
- database/data models when relevant
- existing assets
- environment/configuration relevant to frontend functionality

Determine:

- what functionality already exists
- what APIs the frontend must consume
- what data structures must remain compatible
- what authentication flows exist
- what user flows exist
- what backend code must remain untouched
- which frontend code can safely be replaced
- which utilities/components are technically useful


## Phase 2 — DEFINE

Separate the project into:

### MUST PRESERVE

Functionality, APIs, authentication, data contracts, backend behavior, and other technical requirements that the new frontend depends on.

### CAN REPLACE

Existing frontend layouts, styling, visual components, page composition, animations, and other presentation-layer decisions unless explicitly required otherwise.

### DO NOT TOUCH

Backend functionality, database logic, API contracts, authentication logic, or unrelated project infrastructure unless explicitly requested.

The existing frontend is a technical reference, not necessarily a design reference.


## Phase 3 — CONCEPT

Before implementing a completely new frontend, establish a visual direction.

Analyze what CarbonLoop should communicate through:

- typography
- color
- composition
- imagery
- motion
- interaction
- spacing
- visual rhythm

Develop 2–3 genuinely different visual directions for substantial greenfield frontend work.

Each direction should explain:

- overall visual character
- typography direction
- color approach
- layout/composition style
- component language
- motion language
- imagery direction
- why the direction fits CarbonLoop

Do NOT generate three superficial variations of the same SaaS design.

Do NOT begin implementation until the design direction has been selected when the user has explicitly asked for a design-first workflow.


## Phase 4 — STRUCTURE

After the visual direction is selected, establish the information architecture.

Determine:

- page hierarchy
- navigation structure
- section order
- content hierarchy
- primary and secondary actions
- responsive behavior
- component relationships

Do not immediately code the entire website blindly.

For substantial pages, establish the composition section-by-section first.


## Phase 5 — IMPLEMENT

Implement the selected direction using the existing project architecture.

Prefer:

- reusable components
- semantic HTML
- design tokens
- composable primitives
- existing APIs
- existing functionality

Do not rewrite backend functionality while implementing frontend work unless explicitly requested.

Do not introduce unrelated dependencies.

Do not modify unrelated files.

Build the smallest coherent implementation that fully expresses the selected design direction.


## Phase 6 — REVIEW

After implementation, critically review the result.

Check:

- hierarchy
- typography
- spacing
- composition
- color
- component consistency
- responsiveness
- accessibility
- animation
- performance
- visual identity

Then perform the Anti-AI Review defined below.

If something feels generic, over-designed, or unnecessary, fix it before finishing.


# 2. TECHNOLOGY & LIBRARIES

Use the project's existing stack whenever possible.

Do not add dependencies casually.

Before installing any library, determine:

1. Whether the project already has a solution.
2. Whether the requirement can be solved with CSS.
3. Whether an existing utility can solve it.
4. Whether the dependency provides meaningful capability.
5. Whether the added complexity is justified.


## Approved animation stack

### PRIMARY — Motion

Use `motion` for normal UI animation.

Good use cases:

- component entrance animations
- hover interactions
- layout transitions
- staggered reveals
- modal/dialog transitions
- small UI state transitions
- spring interactions
- shared layout animation

Prefer Motion whenever it can cleanly solve the problem.


### SECONDARY — GSAP

Use GSAP only when Motion is not the appropriate tool.

Good use cases:

- complex animation timelines
- advanced scroll-driven sequences
- coordinated multi-element timelines
- advanced SVG animation
- highly controlled cinematic sequences

Do NOT introduce GSAP merely because it is powerful.

If Motion can accomplish the interaction cleanly, use Motion.


### SMOOTH SCROLLING — Lenis

Use Lenis only when smooth scrolling materially improves the experience.

Do NOT add smooth scrolling automatically.

Do not make the website feel artificially floaty.

Do not use smooth scrolling as a substitute for good layout and interaction.


### ICONS — Lucide

Use `lucide-react` when an interface icon is genuinely necessary.

Do not use icons merely to fill empty space.

Do not mix multiple icon libraries without a specific reason.

Do not use emoji as interface icons.


## Do NOT automatically install:

- Three.js
- React Three Fiber
- GSAP
- particle libraries
- cursor-follow libraries
- magnetic button libraries
- parallax libraries
- shader libraries
- unnecessary UI component libraries

These should only be introduced when a specific design requirement justifies them.


# 3. ANIMATION PHILOSOPHY

Animation should communicate something.

Every significant animation must have at least one purpose:

- hierarchy
- continuity
- feedback
- orientation
- state change
- emphasis
- discovery
- spatial relationship

If an animation has no purpose, remove it.

Animation should support the design rather than become the design.


## Preferred motion

Use:

- subtle translation
- opacity transitions
- restrained scale
- clip-path reveals
- staggered text/image entrances
- layout transitions
- spring-based interactions
- subtle blur transitions
- masked image reveals
- controlled scroll-linked movement


## Avoid

Do NOT create:

- everything-fades-in-on-scroll websites
- constant parallax
- floating blobs
- endless particles
- bouncing buttons
- excessive 3D
- random rotations
- excessive scale animations
- animation on every card
- animation on every word
- perpetual movement
- cursor-follow effects everywhere
- unnecessary page-transition theatrics


## Timing

Typical UI interaction:

150–250ms

Small reveal:

250–450ms

Large section transition:

400–800ms

Cinematic sequence:

800ms+

These are guidelines, not mandatory values.

Motion should feel appropriate to the element and interaction.


## Easing

Prefer natural easing.

Use springs where physical interaction makes sense.

Avoid exaggerated elastic or bouncy animation unless it is intentionally part of CarbonLoop's visual identity.


## Reduced motion

Always respect:

`prefers-reduced-motion`

Users who disable motion must still receive a complete and coherent experience.


# 4. ANTI-AI DESIGN RULES

This section is extremely important.

Avoid visual patterns that make the site immediately recognizable as AI-generated.

Do NOT default to:

- giant centered hero sections
- gradient text
- purple-blue gradient backgrounds
- glowing blobs
- glassmorphism everywhere
- excessive rounded cards
- huge pill buttons
- generic dashboard cards
- identical three-column feature sections
- excessive shadows
- floating UI cards
- random decorative circles
- generic SaaS illustrations
- excessive whitespace with no compositional purpose
- meaningless "Trusted by" sections
- meaningless statistics
- excessive badges
- arbitrary line-art icons
- excessive gradients
- excessive `backdrop-filter`
- giant typography without purpose
- generic dark-mode neon aesthetics
- default Tailwind-looking layouts
- excessive use of rounded rectangles


## Section composition

Do not make every section follow:

Heading
↓
Paragraph
↓
Three cards
↓
Button

Break visual rhythm intentionally.

Consider:

- asymmetric compositions
- editorial layouts
- overlapping elements
- full-width sections
- constrained reading widths
- intentional whitespace
- image-led compositions
- unexpected alignment
- strong typographic moments
- horizontal compositions
- vertical rhythm
- visual interruptions
- changes in density
- changes in scale

Do not introduce asymmetry merely for novelty.

Every unusual composition should improve communication or visual identity.


# 5. VISUAL IDENTITY

CarbonLoop should have a recognizable visual language.

Do not treat every section as an isolated design.

Maintain consistency across:

- colors
- typography
- spacing
- radii
- borders
- shadows
- buttons
- cards
- motion
- iconography
- imagery
- interaction states

A new section should feel like it belongs to the same product.


# 6. COLOR SYSTEM

Use a limited palette.

Define semantic tokens rather than scattering raw colors throughout components.

Preferred conceptual tokens:

```text
background
background-secondary
surface
surface-elevated
foreground
foreground-secondary
foreground-muted
border
accent
accent-hover
success
warning
error
```

Do not introduce a new color because it merely "looks nice."

Before adding a color, determine whether an existing token can fulfill the role.

## Color rules

- Avoid unnecessary gradients.
- Avoid neon colors unless explicitly part of the brand.
- Avoid pure black/white everywhere unless intentional.
- Maintain sufficient contrast.
- Accent colors should have hierarchy.
- Semantic colors should communicate meaning consistently.
- Do not use color as decoration when it could improve hierarchy instead.

The interface should remain recognizable even if decorative effects are removed.


# 7. TYPOGRAPHY

Typography is one of the primary design elements.

Do NOT automatically use:

- Inter
- Roboto
- Arial
- system-ui

Use the project's existing typography if one exists.

If selecting fonts, choose them based on CarbonLoop's identity rather than current trends.

Typography should be treated as part of the visual identity, not as a final styling detail.


## Hierarchy

Every page should establish:

- display
- heading
- subheading
- body
- metadata
- labels
- interactive text

Do not use font size alone to establish hierarchy.

Use:

- weight
- line-height
- letter-spacing
- width
- spacing
- contrast


## Rules

- Headings should have controlled line lengths.
- Body text should remain comfortably readable.
- Avoid excessive uppercase text.
- Avoid excessive letter spacing.
- Avoid giant headings simply to make the page appear impressive.
- Use typography to establish rhythm between sections.
- Do not use too many font families.
- Font choices should remain consistent across the product.


# 8. LAYOUT & COMPOSITION

Do not treat the page as a stack of rectangular containers.

Think in terms of composition.

Use:

- intentional alignment
- visual rhythm
- negative space
- section density
- contrast
- focal points
- hierarchy
- repetition with variation


## Grid

Use a consistent grid.

However, do not force every section into identical columns.

A section can intentionally break the grid when the content benefits from it.


## Width

Avoid making everything full-width.

Use meaningful reading widths.

Long text should not stretch unnecessarily across the viewport.


## Spacing

Spacing should follow a system.

Avoid arbitrary values such as:

- 13px
- 27px
- 43px
- 67px

unless there is a specific design reason.

Prefer consistent spacing tokens with deliberate exceptions.


# 9. COMPONENT ARCHITECTURE

Before creating a component, search for an existing component that already solves the problem.

Prefer:

```text
composition > duplication
```

Do not create:

```text
Card
Card2
CardNew
PremiumCard
ModernCard
FeatureCard
```

when one composable component would work.


## Components should:

- have one clear responsibility
- accept meaningful props
- remain composable
- avoid unnecessary abstraction
- avoid visual duplication
- follow existing project conventions


## Do not over-abstract

Not every `<div>` needs a component.

Not every text style needs a component.

Not every section needs its own abstraction.

Create components when they improve:

- reuse
- readability
- maintainability
- consistency


# 10. BUTTONS & INTERACTIONS

Buttons should have clear hierarchy.

Primary actions should be visually distinct.

Secondary actions should not compete with primary actions.

Avoid turning every clickable element into a giant pill.


## Hover states

Prefer subtle changes:

- background
- border
- color
- slight translation
- controlled scale
- icon movement

Avoid:

- dramatic scaling
- excessive glow
- random rotations
- huge shadows
- bouncing


## Interaction principle

Interactive elements should provide clear feedback.

The user should understand:

- what is clickable
- what changed
- what is active
- what is loading
- what succeeded
- what failed


# 11. CARDS

Cards are not the default answer to every piece of content.

Before using a card ask:

"Does this content actually need containment?"

Use cards when grouping or separation improves comprehension.

Avoid:

- card grids everywhere
- excessive rounded corners
- excessive shadows
- identical card structures
- cards inside cards without a clear reason

Not everything should look like a dashboard.


# 12. IMAGES & VISUAL ASSETS

Prefer meaningful imagery over decorative imagery.

Do not add stock-looking imagery merely to fill space.

Do not use random abstract blobs.

Images should contribute to:

- storytelling
- hierarchy
- context
- branding
- comprehension

Maintain consistent image treatment where appropriate.

Use:

- intentional aspect ratios
- deliberate cropping
- masks
- framing
- controlled image density

Do not let imagery overpower important information.


# 13. RESPONSIVE DESIGN

Mobile is NOT the desktop layout compressed.

Design mobile intentionally.

Always consider:

- navigation
- typography scale
- section spacing
- content order
- touch targets
- image cropping
- animation
- horizontal overflow
- interaction density


## Breakpoints

Use the project's existing breakpoint system.

Do not create custom breakpoints unless necessary.


## Mobile rules

On mobile:

- simplify rather than merely shrink
- reduce decorative motion
- preserve hierarchy
- maintain readable line lengths
- avoid unintended horizontal scrolling
- ensure touch targets are comfortable
- prevent text collisions
- preserve important visual relationships
- reconsider section composition where necessary

A desktop layout should not simply collapse into a vertical list.


## Consider these viewport widths

320px
375px
390px
768px
1024px
1280px+
1440px+

Do not assume desktop responsiveness will happen automatically.


# 14. ACCESSIBILITY

All UI must remain usable without animation.

Ensure:

- keyboard navigation
- visible focus states
- semantic HTML
- appropriate button/link usage
- sufficient contrast
- accessible labels
- reduced-motion support
- logical heading hierarchy
- meaningful alt text where applicable

Do not sacrifice accessibility for aesthetics.


# 15. PERFORMANCE

Do not add visual effects that create unnecessary performance costs.

Avoid:

- excessive blur
- huge box shadows
- unnecessary canvas animations
- expensive scroll listeners
- continuous layout calculations
- unnecessary re-renders
- large animation libraries for tiny interactions

Prefer transform/opacity animations.

Avoid animating layout properties when possible.

Use GPU-friendly properties where appropriate.


# 16. CODE QUALITY

Before adding code:

- inspect existing conventions
- follow existing naming
- follow existing folder structure
- reuse existing utilities
- reuse existing tokens

Do not rewrite unrelated code.

Do not modify backend functionality while working on frontend styling unless explicitly requested.

Do not introduce unrelated dependencies.

Do not silently change APIs.

Do not silently change data structures.

Keep changes scoped.


# 17. DESIGN DECISION PRIORITY

When multiple solutions are possible, prioritize:

1. Clarity
2. Product identity
3. Consistency
4. Accessibility
5. Responsiveness
6. Performance
7. Interaction quality
8. Visual novelty

Novelty is NOT more important than usability.


# 18. BEFORE INSTALLING A LIBRARY

Before installing any dependency:

Ask:

1. Does the project already have a solution?
2. Can this be solved with CSS?
3. Can an existing utility solve it?
4. Is the dependency justified by the interaction?
5. Does it add meaningful capability?
6. Will it increase maintenance or bundle complexity unnecessarily?

Preferred hierarchy:

CSS
↓
Existing project utilities
↓
Motion
↓
GSAP for advanced timelines
↓
Specialized libraries only when genuinely justified

Do not install libraries simply because they are popular.


# 19. VISUAL REVIEW CHECKLIST

After completing a significant frontend change, inspect:


## Composition

- Is the hierarchy obvious?
- Is the focal point clear?
- Is the layout visually interesting without being chaotic?
- Is there enough variation between sections?
- Does the page have a recognizable visual rhythm?


## Typography

- Is the heading hierarchy strong?
- Are line lengths reasonable?
- Are font weights intentional?
- Is text too large or too small?
- Does typography contribute to the product identity?


## Color

- Is the palette coherent?
- Are accents overused?
- Are gradients necessary?
- Is contrast sufficient?
- Are semantic colors consistent?


## Components

- Are there too many cards?
- Are components visually repetitive?
- Are borders/radii consistent?
- Are there unnecessary abstractions?


## Motion

- Does animation serve a purpose?
- Is anything moving unnecessarily?
- Does the page still work with reduced motion?
- Are transitions too slow or dramatic?


## Responsive

- Does mobile feel designed?
- Does anything overflow?
- Are touch targets sufficient?
- Does typography remain readable?
- Does content order make sense?


## Anti-AI

Ask:

"Could someone identify this as an AI-generated website from a screenshot?"

If yes, identify why.

Then fix the actual cause rather than adding more decoration.


# 20. DO NOT "POLISH" BY ADDING MORE

When a design feels weak, do NOT automatically add:

- gradients
- animations
- shadows
- glass
- particles
- blobs
- icons
- 3D
- floating elements

First attempt:

1. Better typography
2. Better spacing
3. Better hierarchy
4. Better composition
5. Better contrast
6. Better imagery
7. Better interaction

Only then consider additional visual effects.

The solution to weak design is usually better design, not more effects.


# 21. GREENFIELD FRONTEND RULE

CarbonLoop may contain an existing implementation, but the frontend may be completely replaced when the user requests a new frontend.

When building a new frontend:

1. Inspect the existing project first.
2. Understand the functionality before designing.
3. Identify APIs, data structures, authentication, and backend contracts that must remain compatible.
4. Identify frontend code that can be replaced.
5. Treat existing frontend styling as optional reference material.
6. Develop a new visual direction independently.
7. Establish typography, color, layout, component, and motion systems before implementing the full interface.
8. Reuse existing functionality where appropriate.
9. Do not rewrite backend functionality unless explicitly requested.
10. Do not blindly copy existing UI patterns.
11. Do not generate the entire frontend without first understanding the application.

The existing frontend is a technical reference, not necessarily a design reference.


# 22. GREENFIELD DESIGN PROCESS

For a completely new frontend, follow:

DISCOVER
→ DEFINE
→ CONCEPT
→ STRUCTURE
→ IMPLEMENT
→ REVIEW


## DISCOVER

Understand:

- project architecture
- functionality
- APIs
- authentication
- data
- user flows
- technical constraints


## DEFINE

Determine:

- product personality
- visual identity
- typography
- color
- layout principles
- interaction principles
- motion language


## CONCEPT

Develop 2–3 genuinely distinct visual directions.

Do not produce superficial variations of the same generic SaaS layout.


## STRUCTURE

Create:

- information architecture
- page hierarchy
- section order
- component relationships
- responsive strategy


## IMPLEMENT

Build the frontend using the selected direction.

Do not blindly generate every page simultaneously.

Implement coherent sections and verify them as the system develops.


## REVIEW

Perform:

- visual hierarchy review
- responsive review
- accessibility review
- performance review
- animation review
- component consistency review
- anti-AI review


Do not skip directly from DISCOVER to IMPLEMENT.


# 23. VAGUE DESIGN REQUESTS

If the user says:

"make it better"
"make it premium"
"make it modern"
"make it look good"
"make it more aesthetic"
"make it insane"
"make it cooler"

Do NOT interpret this as permission to add generic modern SaaS styling.

Instead:

1. inspect the relevant implementation
2. understand the existing visual language if one exists
3. identify the weakest visual decisions
4. determine what the product needs
5. make targeted improvements
6. preserve strong decisions when modifying an existing UI
7. create a new direction when explicitly asked for a greenfield frontend


# 24. DESIGN REFERENCES

When the user provides visual references:

Use them to understand:

- typography principles
- spacing principles
- composition
- interaction patterns
- color relationships
- motion language
- visual density

Do NOT blindly copy:

- exact layouts
- exact assets
- exact branding
- exact copy
- distinctive proprietary design elements

References are for extracting design principles.

The final result should feel like CarbonLoop.


# 25. FINAL PRINCIPLE

The strongest implementation is usually not the one with the most effects.

It is the one where every visible decision feels intentional.

Before finishing any frontend task, ask:

"Would a competent human designer have a reason for every major visual decision here?"

If the answer is no, simplify or redesign it.

Build CarbonLoop as a product with an identity,
not as a collection of impressive UI components.