---
name: frontend-polish
description: Design and implement distinctive CarbonLoop frontends from scratch or improve existing frontend UI without generic AI-generated aesthetics. Use for frontend design, page creation, redesign, visual polish, animation, responsive UI, and interaction work.
---

# CarbonLoop Frontend Design Skill

## Purpose

Create frontend experiences for CarbonLoop that feel intentionally designed,
distinctive, coherent, and product-specific.

This skill is primarily intended for GREENFIELD FRONTEND DEVELOPMENT.

The existing application may provide:

- APIs
- authentication
- database structures
- data models
- business logic
- utilities
- assets
- technical constraints

These should be understood and respected.

The existing frontend is NOT automatically the design reference.

When the user asks for a new frontend, design it from scratch.


# 1. REQUIRED WORKFLOW

Always follow:

DISCOVER
→ DEFINE
→ CONCEPT
→ STRUCTURE
→ IMPLEMENT
→ REVIEW

Do not skip directly from DISCOVER to IMPLEMENT for substantial frontend work.


## DISCOVER

Before writing substantial frontend code, inspect the relevant project.

Understand:

- framework
- routing
- package.json
- existing dependencies
- APIs
- backend functionality
- authentication
- data models
- user flows
- existing assets
- existing frontend structure
- styling system
- available animation libraries
- existing utilities
- existing reusable components

Determine what MUST remain functional.

Determine:

- what must be preserved
- what can be replaced
- what should not be touched
- what existing utilities are actually worth keeping

Do not modify backend behavior simply to make frontend implementation easier.


## DEFINE

Establish the design language before implementation.

Determine:

### Product personality

Ask:

- What should CarbonLoop feel like?
- What emotion should the interface create?
- What makes the product different?
- What visual language supports that difference?

### Typography

Determine:

- display type
- heading type
- body type
- metadata type
- weight hierarchy
- line-height
- letter-spacing

### Color

Determine:

- background
- foreground
- secondary surfaces
- borders
- accent
- semantic states

### Composition

Determine:

- grid
- section density
- whitespace
- alignment
- visual rhythm
- focal points
- image treatment


# 2. CONCEPT DEVELOPMENT

For substantial greenfield work, develop 2–3 genuinely different visual
directions before implementation.

Do NOT generate three superficial variations of:

"big hero + cards + CTA."

Each direction should differ meaningfully in:

- composition
- typography
- visual density
- color relationships
- interaction
- motion

For each direction explain:

- visual character
- typography
- color
- composition
- component language
- animation language
- interaction language
- imagery direction
- why it fits CarbonLoop

Do NOT start implementation until the user has selected a direction when
the user has explicitly requested a design-first workflow.

The concepts should be practical enough to implement in the existing project.


# 3. INFORMATION ARCHITECTURE

After the visual direction is selected, determine the page structure.

Think in terms of information hierarchy rather than component count.

For each page identify:

- primary objective
- primary action
- secondary actions
- information hierarchy
- section sequence
- visual focal points
- responsive behavior

Do not add sections simply because common SaaS websites have them.

Every major section should have a clear product or communication purpose.


# 4. COMPOSITION

Do not build every page as a collection of cards.

Use a mixture of:

- editorial layouts
- asymmetric layouts
- full-width sections
- constrained content
- image-led sections
- typographic sections
- horizontal compositions
- overlapping elements
- dense information sections
- intentionally sparse sections

Variation should create rhythm.

Do not introduce asymmetry merely to appear creative.

Do not make every section look visually unrelated.

The entire page must still feel like one coherent product.


# 5. COMPONENT STRATEGY

Build a coherent component system.

Prefer:

composition
over
duplication

Before creating a new component:

1. Search for an existing component.
2. Determine whether it can be reused.
3. Determine whether it can be extended.
4. Only then create a new component.

Avoid duplicate components such as:

- Card
- FeatureCard
- PremiumCard
- ModernCard
- InfoCard

when one composable primitive can handle the use cases.

Do not over-abstract.

Not every element needs to become a component.

Create abstractions when they improve:

- reuse
- consistency
- readability
- maintainability


# 6. DESIGN TOKENS

Establish shared tokens before building many pages.

At minimum consider:

- colors
- spacing
- typography
- radius
- borders
- shadows
- motion timing

Prefer semantic names.

Example:

```text
background
surface
surface-elevated
foreground
foreground-muted
border
accent
accent-hover
success
warning
error
```

Do not scatter arbitrary visual values throughout components.

Do not introduce new colors, radii, shadows, or spacing values without a
design reason.


# 7. TYPOGRAPHY-FIRST DESIGN

Typography should be established early.

Do not leave typography until the end.

Use typography to establish:

- hierarchy
- rhythm
- personality
- emphasis
- reading width

Avoid defaulting to Inter, Roboto, Arial, or another generic font without
considering the visual identity.

Do not use giant headings merely to make the website look impressive.

Do not use excessive uppercase text.

Do not use excessive letter spacing.

Typography should feel intentional across every page.


# 8. DEPENDENCY & ANIMATION STACK

Do not install frontend libraries preemptively.

