# Project screenshots

Two files per project drive the scrolling screen previews on the portfolio grid:

    <slug>/desktop.webp    ~1566 × 5000
    <slug>/mobile.webp     ~370 × 5000

The height is the point — it is a full-page capture, and the taller it is the
more natural the scroll inside the frame looks.

## Capturing

1. Open the live site, set the viewport to 1566px wide (desktop) or 370px (mobile).
2. Capture the full page — the GoFullPage Chrome extension does this in one click.
3. Convert to WebP at roughly quality 75.

Keep each file under ~600 KB. These are CSS backgrounds, so Next's image
optimiser never touches them; whatever you commit is what visitors download.
They are loaded lazily as the grid scrolls into view, but a 3 MB file is still
a 3 MB file once it is reached.

## Until they exist

A project with no screenshots renders an empty framed screen. That is a
deliberate placeholder, not a bug — it reads as intentional rather than broken.
