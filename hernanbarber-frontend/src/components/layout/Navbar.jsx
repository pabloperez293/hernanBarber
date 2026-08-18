import { useState } from 'react'
import {
     Menu, MessageCircle, X 
} from "lucide-react";

import logo from "../../assets/jr.jpg";

const navLinks = [ { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Barberos", href: "#barberos" },
  { label: "Galería", href: "#galeria" },
  { label: "Ubicación", href: "#ubicacion" }];
  
const  WHATSAPP_NUMBER = "1166023096";


export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;

    const handleMenuClick = () => {
        setMenuOpen(false);
    };

    return (
        <nav className='sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0B0B]/90 backdrop-blur-md'>
    <div className="mx-auto flex h-20 max-w-7xl item center justify-between px-4 sm:px-6 lg:px-8">

    </div>
        </nav>

)};