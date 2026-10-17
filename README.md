# Little letters

A standalone, mobile-friendly handwriting worksheet maker inspired by [routine cards](https://github.com/bioshazard/routine-cards).

- Custom words, names, phrases, or blank writing paper.
- Original dotted single-stroke alphabet: A–Z, a–z, numbers and common punctuation. Single-storey lowercase a and g. Other characters use a solid fallback, flagged in the editor.
- Solid model rows, dotted / light / solid tracing, repeated phrases, and blank practice rows.
- 2, 3, or 4 writing guides (or none), four writing sizes, Letter and A4.
- Automatic wrapping and pagination, including long words. Size refers to the top-line-to-baseline distance.
- Multiple named worksheets, automatic browser storage, duplication, JSON export / import. Imports add worksheets without replacing existing work.
- No accounts, dependencies, remote fonts, analytics, or network requests. All user text stays in the browser.

Open `index.html` directly, or use the [live site](https://bios.dev/writing-practice/). Print at **100% / actual size**, with browser headers and footers disabled. Choose **Save as PDF** to export. The generated pages include their own margins; the print stylesheet uses zero printer margins. A4 / Letter selection updates both preview and print dimensions.

`letters.js` holds the original vector alphabet; `app.js` lays out physical-size SVG pages; `style.css` handles editor and print layout. No build step. GitHub Actions deploys on every push to `main`.

Local preview: `python3 -m http.server 8080`. Syntax check: `node --check app.js` and `node --check letters.js`. Run `node test-layout.cjs` to check wrapping, glyph coverage, and page geometry at every paper / writing size.
