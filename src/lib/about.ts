/* --------------------------------------------------------------------------
    Local About fallback

    Vision and mission copy transcribed verbatim from
    https://anweshan.org/about/our-vision and
    https://anweshan.org/about/our-mission, including the two mission
    pillars. The original labels only the first pillar, so `title` is
    optional and the second pillar is rendered without an invented heading.
   ----------------------------------------------------------------------- */

export type MissionPillar = {
  title?: string;
  text: string;
};

export const fallbackVision =
  "A future where decisions affecting health, development and public life are grounded in rigorous research and credible evidence, shaped by the people and communities they concern, and translated into action that advances health, well-being and lasting progress.";

export const fallbackMission =
  "To generate rigorous, ethical and contextually grounded evidence and translate it into better decisions, stronger systems and practical action that advance the health and well-being of people and communities.";

export const fallbackMissionPillars: MissionPillar[] = [
  {
    title: "Research, Evaluation and Advisory",
    text: "We work with governments, development partners, institutions and communities to understand complex realities, evaluate what works and transform evidence into policies, programmes and communication that improve public life.",
  },
  {
    text: "Through our CRO practice, we design and deliver ethical, high-quality clinical, public health and implementation research\u2014from study design and regulatory support to field implementation, data management, analysis and scientific reporting\u2014combining international research standards with deep local understanding.",
  },
];
