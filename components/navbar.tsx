"use client"
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import Image from "next/image";
import {
  HomeIcon,
  Users,
  HelpCircle,
  Share2,
  FileText,
  Bell,
  MessageSquare,
  Wallet,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleInDevelopment = (e: React.MouseEvent, itemLabel: string) => {
    e.preventDefault();
    toast.info(`${itemLabel} - Función en desarrollo`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const menuItems = [
    { label: "Inicio", href: "/", icon: HomeIcon },
    { label: "Nosotros", href: "/nosotros", icon: Users },
    { label: "¿Qué puedes hacer?", href: "/servicios", icon: HelpCircle },
    { label: "Social", href: "/social", icon: Share2 },
    { label: "Solicitudes", href: "/solicitudes", icon: FileText },
    { label: "Novedades", href: "/novedades", icon: Bell },
    { label: "PQRS", href: "/pqrs", icon: MessageSquare },
  ];

  return (
    <HeroUINavbar 
      maxWidth="xl" 
      position="sticky" 
      className="bg-white py-2 shadow-sm w-full"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <Image 
          src="/logo-cotrafasocial.png" 
          alt="Logo Cotrafasocial" 
          width={60}
          height={90}
          className="object-contain w-[80px] h-[60px] cursor-pointer"
          onClick={() => router.push("/")}
        />
        
        <ul className="hidden lg:flex items-center gap-6">
          {menuItems.map((item) => (
            <NavbarItem key={item.href}>
              {item.label === "Inicio" || item.label === "Solicitudes" ? (
                  <NextLink
                    href={item.href}
                    className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2 py-2"
                  >
                    <item.icon size={20} className="stroke-[1.5px]" />
                    {item.label}
                  </NextLink>
                ) : (
                  <a
                    href="#"
                    className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2 py-2"
                    onClick={(e) => handleInDevelopment(e, item.label)}
                  >
                    <item.icon size={20} className="stroke-[1.5px]" />
                    {item.label}
                  </a>
                )}
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex items-center gap-3" justify="end">
        <NavbarItem>
          <Button
            as="a"
            href="#"
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium px-4 py-2 rounded flex items-center gap-2"
            onClick={(e) => handleInDevelopment(e, "Pagos en línea")}
          >
            <Wallet size={20} className="stroke-[1.5px]" />
            Pagos en línea
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as="a"
            href="#"
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded flex items-center gap-2"
            onClick={(e) => handleInDevelopment(e, "Ingresar")}
          >
            <LogIn size={20} className="stroke-[1.5px]" />
            Ingresar
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden" justify="end">
        <NavbarMenuToggle onClick={() => setIsMenuOpen(!isMenuOpen)} />
      </NavbarContent>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white py-4 shadow-lg sm:hidden">
          {menuItems.map((item) => (
            item.label === "Inicio" || item.label === "Solicitudes" ? (
              <NextLink
                key={item.href}
                className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2 py-3 px-4"
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={20} className="stroke-[1.5px]" />
                {item.label}
              </NextLink>
            ) : (
              <a
                key={item.href}
                href="#"
                className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-2 py-3 px-4"
                onClick={(e) => {
                  handleInDevelopment(e, item.label);
                  setIsMenuOpen(false);
                }}
              >
                <item.icon size={20} className="stroke-[1.5px]" />
                {item.label}
              </a>
            )
          ))}
          
          <div className="flex flex-col gap-3 mt-6 px-4">
            <Button
              as="a"
              href="#"
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium px-4 py-2 rounded flex items-center gap-2 justify-center"
              onClick={(e) => {
                handleInDevelopment(e, "Pagos en línea");
                setIsMenuOpen(false);
              }}
            >
              <Wallet size={20} className="stroke-[1.5px]" />
              Pagos en línea
            </Button>
            
            <Button
              as="a"
              href="#"
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded flex items-center gap-2 justify-center"
              onClick={(e) => {
                handleInDevelopment(e, "Ingresar");
                setIsMenuOpen(false);
              }}
            >
              <LogIn size={20} className="stroke-[1.5px]" />
              Ingresar
            </Button>
          </div>
        </div>
      )}
    </HeroUINavbar>
  );
};
