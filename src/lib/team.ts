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
  name: string;
  blurb: string;
};

export type LocalTeamMember = {
  name: string;
  role?: string;
  group: string;
  photo: string;
};

export const teamGroups: TeamGroup[] = [
  { name: "Leadership", blurb: "Direction, partnerships, and institutional oversight that steers strategy." },
  { name: "Advisor and specialist", blurb: "Expert advice and specialist guidance across research, communications, and partnerships." },
  { name: "Research and Programmes", blurb: "Study design, qualitative and quantitative enquiry, evaluation, and programme delivery." },
  { name: "Data", blurb: "Data coordination and support that strengthen evidence-based practice." },
  { name: "Operations", blurb: "Finance, operations, and administrative support that keep delivery running." },
  { name: "IT team", blurb: "Design and digital development that power our communications and platforms." },
  { name: "Office Support", blurb: "Office administration and logistics that keep the organisation running smoothly." },
];

export const localTeam: LocalTeamMember[] = [
  { name: "Sanju Maharjan", role: "Chairperson & Programme Director", group: "Leadership", photo: "/images/team/sanju-maharjan.jpg" },
  { name: "Manish Gautam", role: "Managing Director", group: "Leadership", photo: "/images/team/manish-gautam.jpg" },

  { name: "Dharma Gautam", role: "Director", group: "Advisor and specialist", photo: "/images/team/dharma-gautam.jpg" },
  { name: "Dr. Niraj Poudyal", role: "Senior Research Advisor", group: "Advisor and specialist", photo: "/images/team/niraj-poudyal.jpg" },
  { name: "Dr. Binod Kumar Sah", role: "Senior Research Advisor", group: "Advisor and specialist", photo: "/images/team/binod-kumar-sah.jpg" },
  { name: "Bhogendra Raj Dotel", role: "Senior Health Systems Adviser", group: "Advisor and specialist", photo: "/images/team/bhogendra-raj-dotel.jpg" },
  { name: "Kirti Kaushal Joshi", role: "Lead Graphic Communications Advisor", group: "Advisor and specialist", photo: "/images/team/kirti-kaushal-joshi.jpg" },
  { name: "Shanker Dev Kattel", role: "Health and Wellness Research Specialist", group: "Advisor and specialist", photo: "/images/team/shanker-dev-kattel.jpg" },
  { name: "Surendra Koirala", role: "Business Development Officer", group: "Advisor and specialist", photo: "/images/team/surendra-koirala.jpg" },

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
