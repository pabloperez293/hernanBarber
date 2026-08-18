// src/App.jsx
import React from 'react';
import BookingStepper from './components/client/BookingStepper';
import Navbar from './components/layout/Navbar';


function App() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      <main id="turnos" className="px-4">
      <BookingStepper />
      </main>
    </div>
  );
}

export default App;