export const ANWESHAN_ROLES = [
  { title: "Authored by Anweshan team", value: "authored" },
  { title: "Co-authored in collaboration", value: "co-authored" },
  { title: "Research delivered by Anweshan", value: "research-delivered" },
  { title: "Technical writing or report preparation", value: "technical-writing" },
  { title: "Edited or produced by Anweshan", value: "edited-produced" },
] as const;

export type AnweshanRole = (typeof ANWESHAN_ROLES)[number]["value"];

export const PUBLICATION_TYPES = [
  { title: "Journal article", value: "journal-article" },
  { title: "Technical report", value: "technical-report" },
  { title: "Policy brief", value: "policy-brief" },
  { title: "Guideline / manual", value: "guideline-manual" },
  { title: "Dataset / digital tool", value: "dataset-tool" },
  { title: "Film / animation / multimedia", value: "multimedia" },
  { title: "Leadership publication", value: "leadership" },
] as const;

export type PublicationType = (typeof PUBLICATION_TYPES)[number]["value"];

export const ACCESS_STATUSES = [
  { title: "Open access", value: "open-access" },
  { title: "Downloadable file", value: "downloadable" },
  { title: "Available on request", value: "on-request" },
  { title: "Restricted / not public", value: "restricted" },
] as const;

export type AccessStatus = (typeof ACCESS_STATUSES)[number]["value"];