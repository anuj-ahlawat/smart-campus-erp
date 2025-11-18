import { ShieldCheck, Smartphone, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchPortalButton } from "@/components/marketing/LaunchPortalButton";

const features = [
  {
    title: "Role-aware UX",
    body: "Admin, student, teacher, parent, hostel, cafeteria, staff and security journeys each get their own layout + redirect.",
    icon: ShieldCheck
  },
  {
    title: "Realtime Campus Pulse",
    body: "Socket.io broadcasts attendance, announcements, outpass status and menu updates instantly.",
    icon: Smartphone
  },
  {
    title: "Analytics-ready",
    body: "MongoDB + Mongoose + CSV exports make it simple to pipeline data into BI or AI copilots.",
    icon: LineChart
  }
];

export default function Home() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,98,254,0.35),_transparent_50%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-16 px-4 py-24 text-center">
        <div className="space-y-6">
          <span className="rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
            Smart Campus ERP
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
            Register your college and launch a secure campus ERP
          </h1>
          <p className="text-lg text-white/70 sm:text-xl">
            Next.js 14 + custom JWT auth + Express + MongoDB + Socket.io reference implementation.
            Includes invite-gated onboarding, QR passes, notifications and CI-ready automation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <a href="/auth/college-register">
                Register as College Admin
                <ShieldCheck className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <LaunchPortalButton />
            <Button asChild variant="outline" size="lg">
              <a href="#deployment" rel="noreferrer">
                Deployment Notes
              </a>
            </Button>
          </div>
        </div>
        <div className="grid w-full gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-white/20 bg-white/5 p-6 text-left backdrop-blur">
              <feature.icon className="mb-4 h-8 w-8 text-primary-foreground" />
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-white/70">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
