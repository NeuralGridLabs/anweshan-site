"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const slides = [
  {
    image: "/images/hero-1.jpg",
    label: "Community Health Surveys",
  },
  {
    image: "/images/hero-2.jpg",
    label: "HPV Vaccination Research",
  },
  {
    image: "/images/hero-3.jpg",
    label: "Household Data Collection",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-20 pb-16 overflow-hidden">

      <Image
        src="/images/bg.png"
        alt="background"
        fill
        className="object-cover object-center -z-10"
        priority
      />
      <div className="absolute inset-0 bg-white/0 -z-10" />

      <div className="max-w-4xl mx-auto px-6 pb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-8 bg-primary inline-block" />
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Redefining Research in Nepal
          </p>
          <span className="h-px w-8 bg-primary inline-block" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-base-text leading-tight mb-6 max-w-2xl mx-auto">
          Field Research That Drives Real Health Impact
        </h1>
        <p className="text-base-text/60 text-base leading-relaxed max-w-lg mx-auto mb-10">
          Clinical research, policy dialogue, and data-driven survey work across Nepal - from HPV vaccination studies to nationwide household health data.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => scrollTo("projects")}
            className="flex items-center gap-2 rounded-full bg-primary text-white text-sm font-semibold px-7 py-3.5 hover:bg-primary-dark transition-colors"
          >
            Our work
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => scrollTo("clients")}
            className="flex items-center gap-2 rounded-full bg-accent text-accent-dark text-sm font-semibold px-7 py-3.5 hover:brightness-95 transition"
          >
            Our clients
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8">
        <div
          className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden bg-primary-light shadow-lg"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 0.4s ease" }}
        >
          <Image
            key={current}
            src={slides[current].image}
            alt={slides[current].label}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
            <span className="text-white text-sm font-medium">
              {slides[current].label}
            </span>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-white w-5 h-2"
                      : "bg-white/50 w-2 h-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}