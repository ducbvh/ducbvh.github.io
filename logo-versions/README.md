# Logo versions — Duke

Monochrome spiral marks (theme = growth / evolution / the agent loop).
Open **preview.html** to see them all in light + dark.

Currently **in use across the site: `spiral-1-taper.svg`** (SP-1).

## Files
- spiral-1-taper.svg      — SP-1 · tapered thin→thick (IN USE)
- spiral-2-taper-fine.svg — SP-2 · tapered, more turns, finer
- spiral-3-bold.svg       — SP-3 · bold uniform stroke, round cap
- spiral-4-thin.svg       — SP-4 · fine 6-turn line
- spiral-5-medium.svg     — SP-5 · balanced stroke

## To swap the site logo
The mark is applied via CSS mask in `styles.css` (`.brand-mark`) and the
`favicon.svg` at the project root. To use a different one, change the two
`mask`/`-webkit-mask` URLs in `.brand-mark` to another file here, and
regenerate favicon.svg (or copy one of these and add the theme <style>).
