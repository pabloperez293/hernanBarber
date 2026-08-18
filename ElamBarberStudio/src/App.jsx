import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";
import Services from "./components/home/Services";
import Location from "./components/home/Location";
import Footer from "./components/layout/Footer";
import BookingStepper from "./components/client/BookingStepper";

function Home() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      <main>
        <Hero />
        <Services />
        <Location />
      </main>

      <Footer />
    </div>
  );
}

function Booking() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      <main>
        <BookingStepper />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reservar" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
}