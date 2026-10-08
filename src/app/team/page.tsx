import Image from "next/image";

import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import Cutouts from "@/components/Cutouts";

import { teamMembersQuery, siteSettingsQuery } from "@/lib/queries";
import { fetchSanity } from "@/lib/sanity";
import { sanityImageUrl } from "@/lib/image";
import { localPhotoFor, localTeam, teamGroups } from "@/lib/team";
import type { SiteSettings, TeamMember } from "@/lib/types";

const OTHER_GROUP = "Other";

type ResolvedMember = {
  key: string;
  name: string;
  role?: string;
  group?: string;
  photo: string | null;
};

/**
 * Sanity is the preferred source, but the dataset may hold no teamMember
 * records. The local roster from the original site is used in that case so the
 * page still renders. A Sanity record without an uploaded image falls back to
 * its matching local photo rather than showing a placeholder.
 */
function resolveMembers(members: TeamMember[] | null): ResolvedMember[] {
  if (members?.length) {
    return members.map((m) => ({
      key: m._id,
      name: m.name,
      role: m.role,
      group: m.group,
      photo: sanityImageUrl(m.photo) ?? localPhotoFor(m.name),
    }));
  }

  return localTeam.map((m) => ({
    key: `local:${m.name}`,
    name: m.name,
    role: m.role,
    group: m.group,
    photo: m.photo,
  }));
}

export default async function TeamPage() {
  const [members, siteSettings] = await Promise.all([
    fetchSanity<TeamMember[]>(teamMembersQuery),
    fetchSanity<SiteSettings>(siteSettingsQuery),
  ]);
  // `fetchSanity` resolves to null when Sanity is not configured or the query
  // fails, so the fallback is applied to the awaited value, not to the promise.
  const teamMembers = resolveMembers(members);

  const groups = teamGroups
    .map((g) => ({
      ...g,
      members: teamMembers.filter((m) => m.group === g.name),
    }))
    .filter((g) => g.members.length > 0);

  // Anything tagged with a group that is not a heading would otherwise be
  // dropped, so collect it rather than silently hiding the record.
  const orphans = teamMembers.filter(
    (m) => m.group && !teamGroups.some((g) => g.name === m.group),
  );
  if (orphans.length) {
    groups.push({
      name: OTHER_GROUP,
      blurb: "Team members whose group has not been set to a listed heading.",
      members: orphans,
    });
  }

  const sanityStats = (siteSettings?.stats ?? []).filter(
    (s): s is { value: string; label: string } =>
      typeof s.value === "string" && typeof s.label === "string",
  );

  const meta = sanityStats.length
    ? sanityStats
    : [
        { label: "Team members", value: String(teamMembers.length) },
        { label: "Teams", value: String(groups.length) },
        {
          label: "Advisor & specialist",
          value: String(
            groups.find((g) => g.name === "Advisor and specialist")?.members
              .length ?? 0,
          ),
        },
        { label: "Based in", value: "Lalitpur" },
      ];

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
                      dark ? "text-forest/85" : "text-forest/85"
                    }`}
                  >
                    {group.blurb}
                  </p>
                </div>

                <div className="md:col-span-8 flex md:justify-end md:items-end">
                  <p className="text-sm font-semibold tabular-nums text-forest/85">
                    {String(group.members.length).padStart(2, "0")}
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {group.members.map((person, i) => (
                  <Reveal as="li" key={person.key} delay={(i % 4) * 90}>
                    <article className="group">
                      <div className={`relative aspect-[4/5] rounded-xl overflow-hidden mb-4 ${dark ? "bg-forest/6" : "bg-mint/50"}`}>
                        {person.photo ? (
                          <Image
                            src={person.photo}
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
                      <h2 className="text-base md:text-lg font-bold leading-tight tracking-tight text-forest">
                        {person.name}
                      </h2>
                      {person.role && (
                        <p className={`body-sm mt-1 ${dark ? "text-forest/85" : "text-forest/85"}`}>
                          {person.role}
                        </p>
                      )}
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