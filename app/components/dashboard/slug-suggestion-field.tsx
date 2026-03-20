"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/form-field";
import { suggestSlugFromTitle } from "~/lib/slug";

interface SlugSuggestionFieldProps {
  defaultValue: string;
  error?: string;
  id?: string;
  initialTitleValue: string;
  inputClassName?: string;
  label: string;
  name: string;
  placeholder?: string;
  serverSuggestion?: string | null;
  titleInputId: string;
}

export function SlugSuggestionField({
  defaultValue,
  error,
  id,
  initialTitleValue,
  inputClassName,
  label,
  name,
  placeholder,
  serverSuggestion,
  titleInputId,
}: SlugSuggestionFieldProps) {
  const inputId = id ?? name;
  const [slugValue, setSlugValue] = useState(defaultValue);
  const [titleValue, setTitleValue] = useState("");
  const deferredTitleValue = useDeferredValue(titleValue);

  useEffect(() => {
    setSlugValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const titleInput = document.getElementById(titleInputId);

    if (!(titleInput instanceof HTMLInputElement)) {
      return undefined;
    }

    const syncTitleValue = () => {
      setTitleValue(titleInput.value);
    };

    syncTitleValue();
    titleInput.addEventListener("input", syncTitleValue);

    return () => {
      titleInput.removeEventListener("input", syncTitleValue);
    };
  }, [titleInputId]);

  const titleSuggestion = suggestSlugFromTitle(deferredTitleValue);
  const hasTitleChanged = deferredTitleValue.trim() !== initialTitleValue.trim();
  const nextSuggestion =
    serverSuggestion && serverSuggestion.length > 0 && !hasTitleChanged
      ? serverSuggestion
      : titleSuggestion;
  const shouldShowSuggestion =
    nextSuggestion.length > 0 && nextSuggestion !== slugValue;

  return (
    <div className="grid gap-2">
      <TextField
        id={inputId}
        error={error}
        inputClassName={inputClassName}
        label={label}
        name={name}
        onChange={(event) => {
          setSlugValue(event.currentTarget.value);
        }}
        placeholder={placeholder}
        value={slugValue}
      />
      {shouldShowSuggestion ? (
        <Button
          type="button"
          variant="secondary"
          className="h-auto max-w-full min-w-0 justify-start text-left tracking-[0.08em] break-all whitespace-normal"
          onClick={() => {
            setSlugValue(nextSuggestion);
          }}
        >
          <span>
            Use suggested slug: <span className="lowercase">{nextSuggestion}</span>
          </span>
        </Button>
      ) : null}
    </div>
  );
}
