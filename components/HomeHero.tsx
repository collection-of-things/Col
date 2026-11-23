import { Fragment, type CSSProperties } from "react";
import { Image } from "@/components/Image";
import { Link } from "@/components/Link";
import { ArrowRight, Star } from "lucide-react";
import { sponsors } from "@/data/sponsors";
import { repo } from "@/lib/repo";
import { DitherHall } from "./DitherHall";
import { RollText } from "./RollText";
import styles from "./HomePage.module.css";

/** Headline lines, split into words so each one can rise in on its own. `order` staggers them; the last line is set in flame italic. */
const headlineLines = [
  ["The", "libraries", "that", "developers", "love,"],
  ["all", "in", "one", "place"],
];
const headline = headlineLines.map((line, lineIndex) => {
  const start = headlineLines.slice(0, lineIndex).flat().length;
  return line.map((word, wordIndex) => ({ word, order: start + wordIndex }));
});

/** The hero's scenery: the Great Library as a flame dither. Stays on screen behind every scene. */
export function HeroBackdrop() {
  return <DitherHall className={styles.hall} />;
}

/** The hero's copy: headline (words rise in one by one), subtitle, the two calls to action, and the sponsors line. */
export function HeroCopy() {
  return (
    <section className={styles.heroCopy} aria-labelledby="home-title">
      <h1 id="home-title">
        {headline.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            <span className={lineIndex > 0 ? styles.headlineAccent : undefined}>
              {line.map(({ word, order }, wordIndex) => (
                <Fragment key={order}>
                  {wordIndex > 0 && " "}
                  <span className={styles.word} style={{ "--word": order } as CSSProperties}>{word}</span>
                </Fragment>
              ))}
            </span>
          </Fragment>
        ))}
      </h1>
      <p>Discover UI libraries, components, and tools by stack and use case.</p>
      <div className={styles.actions}>
        <Link to="/libraries" className={styles.button}>
          <RollText>Browse libraries</RollText>
          <span className={styles.arrowSwap} aria-hidden><ArrowRight /><ArrowRight /></span>
        </Link>
        <a href={repo.url} target="_blank" rel="noopener noreferrer" className={styles.starLink}>
          <Star aria-hidden />
          <RollText>Star on GitHub</RollText>
        </a>
      </div>
      {sponsors.length > 0 && (
        <p className={styles.sponsors}>
          <span>Sponsored by</span>
          {sponsors.map(({ name, url, tier, logo }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer">
              <Image src={logo} alt="" width={128} height={128} className={styles.sponsorMark} />
              <span className={styles.sponsorName}>{name}</span>
              <span className={styles.sponsorTier}>· {tier}</span>
            </a>
          ))}
        </p>
      )}
    </section>
  );
}
