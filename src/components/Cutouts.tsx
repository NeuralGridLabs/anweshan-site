/* Decorative animated background shapes. Purely presentational:
   aria-hidden and pointer-events-none so they never affect
   interaction or the accessibility tree. */

type Variant = "featured" | "explore" | "marquee" | "header" | "team";

export default function Cutouts({ variant }: { variant: Variant }) {
  if (variant === "featured") {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="cutout cutout-a -top-28 -right-24 w-[38rem] h-[38rem] rounded-full bg-aqua/25" />
        <span className="cutout cutout-b -bottom-40 -left-28 w-[30rem] h-[30rem] rotate-12 rounded-[5rem] bg-gold/22" />
        <span className="cutout cutout-c top-1/3 left-[42%] w-56 h-56 rounded-full bg-mint/30" />
      </div>
    );
  }

  if (variant === "explore") {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="cutout cutout-b -top-32 left-[-6rem] w-[34rem] h-[34rem] rounded-full bg-mint/40" />
        <span className="cutout cutout-a top-[20%] right-[-8rem] w-[26rem] h-[26rem] rotate-45 rounded-[4rem] bg-aqua/30" />
        <span className="cutout cutout-c -bottom-24 left-[38%] w-72 h-72 rounded-full bg-gold/30" />
      </div>
    );
  }

  if (variant === "marquee") {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="cutout cutout-a top-[-6rem] left-[12%] w-80 h-80 rounded-full bg-aqua/20" />
        <span className="cutout cutout-b bottom-[-8rem] right-[16%] w-72 h-72 rotate-12 rounded-[3rem] bg-mint/25" />
      </div>
    );
  }

  if (variant === "team") {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="cutout cutout-a -top-10 -left-10 w-[22rem] h-[22rem] rounded-full bg-mint/35" />
        <span className="cutout cutout-b top-1/3 -right-16 w-[18rem] h-[18rem] rotate-12 rounded-[3rem] bg-aqua/22" />
        <span className="cutout cutout-c bottom-10 left-1/4 w-64 h-64 rounded-full bg-gold/25" />
        <span className="cutout cutout-a bottom-0 right-1/3 w-52 h-52 rotate-45 rounded-[2rem] bg-forest/18" />
        <span className="cutout cutout-b top-1/2 left-1/2 w-44 h-44 rounded-full bg-forest/8" />
      </div>
    );
  }

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <span className="cutout cutout-a -top-24 right-[-6rem] w-[30rem] h-[30rem] rounded-full bg-gold/20" />
      <span className="cutout cutout-c -bottom-32 left-[-4rem] w-[24rem] h-[24rem] rotate-12 rounded-[4rem] bg-aqua/18" />
    </div>
  );
}
