// src/App.jsx
import React from "react";
import BookingStepper from "./components/client/BookingStepper";
import Navbar from "./components/layout/Navbar";
import "./index.css";
import Hero from "./components/home/Hero";
import Location from "./components/home/Location";
import Footer from "./components/layout/Footer";
import Services from "./components/home/Services";

function App() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />
      <main >
        <Hero />
        <Services />

        <Location />

        <section id="turnos" className="px-4">
        <BookingStepper />
        </section>        
      </main>

      <Footer />
    </div>
  );
}

export default App;
