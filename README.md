# Lighthouse Bulk Report Generator

## Overview

Lighthouse Bulk Report Generator is a lightweight web application that allows users to generate performance and SEO reports for multiple websites at once.

The tool accepts a list of URLs and retrieves Lighthouse metrics using the Google PageSpeed Insights API. Results are displayed in a structured table showing key metrics such as performance, accessibility, SEO, and best practices.

The application is designed to be:

* Fully static
* Deployable on free hosting platforms
* Simple to use
* Fast and scalable

The system does not run Lighthouse locally. Instead, it consumes Lighthouse data from the Google PageSpeed Insights API.

---

## Key Features

* Bulk Lighthouse analysis
* Static web application
* No backend required
* Free deployment support
* Clean results dashboard
* URL batch processing
* JSON response parsing

---

## Metrics Provided

Each analyzed URL returns:

* Performance Score
* Accessibility Score
* SEO Score
* Best Practices Score
* First Contentful Paint
* Largest Contentful Paint
* Total Blocking Time
* Cumulative Layout Shift
* Time to Interactive

---

## Tech Stack

Frontend

* Next.js (Static Export)
* Tailwind CSS
* TypeScript

API

* Google PageSpeed Insights API

Deployment

* Cloudflare Pages / Vercel / Netlify / GitHub Pages

---

## Project Architecture

User Input (URL List)
↓
Frontend API Request
↓
Google PageSpeed Insights API
↓
Lighthouse JSON Response
↓
Frontend Parsing
↓
Results Dashboard

---

## Installation

Clone repository

git clone <repo-url>

cd lighthouse-bulk-reporter

Install dependencies

npm install

Run development server

npm run dev

---

## Build Static Site

npm run build

Static files will be generated in the output directory.

---

## Deployment

This project supports static hosting platforms:

* Vercel
* Cloudflare Pages
* Netlify
* GitHub Pages

Simply deploy the build output.

---

## Usage

1. Enter one URL per line.
2. Click "Generate Report".
3. Wait for Lighthouse analysis.
4. View results in the dashboard table.

---

## Future Enhancements

* PDF report generation
* Historical tracking
* Export CSV
* Performance charts
* Scheduled audits
* Multi-device testing
* API caching layer

---

## License

MIT License
