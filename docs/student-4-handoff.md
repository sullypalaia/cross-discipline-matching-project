# Student 4: profiles and sample recommendations

> Update: optional OpenAI pairing and the full-homepage connection are implemented.
> See [current setup instructions](ai-pairing-setup.md). The endpoint now returns
> `mode: "ai" | "manual"`, not `"sample"`. Shared profile persistence still needs
> Student 1. Sections below describe the original sample-only handoff.

Feature branch: `tom-ai`. This feature adds no shared storage, dependencies,
navigation integration, or main-page changes. The matching types use the existing
type-file location; no competing type file was created.

## Who changes what, and what can be deleted

Search the source for `TODO(team integration):`, `KEEP:`, and `DEMO ONLY`.
Delete completed TODO comments only after verifying their connections work.

| Owner | Work in scope | Completion check |
| --- | --- | --- |
| Student 1 | Place the two components in the real app; pass shared profile/projects; wire saving and navigation; coordinate shared-type mapping. | Save, refresh, find a real project, and open its detail view. |
| Student 2 | Create/edit real project records with stable IDs, title, description, skillsNeeded, and numeric hoursPerWeek. Agree on field names with Student 1. | A newly created project reaches the matching list and retains its ID after editing. |
| Student 3 | Build project details that open by ID, including missing-project handling; own join requests and teammate acceptance. | Student 1's navigation opens the selected project and its join controls. |
| Student 4 | Maintain profile/matching components, validation, endpoint, matching logic, and tests; handle eventual AI integration. | Recommendations use actual inputs and all matching states work. |

**Safe to delete after the real flow is verified:** Student 1 can remove
`src/app/matching-demo/page.tsx` entirely. That removes the fictional project data,
temporary page state, test checkbox, and selection confirmation together. Remove
any links to `/matching-demo` and update this guide if the page is removed.

**Keep:** both components, `/api/match`, validation, matching logic, and imported
types. The sample algorithm is functional code, not disposable sample data.
Keep `scripts/check-matching.mjs` for regression checks. Student 1 may consolidate
types only after updating imports and agreeing on the contract with Students 2
and 4. Keep sample labels until Student 4 actually connects a real AI provider.

## Completed features

- **4.1:** Editable profile form with comma-separated skills/interests and weekly hours.
- **4.2:** `onSave(profile)` supports synchronous or asynchronous storage callbacks and save errors.
- **4.3:** “Find my matches” sends the saved profile and projects to `/api/match`.
- **4.4:** POST endpoint validates runtime data and returns `{ matches, mode: "sample" }`,
  or `{ error: string }` with status 400 for invalid input / 500 for matching failure.
- **4.5:** Server-only deterministic matching returns up to three unique supplied IDs.
- **4.6:** Sample-labeled cards show titles, grounded reasons, and “View project” callbacks.
- **4.7:** Missing-profile, empty-project, loading, no-result, failure/retry, and changed-input states.
  Requests time out after 15 seconds. Input changes clear recommendations and abort old requests.
- **4.8:** `TODO(team integration):` comments identify outstanding data and callback connections.

## Files

- `src/app/types/matching.ts`: existing type-file location; Profile, Project, Match and API types.
- `src/lib/ai/validation.ts`: shared browser/server input rules and comma-separated input parsing.
- `src/lib/ai/matchProjects.ts`: isolated server-only sample ranking.
- `src/app/api/match/route.ts`: POST endpoint.
- `src/components/ai/ProfileForm.tsx`: profile UI.
- `src/components/ai/ProjectMatcher.tsx`: matching UI.
- `scripts/check-matching.mjs`: repeatable live-endpoint checks using labeled fixtures.
- `src/app/matching-demo/page.tsx`: standalone sample UI; removable after integration.
- `docs/student-4-handoff.md`: this guide.

## How sample matching works

Projects must require no more hours than the profile allows. Each exact,
case-insensitive skill overlap earns 3 points; each interest phrase found in the
title, description, or skill requirements earns 1. Projects need at least one
overlap. Ties keep the incoming project order. No AI provider is contacted.
This is a simple demo rule, not a semantic or synonym-aware recommendation model.

Profiles need 1–30 skills and interests, with each entry at most 80 characters.
Hours must be positive and at most 80. The form accepts hours from 0.1 to 80.
Project IDs must be unique, trimmed, nonempty strings (up to 120 characters).
Titles are limited to 200 characters and descriptions to 5,000. Projects may have
an empty skillsNeeded array; interests can still match. Requests allow up to 200 projects.

## Exact integration example for Student 1

The components are **not placed in the main app yet**. Put them in an existing
Client Component that owns the shared state and callbacks. A regular callback
cannot be passed directly from a Server Component across the client boundary.
The following adapter is a complete example; it introduces no storage:

