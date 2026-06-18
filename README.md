# Create Req Chat

Create Req Chat is a requirements-definition companion. It starts with a conversation on the left and an editable markdown requirements document on the right. As the user answers deeper product questions, the markdown draft updates in real time so gaps are visible immediately.

The product goal is to force clear thinking before implementation starts. Instead of asking for a short prompt and producing shallow requirements, the app walks the user through target segment, competition, standard capabilities, differential capabilities, user love, user hate, scope, acceptance criteria, and open risks.

## Current Experience

- Left pane: guided requirements interview with a Talk button, typed answers, skip support, answer copy, restart, and progress by section.
- Right pane: live `Requirements.md` document with editable markdown, preview mode, copy, download, and manual-edit protection.
- Draft state: stored in browser `localStorage` so a user can refresh without losing the current conversation.
- Voice path: browser speech capture works as a local fallback. Gemini Live is prepared through a backend token endpoint.

## Requirements Template

The markdown document keeps these sections visible from the start. Empty sections show `Pending conversation.` until enough context has been gathered.

- Product Summary
- Target Segment
- Problem and Urgency
- Competitive Landscape
- Core Feature Set
- Standard Capabilities
- Differential Capabilities
- Why Users Would Love It
- Why Users Might Hate It
- Scope Boundaries
- Success Metrics
- Acceptance Criteria
- Open Questions and Risks

## Interview Flow

The interview asks 30 questions across these areas:

- Product shape
- Target segment
- Problem
- Goals
- Competition
- Core features
- Differentiation
- Experience
- Constraints
- Love and hate
- Scope
- Validation

Each answer is stored by key and then synthesized into the markdown document. This makes the document useful while the conversation is still unfinished.

## Gemini Live Voice Plan

The frontend calls `POST /api/gemini-live-token` before starting a Gemini Live session. The backend creates a short-lived ephemeral token using `GEMINI_API_KEY` from `.env`.

Real API keys must never be placed in browser code or committed to Git. Keep long-lived tokens in `.env` only.

As of the current Google AI docs, the dialogue-focused Live model shown in examples is:

```text
gemini-3.1-flash-live-preview
```

There is also a `Gemini 3.5 Live Translate` model family listed for speech-to-speech translation. If the required product voice model is exposed under a different 3.5 Live model ID, set it through `GEMINI_LIVE_MODEL` in `.env` without changing frontend code.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env
```

3. Add your Gemini API key to `.env`:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
PORT=4173
```

4. Start the local server:

```bash
npm start
```

5. Open:

```text
http://localhost:4173
```

## Static Preview

The app still works as a plain static file for typed conversations and markdown generation:

```bash
open index.html
```

Static mode cannot securely create Gemini Live tokens. For Gemini Live voice, run the Node server so `/api/gemini-live-token` can read `.env` and mint ephemeral tokens server-side.

## Token Handling

Tracked files:

- `.env.example` documents required variables.
- `server.js` reads env vars and returns short-lived Gemini Live tokens.
- `index.html` only requests short-lived tokens from the backend.

Ignored files:

- `.env`
- `.env.*` except `.env.example`
- screen recordings and local video captures
- `node_modules`

## Deployment Notes

For a static GitHub Pages deployment, the requirements chat and markdown editor work, but Gemini Live voice token minting will not. Deploy the Node server to a host that supports environment variables if voice is required.

Expected GitHub Pages URL after Pages is enabled:

```text
https://aditya-vithaldas.github.io/create-req-chat/
```

## Next Product Steps

- Replace the browser speech fallback with full Gemini Live audio streaming.
- Add structured markdown section locking so manual edits and auto-generated sections can coexist more gracefully.
- Add export to GitHub issue, PRD, or Jira-ready backlog.
- Add saved sessions so multiple requirement documents can be managed in one workspace.
