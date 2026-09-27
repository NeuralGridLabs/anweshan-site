import Image from "next/image";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import Cutouts from "@/components/Cutouts";

import { teamMembersQuery, siteSettingsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  group: string;
  bio?: string;
  photo?: {
    asset?: {
      _ref?: string;
    };
  };
  email?: string;
  order?: number;
};

type SiteSettings = {
  stats?: {
    value: string;
    label: string;
  }[];
};

const fallbackGroups = [
  {
    name: "Leadership",
    blurb:
      "Direction, partnerships, and institutional oversight that steers strategy.",
  },
  {
    name: "Research & Policy",
    blurb:
      "Study design, qualitative and quantitative enquiry, evaluation, and policy analysis.",
  },
  {
    name: "Programmes & Operations",
    blurb:
      "Programme management, finance, data, and partnerships that keep delivery running.",
  },
  {
    name: "Communications & Technology",
    blurb:
      "Design, editorial, and digital development that power our communications.",
  },
  {
    name: "Support Services",
    blurb:
      "Office administration and logistics that keep the organisation running smoothly.",
  },
];

export default async function TeamPage() {
  const [rawTeamMembers, rawSiteSettings] = await Promise.all([
    fetchSanity(teamMembersQuery),
    fetchSanity(siteSettingsQuery),
  ]);

  const teamMembers = (rawTeamMembers as TeamMember[]) || [];
  const siteSettings = rawSiteSettings as SiteSettings;

  // Group members by group field
  const groups = fallbackGroups
    .map((g) => ({
      ...g,
      members: teamMembers.filter((member) => member.group === g.name),
    }))
    .filter((g) => g.members.length > 0);

  const meta = siteSettings?.stats?.length
    ? siteSettings.stats
    : [
        {
          label: "Team members",
          value: teamMembers.length.toString(),
        },
        {
          label: "Practice groups",
          value: groups.length.toString(),
        },
        {
          label: "Senior advisors",
          value: teamMembers
            .filter(
              (member) =>
                member.role?.includes("Senior") ||
                member.role?.includes("Advisor") ||
                member.role?.includes("Director")
            )
            .length.toString(),
        },
        {
          label: "Based in",
          value: "Lalitpur",
        },
      ];

  function getImageUrl(ref?: string) {
    if (!ref) return "";

    return `https://cdn.sanity.io/images/10g74skr/production/${ref
      .replace("image-", "")
      .replace(/-(jpg|jpeg|png|webp|gif)$/, ".$1")}`;
  }

  return (
    <main className="min-h-screen bg-snow">
      <PageHeader
        tone="ink"
        eyebrow="Our team"
        title="A highly motivated team of young professionals."
        lead="Researchers, clinicians, communications specialists, and operations staff committed to evidence based analysis of development challenges."
        image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
        imageAlt="Team collaborating in a meeting"
        meta={meta}
      />

      {groups.map((group, gi) => {
        const dark = gi % 2 === 1;

        return (
          <section
            key={group.name}
            className={`${
              dark
                ? "bg-sage text-forest"
                : "bg-snow text-forest"
            } py-16 md:py-24 relative overflow-hidden`}
          >
            <Cutouts variant="team" />

            <div className="max-w-[1400px] mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
                <div className="md:col-span-4">
                  <p className="text-2xl md:text-3xl font-bold mb-4 text-forest">
                    {group.name}
                  </p>

                  <p
                    className={`text-base md:text-lg leading-relaxed ${
                      dark ? "text-forest/80" : "text-forest/75"
                    }`}
                  >
                    {group.blurb}
                  </p>
                </div>

                <div className="md:col-span-8 flex md:justify-end md:items-end">
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      dark ? "text-forest/70" : "text-forest/70"
                    }`}
                  >
                    {String(group.members.length).padStart(2, "0")}
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {group.members.map((person, i) => (
                  <Reveal
                    as="li"
                    key={person._id}
                    delay={(i % 4) * 90}
                  >
                    <article className="group">
                      <div
                        className={`relative aspect-[4/5] rounded-xl overflow-hidden mb-4 ${
                          dark ? "bg-forest/6" : "bg-mint/50"
                        }`}
                      >
                        {person.photo?.asset?._ref ? (
                          <Image
                            src={getImageUrl(
                              person.photo.asset._ref
                            )}
                            alt={person.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 22vw"
                            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-forest/30">
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              aria-hidden="true"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle
                                cx="12"
                                cy="7"
                                r="4"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <h2
                        className={`text-base md:text-lg font-bold leading-tight tracking-tight ${
                          dark
                            ? "text-forest"
                            : "text-forest"
                        }`}
                      >
                        {person.name}
                      </h2>

                      <p
                        className={`body-sm mt-1 ${
                          dark
                            ? "text-forest/80"
                            : "text-forest/60"
                        }`}
                      >
                        {person.role}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </main>
  );
}