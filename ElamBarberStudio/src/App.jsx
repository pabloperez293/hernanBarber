// src/App.jsx
import React from 'react';
import BookingStepper from './components/client/BookingStepper';
import Navbar from './components/layout/Navbar';
import "./index.css";
import Hero from './components/home/Hero';


function App() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />
      <Hero />

      <main id="turnos" className="px-4">
      <BookingStepper />
      </main>
    </div>
  );
}

export default App;