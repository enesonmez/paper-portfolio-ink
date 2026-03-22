import { Link } from "react-router";

import { LocaleSwitcher } from "~/shared/i18n/components/locale-switcher";
import { useLocalizedPath } from "~/shared/i18n/i18n-react";

import { useLoginCopy } from "../copy";

export function LoginHeader() {
  const to = useLocalizedPath();
  const copy = useLoginCopy();

  return (
    <header className="dark:border-primary relative z-10 border-b-2 border-black bg-white px-4 py-4 md:px-6 dark:bg-stone-900">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary border-2 border-black px-3 py-2 text-lg leading-none text-black">
            &gt;_
          </div>
          <p className="text-foreground font-sans text-base font-bold tracking-[0.08em] uppercase md:text-lg">
            {copy.siteName}{" "}
            <span className="dark:bg-primary bg-black px-2 py-1 text-xs text-white dark:text-black">
              {copy.adminBadge}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            to={to("/")}
            className="dark:focus-visible:outline-primary font-sans text-xs font-bold tracking-[0.12em] uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            {copy.returnToSite}
          </Link>
        </div>
      </div>
    </header>
  );
}
