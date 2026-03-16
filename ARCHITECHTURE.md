# System Architecture

## Overview

The Lighthouse Bulk Report Generator is a fully static web application designed to generate Lighthouse performance reports for multiple URLs using the Google PageSpeed Insights API.

The system is intentionally designed without a backend to ensure it can be deployed entirely on free static hosting platforms.

---

## High-Level Architecture

User Browser
↓
Static Web Application
↓
Google PageSpeed Insights API
↓
Lighthouse Report JSON
↓
Frontend Parsing Layer
↓
Results Dashboard

---

## Components

### 1. Input Layer

Responsible for collecting user input.

Features:

* Multi-URL input
* URL validation
* Input sanitation
* Batch preparation

Component:

URLInput.tsx

---

### 2. API Integration Layer

Responsible for calling the PageSpeed Insights API.

Responsibilities:

* Sending requests
* Managing rate limits
* Parsing JSON responses
* Returning structured report data

Component:

pagespeedClient.ts

---

### 3. Processing Layer

Transforms raw Lighthouse responses into simplified report objects.

Responsibilities:

* Extract metrics
* Normalize scores
* Format data

Component:

reportParser.ts

---

### 4. UI Rendering Layer

Displays results in a dashboard format.

Components:

ResultsTable.tsx
ScoreBadge.tsx
MetricsPanel.tsx

---

### 5. State Management

Maintains application state.

Responsibilities:

* URL queue
* Loading states
* Results storage
* Error states

Recommended implementation:

React useState / useReducer

---

## Data Flow

Step 1
User submits URLs.

Step 2
URLs are validated and stored in state.

Step 3
Each URL triggers a PageSpeed API request.

Step 4
API returns Lighthouse JSON.

Step 5
Response is parsed into simplified report format.

Step 6
Dashboard updates with results.

---

## File Structure

src/

components/
URLInput.tsx
ResultsTable.tsx
ScoreBadge.tsx

lib/
pagespeedClient.ts
reportParser.ts

types/
report.ts

pages/
index.tsx

styles/
globals.css

---

## Lighthouse Data Source

All Lighthouse metrics come from:

Google PageSpeed Insights API

Endpoint:

https://www.googleapis.com/pagespeedonline/v5/runPagespeed

---

## Scalability Design

Although static, the system supports:

* Batch URL processing
* Client-side queuing
* Progressive results rendering

---

## Deployment Architecture

Git Repository
↓
Static Build
↓
Hosting Platform

Supported platforms:

* Cloudflare Pages
* Vercel
* Netlify
* GitHub Pages

---

## Security Considerations

* Input validation
* URL sanitization
* Prevent malformed requests
* Avoid API flooding
