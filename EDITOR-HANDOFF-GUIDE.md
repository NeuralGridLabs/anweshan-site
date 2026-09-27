# Anweshan — Editor Handoff Guide

## Quick Start

1. **Open the CMS**: Go to `https://your-domain.com/admin` (or `http://localhost:3000/admin` locally)
2. **Log in** with your Google or GitHub account
3. **Start editing** — the sidebar shows all editable content

---

## Content Structure

### Singletons (One per site — click to edit)
| Section | What it controls |
|---------|------------------|
| **Site Settings** | Organization name, tagline, logos (dark/light), homepage stats |
| **Home** | Hero banner (eyebrow, heading, subtext, buttons, slides), About blurb |
| **About** | Heading, body text, feature image |
| **Services** | Section heading, intro, service items (title, description, icon) |
| **Clients** | Section heading, client list (name + logo) |
| **Career** | Section heading, intro, vacancies (title, location, type, description) |
| **Contact** | Heading, address, email, phone, map embed URL |

### Collections (Many items — click "Create new")
| Collection | What to create |
|------------|----------------|
| **Projects** | Full project records with all detail fields |
| **Team Members** | Individual staff profiles |
| **Publications** | Downloadable PDFs/Word/Excel files with metadata |
| **Gallery Events** | Photo albums from fieldwork/events |

---

## Common Tasks

### Add a New Project
1. Click **Projects** → **Create new**
2. Fill in:
   - **Title** (required) — auto-generates slug
   - **Client / Partner**
   - **Year** (number)
   - **Category / Theme** (e.g., "Migration health", "AMR")
   - **Summary** (required, short description for cards)
   - **Status** — Ongoing / Completed
   - **Timeline** — display string like "2022 - 2023"
   - **Location**
   - **Methods** — add as tags
   - **Team** — short description
   - **Overview** — multiple paragraphs for the detail page
   - **Approach** — numbered steps
   - **Outcomes** — bullet points
   - **Key Figures** — label/value pairs (e.g., "Participants surveyed" / "1,240")
   - **Cover Image** — upload, set hotspot
   - **Featured on home** — toggle to show in homepage carousel

### Add a Team Member
1. Click **Team members** → **Create new**
2. Fill in: Name, Role, Group (Leadership / Research & Policy / Programmes & Operations / Communications & Technology / Support Services), Bio, Photo, Email, Display Order

### Add a Publication
1. Click **Publications** → **Create new**
2. Fill in: Title, Authors, Year, Journal, Abstract, **File** (PDF/Word/Excel), Cover Image, Display Order

### Add a Gallery Event
1. Click **Gallery events** → **Create new**
2. Fill in: Title, Date, Description, Photos (multiple), Cover Image, Display Order

### Update Homepage Hero
1. Click **Home** (singleton)
3. Edit: Hero Eyebrow, Hero Heading, Hero Subtext, Primary/Secondary CTA labels
4. **Slides** — add/reorder images with captions

### Update Site-Wide Settings
1. Click **Site settings** (singleton)
2. Edit: Org name, tagline, logos, stats (value/label pairs for homepage stat band)

---

## Image Guidelines

- **Cover images**: 16:9 or 4:3, min 1200px wide
- **Team photos**: Square (1:1), min 400px
- **Logos**: SVG preferred, or transparent PNG
- **Use hotspot** (circle on image) to set focal point for cropping

---

## Publishing

- **Changes are live immediately** on save (no separate "publish" button)
- **Drafts**: Sanity has draft/published — click "Publish" when ready
- **Preview**: Open the live site in another tab to verify

---

## Need Help?

- **Sanity docs**: https://www.sanity.io/docs
- **Vision tool** (in Studio): Click "Vision" in sidebar to run GROQ queries
- **Technical contact**: [your email] for schema changes or new fields

---

## Schema Reference (for developers)

All schemas in `sanity/schemaTypes/`:
- `siteSettings.ts`, `home.ts`, `about.ts`, `services.ts`, `clients.ts`, `career.ts`, `contact.ts`
- `project.ts`, `teamMember.ts`, `publication.ts`, `galleryEvent.ts`

To add fields: edit the schema file, restart dev server, Studio updates automatically.