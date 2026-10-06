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
  primaryCtaLink,
  secondaryCtaLink,
  slides[] { image, label, alt },
  aboutBlurb,
  aboutEyebrow,
  aboutBadge,
  aboutHeading,
  aboutHeadingHighlight,
  aboutCtaLabel,
  proofItems,
  clientsEyebrow,
  clientsHeading,
  clientsIntro,
  clientsCtaLabel,
  clientsCtaLink
}`;

export const aboutQuery = groq`*[_type == "about"][0]{
  heading,
  body,
  image,
  vision,
  mission,
  missionPillars[]{ title, text },
  storyEyebrow,
  storyParagraphs,
  purposeEyebrow,
  purpose,
  promisesHeading,
  promises[]{ title, text },
  howWeWorkHeading,
  howWeWorkSteps[]{ title, text },
  valuesHeading,
  values[]{ title, text },
  whyHeading,
  whyItems
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
    tagline,
    detailBody,
    capabilities,
    ctaLabel,
    ctaLink,
    highlights,
    sections[]{ _key, heading, body, bullets }
  }
}`;

/* One service's own page content.

   Matches on the `hasDetailPage` switch only. It used to require
   `count(sections) > 0` as well, but `sections` is now a retired field, so that
   clause would have made every lookup return nothing. $slug is always a GROQ
   parameter: no caller input is ever concatenated into the query string. */
export const serviceBySlugQuery = groq`*[_type == "services"][0]{
  "items": items[slug.current == $slug && hasDetailPage == true]{
    _key,
    title,
    tagline,
    detailBody,
    capabilities,
    ctaLabel,
    ctaLink,
    "image": image{
      ...,
      alt,
      "dims": asset->metadata.dimensions
    },
    slug,
    hasDetailPage
  }
}`;

export const clientsQuery = groq`*[_type == "clients"][0]{
  eyebrow,
  heading,
  intro,
  note,
  ctaLabel,
  ctaLink,
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

export const projectsQuery = groq`*[_type == "project" && coalesce(webStatus, "ready") == "ready"] | order(year desc) {
  _id,
  title,
  slug,
  client,
  year,
  startYear,
  endYear,
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
  facts[] { value, label },
  body,
  coverImage,
  externalUrl,
  featured
}`;

/* Siblings are the same client's other ready assignments, oldest first. Filtered
   exactly like everything else, and this project is excluded from its own list.

   Note: GROQ has no comment syntax, so every comment in this file must sit
   OUTSIDE the backticks. One placed inside a query string parses as an error and
   the fetch returns null, which fails silently as "no data". */
export const projectBySlugQuery = groq`*[_type == "project"
  && slug.current == $slug
  && coalesce(webStatus, "ready") == "ready"][0]{
  _id,
  title,
  slug,
  client,
  category,
  summary,
  status,
  years,
  startYear,
  endYear,
  location,
  methods,
  team,
  overview,
  approach,
  outcomes,
  facts[] { value, label },
  body,
  coverImage,
  externalUrl,
  featured,
  year,
  webStatus,
  "clientHub": clientHub->{
    _id,
    name,
    slug,
    logo{ ..., alt },
    shortName,
    relationshipType,
    "projectCount": count(*[_type == "project"
      && references(^._id)
      && coalesce(webStatus, "ready") == "ready"])
  },
  "siblings": *[_type == "project"
    && coalesce(webStatus, "ready") == "ready"
    && references(^.clientHub._ref)
    && !(_id == ^._id)] | order(coalesce(startYear, year) asc){
      _id,
      title,
      slug,
      years,
      startYear
    }
}`;

export const featuredProjectsQuery = groq`*[_type == "project"
  && featured == true
  && coalesce(webStatus, "ready") == "ready"] | order(year desc) {
  _id,
  title,
  slug,
  client,
  year,
  startYear,
  endYear,
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
  facts[] { value, label },
  body,
  coverImage,
  externalUrl,
  featured
}`;

/* --------------------------------------------------------------------------
    CLIENT HUBS AND PROJECTS

    Every query below filters on `coalesce(webStatus, "ready") == "ready"`.
    The coalesce is what makes this safe to add to a dataset that already has
    documents: a legacy project with no webStatus at all is treated as ready,
    so nothing disappears on deploy. Only a document explicitly set to
    "needs-clearance" is withheld.

    The same filter is applied to hubs, to the projects inside a hub, to the
    sibling lookups and to the counts. A count that ignored it would advertise
    assignments the visitor cannot open.
   ----------------------------------------------------------------------- */

/* A hub with nothing to show would render as an empty page, so the final
   filter withholds it entirely rather than linking to a blank page. */
export const clientHubsQuery = groq`*[_type == "clientHub" && coalesce(webStatus, "ready") == "ready"]{
  _id,
  name,
  slug,
  logo{ ..., alt },
  shortName,
  relationshipType,
  order,
  "projectCount": count(*[_type == "project"
    && references(^._id)
    && coalesce(webStatus, "ready") == "ready"]),
  "firstYear": math::min(*[_type == "project"
    && references(^._id)
    && coalesce(webStatus, "ready") == "ready"
    && startYear > 0].startYear),
  "lastYear": math::max(*[_type == "project"
    && references(^._id)
    && coalesce(webStatus, "ready") == "ready"
    && coalesce(endYear, startYear) > 0]{
      "y": coalesce(endYear, startYear)
    }.y),
  "categories": array::unique(*[_type == "project"
    && references(^._id)
    && coalesce(webStatus, "ready") == "ready"].category)
}[projectCount > 0] | order(order asc, name asc)`;

export const clientHubBySlugQuery = groq`*[_type == "clientHub"
  && slug.current == $slug
  && coalesce(webStatus, "ready") == "ready"][0]{
  _id,
  name,
  slug,
  logo{ ..., alt },
  shortName,
  relationshipType,
  order,
  intro,
  website,
  "projects": *[_type == "project"
    && references(^._id)
    && coalesce(webStatus, "ready") == "ready"]
    | order(coalesce(startYear, year) desc, title asc){
      _id,
      title,
      slug,
      summary,
      category,
      status,
      years,
      startYear,
      endYear,
      location,
      client,
      methods,
      facts[]{ value, label }
    }
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