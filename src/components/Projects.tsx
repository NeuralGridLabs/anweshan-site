"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const projectsData = [
  {
    id: "01",
    title: "National Household Survey",
    description: "A comprehensive nationwide survey to evaluate basic health metrics and access to sanitation across rural and urban municipalities.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "02",
    title: "HPV Vaccination Research",
    description: "Evaluating the efficacy and community acceptance of HPV vaccines among young adolescents in targeted provinces of Nepal.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "03",
    title: "Community Health Toolkit",
    description: "Deploying open-source digital health tools to empower female community health volunteers (FCHVs) with real-time data tracking.",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "04",
    title: "Maternal Nutrition Assessment",
    description: "Assessing dietary diversity and nutritional outcomes for pregnant women in remote mountain regions to guide policy interventions.",
    image: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "05",
    title: "Urban Air Quality & Respiratory Health",
    description: "A longitudinal study mapping PM2.5 exposure to the incidence of respiratory diseases among daily wage workers in the Kathmandu Valley.",
    image: "https://images.unsplash.com/photo-1611077544815-5e6080352dd6?auto=format&fit=crop&q=80&w=800",
  },
];

export default function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % projectsData.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + projectsData.length) % projectsData.length);
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden z-0 bg-primary-dark">
      
      {/* Background Lighting Effects */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Soft green and yellow glows to give the dark background depth */}
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Section Header with Attractive Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="h-[3px] w-10 bg-accent rounded-full shadow-sm" />
              <p className="text-accent text-sm font-extrabold tracking-widest uppercase">
                Our Projects
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
              Our Featured Work
            </h2>
          </div>

          {/* Elevated, Attractive Carousel Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={prev}
              className="p-4 rounded-full bg-white text-primary-dark shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:bg-accent hover:text-accent-dark hover:scale-110 active:scale-95 transition-all duration-300"
              aria-label="Previous project"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
            <button
              onClick={next}
              className="p-4 rounded-full bg-white text-primary-dark shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:bg-accent hover:text-accent-dark hover:scale-110 active:scale-95 transition-all duration-300"
              aria-label="Next project"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Dynamic Scaling Carousel Container */}
        <div className="relative w-full h-[580px] md:h-[620px] flex items-center justify-center">
          {projectsData.map((project, i) => {
            // Calculate relative distance from the current center index
            let diff = i - currentIndex;
            const half = Math.floor(projectsData.length / 2);
            
            // Adjust diff for infinite looping behavior
            if (diff > half) diff -= projectsData.length;
            if (diff < -half) diff += projectsData.length;

            const isCenter = diff === 0;

            // Keeps cards tucked close together
            const style: React.CSSProperties = {
              transform: `translateX(calc(${diff * 75}%)) scale(${1 - Math.abs(diff) * 0.12})`,
              zIndex: 20 - Math.abs(diff),
              opacity: 1 - Math.abs(diff) * 0.15,
            };

            return (
              <div
                key={project.id}
                style={style}
                className={`absolute w-[85vw] sm:w-[380px] md:w-[440px] h-[520px] md:h-[560px] p-5 md:p-6 rounded-[2.5rem] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-2xl ${
                  isCenter
                    ? "bg-primary text-white border border-white/10"
                    : "bg-white border border-gray-100 text-base-text"
                }`}
              >
                {/* Image Container */}
                <div className="w-full h-[220px] md:h-[250px] shrink-0 rounded-2xl overflow-hidden mb-6 bg-gray-100 shadow-inner">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text Content */}
                <div className="flex-1 flex flex-col px-2">
                  <h3
                    className={`text-2xl md:text-3xl font-bold mb-3 leading-tight ${
                      isCenter ? "text-white" : "text-base-text"
                    }`}
                  >
                    {project.title}
                  </h3>
                  
                  <p
                    className={`text-sm md:text-base leading-relaxed line-clamp-3 mb-6 ${
                      isCenter ? "text-white/90 font-medium" : "text-base-text/70"
                    }`}
                  >
                    {project.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 mt-auto">
                    <button
                      onClick={() => console.log(`Navigate to project ${project.id}`)}
                      className={`flex-1 py-4 px-4 rounded-xl font-bold text-sm text-center transition-transform hover:scale-[1.02] active:scale-95 shadow-sm ${
                        isCenter
                          ? "bg-accent text-accent-dark hover:bg-accent-dark hover:text-white"
                          : "bg-primary-light text-primary-dark hover:bg-primary hover:text-white"
                      }`}
                    >
                      Read More
                    </button>
                    <button
                      onClick={() => console.log(`Navigate to project ${project.id}`)}
                      className={`p-4 rounded-xl transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center shadow-sm ${
                        isCenter
                          ? "bg-accent text-accent-dark hover:bg-accent-dark hover:text-white"
                          : "bg-primary-light text-primary-dark hover:bg-primary hover:text-white"
                      }`}
                      aria-label="View Project"
                    >
                      <ArrowUpRight size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}