```tsx
"use client";

import ProfileForm from "@/components/ai/ProfileForm";
import ProjectMatcher from "@/components/ai/ProjectMatcher";
import type { Profile, Project } from "@/app/types/matching";

type Props = {
  profile: Profile | null;
  projects: Project[];
  saveProfile: (profile: Profile) => void | Promise<void>;
  openProject: (projectId: string) => void;
};

export default function StudentMatching({
  profile, projects, saveProfile, openProject,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <ProfileForm initialProfile={profile} onSave={saveProfile} />
      <ProjectMatcher
        profile={profile}
        projects={projects}
        onSelectProject={openProject}
      />
    </div>
  );
}
```

From Student 1's client-side shared-state owner, use:

```tsx
<StudentMatching
  profile={currentProfile}
  projects={availableProjects}
  saveProfile={saveCurrentProfile}
  openProject={selectProject}
/>
```

Those four values must come from Student 1's actual app. `saveCurrentProfile`
must update `currentProfile` after a successful save. If it returns a Promise,
resolve after saving and reject on failure. Pass only available projects and
make new state values when editing records. `selectProject(id)` opens Student 3's
detail view for that exact ID. Loading a different saved profile replaces the form draft.

## Simple testing steps

For a standalone UI demo, run the app and open `/matching-demo`. This added demo
page uses fictional projects and in-memory profile state that resets on refresh.
Enter React, sustainability, and 6 hours; save and find matches. “View project”
shows the selected ID in a demo confirmation panel. Saving 1 hour produces no
matches; the checkbox tests an empty project list. The main homepage is unchanged.

1. Start the app: `npm run dev`.
2. In a second terminal, run `node scripts/check-matching.mjs` (defaults to port 3000).
   For a different port: `node scripts/check-matching.mjs http://localhost:3005`.
3. After Student 1 places the components, save skills `React, React, design`,
   interests `sustainability`, and hours `6`. The save callback should receive
   `{ skills: ["React", "design"], interests: ["sustainability"], hoursPerWeek: 6 }`.
4. Try empty fields, comma-only skills, and hours 0 or 81. Saving should be blocked.
5. Use this **sample fixture only for testing**, not as production project data:

   ```ts
   const sampleProjects = [{
     id: "sample-green",
     title: "Sample green campus",
     description: "A sustainability website.",
     skillsNeeded: ["React"],
     hoursPerWeek: 4,
   }];
   ```

6. Click “Find my matches.” Expect a sample-labeled result for `sample-green`.
   Click “View project”; confirm the selection callback receives `sample-green`.
7. Save 2 available hours. Old recommendations should disappear; finding again gives no results.
8. Pass `projects={[]}`. Expect an empty-project message and disabled matching button.
9. Stop the development server while the page is open, then find matches.
   Expect loading with repeat submissions disabled, followed by an error and retry button.
   Restart the server and retry. A network failure may take up to 15 seconds.
10. Have a temporary save callback throw an Error to check the save-failure message.

## Verification performed

- Next.js route type generation and TypeScript: passed.
- ESLint: passed.
- Production build: passed after allowing network access for the existing layout's Google Fonts.
- Live endpoint checks: passed for validation, malformed JSON, deterministic ordering,
  three-result limit, unique/supplied IDs, availability, case normalization,
  interest-only matching, phrase boundaries, and empty/no-overlap inputs.
- Isolated browser fixture: checked validation, profile saving/normalization callback,
  editing, sample recommendation display, project-selection callback, clearing stale
  results, empty projects, no matches, disabled loading state, and simulated HTTP
  failure followed by a successful retry against the real endpoint.
- The temporary UI test route was removed. Shared persistence and actual navigation
  remain untested because those teammate integrations do not exist yet.

## Team checklist

- **Student 1:** place components; provide shared profile/projects; wire save and navigation callbacks;
  update the profile prop after saving; confirm shared types before adopting the contract.
- **Student 2:** agree on project fields; supply stable unique IDs, descriptions, skillsNeeded,
  and numeric hoursPerWeek. Map any different field names at integration time.
- **Student 3:** expose a detail view that Student 1 can open with a project ID.

## Before real AI

Choose a provider, then replace the server-only implementation in `matchProjects.ts`.
Keep credentials in server environment variables, never browser code or `NEXT_PUBLIC_`.
Validate provider output against supplied IDs, remove duplicates, cap at three, and keep
explanations grounded in project data. Add provider timeout/failure handling and update
the response mode, TypeScript contract, and UI labels together. Agree with Student 1 on
authentication, authorized project access, request limits, and costs before a public rollout.
No API key is needed now.
