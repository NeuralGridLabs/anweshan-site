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
  items[] { title, description, icon }
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

export const publicationsQuery = groq`*[_type == "publication" && !(_id in path("drafts.**"))] | order(order asc, year desc) {
  _id,
  title,
  authors,
  year,
  journal,
  abstract,
  file,
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
  file,
  externalUrl,
  coverImage,
  featuredOnHome
}`;

export const galleryEventsQuery = groq`*[_type == "galleryEvent"] | order(order asc, date desc) {
  _id,
  title,
  date,
  description,
  images[],
  coverImage,
  order
}`;