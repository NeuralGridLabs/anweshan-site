"use client";

import { ArrowRight } from "lucide-react";
import AboutImages from "@/components/AboutImages";
import { highlightText } from "@/lib/highlight";

interface AboutData {
  aboutBlurb?: string;
  aboutEyebrow?: string;
  aboutBadge?: string;
  aboutHeading?: string;
  aboutHeadingHighlight?: string;
  aboutCtaLabel?: string;
}

/* Today's copy, kept as the fallback for every field so an empty CMS document
   renders exactly as before. */
const DEFAULT_EYEBROW = "ANWESHAN";
const DEFAULT_BADGE = "Working since 2016";
const DEFAULT_HEADING = "Advancing Nepal's public health. Through evidence.";
const DEFAULT_HEADING_HIGHLIGHT = "public health.";
const DEFAULT_CTA_LABEL = "About Us";
const DEFAULT_BLURB =
  "Anweshan Pvt. Ltd. is a multidisciplinary CRO and public health think tank based in Lalitpur, Nepal. We bring together researchers, clinicians, and policy experts to generate evidence that shapes health systems and improves lives.";
const DEFAULT_BLURB_SECOND =
  "From clinical trials to nationwide household surveys, and from HPV vaccination research to community health toolkit deployments, our work spans the full spectrum of health research across Nepal.";

/* An editor may separate paragraphs with a blank line, or with a single newline
   from a pasted block. Split on a line break surrounded by whitespace so both
   produce the same result. */
function toParagraphs(text: string) {
  return text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function About({ data }: { data?: AboutData }) {
  const heading = data?.aboutHeading?.trim() || DEFAULT_HEADING;
  const highlight = data?.aboutHeadingHighlight?.trim() || DEFAULT_HEADING_HIGHLIGHT;

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
      <section className="bg-accent py-16 md:py-24 transition-colors">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-20">
         
          {/* Left Column: Image slider. Held to half the row so the copy
              beside it gets a readable measure instead of a tall narrow
              column — the slider keeps its aspect ratio, so it loses almost
              no height from the wider container.

              `lg:items-center` on the row centers the shorter slider against
              the taller copy instead of pinning it to the top, which drops it
              to sit beside the middle of the text rather than the first line.
              It stays `items-start` on mobile: once the row stacks, `center`
              would collapse both children to their content width. */}
          <div className="w-full lg:w-1/2">
            <AboutImages />
          </div>

          {/* Right Column: Text & Actions */}
          <div className="w-full lg:w-1/2 flex flex-col">
           
            {/* Top Labels Grouped Together */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <p className="text-primary-dark text-sm font-bold tracking-wider uppercase">
                {(data?.aboutEyebrow?.trim() || DEFAULT_EYEBROW)}
              </p>
              </div>
              <span className="bg-white text-primary-dark text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                {data?.aboutBadge?.trim() || DEFAULT_BADGE}
              </span>
            </div>

            {/* Simple, Clean Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.2] mb-6 text-base-text">
              {headingNode}
            </h2>

            {/* Body Copy from Sanity, split into paragraphs, or the fallback */}
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`text-base-text/80 body-lg font-medium ${
                  i === paragraphs.length - 1 ? "mb-10" : "mb-4"
                }`}
              >
                {paragraph}
              </p>
            ))}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              

              <button
                onClick={() => (window.location.href = "/about")}
                className="flex items-center gap-2 rounded-full bg-primary text-white text-sm font-bold px-7 py-3.5 hover:bg-primary-dark transition-colors shadow-sm"
              >
                {data?.aboutCtaLabel?.trim() || DEFAULT_CTA_LABEL}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
