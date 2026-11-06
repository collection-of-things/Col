import { Link } from "@/components/Link";
import { SiteFooter } from "@/components/SiteFooter";

/** The root not-found page, for unknown paths and unknown library or integration slugs. */
export function NotFound() {
  return (
    <>
      <meta name="robots" content="noindex" />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
        <p className="docs-accent text-sm font-semibold">404</p>
        <h1 className="theme-text mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
        <p className="theme-muted mt-4">The page you requested does not exist.</p>
        <Link to="/" className="hero-cta hero-cta-primary mt-8 min-h-11">Back to home</Link>
      </div>
      <SiteFooter />
    </>
  );
}
