"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import AboutImages from "@/components/AboutImages";
import { ClientLogoStrip, type MarqueeLogo } from "@/components/ClientMarquee";
import { highlightText } from "@/lib/highlight";

interface AboutData {
  aboutBlurb?: string;
  aboutEyebrow?: string;
  aboutHeading?: string;
  aboutHeadingHighlight?: string;
  aboutCtaLabel?: string;
  /* The clients block reads the same CMS fields the standalone band used, so
     an editor who has filled them sees no change. */
  clientsEyebrow?: string;
  clientsIntro?: string;
  clientsCtaLabel?: string;
  clientsCtaLink?: string;
  logos?: MarqueeLogo[];
}

/* Today's copy, kept as the fallback for every field so an empty CMS document
   renders exactly as before. */
const DEFAULT_EYEBROW = "ANWESHAN";
const DEFAULT_HEADING = "Advancing Nepal's public health. Through evidence.";
const DEFAULT_HEADING_HIGHLIGHT = "public health.";
const DEFAULT_CTA_LABEL = "About Us";
const DEFAULT_CLIENTS_EYEBROW = "Who we work with";
const DEFAULT_CLIENTS_INTRO =
  "Government institutions, UN agencies, universities, international NGOs, research partners and technical programmes.";
const DEFAULT_CLIENTS_CTA_LABEL = "View clients";
const DEFAULT_BLURB =
  "Anweshan Pvt. Ltd. is a multidisciplinary CRO and public health think tank based in Lalitpur, Nepal. We bring together researchers, clinicians, and policy experts to generate evidence that shapes health systems and improves lives.";
const DEFAULT_BLURB_SECOND =
  "From clinical trials to nationwide household surveys, and from HPV vaccination research to community health toolkit deployments, our work spans the full spectrum of health research across Nepal.";

/* An internal path goes through next/link for a client-side transition;
   everything else (absolute URLs, bare fragments) uses a plain anchor. */
function isInternal(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/* An editor may separate paragraphs with a blank line, or with a single newline
   from a pasted block. Split on a line break surrounded by whitespace so both
   produce the same result. */
function toParagraphs(text: string) {
  return text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function About({
  data,
  logos,
  clientsEyebrow,
  clientsIntro,
  clientsCtaLabel,
  clientsCtaLink,
}: {
  data?: AboutData;
  logos?: MarqueeLogo[];
  clientsEyebrow?: string;
  clientsIntro?: string;
  clientsCtaLabel?: string;
  clientsCtaLink?: string;
}) {
  const heading = data?.aboutHeading?.trim() || DEFAULT_HEADING;
  const highlight = data?.aboutHeadingHighlight?.trim() || DEFAULT_HEADING_HIGHLIGHT;

  /* The link never dead-ends: the CMS value wins, otherwise it falls back to
     the clients page. */
  const clientsHref = clientsCtaLink?.trim() || "/clients";

  /* No CMS heading keeps the original markup verbatim, so the highlighted words
     sit exactly where they always did. A CMS heading is highlighted by
     matching the editor's phrase. */
  const headingNode = data?.aboutHeading?.trim() ? (
    highlightText(heading, highlight, "text-primary-dark")
  ) : (
    <>
      Advancing Nepal&apos;s{" "}
      <span className="text-primary-dark">public health.</span> Through
      evidence.
    </>
  );

  const paragraphs = data?.aboutBlurb?.trim()
    ? toParagraphs(data.aboutBlurb)
    : [DEFAULT_BLURB, DEFAULT_BLURB_SECOND];

  return (
    /* Top padding only. This band now shares one continuous gold field with
       the publications preview directly beneath it, so it must not add bottom
       padding of its own or the two would read as separate sections. */
    <section className="bg-accent pt-16 md:pt-24 pb-8 md:pb-10 transition-colors">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Eyebrow sits ABOVE the two columns rather than inside the text one.
            That is what lets the image column start level with the heading: if
            the label were in the text column the image would either begin under
            it, leaving a gap above, or begin at the top and break the alignment.

            The "Working since 2016" pill that used to sit beside this label has
            been removed at the design owner's request; the CMS field itself is
            untouched in the schema and the query. */}
        <p className="text-forest text-sm font-bold tracking-wider uppercase mb-8">
          {data?.aboutEyebrow?.trim() || DEFAULT_EYEBROW}
        </p>

        {/* Columns start-aligned. The image holds its own 4:3 ratio so the whole
            photograph stays visible; stretching the cell to the full height of
            the text column is what made the frame huge and cropped it. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Text column. First in the DOM so the stacked mobile order reads
              text -> clients -> image, then the logo strip below the grid. */}
          <div className="order-1 lg:order-2 flex flex-col">

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.2] mb-6 text-base-text">
              {headingNode}
            </h2>

            {/* Body Copy from Sanity, split into paragraphs, or the fallback */}
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`text-base-text body-lg font-medium ${
                  i === paragraphs.length - 1 ? "mb-6" : "mb-4"
                }`}
              >
                {paragraph}
              </p>
            ))}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => (window.location.href = "/about")}
                className="flex items-center gap-2 rounded-full bg-primary-dark text-white text-sm font-bold px-7 py-3.5 hover:bg-forest transition-colors shadow-sm"
              >
                {data?.aboutCtaLabel?.trim() || DEFAULT_CTA_LABEL}
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Clients block: label, one short paragraph, one text link.
                Compact by design - it sits under the About button rather than
                becoming a section of its own. */}
            <div className="mt-10">
              <p className="text-forest text-sm font-bold tracking-wider uppercase mb-3">
                {clientsEyebrow?.trim() || DEFAULT_CLIENTS_EYEBROW}
              </p>

              <p className="text-base-text body-lg mb-4">
                {clientsIntro?.trim() || DEFAULT_CLIENTS_INTRO}
              </p>

              {isInternal(clientsHref) ? (
                <Link
                  href={clientsHref}
                  className="group inline-flex items-center gap-2 text-forest text-sm font-semibold underline underline-offset-4 decoration-forest/40 hover:decoration-forest transition-colors"
                >
                  {clientsCtaLabel?.trim() || DEFAULT_CLIENTS_CTA_LABEL}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              ) : (
                <a
                  href={clientsHref}
                  className="group inline-flex items-center gap-2 text-forest text-sm font-semibold underline underline-offset-4 decoration-forest/40 hover:decoration-forest transition-colors"
                >
                  {clientsCtaLabel?.trim() || DEFAULT_CLIENTS_CTA_LABEL}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </a>
              )}
            </div>
          </div>

          {/* Image column. Second in the DOM, first on desktop. `lg:mt-10` drops it a
            little below the top of the text so the photo is not shouldered
            against the heading; the text column itself does not move. */}
          <div className="order-2 lg:order-1 w-full lg:mt-10">
            <AboutImages />
          </div>
        </div>

        {/* Logo carousel, full container width, below both columns. The same
            strip the standalone band uses, without its own section, heading or
            top padding. */}
        <div className="mt-10 md:mt-12">
          <ClientLogoStrip logos={logos} />
        </div>
      </div>
    </section>
  );
}
