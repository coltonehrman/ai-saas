"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { navLinks } from "@/constants";
import NavItem from "./NavItem";
import { Button } from "../ui/button";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <Link href="/" className="flex items-center gap-2 md:py-2">
        <Image
          src="/assets/images/logo-text.svg"
          alt="logo"
          width={180}
          height={28}
        />
      </Link>

      <nav className="flex gap-2">
        <UserButton afterSignOutUrl="/" />

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger>
            <Image
              src="/assets/icons/menu.svg"
              alt="menu"
              className="cursor-pointer"
              width={32}
              height={32}
            />
          </SheetTrigger>

          <SheetContent className="sheet-content sm:w-64">
            <Image
              src="/assets/images/logo-text.svg"
              alt="logo"
              width={152}
              height={23}
            />
            <SignedIn>
              <ul className="header-nav_elements">
                {navLinks.slice(0, 6).map((link) => (
                  <NavItem
                    key={link.route}
                    link={link}
                    className="p-18 flex whitespace-nowrap text-dark-700"
                    activeClassName="gradient-text"
                    onClick={() => setIsOpen(!isOpen)}
                  />
                ))}
              </ul>

              <ul className="header-nav_elements">
                {navLinks.slice(6).map((link) => (
                  <NavItem
                    key={link.route}
                    link={link}
                    className="p-18 flex whitespace-nowrap text-dark-700"
                    activeClassName="gradient-text"
                    onClick={() => setIsOpen(!isOpen)}
                  />
                ))}
              </ul>
            </SignedIn>

            <SignedOut>
              <ul className="header-nav_elements">
                {navLinks.slice(0, 1).map((link) => (
                  <NavItem
                    key={link.route}
                    link={link}
                    className="p-18 flex whitespace-nowrap text-dark-700"
                    activeClassName="gradient-text"
                    onClick={() => setIsOpen(!isOpen)}
                  />
                ))}
              </ul>

              <ul className="header-nav_elements">
                <li className="flex cursor-pointer gap-2 p-4">
                  <Button
                    asChild
                    className="button bg-purple-gradient bg-cover"
                  >
                    <Link href="signin">Login</Link>
                  </Button>
                </li>
              </ul>
            </SignedOut>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default MobileNav;
