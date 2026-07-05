# Adding a new project

1. Create a folder in the site root named like the ones you're already using:
   `2 Project Name`, `3 Project Name`, and so on. Drop your work images inside,
   numbered `1`, `2`, `3`... in whatever order makes sense for the page (the
   image that should open the case study first, then the rest).

2. Optimize the images. From the site root, in PowerShell:

   ```
   .\tools\optimize-project-images.ps1 -ProjectFolder "2 Project Name" -Slug "project-slug"
   ```

   This resizes anything too large and converts everything to compressed JPEGs
   in `images\work\project-slug\`, keeping the same numbers as your source
   files. Raw folders like `2 Project Name` are already ignored by git, so they
   never get uploaded, only the optimized copies do.

3. Copy `tools/template-project.html` into the site root, rename it to
   `project-slug.html`, and fill in the placeholders (title, role, tools,
   timeline, intro text, and which numbered image goes in which section).
   Write real alt text for every image.

4. Add a card for it in `projects.html` (and `index.html` if it should be
   featured on the homepage), then fix the `case-nav` prev/next links on the
   new page and on the two projects next to it in the chain, so the loop
   still connects all the way around.

That's it, no other files need to change. The shared styles in
`css/base.css` and `css/case-study.css` already cover the header, nav,
footer, cursor, buttons, and every grid layout the template uses.
