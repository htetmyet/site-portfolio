<div align="center">
<img width="1200" height="475" alt="GHBanner" src=" />
</div>

# Run and deploy your AI Studio app

## Local Development

**Prerequisites:** Node.js 20+, PostgreSQL 14+, npm

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an environment file:
   ```bash
   cp .env.example .env
   ```
   Update the values (database URL, JWT secret, API keys). For local development, set `VITE_API_BASE_URL=http://localhost:9000/api` and point `DATABASE_URL` to the mapped Postgres host port (default `5433` when using the provided compose file).
   When serving the built site from another origin, unset `VITE_API_BASE_URL` to fall back to same-origin `/api` requests.
   If you need to deploy the static bundle under a sub-path (e.g. `/landing/`), set `VITE_BASE_PATH` before running the build (defaults to `/`).
   When previewing the production bundle locally, use `npm run preview` (opening `dist/index.html` directly in a browser is not supported).
3. Create the database schema:
   ```bash
   npm run db:migrate
   ```
4. Add an admin user (update the email, password, and name):
   ```bash
   npm run seed:admin -- --email admin@example.com --password "change-me" --name "Admin User"
   ```
5. Run the backend API:
   ```bash
   npm run server
   ```
6. In a new terminal, run the Vite dev server:
   ```bash
   npm run dev
   ```
   The landing page is served at `http://localhost:5173`, and the API listens on `http://localhost:9000`.

### Admin Console

- Visit `http://localhost:5173/admin/login` and sign in with the credentials you seeded.
- Inside the console you'll find dedicated sections for:
  - **Settings** – company identity, hero slides, and services
  - **Posts** – manage blog content with a consistent narrative format
  - **AI Content Studio** – source AI headlines, preview raw copy, and rewrite them with your local Ollama model into Markdown-ready drafts
  - **Products** – craft bespoke product pages with the visual canvas editor (supports rich text, quotes, lists, and links)
  - **Users** – invite new admins, edit their details, and remove access
  - **Account** – update your own name/email and change your password
  - **Background pattern** – pick from mesh, grid, node, or minimal themes and upload a logo for the site chrome

### AI Content + Ollama

- The admin route at `/admin/ai-content` lets you fetch a combined feed from Hacker News and r/artificial, preview each article, and generate a rewritten summary + Markdown post in a data-scientist tone.
- The rewrite flow calls your local Ollama instance. Set the following variables in `.env` (or rely on the defaults shown):

  ```bash
  OLLAMA_HOST=http://localhost:11434
  OLLAMA_MODEL=mistral
  ```

- When the backend runs inside Docker, requests to `http://localhost:11434` automatically fall back to `http://host.docker.internal:11434`. Add more candidates via `OLLAMA_HOST_FALLBACKS` or set `OLLAMA_DOCKER_BRIDGE_HOST` if you expose Ollama on a different hostname or another machine on your LAN.

- Make sure the chosen model is already pulled locally (e.g., `ollama pull mistral`). Requests will fail if Ollama is not running or the model is missing. The UI lets you refresh the model list, switch between pulled models, and specify comma-separated keywords (for example `robotics, multi-modal`) before fetching headlines. The keywords flow propagates to both news sources, so you are not limited to the default “AI” search terms. You can also set a custom writer tone (data scientist, world leader, comedy, etc.); that persona is injected into the prompt before sending it to the local LLM.

### Public Routes

- Landing page previews link to full collections at `/blog` and `/products`, with individual detail pages at `/blog/:id` and `/products/:id`.

## Docker

### Frontend only

1. Build the static site image:
   ```bash
   docker build -t landing-page .
   ```
2. Run the container (the site listens on container port `2323`):
   ```bash
   docker run --rm -p 2323:2323 landing-page
   ```
   > You can map to any host port (e.g., `8080:2323`) if you prefer a different local address.

### Full stack with PostgreSQL

```bash
docker compose up --build
```

This launches:
- `db`: PostgreSQL 16 with persistent `pgdata` volume (container port `5432`, exposed on host port `5433`)
- `backend`: Express API on `http://localhost:9000`
- `frontend`: Nginx-served build on host port `2323`

> The frontend bundle is built to call the API via `http://localhost:9000/api`, so make sure the backend port is published (as shown above) if you change the compose file.
> If you run Ollama on the host (outside Docker), set `OLLAMA_HOST=http://host.docker.internal:11434` so the backend container can reach it. For remote hosts, use their LAN IP instead.

After the stack is up, run the migrations and seed an admin user inside the backend container if needed:

```bash
docker compose exec backend npm run db:migrate
docker compose exec backend npm run seed:admin -- --email admin@example.com --password "change-me" --name "Admin"
```
