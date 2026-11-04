# Road to Hamburg 2027

**[Open the site →](https://armanqala011.github.io/roadtohamburg2027/)**

Training plan site for Arman's 33-week build toward IRONMAN Hamburg (Sunday 6 June 2027, goal sub-10:30), with IRONMAN 70.3 Doha on 20 March 2027 as the tune-up. In English and Russian; switch with the EN / RU buttons in the menu.

## Files

```
index.html     Page markup: menu, then one block of pages per language (EN, RU)
css/style.css  All styles, light and dark theme
js/data.js     The 33 weeks: dates, hours per sport, long sessions, focus (EN + RU)
js/i18n.js     Interface text in both languages (menu, chart labels, phase names)
js/app.js      Countdown, "this week", season chart, page menu, language switch
.nojekyll      Tells GitHub Pages to serve the files as they are
```

## Updating the plan

- Weekly numbers or focus text: edit `js/data.js`.
- Page text: edit `index.html`, in both the `data-lang="en"` and `data-lang="ru"` blocks.

No build step. GitHub Pages serves the `main` branch root.
