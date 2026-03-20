import { Contrast, MoonStar, SunMedium } from "lucide-react";
import { Form, useLocation } from "react-router";

import { Button } from "~/components/ui/button";

import {
  PUBLIC_LAYOUT_COPY,
  PUBLIC_THEME,
  PUBLIC_THEME_FORM_FIELD,
  PUBLIC_THEME_INTENT,
  type PublicTheme,
} from "../public-layout.shared";

interface PublicThemeToggleProps {
  theme: PublicTheme;
}

export function PublicThemeToggle({ theme }: PublicThemeToggleProps) {
  const location = useLocation();
  const nextTheme =
    theme === PUBLIC_THEME.light ? PUBLIC_THEME.dark : PUBLIC_THEME.light;
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;
  const themeLabel =
    nextTheme === PUBLIC_THEME.dark
      ? PUBLIC_LAYOUT_COPY.themeDarkLabel
      : PUBLIC_LAYOUT_COPY.themeLightLabel;

  return (
    <Form action={PUBLIC_LAYOUT_COPY.themeToggleAction} method="post" replace>
      <input
        type="hidden"
        name={PUBLIC_THEME_FORM_FIELD.intent}
        value={PUBLIC_THEME_INTENT.setTheme}
      />
      <input
        type="hidden"
        name={PUBLIC_THEME_FORM_FIELD.redirectTo}
        value={redirectTo}
      />
      <input type="hidden" name={PUBLIC_THEME_FORM_FIELD.theme} value={nextTheme} />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        aria-label={`${PUBLIC_LAYOUT_COPY.themeToggle}: ${themeLabel}`}
        className="gap-1.5 px-2 py-2 text-[11px] min-[420px]:gap-2 min-[420px]:px-3"
      >
        <Contrast className="hidden size-4 min-[420px]:block" aria-hidden="true" />
        {theme === PUBLIC_THEME.light ? (
          <MoonStar className="size-4" aria-hidden="true" />
        ) : (
          <SunMedium className="size-4" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{PUBLIC_LAYOUT_COPY.themeToggle}</span>
      </Button>
    </Form>
  );
}