Before adding a dependency:

1. Inspect `package.json`.
2. Check whether the project already provides an equivalent capability.
3. Determine whether CSS or existing utilities can solve the requirement.
4. Confirm that the selected design direction actually requires the dependency.
5. Install only the smallest set of libraries needed for the implementation.

Do NOT install animation or UI libraries during the initial
discovery/concept phase.

The existence of an approved library does NOT mean it must be used.


## Approved animation hierarchy

Use this order of preference:

1. CSS
2. `motion`
3. `gsap` for genuinely advanced timelines
4. `lenis` only when smooth scrolling is an intentional part of the design
5. Specialized libraries only when a specific design requirement justifies them


## Motion

`motion` is the default animation library for CarbonLoop.

Use it when CSS alone is insufficient for:

- component entrance animations
- layout transitions
- staggered reveals
- interactive states
- spring interactions
- shared layout transitions
- coordinated component animation

Do not install `motion` until an actual implementation requirement exists.

Do not use animation simply because the library is available.


## GSAP

Do NOT install GSAP by default.

Only introduce GSAP when the selected design direction requires capabilities
such as:

- complex animation timelines
- advanced scroll-driven sequences
- coordinated multi-element choreography
- complex SVG animation
- cinematic sequences

If `motion` can implement the interaction cleanly, prefer `motion`.


## Lenis

Do NOT install Lenis by default.

Only introduce Lenis when smooth scrolling is an intentional part of the
approved visual direction and materially improves the experience.

Do not add smooth scrolling merely because it is popular on design-heavy
websites.


## Icons

Use `lucide-react` when interface icons are genuinely required.

Do NOT install an icon library merely to decorate the interface.

If icons are needed:

- use one consistent icon system
- use icons only where they communicate meaning
- avoid replacing meaningful typography or content with icons
- do not use emoji as interface icons

Install `lucide-react` only when the implementation actually requires it.


## Explicitly avoid preemptive installation

Do NOT install:

- `framer-motion`
- Three.js
- React Three Fiber
- particle libraries
- cursor-follow libraries
- magnetic button libraries
- parallax libraries
- shader libraries
- additional UI component libraries

unless a specific, approved design requirement makes one necessary.

The implementation should justify the dependency.


# 9. MOTION DESIGN

Before adding an animation, identify its purpose.

Valid purposes include:

- hierarchy
- feedback
- continuity
- orientation
- emphasis
- discovery
- spatial relationships
- state change

If no purpose exists, do not add the animation.


## Preferred

Use:

- subtle transforms
- opacity
- clip-path
- masks
- staggered reveals
- layout transitions
- spring interactions
- controlled scroll-linked motion


## Avoid

Do NOT create:

- everything-fades-in websites
- excessive parallax
- floating blobs
- random particles
- perpetual movement
- bouncing UI
- excessive scale
- random rotation
- excessive cursor effects
- animation on every card
- animation on every word
- animation on every scroll event


## Timing

Use timing appropriate to the interaction.

Typical ranges:

- small UI interaction: 150–250ms
- small reveal: 250–450ms
- large section transition: 400–800ms
- cinematic sequence: 800ms+

These are guidelines, not rigid requirements.

Use natural easing.

Use springs where physical interaction makes sense.

Avoid exaggerated bounce or elastic effects unless they are deliberately
part of CarbonLoop's visual identity.


## Reduced motion

Respect:

`prefers-reduced-motion`

Users who disable motion must still receive a complete and coherent
experience.


# 10. ANTI-AI DESIGN PASS

Every major frontend implementation must undergo an Anti-AI Review.

Look specifically for:

- generic SaaS hero sections
- giant centered hero layouts
- purple/blue gradients
- gradient text
- excessive glassmorphism
- excessive rounded cards
- huge pill buttons
- repetitive card grids
- generic dashboards
- excessive shadows
- floating decorative blobs
- random circles
- meaningless statistics
- excessive badges
- excessive icons
- generic illustrations
- excessive whitespace
- excessive animation
- default Tailwind appearance
- visually repetitive sections
- unnecessary decorative effects

Do not fix these problems by adding more decoration.

Fix the underlying:

- typography
- hierarchy
- spacing
- composition
- color
- interaction
- content structure


# 11. COLOR

Use a controlled palette.

Prefer semantic tokens.

Do not introduce a new color because it merely looks attractive.

Avoid:

- unnecessary gradients
- neon accents without brand justification
- excessive accent colors
- random colored decorations

Color should establish hierarchy and meaning.

The interface should still look coherent if decorative effects are removed.


# 12. RESPONSIVE DESIGN

Design responsive behavior intentionally.

Do not simply allow desktop layouts to collapse.

Consider:

- 320px
- 375px
- 390px
- 768px
- 1024px
- 1280px
- 1440px+

For mobile:

- simplify composition
- preserve hierarchy
- reconsider content order
- reduce decorative motion
- maintain readable typography
- avoid accidental horizontal overflow
- maintain comfortable touch targets
- prevent text collisions

Mobile should feel like a deliberate design, not a compressed desktop page.


