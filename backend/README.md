cat > README.md <<'EOF'
# QMS Backend

The API for the Quranic Management System. The frontend calls it to log in, manage Halaqat, run sessions, and save attendance.

## Before you start

You need Node.js (LTS version). Check it with:

    node -v

If the command is not found, install Node.js from nodejs.org, then close and reopen the terminal.

## First-time setup (do this once)

1. Go into this folder:

       cd backend

2. Install the packages:

       npm install

3. Create your settings file from the example:

       cp .env.example .env

   Open `.env` and fill in the values. Never commit this file.

## Run the server

    npm run dev

The server restarts when you save a file. Check that it works by opening http://localhost:3000/health. You should see {"status":"ok"}. Press Ctrl + C to stop.

To run it without auto-restart, use `npm start`.

## Other commands

- `npm test`: run the backend tests

## Folders in src

- `routes/`: API endpoints, one file per area (auth, halaqat, sessions, attendance)
- `services/`: business rules (for example, one active session per Halaqa)
- `models/`: data and tables (user, halaqa, enrollment, session, attendance)
- `middleware/`: checks before a request runs (is the user logged in, is the role correct)
- `tests/`: backend tests

## Rules

- Routes only receive the request and call a service. Rules live in `services/`.
- Every API checks that the user is logged in and has the right role.
- Write each new API in docs/api.md (name, input, output) before the frontend needs it.
- Do not commit the `.env` file or `node_modules`.
EOF