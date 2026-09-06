# AI pairing setup

The full homepage now contains the profile form and pairing component under
"My profile". It uses actual project records and opens the existing join view
when a recommendation is selected. Profiles currently last only for this visit.
Student 1 still owns connecting persistent shared profile storage.

## Automatic selection

- No `API_AI_KEY`: deterministic manual/rule-based pairing, no provider request.
- Key configured: OpenAI Responses API with `gpt-5.4-mini` by default.
- Provider error, timeout, refusal, malformed output, duplicate/unknown IDs:
  manual pairing with a visible fallback message.
- Both modes return at most three projects within the student's available hours.

Manual here means automatic skill/interest rules, not a person assigning teammates.
The endpoint now returns `mode: "ai" | "manual"`; old `mode: "sample"` consumers
must be updated. `fallbackReason` is a safe code, never provider error text.

## Enable AI

Add these lines to the existing `.env.local` without replacing Supabase settings:

```dotenv
API_AI_KEY=your-key-here
OPENAI_MATCH_MODEL=gpt-5.4-mini
```

Replace the placeholder locally, never in chat. Restart the development server.
`API_AI_KEY` is the only accepted API key variable.
On your hosting platform, configure the same server environment variables and
redeploy. `.env.local` is already ignored by Git. Never use a `NEXT_PUBLIC_` key.
Leave the key absent/blank to use manual pairing. Requests with a configured key
send the profile's skills/interests/hours and eligible project fields to OpenAI.
Requests set `store: false`. AI requests may incur API charges.

The 10-second provider timeout leaves time for the manual fallback before the
browser's 20-second timeout. Requests over 100,000 input characters use rules.
The current unauthenticated endpoint is for the hackathon prototype: Student 1
must connect authentication and deployment-appropriate rate limits before public
paid usage. No API key was configured during implementation, so live AI billing
and model access were not tested; the provider path was checked with mock responses.

## Verify

1. Run `node scripts/check-ai-pairing.mjs` for offline AI/fallback tests.
2. With the key unset, run the app and `node scripts/check-matching.mjs http://localhost:3005`.
3. Open `/`, choose My profile, save skills/interests/hours, then Find my matches.
4. With no key, expect “Manual pairing”. With a working key, expect “AI pairing”.
5. With a failed provider request, expect an AI-unavailable message and rule-based results.

Implementation follows [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
and the [GPT-5.4 mini model documentation](https://developers.openai.com/api/docs/models/gpt-5.4-mini).
