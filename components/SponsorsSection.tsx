import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { repo } from "@/lib/repo";

const inquiryUrl = repo.newIssue;
const reveal = (index: number) => ({ "--i": index }) as CSSProperties;

/** Things maintainers spend their time on, which sponsorship pays for. */
const supports = [
  ["Reviewing submissions", "Checking every new library and component against its official source."],
  ["Keeping listings current", "Updating links, component records, and details as projects change."],
  ["Improving the directory", "Better search, filters, and pages for everyone who uses Col."],
] as const;

export function SponsorsSection() {
  return (
    <div className="pg">
      <header className="pg-head ld-reveal" style={reveal(0)}>
        <div>
          <h1>Sponsors</h1>
          <p className="pg-lead">Sponsorship helps keep Col free, open source, and maintained.</p>
        </div>
        <a href={inquiryUrl} target="_blank" rel="noopener noreferrer" className="ld-button ld-button-primary">
          <span className="cap">Become a sponsor</span>
          <ArrowUpRight aria-hidden />
        </a>
      </header>

      <section className="pg-section ld-reveal" style={reveal(1)} aria-labelledby="sponsors-current">
        <h2 id="sponsors-current">Our sponsors</h2>
        <a href="https://reactbits.dev" target="_blank" rel="noopener noreferrer">
          <img src="/sponsors/react-bits.jpg" width={1200} height={630} alt="React Bits, sponsor of Col. Free creative React components." style={{ width: "100%", maxWidth: 480, height: "auto" }} />
        </a>
        <p className="pg-lead">Thank you to React Bits for supporting Col.</p>
      </section>

      <section className="pg-section ld-reveal" style={reveal(2)} aria-labelledby="sponsors-supports">
        <h2 id="sponsors-supports">What sponsorship supports</h2>
        <ul className="pg-list">
          {supports.map(([title, text]) => (
            <li key={title} className="pg-row pg-row-static">
              <span className="pg-row-stack">
                <span className="pg-row-title">{title}</span>
                <span className="pg-row-text">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="pg-foot ld-reveal" style={reveal(3)}>
        Inquiries are public git.cafe issues, so leave billing and private contact details out.
      </p>
    </div>
  );
}
