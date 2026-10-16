/* --------------------------------------------------------------------------
    Local team fallback

    Names, roles and ordering are transcribed from https://anweshan.org/about/teams
    (all 3 paginated pages, 34 members). Photos are the local copies in
    public/images/team. Group headings come from the pre-CMS team page, since
    the original site renders one flat grid with no grouping.

    Used only when Sanity has no teamMember records or is unavailable, so the
    page still renders without CMS write access. Keep in sync with the
    `group` options in sanity/schemaTypes/teamMember.ts.
   ----------------------------------------------------------------------- */

export type TeamGroup = {
  /** The stored value this group is matched on. Keep identical to the schema
   *  option and to every `group` value in Sanity. */
  name: string;
  /** What the heading reads on the page. Defaults to `name`; set it only where
   *  the two legitimately differ. A key is for comparing, a label is for
   *  reading, and a heading like "Advisers and Specialists" should never have
   *  to double as a lookup key. */
  label?: string;
  blurb: string;
};

/* The advisers group is the one that gets looked up by name - the /team stats
   strip counts it - so its key and its label are named once and reused. */
export const ADVISER_GROUP_KEY = "Adviser and specialist";
export const ADVISER_GROUP_LABEL = "Advisers and Specialists";

/**
 * Reduces a stored group value and a heading to something comparable.
 *
 * The values in Sanity are free text that people type into a dropdown, and they
 * drifted: "Advisor and specialist" when the role was spelled the American way,
 * "Advisor & specialist" because & is quicker to type, and stray double spaces
 * are inevitable once a value has been hand-edited. Comparing those to a
 * heading with `===` silently drops every one of them into the Other bucket,
 * which is how advisers ended up filed under Other while looking correctly
 * tagged in the Studio.
 *
 * So both sides are normalised before they are compared:
 *   - case is folded, so "adviser and specialist" matches;
 *   - an ampersand becomes "and", so "Advisor & specialist" matches;
 *   - "advisor"/"advisers" becomes "adviser"/"adviser", so both spellings and
 *     the plural used in the display label all reduce to the same key;
 *   - runs of whitespace collapse, so a double space is not a mismatch.
 *
 * Returns "" for nothing, so a caller can treat "no group" as its own case
 * rather than matching it against something.
 */
export function normaliseGroup(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(advisor|advisers)\b/g, "adviser")
    .replace(/\s+/g, " ")
    .trim();
}

export type LocalTeamMember = {
  name: string;
  role?: string;
  group: string;
  photo: string;
};

export const teamGroups: TeamGroup[] = [
  { name: "Leadership", blurb: "Direction, partnerships, and institutional oversight that steers strategy." },
  { name: ADVISER_GROUP_KEY, label: ADVISER_GROUP_LABEL, blurb: "Expert advice and specialist guidance across research, communications, and partnerships." },
  { name: "Research and Programmes", blurb: "Study design, qualitative and quantitative enquiry, evaluation, and programme delivery." },
  { name: "Data", blurb: "Data coordination and support that strengthen evidence-based practice." },
  { name: "Operations", blurb: "Finance, operations, and administrative support that keep delivery running." },
  { name: "IT team", blurb: "Design and digital development that power our communications and platforms." },
  { name: "Office Support", blurb: "Office administration and logistics that keep the organisation running smoothly." },
];

