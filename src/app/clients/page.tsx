import { permanentRedirect } from "next/navigation";

export default function ClientsPage() {
  permanentRedirect("/services#clients");
}
