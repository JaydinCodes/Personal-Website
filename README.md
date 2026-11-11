# Jaydin Morrison Personal Website

This repository contains the source code for a high‑end personal website for **Jaydin Morrison** built using a modern full‑stack architecture.  The project is designed to be modular, scalable and production‑ready with the following stack:

* **Frontend** – [Next.js 14](https://nextjs.org/) (App Router) with [Tailwind CSS](https://tailwindcss.com/) and [Framer Motion](https://www.framer.com/motion/), organised into reusable UI and layout components.
* **Middleware** – A lightweight [Express](https://expressjs.com/) server written in Node.js that proxies non-API requests to the Next.js server in production and proxies `/api` requests to the Django backend. It enforces basic HTTP authentication, sanitises input data and uses sensible security headers via Helmet.
* **Backend** – A [Django 4](https://www.djangoproject.com/) application that exposes a REST API using the Django REST Framework (DRF).  The backend provides CRUD endpoints for portfolio projects and a contact endpoint for form submissions.  It connects to a PostgreSQL database via [`dj‑database‑url`](https://github.com/jazzband/dj-database-url) and includes a fully‑featured admin interface.
* **Database** – [PostgreSQL](https://www.postgresql.org/) accessed through Django’s ORM.  For local development the default database is SQLite but the configuration is automatically upgraded when `DATABASE_URL` is provided.
* **Deployment** – A single [Heroku](https://www.heroku.com/) dyno runs both the Node middleware and the Django API concurrently.  A [`Procfile`](./Procfile) and [`start-prod.sh`](./scripts/start-prod.sh) script coordinate the two processes.  Static files are served by the middleware and all API traffic is proxied to the internal Django server.
* **CI/CD** – A GitHub Actions workflow (`.github/workflows/ci.yml`) installs dependencies, runs tests and builds the project on every push.  You can extend this workflow to automatically deploy to Heroku or another platform.

## Architecture Overview

```
Browser ──► Node.js (middleware) ──► Django REST API ──► PostgreSQL
                │
                └─────► Proxies to Next.js app
```

1. **Next.js Frontend** (`frontend/`)
   * Built with Next.js App Router (`app/layout.js`, `app/page.js`) and modular components (`components/PortfolioPage.jsx`, `components/layout/TopNav.jsx`, `components/ui/*`). Each section is responsive, accessible and SEO‑friendly, using semantic HTML, Framer Motion animations, and Tailwind utility classes.
   * Fetches dynamic projects from `/api/projects/` (falling back to curated projects in `data/projects.js`) and submits contact messages to `/api/contact` – the middleware takes care of forwarding requests to Django.
   * Tailwind CSS is configured via `tailwind.config.js` and `postcss.config.js`. Global styles live in `app/globals.css`.

2. **Express Middleware** (`middleware/`)
   * Uses [Helmet](https://helmetjs.github.io/) to set secure HTTP headers and [xss‑clean](https://github.com/validatorjs/xss-clean) to strip malicious HTML from request bodies.
   * Implements [Basic HTTP authentication](https://github.com/LionC/express-basic-auth) with credentials supplied via environment variables (`BASIC_AUTH_USER` and `BASIC_AUTH_PASS`).  All requests to the middleware must include these credentials.
   * Proxies any `/api` request to the Django service running on an internal port using [`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware).  The `/api/contact` route illustrates how to intercept and forward specific endpoints.
   * Serves the compiled Vue app in production.  During development you can run the frontend and middleware separately.

3. **Django Backend** (`backend/`)
   * Configured using environment variables for the secret key, debug mode, allowed hosts and database connection.  See [`core/settings.py`](backend/core/settings.py) for details.
   * Exposes two primary models in `portfolio/models.py`:
     * `Project` – stores a title, description, optional image URL and timestamp.
     * `ContactMessage` – stores messages from the contact form, including sender information and timestamp.
   * Serializers in `portfolio/serializers.py` translate these models to JSON and enforce basic validation.
   * ViewSets in `portfolio/views.py` provide RESTful endpoints via DRF.  Projects are read‑only for anonymous users, while contact messages can be created by anyone but listed only via the Django admin.
   * The built‑in admin interface is enabled and customised in `portfolio/admin.py` to make it easy to manage projects and review messages.
   * Uses [`django-cors-headers`](https://github.com/adamchainz/django-cors-headers) to allow cross‑origin requests from the middleware (configured via `CORS_ALLOW_ALL_ORIGINS` and `CORS_ALLOWED_ORIGINS`).

4. **Heroku Deployment**
   * The [`Procfile`](./Procfile) defines two process types: `web` and `release`.  The `release` phase runs database migrations automatically before each deploy.
   * The `web` process executes [`scripts/start-prod.sh`](scripts/start-prod.sh), which performs the following steps:
     1. Runs Django database migrations.
     2. Starts the Django API using Gunicorn on port `8000`.
     3. Starts the Node.js middleware on the port provided by Heroku via the `PORT` environment variable (default `3000`).
   * Heroku’s [multi‑buildpack](https://devcenter.heroku.com/articles/using-multiple-buildpacks-for-an-app) workflow will detect both Node.js and Python, install dependencies and run the `heroku-postbuild` scripts defined in each package (if you choose to add them).  The Vue app should be built ahead of deployment (for example in CI) and checked into the repository under `frontend/dist/`.

## Local Development

To set up the project on your local machine you’ll need Node.js (18+ recommended) and Python (3.11) installed.  Clone the repository and run the following commands from the repository root:

```bash
# 1. Install Node dependencies for the middleware and frontend
npm install --prefix middleware
npm install --prefix frontend

# 2. Install Python dependencies for the backend
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# 3. Configure environment variables
cp .env.example .env
# edit .env to provide BASIC_AUTH_USER, BASIC_AUTH_PASS, DJANGO_SECRET_KEY, etc.

# 4. Run the Django development server (listens on 8000)
python backend/manage.py migrate
python backend/manage.py runserver 0.0.0.0:8000

# 5. In another terminal, start the Node.js middleware (proxies API calls to Django)
npm run start --prefix middleware

# 6. And separately, start the Vue development server
npm run dev --prefix frontend

# Visit http://localhost:5173/ in your browser; API requests will be proxied via the middleware at http://localhost:3000/api
```

> **Tip:** For convenience during development, you can point your Vue app directly at the Django API by setting `VITE_API_BASE_URL` in a `.env` file under `frontend/`.  However, using the middleware locally ensures you’re exercising the same proxy logic you’ll use in production.

## Environment Variables

| Variable             | Where                           | Description                                                             |
|----------------------|---------------------------------|-------------------------------------------------------------------------|
| `BASIC_AUTH_USER`    | `middleware/.env`               | Username for basic authentication enforced by the Node.js middleware.   |
| `BASIC_AUTH_PASS`    | `middleware/.env`               | Password for basic authentication.                                      |
| `DJANGO_API_URL`     | `middleware/.env`               | Base URL of the Django API (e.g. `http://localhost:8000/api`).           |
| `DJANGO_SECRET_KEY`  | `backend/.env` or Heroku config | Django secret key used for cryptographic signing.                       |
| `DJANGO_DEBUG`       | `backend/.env` or Heroku config | Set to `True` to enable debug mode (never do this in production).       |
| `DJANGO_ALLOWED_HOSTS`| `backend/.env` or Heroku config| Comma‑separated list of allowed hostnames.                              |
| `DATABASE_URL`       | `backend/.env` or Heroku config | PostgreSQL connection string in the format `postgres://USER:PASSWORD@HOST:PORT/NAME`. |

You can create `.env.example` files in the `middleware/` and `backend/` folders to document the expected variables.  These files are not committed to version control.

## Continuous Integration

The repository includes a simple GitHub Actions workflow at `.github/workflows/ci.yml` that installs dependencies, lints the code and runs unit tests on every push or pull request.  Extend this workflow by adding steps to build the Vue app, run Python unit tests, or deploy to Heroku using the Heroku CLI.  See the official Heroku Action documentation for details on automating deployments.

## Security Considerations

* **HTTPS** – Heroku automatically provisions HTTPS for custom domains.  The Django settings include `SECURE_PROXY_SSL_HEADER` and optional `SECURE_SSL_REDIRECT` to ensure all traffic is redirected to HTTPS in production.
* **Input Sanitisation** – The middleware uses `xss‑clean` to strip malicious HTML from JSON bodies before forwarding them to the API.  DRF further validates incoming data in the serializers.
* **Authentication** – Basic authentication is applied at the middleware layer.  In a real‑world deployment you may wish to replace this with OAuth2, JWT or another scheme.
* **Admin Access** – The Django admin is available at `/admin/`.  Create a superuser with `python backend/manage.py createsuperuser` and log in using the credentials you set.  Limit admin access to trusted users and enable two‑factor authentication on your Heroku account.

## Future Improvements

This scaffold provides a solid foundation for Jaydin Morrison’s personal website.  Here are some ideas for future features:

* **Blog Module** – Create a `BlogPost` model and corresponding API endpoints for a blog section.  Use Markdown rendering and SEO‑friendly URLs.
* **Authentication & Authorization** – Implement token‑based auth (e.g. JWT) to restrict content management to authenticated users.  Integrate third‑party providers like Google or GitHub for social logins.
* **Image Uploads** – Allow images to be uploaded and stored on an object store such as Amazon S3.  Serve optimised thumbnails via CloudFront.
* **Testing** – Add unit and integration tests for both frontend and backend components.  Use Jest/Vitest for Vue components and Django’s test suite for API endpoints.
* **Performance Enhancements** – Enable server‑side rendering (SSR) with [Nuxt.js](https://nuxtjs.org/) or [Vue 3’s SSR API](https://v3-migration.vuejs.org/breaking-changes/ssr.html) to improve SEO further.  Add caching (e.g. Redis) in front of the API and implement HTTP caching headers.

---

If you have any questions or need assistance extending this project, feel free to reach out.  Happy coding!