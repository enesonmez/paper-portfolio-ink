import { Form, Link } from "react-router";
import { ArrowLeft, PenSquare, X } from "lucide-react";

import { SlugSuggestionField } from "~/components/dashboard/slug-suggestion-field";
import { Button } from "~/components/ui/button";
import { FormError, SelectField, TextField } from "~/components/ui/form-field";
import { POST_FORM_FIELD, POST_MUTATION_INTENT } from "~/features/posts/post.shared";

import {
  DASHBOARD_POSTS_COPY,
  DASHBOARD_POSTS_FORM_COPY,
} from "../dashboard-posts.constants";
import {
  dashboardPostStatusOptions,
  type DashboardPostsFormState,
} from "../dashboard-posts.shared";
import { DashboardPostsEditor } from "./dashboard-posts-editor";

interface DashboardPostsComposeViewProps {
  form: DashboardPostsFormState;
}

export function DashboardPostsComposeView({ form }: DashboardPostsComposeViewProps) {
  if (!form.isOpen || !form.mode) {
    return null;
  }

  const title =
    form.mode === "edit"
      ? DASHBOARD_POSTS_COPY.editTitle
      : DASHBOARD_POSTS_COPY.createTitle;
  const submitLabel =
    form.mode === "edit"
      ? DASHBOARD_POSTS_COPY.editActionLabel
      : DASHBOARD_POSTS_COPY.createTitle;
  const titleInputId = "dashboard-post-title";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-100 dark:bg-stone-900"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} Editor`}
    >
      <Form method="post" className="min-h-screen">
        <input
          type="hidden"
          name={POST_FORM_FIELD.intent}
          value={
            form.mode === "edit"
              ? POST_MUTATION_INTENT.update
              : POST_MUTATION_INTENT.create
          }
        />
        {form.mode === "edit" && form.editingPostId ? (
          <input
            type="hidden"
            name={POST_FORM_FIELD.postId}
            value={form.editingPostId}
          />
        ) : null}

        <header className="sticky top-0 z-10 border-b-2 border-black bg-stone-100/95 backdrop-blur dark:bg-stone-900/95">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button asChild variant="secondary" size="iconSm">
                <Link
                  to="/dashboard/posts"
                  aria-label={DASHBOARD_POSTS_FORM_COPY.backToListLabel}
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <div>
                <p className="font-display text-4xl leading-none uppercase">Compose</p>
                <p className="text-muted-foreground font-sans text-xs font-bold tracking-[0.16em] uppercase">
                  {DASHBOARD_POSTS_COPY.composeEyebrow}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-muted-foreground hidden font-sans text-xs font-bold tracking-[0.16em] uppercase md:block">
                {DASHBOARD_POSTS_FORM_COPY.heroHelper}
              </p>
              <Button
                type="submit"
                className="tracking-[0.14em] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <PenSquare className="size-4" aria-hidden="true" />
                {submitLabel}
              </Button>
              <Button asChild variant="secondary" size="iconSm">
                <Link
                  to="/dashboard/posts"
                  aria-label={DASHBOARD_POSTS_FORM_COPY.closeFullscreenLabel}
                >
                  <X className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="mx-auto w-full max-w-3xl space-y-6">
            <div className="space-y-3">
              <input
                id={titleInputId}
                name={POST_FORM_FIELD.title}
                defaultValue={form.values.title}
                placeholder={DASHBOARD_POSTS_FORM_COPY.fullscreenTitlePlaceholder}
                className="font-display w-full border-0 bg-transparent p-0 text-6xl leading-none text-stone-950 outline-none placeholder:text-stone-400 md:text-7xl dark:text-stone-50 dark:placeholder:text-stone-500"
              />
              <FormError message={form.errors?.title} />
              <textarea
                name={POST_FORM_FIELD.excerpt}
                defaultValue={form.values.excerpt}
                rows={3}
                placeholder={DASHBOARD_POSTS_FORM_COPY.excerpt.placeholder}
                className="w-full resize-none border-0 bg-transparent p-0 font-sans text-lg leading-8 text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-300 dark:placeholder:text-stone-500"
              />
              <FormError message={form.errors?.excerpt} />
            </div>

            <DashboardPostsEditor
              key={`${form.editingPostId ?? "create"}:${form.values.content}`}
              initialContent={form.values.content}
              inputName={POST_FORM_FIELD.content}
              variant="fullscreen"
            />
            <FormError message={form.errors?.content} />
          </section>

          <aside className="mx-auto w-full max-w-3xl space-y-6">
            <section className="bg-card border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-stone-800 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
              <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                Story Setup
              </p>
              <div className="mt-4 grid gap-4">
                <SlugSuggestionField
                  defaultValue={form.values.slug}
                  error={form.errors?.slug}
                  id={POST_FORM_FIELD.slug}
                  initialTitleValue={form.values.title}
                  label={DASHBOARD_POSTS_FORM_COPY.slug.label}
                  name={POST_FORM_FIELD.slug}
                  placeholder={DASHBOARD_POSTS_FORM_COPY.slug.placeholder}
                  serverSuggestion={form.slugSuggestion}
                  titleInputId={titleInputId}
                />
                <TextField
                  error={form.errors?.coverImageUrl}
                  label={DASHBOARD_POSTS_FORM_COPY.coverImageUrl.label}
                  name={POST_FORM_FIELD.coverImageUrl}
                  defaultValue={form.values.coverImageUrl}
                  placeholder={DASHBOARD_POSTS_FORM_COPY.coverImageUrl.placeholder}
                />
                <SelectField
                  error={form.errors?.status}
                  label={DASHBOARD_POSTS_FORM_COPY.status.label}
                  name={POST_FORM_FIELD.status}
                  defaultValue={form.values.status}
                  options={dashboardPostStatusOptions}
                />
              </div>
            </section>

            <section className="bg-card border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-stone-800 dark:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
              <p className="font-sans text-xs font-bold tracking-[0.18em] uppercase">
                Editor Flow
              </p>
              <div className="mt-4 grid gap-3">
                <Button
                  asChild
                  variant="secondary"
                  className="justify-between tracking-[0.12em]"
                >
                  <Link to="/dashboard/posts">
                    {DASHBOARD_POSTS_FORM_COPY.backToListLabel}
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </Form>
    </div>
  );
}
