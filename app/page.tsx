import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
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

export default function Home() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <Cursor />
      <Nav />
      <main id="main">
        <Hero />
        <Stats />
        <TechMarquee />
        <About />
        <Bento />
        <Ask />
        <Work />
        <Process />
        <Experience />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
