export function LoginBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg[radial-gradient(var(--color-border)_0.6px,transparent_0.6px)] bg-size[20px_20px] opacity-[0.06] dark:opacity-[0.04]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="dark:border-primary absolute top-8 left-6 h-24 w-24 rotate-12 border-4 border-black md:top-12 md:left-10 md:h-32 md:w-32" />
        <div className="dark:border-primary absolute right-8 bottom-16 h-40 w-40 -rotate-12 border-2 border-black md:right-14 md:bottom-20 md:h-64 md:w-64" />
        <div className="dark:bg-primary absolute top-[42%] left-[18%] h-4 w-4 rotate-45 bg-black" />
      </div>
    </>
  );
}
