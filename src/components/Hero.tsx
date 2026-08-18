"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1600",
    label: "Community Health Surveys",
  },
  {
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1600",
    label: "HPV Vaccination Research",
  },
  {
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1600",
    label: "Household Data Collection",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  // Automatic slide change
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000); // image stays for 7 seconds

    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative overflow-hidden">

      {/* Background */}
      <Image
        src="/images/bg.png"
        alt=""
        fill
        className="object-cover object-center -z-10"
        priority
      />

      {/* HERO TEXT */}
      <div className="max-w-4xl mx-auto px-8 pt-6 pb-30 text-center">

        <p className="text-primary eyebrow mb-5 text-base">
          Redefining Research in Nepal
        </p>

        <h1 className="text-4xl md:text-5xl font-bold text-base-text leading-tight mb-6 max-w-2xl mx-auto">
          Field Research That Drives Real Health Impact
        </h1>

        <p className="text-base-text/75 body mb-10 max-w-lg mx-auto">
          Clinical research, policy dialogue, and data-driven survey work
          across Nepal, from HPV vaccination studies to nationwide household
          health data.
        </p>

        <div className="flex items-center justify-center gap-4">

          <button
            onClick={() => scrollTo("projects")}
            className="flex items-center gap-2 rounded-full bg-primary text-white text-md font-semibold px-7 py-3.5 hover:bg-primary-dark transition-colors"
          >
            Our work
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => (window.location.href = "/clients")}
            className="flex items-center gap-2 rounded-full bg-accent text-forest-dark text-md font-semibold px-7 py-3.5 hover:brightness-100 transition"
          >
            Our clients
            <ArrowRight size={14} />
          </button>

        </div>
      </div>


      {/* IMAGE SLIDER */}
      <div className="max-w-5xl mx-auto px-8 pb-12">

        <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden bg-primary-light shadow-lg">

          {/* ALL IMAGES STAY MOUNTED */}
          {slides.map((slide, index) => (
            <Image
              key={slide.image}
              src={slide.image}
              alt={slide.label}
              fill
              sizes="(max-width: 1024px) 100vw, 1000px"
              className={`
                absolute inset-0 object-cover
                transition-opacity
                duration-[2000ms]
                ease-in-out
                ${
                  index === current
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0"
                }
              `}
              priority={index === 0}
            />
          ))}

          {/* DARK GRADIENT */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />


          {/* LABEL + DOTS */}
          <div className="absolute bottom-5 left-6 right-6 z-30 flex items-end justify-between">

            <span className="text-white text-sm font-semibold">
              {slides[current].label}
            </span>

            <div className="flex gap-2">

              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`
                    rounded-full
                    transition-all
                    duration-700
                    ${
                      index === current
                        ? "bg-white w-5 h-2"
                        : "bg-white/50 w-2 h-2"
                    }
                  `}
                />
              ))}

            </div>

          </div>

        </div>
      </div>

    </section>
  );
}