# 13. ACCESSIBILITY

Maintain:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- accessible labels
- logical heading hierarchy
- meaningful alt text
- reduced-motion support
- correct button/link semantics

Do not sacrifice accessibility for aesthetics.


# 14. PERFORMANCE

Prefer performant techniques.

Prioritize:

- transform
- opacity
- CSS transitions
- efficient animation
- lazy loading where appropriate
- efficient component rendering

Avoid unnecessary:

- canvas animation
- continuous scroll calculations
- expensive blur
- huge shadows
- unnecessary re-renders
- large dependencies for small effects

Do not add a visually impressive effect if its performance cost is
disproportionate to its value.


# 15. GREENFIELD IMPLEMENTATION RULE

When building from scratch:

DO NOT:

- copy the existing frontend
- reproduce the same section structure automatically
- assume existing styling is correct
- rebuild backend functionality
- install unnecessary libraries
- generate the entire UI without validating the design direction

DO:

1. Understand the application.
2. Identify preserved functionality.
3. Establish the visual direction.
4. Establish the design system.
5. Establish the page structure.
6. Build reusable primitives.
7. Implement sections.
8. Verify functionality.
9. Review visually.
10. Perform the Anti-AI pass.
11. Test responsive behavior.


# 16. EXISTING FRONTEND MODIFICATION

When the user explicitly asks to modify an existing frontend:

1. Inspect the current implementation.
2. Identify what is strong.
3. Identify what is weak.
4. Preserve intentional design decisions.
5. Reuse existing components where appropriate.
6. Modify only what is necessary.
7. Perform the Anti-AI review afterward.

Do not rebuild the application unnecessarily.

If the user explicitly requests a complete redesign, switch to the
greenfield workflow instead.


# 17. DESIGN REFERENCES

When visual references are provided:

Extract principles from them:

- typography
- composition
- spacing
- color
- visual density
- interaction
- motion

Do not blindly reproduce:

- exact layouts
- exact branding
- exact copy
- proprietary assets
- distinctive design elements

The result should feel like CarbonLoop, not like a clone of the reference.


# 18. VAGUE REQUESTS

If the user says:

"make it better"
"make it premium"
"make it modern"
"make it aesthetic"
"make it cooler"
"make it insane"

Do not automatically add:

- gradients
- glassmorphism
- 3D
- particles
- blobs
- excessive animations

First identify what actually needs improvement.

Prioritize:

1. Typography
2. Layout
3. Hierarchy
4. Spacing
5. Color
6. Imagery
7. Interaction
8. Animation
9. Decoration


# 19. IMPLEMENTATION DISCIPLINE

Do not blindly generate the entire application in one pass.

For substantial pages:

1. Establish the page structure.
2. Build the major visual sections.
3. Verify the hierarchy.
4. Add interactions.
5. Add motion where justified.
6. Test responsive behavior.
7. Review the complete page.

Keep frontend changes scoped.

Do not:

- modify unrelated files
- silently change APIs
- silently change data structures
- rewrite backend logic
- add unrelated dependencies
- create unnecessary abstractions


# 20. FINAL REVIEW

Before considering a significant frontend task complete, perform all of
the following.


## Visual

- Is the hierarchy obvious?
- Is the composition intentional?
- Is there visual rhythm?
- Does the page have personality?
- Does it feel specific to CarbonLoop?


## Typography

- Is the typography distinctive?
- Is hierarchy clear?
- Are line lengths appropriate?
- Are font weights intentional?
- Does typography contribute to identity?


## Color

- Is the palette coherent?
- Are accents restrained?
- Is contrast sufficient?
- Are semantic colors consistent?


## Components

- Are there unnecessary cards?
- Are components duplicated?
- Is the system coherent?
- Are radii, borders, and spacing consistent?


## Motion

- Does every significant animation have a purpose?
- Is anything moving unnecessarily?
- Is the animation too slow or dramatic?
- Does reduced motion work correctly?


## Responsive

- Does mobile feel intentionally designed?
- Is anything overflowing?
- Are touch targets usable?
- Does content order make sense?
- Does typography remain readable?


## Accessibility

- Can the page be navigated with a keyboard?
- Are focus states visible?
- Are controls correctly labeled?
- Is the heading hierarchy logical?
- Is contrast sufficient?


## Performance

- Are expensive effects justified?
- Are animations efficient?
- Are unnecessary dependencies avoided?
- Are there unnecessary renders or listeners?


## Anti-AI

Ask:

"Could this website be mistaken for a generic AI-generated website?"

If yes:

1. Identify the exact cause.
2. Determine whether the problem is hierarchy, typography, composition,
   spacing, color, components, or decoration.
3. Fix the underlying issue.
4. Do NOT simply add more effects.


# 21. FINAL PRINCIPLE

Do not optimize for:

"How much can we put on the page?"

Optimize for:

"How intentional does every decision feel?"

CarbonLoop should have:

- a recognizable identity
- strong typography
- deliberate composition
- meaningful interaction
- restrained motion
- coherent responsive behavior

The objective is not to impress through effects.

The objective is to create a frontend that feels designed.