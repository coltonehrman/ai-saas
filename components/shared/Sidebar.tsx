import { navLinks } from "@/constants";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import NavItem from "./NavItem";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        <Link href="/" className="sidebar-logo">
          <Image
            src="/assets/images/logo-text.svg"
            alt="logo"
            width={180}
            height={280}
          />
        </Link>

        <nav className="sidebar-nav">
          <SignedIn>
            <ul className="sidebar-nav_elements">
              {navLinks.slice(0, 6).map((link) => (
                <NavItem
                  key={link.route}
                  link={link}
                  iconActiveClassName="brightness-200"
                />
              ))}
            </ul>

            <ul className="sidebar-nav_elements">
              {navLinks.slice(6).map((link) => (
                <NavItem
                  key={link.route}
                  link={link}
                  iconActiveClassName="brightness-200"
                />
              ))}

              <li className="flex cursor-pointer gap-2 p-4">
                <UserButton afterSignOutUrl="/" showName />
              </li>
            </ul>
          </SignedIn>

          <SignedOut>
            <ul className="sidebar-nav_elements">
              {navLinks.slice(0, 1).map((link) => (
                <NavItem
                  key={link.route}
                  link={link}
                  iconActiveClassName="brightness-200"
                />
              ))}
            </ul>

            <ul className="sidebar-nav_elements">
              <li className="flex cursor-pointer gap-2 p-4">
                <Button asChild className="button bg-purple-gradient bg-cover">
                  <Link href="signin">Login</Link>
                </Button>
              </li>
            </ul>
          </SignedOut>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