export const localTeam: LocalTeamMember[] = [
  { name: "Sanju Maharjan", role: "Chairperson & Programme Director", group: "Leadership", photo: "/images/team/sanju-maharjan.jpg" },
  { name: "Manish Gautam", role: "Managing Director", group: "Leadership", photo: "/images/team/manish-gautam.jpg" },

  { name: "Dharma Gautam", role: "Director", group: "Adviser and specialist", photo: "/images/team/dharma-gautam.jpg" },
  { name: "Dr. Niraj Poudyal", role: "Senior Research Adviser", group: "Adviser and specialist", photo: "/images/team/niraj-poudyal.jpg" },
  { name: "Dr. Binod Kumar Sah", role: "Senior Research Adviser", group: "Adviser and specialist", photo: "/images/team/binod-kumar-sah.jpg" },
  { name: "Bhogendra Raj Dotel", role: "Senior Health Systems Adviser", group: "Adviser and specialist", photo: "/images/team/bhogendra-raj-dotel.jpg" },
  { name: "Kirti Kaushal Joshi", role: "Lead Graphic Communications Adviser", group: "Adviser and specialist", photo: "/images/team/kirti-kaushal-joshi.jpg" },
  { name: "Shanker Dev Kattel", role: "Health and Wellness Research Specialist", group: "Adviser and specialist", photo: "/images/team/shanker-dev-kattel.jpg" },
  { name: "Surendra Koirala", role: "Business Development Officer", group: "Adviser and specialist", photo: "/images/team/surendra-koirala.jpg" },

  { name: "Shreya Shrestha", role: "Research Coordinator", group: "Research and Programmes", photo: "/images/team/shreya-shrestha.jpg" },
  { name: "Aayushi Thapa", role: "Sr. Qualitative Research Officer", group: "Research and Programmes", photo: "/images/team/aayushi-thapa.jpg" },
  { name: "Kamal Ranabhat", role: "Sr. Project Officer", group: "Research and Programmes", photo: "/images/team/kamal-ranabhat.jpg" },
  { name: "Samiksha Baral", role: "Research Officer", group: "Research and Programmes", photo: "/images/team/samiksha-baral.jpg" },
  { name: "Manisha Budhathoki", role: "Programme Officer", group: "Research and Programmes", photo: "/images/team/manisha-budhathoki.jpg" },
  { name: "Shourya KC", role: "Research Associate", group: "Research and Programmes", photo: "/images/team/shourya-kc.jpg" },
  { name: "Jamina Prajapati", role: "Research Associate", group: "Research and Programmes", photo: "/images/team/jamina-prajapati.jpg" },
  { name: "Bipana Shrestha", role: "Research Associate", group: "Research and Programmes", photo: "/images/team/bipana-shrestha.jpg" },
  { name: "Situ Manandhar", role: "Research Assistant", group: "Research and Programmes", photo: "/images/team/situ-manandhar.jpg" },
  { name: "Juna Bhusal", role: "Research Assistant", group: "Research and Programmes", photo: "/images/team/juna-bhusal.jpg" },
  { name: "Sudisha Shakya", role: "Research Assistant", group: "Research and Programmes", photo: "/images/team/sudisha-shakya.jpg" },
  { name: "Pawan Pandeya", role: "Research Assistant", group: "Research and Programmes", photo: "/images/team/pawan-pandeya.jpg" },

  { name: "Krishna Khadka", role: "Data Coordinator", group: "Data", photo: "/images/team/krishna-khadka.jpg" },
  { name: "Akhilesh Mishra", role: "Data Associate", group: "Data", photo: "/images/team/akhilesh-mishra.jpg" },
  { name: "Prabin Parajuli", role: "Data Associate", group: "Data", photo: "/images/team/prabin-parajuli.jpg" },

  { name: "Sabitra Acharya", role: "Admin & Finance Officer", group: "Operations", photo: "/images/team/sabitra-acharya.jpg" },
  { name: "Prakriti Maharjan", role: "Operations Associate", group: "Operations", photo: "/images/team/prakriti-maharjan.jpg" },
  { name: "Supriya Bhushal", role: "Finance Assistant", group: "Operations", photo: "/images/team/supriya-bhushal.jpg" },

  { name: "Luniva Shakya", role: "Graphic designer and coordinator", group: "IT team", photo: "/images/team/luniva-shakya.jpg" },
  { name: "Madhu Sharma", role: "Full-Stack Developer", group: "IT team", photo: "/images/team/madhu-sharma.jpg" },
  { name: "Shreya Laxmi Tandukar", role: "Full-Stack Developer", group: "IT team", photo: "/images/team/shreya-laxmi-tandukar.jpg" },
  { name: "Sujal Yogi", role: "Full-Stack Developer", group: "IT team", photo: "/images/team/sujal-yogi.jpg" },

  { name: "Anju Thapa", role: "Office Housekeeping Assistant", group: "Office Support", photo: "/images/team/anju-thapa.jpg" },
  { name: "Ganesh Rana Magar", role: "Office and transport Assistant", group: "Office Support", photo: "/images/team/ganesh-rana-magar.jpg" },
  { name: "Chhatra Malla", role: "Office Assistant", group: "Office Support", photo: "/images/team/chhatra-malla.jpg" },
];

/** Local photo for a Sanity record, matched by name, so seeded records without an uploaded image still show a face. */
export function localPhotoFor(name: string): string | null {
  const target = name.trim().toLowerCase();
  return localTeam.find((m) => m.name.trim().toLowerCase() === target)?.photo ?? null;
}
