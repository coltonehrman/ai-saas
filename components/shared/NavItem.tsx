"use client";

import { navLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NavItem = ({
  link,
  className = "sidebar-nav_element group",
  activeClassName = "bg-purple-gradient text-white",
  iconActiveClassName,
}: {
  link: (typeof navLinks)[0];
  className?: string;
  activeClassName?: string;
  iconActiveClassName?: string;
}) => {
  const pathname = usePathname();
  const isActive = link.route === pathname;

  return (
    <li
      key={link.route}
      className={`${className} ${isActive ? activeClassName : "text-gray-700"}`}
    >
      <Link className="sidebar-link" href={link.route}>
        <Image
          src={link.icon}
          alt="logo"
          width={24}
          height={24}
          className={`${isActive && iconActiveClassName}`}
        />

        {link.label}
      </Link>
    </li>
  );
};

export default NavItem;
