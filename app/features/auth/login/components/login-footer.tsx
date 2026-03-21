import { useLoginCopy } from "../login.constants";

export function LoginFooter() {
  const copy = useLoginCopy();

  return (
    <footer className="dark:border-primary relative z-10 border-t-2 border-black bg-white px-4 py-5 md:px-6 dark:bg-stone-900">
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4">
        <p className="text-muted-foreground font-sans text-[10px] leading-relaxed tracking-[0.16em] uppercase">
          {copy.buildLabel}
          <br />
          {copy.nodeLabel}
        </p>
        <div className="flex gap-2">
          <span className="dark:bg-primary h-3.5 w-3.5 bg-black" />
          <span className="bg-primary h-3.5 w-3.5 border border-black" />
          <span className="dark:border-primary h-3.5 w-3.5 border-2 border-black" />
        </div>
      </div>
    </footer>
  );
}
