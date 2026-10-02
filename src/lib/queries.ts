import { groq } from "next-sanity";

/* --------------------------------------------------------------------------
   SINGLETONS (one document each)
   ----------------------------------------------------------------------- */

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  orgName,
  tagline,
  logo,
  logoLight,
  stats[] { value, label }
}`;

export const homeQuery = groq`*[_type == "home"][0]{
  heroEyebrow,
  heroHeading,
  heroSubtext,
  primaryCtaLabel,
  secondaryCtaLabel,
  slides[] { image, label },
  aboutBlurb
}`;

export const aboutQuery = groq`*[_type == "about"][0]{
  heading,
  body,
  image,
  vision,
  mission,
  missionPillars[]{ title, text }
}`;

export const servicesQuery = groq`*[_type == "services"][0]{
  heading,
  intro,
  items[]{
    _key,
    title,
    description,
    icon,
    "image": image{
      ...,
      alt,
      "dims": asset->metadata.dimensions
    },
    slug,
    hasDetailPage,
    highlights,
    sections[]{ _key, heading, body, bullets }
  }
}`;

/* One service's long-form content, for the detail page.

   Matches the overview query on `hasDetailPage` and requires at least one
   section, so a service can never serve a detail page that has nothing on it.
   The `!(_id in path("drafts.**"))` guard matches the other queries: the client
   pins apiVersion 2024-01-01, which predates Sanity's published-only default. */
export const serviceBySlugQuery = groq`*[_type == "services"][0]{
  heading,
  "items": items[slug.current == $slug && hasDetailPage == true && count(sections) > 0]
}`;

export const clientsQuery = groq`*[_type == "clients"][0]{
  heading,
  items[] { name, logo }
}`;

export const careerQuery = groq`*[_type == "career"][0]{
  heading,
  intro,
  vacancies[] { title, group, location, type, description }
}`;

export const contactQuery = groq`*[_type == "contact"][0]{
  heading,
  address,
  email,
  phone,
  mapEmbed
}`;

/* --------------------------------------------------------------------------
   COLLECTIONS (many documents each)
   ----------------------------------------------------------------------- */

export const projectsQuery = groq`*[_type == "project"] | order(year desc) {
  _id,
  title,
  slug,
  client,
  year,
  category,
  summary,
  status,
  years,
  location,
  methods,
  team,
  overview,
  approach,
  outcomes,
  facts[] { label, value },
  body,
  coverImage,
  externalUrl,
  featured
}`;

export const projectBySlugQuery = groq`*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  client,
  year,
  category,
  summary,
  status,
  years,
  location,
  methods,
  team,
  overview,
  approach,
  outcomes,
  facts[] { label, value },
  body,
  coverImage,
  externalUrl,
  featured
}`;

export const featuredProjectsQuery = groq`*[_type == "project" && featured == true] | order(year desc) {
  _id,
  title,
  slug,
  client,
  year,
  category,
  summary,
  status,
  years,
  location,
  methods,
  team,
  overview,
  approach,
  outcomes,
  facts[] { label, value },
  body,
  coverImage,
  externalUrl,
  featured
}`;

export const teamMembersQuery = groq`*[_type == "teamMember"] | order(order asc) {
  _id,
  name,
  role,
  group,
  bio,
  photo,
  email,
  order
}`;

/* --------------------------------------------------------------------------
   Publication file assets

   Both publication queries project `file` as a sub-object that keeps
   `asset{ _ref, _type }` intact and ADDS the resolved `asset->url`.

   The `asset->url` dereference is the whole point. A Sanity file `_ref` looks
   like `file-<sha1>-pdf`, but the CDN path is `<sha1>.pdf` — note the dot. The
   two are not interchangeable, so a `_ref` is not a URL and must never be
   string-mangled into one. Reconstructing the path by hand yields a 404 from
   cdn.sanity.io; reading `url` off the asset document cannot.

   `asset` is projected as the plain reference rather than a bare `asset->{...}`
   for the same reason as the gallery query below: a bare dereference REPLACES
   the reference object and `_ref` would no longer be available. The resolved
   URL is therefore a sibling key, not a replacement.

   `asset->url` yields null when the referenced `sanity.fileAsset` is missing
   (deleted, or an upload that never completed), which is what lets the page
   hide the Download button instead of rendering a dead link.
   ----------------------------------------------------------------------- */

export const publicationsQuery = groq`*[_type == "publication" && !(_id in path("drafts.**"))] | order(order asc, year desc) {
  _id,
  title,
  authors,
  year,
  journal,
  abstract,
  file{
    _type,
    asset{ _ref, _type },
    "url": asset->url,
    "originalFilename": asset->originalFilename,
    "extension": asset->extension,
    "size": asset->size
  },
  "fileUrl": file.asset->url,
  externalUrl,
  coverImage,
  order
}`;

/* Homepage preview.

   Deliberately separate from `publicationsQuery` above: the full page lists
   everything, while this curates a short set for the homepage.

   Eligibility is "flagged by an editor OR has a cover image", so a newly
   published paper with artwork surfaces on the homepage before anyone has
   curated it, while `featuredOnHome` still takes absolute precedence. The
   `[0...3]` slice caps the preview at three without a second query.

   Note the ordering term is `(featuredOnHome == true)`, not the raw field:
   in GROQ, `desc` ranks a *missing* boolean above `true`, which would bury
   flagged items. Comparing to `true` yields a real boolean that sorts first.

   Both publication queries also exclude `drafts.**`. That guard is not
   redundant: the client pins apiVersion 2024-01-01, which predates Sanity's
   published-only default, so an authenticated read still returns in-progress
   drafts. Without it, unpublished records are visible on the live site. */
export const featuredPublicationsQuery = groq`*[_type == "publication" && !(_id in path("drafts.**")) && (featuredOnHome == true || defined(coverImage.asset))] | order((featuredOnHome == true) desc, year desc, order asc)[0...3] {
  _id,
  title,
  journal,
  year,
  abstract,
  file{
    _type,
    asset{ _ref, _type },
    "url": asset->url,
    "originalFilename": asset->originalFilename,
    "extension": asset->extension,
    "size": asset->size
  },
  "fileUrl": file.asset->url,
  externalUrl,
  coverImage,
  featuredOnHome
}`;

/**
 * `asset` is projected as the plain reference so `sanityImageUrl()` still finds
 * `_ref`. A bare `asset->{...}` would REPLACE the reference and break every
 * image URL, so intrinsic dimensions are added as a sibling `dims` key instead.
 */
export const galleryEventsQuery = groq`*[_type == "galleryEvent"] | order(order asc, date desc) {
  _id,
  title,
  category,
  date,
  description,
  images[]{
    ...,
    alt,
    asset{ _ref, _type },
    "dims": asset->metadata.dimensions
  },
  coverImage,
  order
}`;