import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import {
  Hero,
  Capabilities,
  RoleMatrix,
  DataFlow,
  FAQ,
  Footer,
} from "@/components/landing/sections";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main>
        <Hero />
        <Capabilities />
        <RoleMatrix />
        <DataFlow />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
