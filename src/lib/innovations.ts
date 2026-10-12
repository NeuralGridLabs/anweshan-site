/* --------------------------------------------------------------------------
    Digital products built by Anweshan

    Three products, each linking to its own live destination, so the section
    works as a set of exit points rather than a gallery. The Bir Hospital app
    is an antimicrobial reference guide Anweshan built and hosts; it is not a
    government product and nothing here should imply it is one.
   ----------------------------------------------------------------------- */

export type Innovation = {
  name: string;
  tag: string;
  description: string;
  href: string;
  cta: string;
  /* Paths live in /public rather than in Sanity, so they are plain strings
     that next/image can take directly. */
  image: string;
  alt: string;
  /* The three sources are not the same shape, so the frame each one fills is
     recorded beside it rather than being inferred in the component. */
  fit: "cover" | "contain";
};

export const innovations: Innovation[] = [
  {
    name: "Hire Enumerator",
    tag: "Web platform",
    description:
      "Hire verified enumerators, surveyors and field staff across Nepal.",
    href: "https://hireenumerator.com/enumerator/about",
    cta: "Visit website",
    image: "/images/innovations/hire-enumerator.png",
    alt: "Hire Enumerator logo on a green field",
    /* A wide green canvas with one small centred wordmark. Covering it fills
       the frame with brand colour, and because the mark sits dead centre the
       crop to a 2:1 window takes green from the sides, never the logo. */
    fit: "cover",
  },
  {
    name: "Bir Hospital AMR Guidelines",
    tag: "Android app",
    description:
      "A digital antimicrobial reference guide for clinicians, residents and trainees at Bir Hospital.",
    href: "https://play.google.com/store/apps/details?id=com.madhusharma9.treatmentv2",
    cta: "View on Google Play",
    image: "/images/innovations/bir-hospital-amr.png",
    alt: "Bir Hospital antimicrobial guidelines app banner",
    /* A 2:1 banner carrying the shield on the left and the wordmark on the
       right. Contained whole, so the crop never cuts the type off. */
    fit: "contain",
  },
  {
    name: "FieldOps",
    tag: "Web dashboard",
    description:
      "A mobilisation and mapping dashboard for managing field researchers and visualising census and facility data across Nepal.",
    href: "https://researchfieldops.com/vision",
    cta: "Visit website",
    image: "/images/innovations/fieldops.png",
    alt: "FieldOps by Anweshan logo",
    /* A 3:1 lockup on near-white. Contained whole on a white plate so the
       wordmark keeps its proportions and the padding reads as margin. */
    fit: "contain",
  },
];