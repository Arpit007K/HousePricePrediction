import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PredictForm from "@/components/PredictForm";
import BatchUpload from "@/components/BatchUpload";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PredictForm />
        <BatchUpload />
        <About />
      </main>
      <Footer />
    </>
  );
}
