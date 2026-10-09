"use client";

import { useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronDown,
  SlidersHorizontal,
  BookOpen,
  Award,
  Unlock,
  Users,
  Globe,
} from "lucide-react";

import { PUBLICATION_TYPES, ANWESHAN_ROLES, ACCESS_STATUSES } from "@/lib/publication-options";
import type { Publication } from "@/lib/types";

export type PublicationFilters = {
  query: string;
  type: string;
  year: string;
  topic: string;
  client: string;
  geography: string;
  role: string;
  accessStatus: string;
};

const EMPTY_FILTERS: PublicationFilters = {
  query: "",
  type: "all",
  year: "all",
  topic: "all",
  client: "all",
  geography: "all",
  role: "all",
  accessStatus: "all",
};

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  ...PUBLICATION_TYPES.map((t) => ({ value: t.value as string, label: t.title as string })),
];

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  ...ANWESHAN_ROLES.map((r) => ({ value: r.value as string, label: r.title as string })),
];

const ACCESS_OPTIONS = [
  { value: "all", label: "All access" },
  ...ACCESS_STATUSES.map((a) => ({ value: a.value as string, label: a.title as string })),
];

function Select({
  label,
  id,
  value,
  onChange,
  options,
  className = "",
  icon,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-forest/70">
        {icon && <span className="text-forest/50">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-forest/15 bg-white px-3 py-2.5 pr-10 text-sm text-forest transition-all duration-200 hover:border-forest/30 focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-forest/40" />
      </div>
    </div>
  );
}

interface PublicationFiltersProps {
  publications: Publication[];
  filters: PublicationFilters;
  onFiltersChange: (filters: PublicationFilters) => void;
}

export default function PublicationFilters({
  publications,
  filters,
  onFiltersChange,
}: PublicationFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const years = useMemo(() => {
    const ys = [...new Set(publications.map((p) => p.year).filter((y): y is number => typeof y === "number"))];
    return ys.sort((a, b) => b - a);
  }, [publications]);

  const topics = useMemo(
    () => [...new Set(publications.flatMap((p) => p.topic || []))].sort(),
    [publications]
  );

  const clients = useMemo(
    () => [...new Set(publications.map((p) => p.client).filter((c): c is string => Boolean(c)))].sort(),
    [publications]
  );

  const geographies = useMemo(
    () => [...new Set(publications.flatMap((p) => p.geography || []))].sort(),
    [publications]
  );

  // Only called from user events, never from an effect
  const handleFilterChange = (key: keyof PublicationFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => onFiltersChange(EMPTY_FILTERS);

  const activeFilterCount = [
    filters.type !== "all",
    filters.year !== "all",
    filters.topic !== "all",
    filters.client !== "all",
    filters.geography !== "all",
    filters.role !== "all",
    filters.accessStatus !== "all",
  ].filter(Boolean).length;

  const hasActiveFilters = filters.query !== "" || activeFilterCount > 0;

  return (
    <div className="border-b border-forest/15 bg-sage/30">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col gap-3 py-5 md:flex-row md:items-center">
          <div className="relative w-full md:w-96">
            <Search size={16} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" />
            <input
              id="pub-search"
              type="search"
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
              placeholder="Search titles, authors, journals, topics..."
              className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-11 pr-4 text-sm text-forest placeholder:text-forest/40 transition-all duration-200 focus:border-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 self-start rounded-full bg-forest/10 px-4 py-2 text-sm font-semibold text-forest transition-all duration-200 hover:bg-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/50"
            >
              <X size={14} aria-hidden />
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-4 border-t border-forest/10 pb-5 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Type"
              id="pub-type"
              value={filters.type}
              onChange={(v) => handleFilterChange("type", v)}
              options={TYPE_OPTIONS}
              icon={<BookOpen size={14} />}
            />
            <Select
              label="Year"
              id="pub-year"
              value={filters.year}
              onChange={(v) => handleFilterChange("year", v)}
              options={[{ value: "all", label: "All years" }, ...years.map((y) => ({ value: String(y), label: String(y) }))]}
            />
            <Select
              label="Role"
              id="pub-role"
              value={filters.role}
              onChange={(v) => handleFilterChange("role", v)}
              options={ROLE_OPTIONS}
              icon={<Award size={14} />}
            />
            <Select
              label="Access"
              id="pub-access"
              value={filters.accessStatus}
              onChange={(v) => handleFilterChange("accessStatus", v)}
              options={ACCESS_OPTIONS}
              icon={<Unlock size={14} />}
            />
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            aria-expanded={advancedOpen}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-forest/70 transition-colors hover:bg-white/50 hover:text-forest md:w-auto"
          >
            <SlidersHorizontal size={16} />
            <span>Advanced filters</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`} />
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">
                {activeFilterCount}
              </span>
            )}
          </button>

          {advancedOpen && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Topic"
                id="pub-topic"
                value={filters.topic}
                onChange={(v) => handleFilterChange("topic", v)}
                options={[{ value: "all", label: "All topics" }, ...topics.map((t) => ({ value: t, label: t }))]}
              />
              <Select
                label="Client / Partner"
                id="pub-client"
                value={filters.client}
                onChange={(v) => handleFilterChange("client", v)}
                options={[{ value: "all", label: "All clients" }, ...clients.map((c) => ({ value: c, label: c }))]}
                icon={<Users size={14} />}
              />
              <Select
                label="Geography"
                id="pub-geography"
                value={filters.geography}
                onChange={(v) => handleFilterChange("geography", v)}
                options={[{ value: "all", label: "All geographies" }, ...geographies.map((g) => ({ value: g, label: g }))]}
                icon={<Globe size={14} />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}