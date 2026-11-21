# Alzikrayat (MERN Edition) with JWT Authentication

A full-stack photo sharing app for campus life. Members register, upload photos with a title and story, browse a responsive gallery (grid or list), open a photo to read and add comments, and delete their own photos.

Built for Advanced Web Technologies: **Project 3** (MERN application) extended with **Project 4, Track A: JWT-Based Authentication**.

## Selected track and rationale

**Track A: JWT-Based Authentication.**

In Project 3 the server identified the user from an `x-user-id` header sent by the client. That header can be forged by anyone, so a user could delete another member's photos just by sending a different id. Track A fixes this properly: the server now issues a **signed token** at login, and every write request must carry it. The signature cannot be produced without the server's secret, so identities cannot be faked. The change stays inside the authentication layer, so every Project 3 feature keeps working.

## Tech stack

| Tier | Technology |
|---|---|
| Presentation | React 18, Vite, React Router 6, Axios |
| Application | Node.js, Express 4 REST API, Joi validation, multer uploads, jsonwebtoken |
| Data | MongoDB with Mongoose schemas, bcrypt password hashing |

## Project structure

```
alzikrayat-mern/
├── server/
│   ├── models/         User.js, Photo.js, Comment.js
│   ├── routes/         authRoutes.js, photoRoutes.js, commentRoutes.js
│   ├── controllers/    authController.js, photoController.js, commentController.js, statsController.js
│   ├── middleware/     protect.js (JWT), validation.js (Joi), upload.js (multer), errorHandler.js
│   ├── utils/          token.js (sign and verify JWTs)
│   ├── uploads/        stored image files
│   └── server.js       Express entry point
└── client/
    └── src/
        ├── components/ Navbar, PhotoCard, CommentForm, Feedback, Footer
        ├── pages/      Home, Gallery, PhotoDetail, LoginRegister, Upload, NotFound
        ├── context/    AuthContext (logged-in user)
        ├── utils/      api.js (Axios + interceptors), tokenStorage.js, useFetch.js, format.js
        ├── App.jsx     route configuration
        └── main.jsx    entry point
```

## Requirements

- Node.js 18 or newer
- A MongoDB database: a free MongoDB Atlas cluster, or MongoDB Community Server running locally

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Generate a secret for signing tokens and paste it into `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Environment variables (`server/.env`, never committed):

| Variable | Meaning | Example |
|---|---|---|
| `PORT` | Port for the API | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/alzikrayat?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret used to sign and verify tokens (32+ random characters) | output of the command above |
| `JWT_EXPIRES_IN` | How long a token stays valid | `2h` |

The server refuses to start if `MONGODB_URI` or `JWT_SECRET` is missing. Start it:

```bash
npm run dev
```

You should see `MongoDB connected`. Check `http://localhost:5000/api/health`.

### 2. Client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server forwards `/api` and `/uploads` to Express (see `client/vite.config.js`).

## How JWT authentication works here

```
Register / Login                         Any protected request
────────────────                         ─────────────────────
client  POST /api/auth/login ─────────►  server checks password with bcrypt
client  ◄───────── { token, user }       server signs a JWT with JWT_SECRET
client stores token in localStorage

client  POST /api/photos  (Axios adds    protect middleware:
        Authorization: Bearer <token>) ► 1. reads the Bearer token
                                         2. verifies signature + expiry
                                         3. loads the user into req.user
                                         4. the controller runs (or 401)
```

**Token structure.** A JWT is three Base64URL parts joined by dots, `header.payload.signature`:

| Part | Content in this app |
|---|---|
| Header | `{"alg":"HS256","typ":"JWT"}` |
| Payload | `{"sub":"<userId>","iat":<issued at>,"exp":<expires at>}` |
| Signature | HMAC-SHA256 of `header.payload` using `JWT_SECRET` |

The payload is encoded, not encrypted, so it only holds the user id and timestamps, never passwords or personal data. You can inspect any token at jwt.io.

