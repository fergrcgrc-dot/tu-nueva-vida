import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Entrance animation for the public landing page: fades and lifts an element
 * into place the first time it enters the viewport. Transform + opacity only,
 * and it respects prefers-reduced-motion by skipping straight to visible.
 * See .landing-reveal in src/styles.css for the actual transition.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    // Already on screen (or close to it) the moment this mounts — show it now rather than
    // betting on an observer callback landing before the next paint. Content must be in place
    // on the first paint (references/layout.md §4); a reveal that never fires is a bug, not a look.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`landing-reveal ${className}`}
      data-visible={visible}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}
