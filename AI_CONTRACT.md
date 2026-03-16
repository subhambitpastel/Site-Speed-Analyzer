# AI Development Contract

This document defines the rules AI systems must follow when contributing to this repository.

---

## Development Constraints

The AI must ensure:

1. The project remains fully static.
2. No backend server is introduced.
3. All Lighthouse data must come from the PageSpeed Insights API.
4. The site must remain deployable on free hosting platforms.

---

## Technology Restrictions

Allowed:

* Next.js
* TypeScript
* Tailwind CSS
* PageSpeed Insights API

Not Allowed:

* Node.js servers
* Express
* Database systems
* Server-side queues

---

## Code Standards

AI-generated code must:

* Be modular
* Be documented
* Follow consistent naming conventions
* Avoid unnecessary complexity

---

## API Usage Rules

All Lighthouse data must be fetched via:

Google PageSpeed Insights API

Endpoint:

https://www.googleapis.com/pagespeedonline/v5/runPagespeed

Requests must include:

* URL parameter
* Strategy parameter (mobile/desktop)

---

## Performance Rules

The AI must avoid:

* Infinite request loops
* API flooding
* Blocking UI rendering

Batch processing must include delays when necessary.

---

## UI Requirements

The interface must include:

* URL input textarea
* Generate report button
* Loading indicator
* Results table

---

## Testing Rules

AI must ensure:

* Valid URL parsing
* Error handling
* API response parsing
* UI rendering accuracy

---

## Forbidden Behaviors

The AI must not:

* Add backend services
* Add authentication systems
* Introduce server dependencies
* Create paid infrastructure dependencies
