<<<<<<< HEAD
# Track-1
# Track-1 — Mock Store Frontend

This is a small, responsive frontend demo built with plain HTML, CSS, and JavaScript using mock JSON data.

## Setup

- No build tools required. Open `index.html` in your browser (double-click or use a local static server).

Optional: serve with a simple HTTP server to avoid CORS issues when fetching `data.json`:

PowerShell (Windows):
```powershell
# from the project folder e:\pro1\pro
python -m http.server 8000
# then open http://localhost:8000
```

## Tech stack

- HTML5
- CSS3 (responsive grid, mobile-first tweaks)
- Vanilla JavaScript (no build step required)

## Files

- `index.html` — main page and layout
# Mock Store — Frontend Demo

This is a small, responsive frontend demo built with plain HTML, CSS, and JavaScript using mock JSON data.

## Setup

- No build tools required. Open `index.html` in your browser (double-click or use a local static server).

Optional: serve with a simple HTTP server to avoid CORS issues when fetching `data.json`:

PowerShell (Windows):
```
# from the project folder e:\pro
python -m http.server 8000
# then open http://localhost:8000
```

## Tech stack

- HTML5
- CSS3 (responsive grid, mobile-first tweaks)
- Vanilla JavaScript (ES modules not required)

## Files

- `index.html` — main page and layout
- `style.css` — styles and responsive rules
- `app.js` — JS to fetch `data.json`, render UI, search/sort, and modal interactions
- `data.json` — mock product data

## Assumptions

- The user can run the demo by opening `index.html` directly or via a simple HTTP server.
- Images use remote Unsplash CDN links for convenience. If offline usage is required, replace `image` values in `data.json` with local image paths.

## Bonus features

- Search input with debounced filtering
- Sort by price (ascending/descending)
- Accessible modal with keyboard support (Escape to close)

## New interactive features (added)

- Header action chips: **Favorites** and **Cart** show live counts.
- Favorite items: click the heart on a card to add/remove favorites (persisted in `localStorage`).
- Add to cart: quick-add buttons increment the cart counter (persisted in `localStorage`).
- Tag filters: click tag chips to filter products by tags (multi-select).
- Ratings & reviews: mock ratings displayed on each card for social proof.
- Hover and micro-interactions: card lift, image zoom, animated buttons, skeleton loader for nicer perceived performance.

## Try it

1. Start a local server from the project folder and open `http://localhost:8000`.

PowerShell:
```
cd e:\pro
python -m http.server 8000
```

2. Interact with the UI:
- Use the search box and sort dropdown.
- Click tag chips to filter.
- Click the heart to favorite items; counts persist across reloads.
- Click `Add` to add items to the cart and watch the cart counter update.

## Currency

- Prices are displayed in Indian Rupees (INR) by default. A currency selector in the controls lets you switch between `₹ INR` and `$ USD`.
- Conversion rate used: 1 USD = 83.5 INR (approx). Update the rate in `app.js` (`currencyState.rate`) if you want a different value or to fetch live rates.

## New additions

- Decorative hero section and improved background visuals.
- Dark / Light theme toggle (persisted to `localStorage`).
- Client-side pagination with page controls.
- Favorites drawer (view & remove favorites) and cart drawer improvements.
- Product badges for top-rated or popular items.
- Toast notifications for user actions like add-to-cart and favorites.

## Authentication (demo)

- A lightweight mock authentication flow has been added for demo purposes: `login.html` stores a simple user object in `localStorage` so you can test protected flows. It is not secure and only intended for UI/demo use. Use the Login link in the header or open `login.html` to sign in.

## Admin dashboard

- `admin.html` is an example analytics dashboard using Chart.js (CDN). It shows:
	- Favorites per product (bar chart)
	- Price distribution (bar chart)
	- Mock sales for the last 7 days (line chart)

The admin page is protected by the mock auth (redirects to `login.html` if not signed in).

## Offline assets bundled

- Product images have been bundled into the `assets/` folder so the demo runs offline. If you served the site earlier from remote images, the app will now use local assets.

## Run (offline)

Install `live-server` and run the start script (optional, for a better dev server):

PowerShell:
```
cd e:\pro
npm install
npm start
```

Or serve with Python as before:
```
python -m http.server 8000
```


If you want, I can:
- Replace remote images with local placeholders, or
- Add build tooling (npm + live-server) and a `package.json`, or
- Expand the UI with pagination, categories, or a shopping cart mock.
