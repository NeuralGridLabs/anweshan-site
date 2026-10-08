/* --------------------------------------------------------------------------
    Highlight helper

    Wraps the first exact occurrence of `highlight` inside `text` in a <span>,
    so an editor can mark one phrase inside a CMS-authored heading without the
    component hardcoding where the coloured words sit.

    Falls back to the plain text whenever there is nothing to wrap, so a missing
    or mismatched highlight changes nothing on screen.
   ----------------------------------------------------------------------- */

export function highlightText(
  text: string,
  highlight?: string,
  className?: string,
) {
  /* Nothing to do without all three, so an unconfigured call is inert. */
  if (!text || !highlight || !className) return text;

  const index = text.indexOf(highlight);

  /* Not found: return the original string so the heading renders unstyled. */
  if (index === -1) return text;

  const end = index + highlight.length;

  return (
    <>
      {text.slice(0, index)}
      <span className={className}>{text.slice(index, end)}</span>
      {text.slice(end)}
    </>
  );
}