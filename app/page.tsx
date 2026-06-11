import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Atmosphere from "@/components/Atmosphere";
import SectionDivider from "@/components/SectionDivider";
import NarrativeStatement from "@/components/NarrativeStatement";
import TechMarquee from "@/components/TechMarquee";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import About from "@/components/sections/About";
import Bento from "@/components/sections/Bento";
import Ask from "@/components/sections/Ask";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import Experience from "@/components/sections/Experience";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import { profile } from "@/data/profile";

/**
 * The page is one scroll-authored narrative:
 * intro (Hero) → who (Stats/About) → the through-line (pinned statement) →
 * what I can do (Bento, Ask) → the proof (Work) → the method (Process) →
 * the journey (Experience) → the next chapter (FAQ, Contact).
 * One fixed Atmosphere evolves underneath the whole arc; labeled dividers
 * hand the story between chapters.
 */
export default function Home() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <Cursor />
      <Nav />
      <main id="main" className="relative">
        <Atmosphere />
        <div className="relative">
          <Hero />
          <Stats />
          <TechMarquee />
          <About />
          <NarrativeStatement />
          <Bento />
          <Ask />
          <SectionDivider label={profile.narrative.handoffs.work} />
          <Work />
          <SectionDivider label={profile.narrative.handoffs.process} />
          <Process />
          <Experience />
          <SectionDivider label={profile.narrative.handoffs.contact} />
          <Faq />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
