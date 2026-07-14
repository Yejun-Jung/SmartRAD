"use client";

import { AnchorHTMLAttributes, MouseEvent } from "react";

interface HashLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: `#${string}`;
}

export default function HashLink({ href, onClick, ...props }: HashLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(href.slice(1));

    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      window.history.pushState(null, "", href);
    }

    onClick?.(e);
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
