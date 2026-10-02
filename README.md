# AI-Productivity-Assistant Property Holdings

A modern SaaS-style AI productivity dashboard designed for a South African construction company that builds houses and schools.

The platform combines several AI-powered tools into one simple workspace, helping with construction estimates, client communication, task planning, research, and architect selection.

Author: Oratile Lithuge

## Features

### 🏗️ Cost Estimator

Generate indicative construction cost ranges based on:

* House or school projects
* Location and floor area
* Bedrooms, bathrooms, or classrooms
* Storeys and finish level
* Construction extras
* Preferred architect
* Client details

Provides a cost breakdown, estimated timeline, assumptions, and next steps.

> **Indicative estimate only, not a formal quotation.**

### ✉️ Email Generator

Generate professional emails for:

* Clients
* Architects
* Suppliers
* Subcontractors

Users can select the purpose, key points, tone, and length, then copy or regenerate the result.

### 📋 Task Planner

Create daily or weekly schedules based on:

* Task duration
* Deadlines
* Priority
* Working hours

The AI produces a prioritised schedule and identifies tasks that do not fit.

### 🔎 Research Assistant

Analyse construction-related topics or articles and generate:

* Summaries
* Key insights
* Recommendations
* Things to verify

Research can focus on regulations, materials, school design, sustainability, or safety.

### 👷 Architects

Browse six mock architect profiles with:

* Speciality
* Experience
* Rating
* Fee range
* Availability

Architects can be selected directly for a client enquiry.

### 📊 Dashboard

Provides an overview of:

* Active projects
* New enquiries
* Tasks due today
* Emails drafted
* Recent activity
* Quick access to AI tools

## Technology

* React + TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React
* React Router
* React Hook Form
* Zod
* Lovable AI
* Lovable Cloud / Edge Functions
* Browser localStorage

## AI Architecture

The application uses **one Edge Function** with different AI modes:

```text
estimate
email
planner
research
```

Each mode uses its own system prompt. Structured responses such as estimates and schedules are validated before being displayed.

API keys are kept server-side and are not exposed in the frontend.

Basic rate limiting is also included because the application is publicly accessible.

## Data & Authentication

There is **no login, sign-up, authentication, or user account system**.

Saved enquiries and activity history are stored in the user's browser using `localStorage`.

## Design

The application uses a clean SaaS dashboard interface with:

* Deep navy `#0F2A43`
* Amber `#F59E0B`
* Light backgrounds
* Inter font
* Rounded components
* Soft shadows
* Responsive desktop and mobile layouts

## Responsible AI

AI-generated information may contain errors or outdated information.

Users should review and verify AI outputs before using them. The application does not replace architects, engineers, quantity surveyors, legal advisers, or other qualified professionals.

Construction estimates are indicative only and are not binding quotations.

## Getting Started

```bash
npm install
npm run dev
```

Open the local development URL provided by Vite.

## Project Purpose

This project demonstrates how AI can be integrated into a practical construction business platform to support estimating, communication, planning, research, and client enquiries through a single responsive application.
