import { Link } from "@/components/Link";
import { SiteFooter } from "@/components/SiteFooter";

/** The root not-found page, for unknown paths and unknown library or integration slugs. */
export function NotFound() {
  return (
    <>
      <meta name="robots" content="noindex" />
      <div className="pg-fill">
        <div className="pg">
          <div className="pg-404">
            <header className="pg-head">
              <div>
                <h1>Page not found</h1>
                <p className="pg-lead">The page you requested does not exist.</p>
              </div>
            </header>
            <Link to="/" className="ld-button ld-button-primary"><span className="cap">Back to home</span></Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    </>
  );
}
