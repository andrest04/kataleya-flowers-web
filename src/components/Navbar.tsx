"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Inicio", href: "#hero", isRoute: false },
  { label: "Catalogo", href: "#catalogo", isRoute: false },
  { label: "Nosotros", href: "#nosotros", isRoute: false },
  { label: "Contacto", href: "#contacto", isRoute: false },
] as const;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleNavigate = (href: string) => {
    // Extraer el ID del anchor (ej: "#hero" -> "hero")
    const targetId = href.startsWith("#") ? href.slice(1) : href.split("#")[1];
    if (!targetId) {
      setIsMenuOpen(false);
      return;
    }

    // Si no estamos en la landing page, navegar a /#target
    if (!isLandingPage) {
      setIsMenuOpen(false);
      window.location.href = `/#${targetId}`;
      return;
    }

    // Estamos en la landing page, hacer scroll suave
    const target = document.getElementById(targetId);

    if (!target) {
      console.warn(`[Navbar] Target element with id "${targetId}" not found`);
      setIsMenuOpen(false);
      return;
    }

    const scrollToTarget = () => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    if (isMenuOpen) {
      setIsMenuOpen(false);
      window.setTimeout(scrollToTarget, 320);
      return;
    }

    scrollToTarget();
  };

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-[90] transition-all duration-300"
        style={{
          backgroundColor: isScrolled ? "var(--color-cream)" : "transparent",
          boxShadow: isScrolled
            ? "0 14px 36px color-mix(in srgb, var(--color-dark) 10%, transparent)"
            : "none",
          backdropFilter: isScrolled ? "blur(8px)" : "blur(0px)",
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <button
            type="button"
            className="cursor-pointer text-left text-[1.45rem] leading-none transition-all duration-300"
            onClick={() => handleNavigate("#hero")}
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            Kataleya Flawers
          </button>

          <div className="hidden items-center gap-5 md:flex">
            {navLinks.map((link, index) => (
              <div key={link.href} className="flex items-center gap-5">
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    className="text-sm leading-none"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    ·
                  </span>
                ) : null}
                {link.isRoute ? (
                  <Link
                    href={link.href}
                    className="text-[0.8rem] font-normal tracking-[0.08em] uppercase transition-all duration-300"
                    style={{
                      color: "var(--color-dark)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="cursor-pointer text-[0.8rem] font-normal tracking-[0.08em] uppercase transition-all duration-300"
                    onClick={() => handleNavigate(link.href)}
                    style={{
                      color: "var(--color-dark)",
                      fontFamily: "var(--font-body)",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.color = "var(--color-accent)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.color = "var(--color-dark)";
                    }}
                  >
                    {link.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:block">
            <button
              type="button"
              className="cursor-pointer rounded-full border px-6 py-3 text-[0.8rem] tracking-[0.08em] uppercase transition-all duration-300"
              onClick={() => handleNavigate("#contacto")}
              style={{
                borderColor: "var(--color-primary)",
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = "var(--color-primary)";
                event.currentTarget.style.color = "var(--color-cream)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = "transparent";
                event.currentTarget.style.color = "var(--color-primary)";
              }}
            >
              Hacer pedido
            </button>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span
              className="block h-0.5 w-7 transition-all duration-300"
              style={{
                backgroundColor: "var(--color-primary)",
                transform: isMenuOpen ? "translateY(8px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-0.5 w-7 transition-all duration-300"
              style={{
                backgroundColor: "var(--color-primary)",
                opacity: isMenuOpen ? "0" : "1",
              }}
            />
            <span
              className="block h-0.5 w-7 transition-all duration-300"
              style={{
                backgroundColor: "var(--color-primary)",
                transform: isMenuOpen ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[80] flex items-center justify-center px-6 transition-all duration-300 md:hidden ${
          isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        style={{
          backgroundColor: isMenuOpen
            ? "color-mix(in srgb, var(--color-cream) 96%, transparent)"
            : "transparent",
          backdropFilter: isMenuOpen ? "blur(10px)" : "blur(0px)",
        }}
      >
        <div className="flex flex-col items-center gap-8 text-center">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                href={link.href}
                className="text-3xl transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.href}
                type="button"
                className="cursor-pointer text-3xl transition-all duration-300"
                onClick={() => handleNavigate(link.href)}
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-display)",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = "var(--color-accent)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = "var(--color-primary)";
                }}
              >
                {link.label}
              </button>
            )
          )}
          <button
            type="button"
            className="cursor-pointer rounded-full border px-8 py-3 text-[0.8rem] tracking-[0.08em] uppercase transition-all duration-300"
            onClick={() => handleNavigate("#contacto")}
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = "var(--color-primary)";
              event.currentTarget.style.color = "var(--color-cream)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = "transparent";
              event.currentTarget.style.color = "var(--color-primary)";
            }}
          >
            Hacer pedido
          </button>
        </div>
      </div>
    </>
  );
}
