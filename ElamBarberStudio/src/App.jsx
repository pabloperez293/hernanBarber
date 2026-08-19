import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import Services from "./components/home/Services";
import Location from "./components/home/Location";
import BookingStepper from "./components/client/BookingStepper";
import ScrollToHashElement from "./components/scrollToHasElement/ScrollToHashElement";
import Gallery from "./components/home/Gallery";

function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Gallery />
      <Location />
    </main>
  );
}

function Booking() {
  return (
    <main>
      <BookingStepper />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHashElement />
      <div className="flex min-h-screen flex-col bg-[#0B0B0B] text-white">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reservar" element={<Booking />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}