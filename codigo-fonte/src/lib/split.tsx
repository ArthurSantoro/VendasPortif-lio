import { Fragment } from 'react';
/** Splits a string into masked characters for per-letter animation. */
export function Chars({ text, className = 'ch' }: { text: string; className?: string }) {
  return (
    <>
      {text.split(' ').map((word, wi, arr) => (
        <Fragment key={wi}>
          <span className="word" aria-hidden>
            {[...word].map((c, i) => (
              <span className={className} key={i}>
                {c}
              </span>
            ))}
          </span>
          {wi < arr.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
/** Masked line: content slides from below its own clipping box. */
export function Line({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`line-mask ${className}`}>
      <span className="line-inner">{children}</span>
    </span>
  );
}