**Server side**
- `utils/token.js` signs tokens (HS256, expiry from `JWT_EXPIRES_IN`) and verifies them with the algorithm pinned to HS256.
- `middleware/protect.js` validates `Authorization: Bearer <token>`, and returns 401 for a missing, malformed, tampered or expired token, or for a deleted account.
- `protect` is applied to **every write operation**: upload, delete photo, add comment (plus `GET /api/auth/me`).
- Deleting a photo still checks ownership on the server and returns 403 for non-owners.
- Login uses one message for unknown email and wrong password, so accounts cannot be probed.

**Client side**
- `utils/api.js` creates one Axios instance. A **request interceptor** adds the `Authorization` header to every call automatically, so no page handles tokens.
- A **response interceptor** reacts to a 401 while logged in: it clears the session and fires an `auth:expired` event, and `AuthContext` logs the user out.
- `utils/tokenStorage.js` keeps the token in `localStorage` (with an in-memory fallback if storage is blocked).
- On page load `AuthContext` calls `GET /api/auth/me` to confirm the stored token is still valid.
- **Logout** deletes the token from storage and state. Because JWTs are stateless, there is nothing to invalidate on the server.

**Trade-offs worth knowing.** `localStorage` is readable by any script on the page, so an XSS bug could steal the token (httpOnly cookies avoid this but need CSRF protection). A token cannot be revoked before it expires, which is why the lifetime is short. A refresh-token flow (optional in the spec) is not implemented.

## REST API

| Method | Route | Auth | Description | Success |
|---|---|---|---|---|
| POST | `/api/auth/register` | no | Create an account, returns `{ token, user }` | 201 |
| POST | `/api/auth/login` | no | Log in, returns `{ token, user }` | 200 |
| GET | `/api/auth/me` | **JWT** | The user behind the token | 200 |
| GET | `/api/photos` | no | List photos, newest first, with comment counts | 200 |
| GET | `/api/photos/:id` | no | One photo with its owner | 200 |
| POST | `/api/photos` | **JWT** | Upload a photo (multipart: `image`, `title`, `description`) | 201 |
| DELETE | `/api/photos/:id` | **JWT**, owner only | Delete a photo, its file and its comments | 204 |
| GET | `/api/photos/:id/comments` | no | Comments for a photo, oldest first | 200 |
| POST | `/api/photos/:id/comments` | **JWT** | Add a comment | 201 |
| GET | `/api/stats` | no | Counts of users, photos and comments | 200 |
| GET | `/api/health` | no | Server and database status | 200 |

Error codes: `400` validation failed, `401` missing/invalid/expired token or wrong credentials, `403` not the owner, `404` not found, `409` email already registered.

## Testing the protection (for the demo)

With the API running (replace `TOKEN` with the token from a login response):

```bash
# No token: rejected
curl -i -X POST http://localhost:5000/api/photos/PHOTO_ID/comments -H "Content-Type: application/json" -d "{\"comment\":\"hi\"}"
# -> 401 Please log in to continue

# Forged token: rejected
curl -i -X POST http://localhost:5000/api/photos/PHOTO_ID/comments -H "Authorization: Bearer abc.def.ghi" -H "Content-Type: application/json" -d "{\"comment\":\"hi\"}"
# -> 401 Invalid token. Please log in again.

# Valid token: accepted
curl -i -X POST http://localhost:5000/api/photos/PHOTO_ID/comments -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"comment\":\"hi\"}"
# -> 201
```

In the browser: log in, open DevTools, Application tab, Local Storage, and you will see `alzikrayat_token`. Edit a few characters of it and reload: the app logs you out. Delete it and the toolbar returns to "Please Login".

## Features checklist

- Register and login with bcrypt, returning a JWT; toolbar shows "Hi <firstName>" with Logout, or "Please Login"
- Protected-route middleware validating `Authorization: Bearer <token>` on all write operations
- Token stored client-side and injected by an Axios interceptor; logout clears it
- Secret managed in `.env`; expiry configurable
- Photo upload with the file stored in `server/uploads/` and metadata saved in MongoDB
- Responsive gallery with grid and list layouts, plus title search
- Photo detail route `/photos/:id` using `useParams`
- Comments appear instantly without reloading the page
- Owner-only deletion, validated on the server
- Joi validation, central error handler, loading and error states on every page
