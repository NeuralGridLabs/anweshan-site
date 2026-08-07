"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1600",
    label: "Community Health Surveys",
  },
  {
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1600",
    label: "HPV Vaccination Research",
  },
  {
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1600",
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
        alt=""
        fill
        className="object-cover object-center -z-10"
        priority
      />

      <div className="max-w-4xl mx-auto px-6 pb-12 text-center">
        <p className="text-primary eyebrow mb-5">Redefining Research in Nepal</p>
        <h1 className="text-4xl md:text-5xl font-bold text-base-text leading-tight mb-6 max-w-2xl mx-auto">
          Field Research That Drives Real Health Impact
        </h1>
        <p className="text-base-text/60 body mb-10 max-w-lg mx-auto">
          Clinical research, policy dialogue, and data-driven survey work across Nepal, from HPV
          vaccination studies to nationwide household health data.
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
            onClick={() => (window.location.href = "/clients")}
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
            sizes="(max-width: 1024px) 100vw, 1000px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
            <span className="text-white text-sm font-semibold">
              {slides[current].label}
            </span>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? "bg-white w-5 h-2" : "bg-white/50 w-2 h-2"
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
