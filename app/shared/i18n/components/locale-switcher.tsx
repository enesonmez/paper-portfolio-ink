import { Form, useLocation } from "react-router";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { useAppI18n, useLocalizedPath } from "../i18n-react";

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const location = useLocation();
  const { locale, supportedLocales, t } = useAppI18n();
  const to = useLocalizedPath();
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;

  return (
    <div
      role="group"
      aria-label={t("common.localeSwitcherAriaLabel")}
      className={cn("flex items-center gap-1", className)}
    >
      {supportedLocales.map((option) => {
        const isActive = option.code === locale;

        return (
          <Form key={option.code} action={to("/locale")} method="post" replace>
            <input type="hidden" name="locale" value={option.code} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Button
              type="submit"
              variant={isActive ? "default" : "secondary"}
              size="sm"
              aria-pressed={isActive}
              className="min-w-11 px-2 py-2 text-[11px]"
            >
              {option.label}
            </Button>
          </Form>
        );
      })}
    </div>
  );
}
