import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { MapPin, Mail, Phone, Smartphone, Globe } from "lucide-react";

const details = [
  { icon: MapPin, label: "Office", value: "Anweshan Pvt. Ltd., Talchikhel, Lalitpur, Nepal" },
  { icon: Phone, label: "Phone", value: "977-01-5526674" },
  { icon: Smartphone, label: "Mobile", value: "977-9801210115" },
  { icon: Mail, label: "Email", value: "info@anweshan.org" },
  { icon: Globe, label: "Website", value: "www.anweshan.org" },
];

const fields = [
  { id: "name", label: "Full name", type: "text", required: true },
  { id: "email", label: "Email", type: "email", required: true },
  { id: "organization", label: "Organization", type: "text", required: false },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-paper">
      <PageHeader
        tone="clay"
        eyebrow="Contact us"
        title="Start a conversation about your research question."
        lead="Whether you need full CRO support, a Q-squared survey, an evaluation, or communication design, our team in Lalitpur will get back to you."
        image="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2000"
        imageAlt="Kathmandu valley"
      />

      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8">

          <div className="lg:col-span-4">
            <Reveal>
              <p className="text-primary eyebrow mb-8 text-base">
                Reach us
              </p>
            </Reveal>

            <ul className="border-t border-primary/15">
              {details.map((item, i) => (
                <Reveal key={item.label} delay={i * 80}>
                  <li className="group flex items-start gap-4 py-6 border-b border-primary/15">
                    <item.icon
                      size={17}
                      className="text-primary mt-1 shrink-0 group-hover:scale-110 transition-transform"
                    />
                    <div>
                      <p className="text-base-text/55 text-base font-medium mb-1">
                        {item.label}
                      </p>
                      <p className="text-base-text text-lg font-medium">{item.value}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={200}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mt-10">
                <Image
                  src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=1200"
                  alt="Lalitpur, Nepal"
                  fill
                  sizes="(max-width: 1024px) 100vw, 32vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal>
              <h2 className="h2-section text-base-text mb-12">
                Send us a message.
              </h2>
            </Reveal>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {fields.map((field, i) => (
                <Reveal key={field.id} delay={i * 70} className="flex flex-col">
                  <label
                    htmlFor={field.id}
                    className="text-base-text/55 text-base font-medium mb-3"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    required={field.required}
                    className="bg-transparent border-0 border-b border-primary/25 pb-3 text-base-text text-base outline-none focus:border-primary transition-colors"
                  />
                </Reveal>
              ))}

              <Reveal delay={210} className="flex flex-col">
                <label
                  htmlFor="subject"
                  className="text-base-text/55 text-base font-medium mb-3"
                >
                  Enquiry about
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="bg-transparent border-0 border-b border-primary/25 pb-3 text-base-text text-base outline-none focus:border-primary transition-colors"
                >
                  <option>Clinical Research Services (CRO)</option>
                  <option>Q-Squared Research</option>
                  <option>Research &amp; Policy Dialogue</option>
                  <option>Health &amp; Development Communication</option>
                  <option>Information Technology</option>
                  <option>Political Economic Analysis</option>
                  <option>Career</option>
                  <option>Other</option>
                </select>
              </Reveal>

              <Reveal delay={280} className="flex flex-col md:col-span-2">
                <label
                  htmlFor="message"
                  className="text-base-text/55 text-base font-medium mb-3"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="bg-transparent border-0 border-b border-primary/25 pb-3 text-base-text text-base outline-none focus:border-primary transition-colors resize-y"
                />
              </Reveal>

              <Reveal delay={340} className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-5 pt-4">
                <button
                  type="submit"
                  className="rounded-full bg-accent text-dark text-md font-semibold px-9 py-4 hover:bg-primary transition-colors"
                >
                  Send message
                </button>
                <p className="text-base-text/45 text-md leading-relaxed">
                  This form is not yet wired to a backend. Until then, email{" "}
                  <span className="text-base-text/70 font-medium">info@anweshan.org</span> directly.
                </p>
              </Reveal>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
