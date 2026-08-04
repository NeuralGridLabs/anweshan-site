"use client";

import { ArrowRight, PlayCircle } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { useState } from "react";

export default function About() {
  const [playing, setPlaying] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
      <section className="bg-accent py-16 md:py-24 transition-colors">      {/* Increased max-width to allow the video to grow larger */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Changed to items-start to fix the top gap issue */}
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          
          {/* Left Column: Video Player (Takes up 60% width on large screens) */}
          <div className="w-full lg:w-3/5">
            {!playing ? (
              <div
                className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-primary-light cursor-pointer group shadow-sm"
                onClick={() => setPlaying(true)}
              >
                <img
                  src="https://img.youtube.com/vi/VtcO4Ja4-Ao/maxresdefault.jpg"
                  alt="About Anweshan"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md border border-white/40 rounded-full p-4 group-hover:scale-105 transition-transform">
                    <PlayCircle size={56} className="text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6">
                  <span className="bg-white text-accent-dark text-xs font-bold tracking-wide px-4 py-2 rounded-full shadow-sm">
                    Watch our story
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-black shadow-sm">
                <iframe
                  src="https://www.youtube.com/embed/VtcO4Ja4-Ao?autoplay=1&modestbranding=1&rel=0"
                  title="About Anweshan"
                  allow="autoplay; fullscreen"
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Right Column: Text & Actions (Takes up 40% width on large screens) */}
          <div className="w-full lg:w-2/5 flex flex-col pt-2">
            
            {/* Top Labels Grouped Together */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <p className="text-primary-dark text-sm font-bold tracking-wider uppercase">
                ANWESHAN</p>
              </div>
              <span className="bg-white text-primary-dark text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                Working since 2017
              </span>
            </div>

            {/* Simple, Clean Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.2] mb-6 text-base-text">
              Advancing Nepal's <span className="text-primary-dark">public health.</span> Through evidence.
            </h2>

            {/* Body Copy */}
            <p className="text-base-text/80 text-base md:text-lg leading-relaxed mb-4 font-medium">
              Anweshan Pvt. Ltd. is a multidisciplinary Clinical Research Organization and public health think tank based in Lalitpur, Nepal. We bring together researchers, clinicians, and policy experts to generate evidence that shapes health systems and improves lives.
            </p>
            <p className="text-base-text/80 text-base md:text-lg leading-relaxed mb-10 font-medium">
              From clinical trials to nationwide household surveys, and from HPV vaccination research to community health toolkit deployments -- our work spans the full spectrum of health research across Nepal.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => window.open("https://www.youtube.com/@anweshan", "_blank")}
                className="flex items-center gap-2 rounded-full bg-white border-2 border-transparent text-base-text text-sm font-bold px-6 py-3.5 hover:border-white hover:bg-white/80 transition-all shadow-sm"
              >
                <FaYoutube size={20} className="text-[#FF0000]" />
                View our channel
              </button>

              <button
                onClick={() => scrollTo("team")}
                className="flex items-center gap-2 rounded-full bg-primary text-white text-sm font-bold px-7 py-3.5 hover:bg-primary-dark transition-colors shadow-sm"
              >
                Meet our team
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}