"use client";

import { FormEvent, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  wide?: boolean;
  multiline?: boolean;
};

const studyFields: Field[] = [
  { name: "name", label: "Name", required: true },
  { name: "organisation", label: "Organisation", required: true },
  { name: "role", label: "Role", required: true },
  { name: "email", label: "Work email", type: "email", required: true },
  { name: "studyType", label: "Study type or phase", required: true },
  { name: "therapeuticArea", label: "Therapeutic area", required: true },
  { name: "targetPopulation", label: "Target population", wide: true },
  { name: "siteAssumptions", label: "Site assumptions", wide: true },
  { name: "expectedTimeline", label: "Expected timeline", required: true },
  { name: "message", label: "Message", multiline: true, wide: true },
];

const capabilityFields: Field[] = [
  { name: "name", label: "Name", required: true },
  { name: "organisation", label: "Organisation", required: true },
  { name: "email", label: "Work email", type: "email", required: true },
  { name: "purpose", label: "Purpose", required: true, wide: true },
];

function MailtoForm({ fields, subject, buttonLabel }: { fields: Field[]; subject: string; buttonLabel: string }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body = fields
      .map((field) => `${field.label}: ${String(values.get(field.name) ?? "")}`)
      .join("\n");
    window.location.href = `mailto:info@anweshan.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const inputClass = "mt-2 w-full rounded-xl border border-forest/20 bg-white px-4 py-3 text-base text-forest placeholder:text-forest/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <label key={field.name} className={`block text-sm font-semibold text-forest ${field.wide ? "sm:col-span-2" : ""}`}>
          {field.label}{field.required && <span aria-hidden="true"> *</span>}
          {field.multiline ? (
            <textarea className={inputClass} name={field.name} rows={4} required={field.required} />
          ) : (
            <input className={inputClass} name={field.name} type={field.type ?? "text"} required={field.required} />
          )}
        </label>
      ))}
      <div className="sm:col-span-2">
        <button type="submit" className="inline-flex items-center justify-center rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-forest/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
          {buttonLabel}
        </button>
        {sent && <p className="mt-4 text-sm text-forest" role="status">Your email app should open with the request ready to send. If it does not, email <a className="underline underline-offset-4" href="mailto:info@anweshan.org">info@anweshan.org</a>.</p>}
      </div>
    </form>
  );
}

export function FeasibilityForm() {
  return <MailtoForm fields={studyFields} subject="CRO enquiry" buttonLabel="Prepare enquiry email" />;
}

export function CapabilityPackForm() {
  return <MailtoForm fields={capabilityFields} subject="CRO capability pack request" buttonLabel="Request capability pack" />;
}
