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
  image
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
  vacancies[] { title, location, type, description }
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
  bio,
  photo,
  email,
  order
}`;

export const publicationsQuery = groq`*[_type == "publication"] | order(order asc, year desc) {
  _id,
  title,
  authors,
  year,
  journal,
  abstract,
  file,
  coverImage,
  order
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