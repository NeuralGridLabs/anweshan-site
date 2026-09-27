import { siteSettings } from "./siteSettings";
import { home } from "./home";
import { about } from "./about";
import { services } from "./services";
import { clients } from "./clients";
import { career } from "./career";
import { contact } from "./contact";
import { project } from "./project";
import { teamMember } from "./teamMember";
import { publication } from "./publication";
import { galleryEvent } from "./galleryEvent";

export const schemaTypes = [
  // Singletons (edited in place, one document each)
  siteSettings,
  home,
  about,
  services,
  clients,
  career,
  contact,
  // Collections (many documents)
  project,
  teamMember,
  publication,
  galleryEvent,
];
