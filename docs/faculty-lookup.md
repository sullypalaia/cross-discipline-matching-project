# Cal Poly faculty lookup

On the homepage, select **Find matches**, then scroll to **Find Cal Poly faculty expertise**. Enter a project description and select **Find faculty**. No saved profile is required.

With `API_AI_KEY`, the server asks OpenAI to search official `calpoly.edu` pages across relevant departments and read faculty research/biographies. A second AI request ranks up to three supported candidates and explains the connection to the project. Links must come from the retrieved official sources. There is no fixed list of majors. This is a sourced suggestion tool, not an exhaustive roster or a guarantee of mentorship availability; check the linked evidence.

Allow about a minute for research. The research request has a 45-second timeout and ranking has 20 seconds. API model and web-search charges apply. Only `API_AI_KEY` is accepted; the optional model setting is `OPENAI_MATCH_MODEL`. The key stays on the server and requests use `store: false`.

Without a key, or if AI fails, topic matching uses the full official faculty catalog plus the media expertise directory, cached for an hour. Department-only matches are labeled clearly because affiliation does not establish research expertise. This fallback is less precise than web research. If both directories fail, the UI offers a retry and official catalog link.

Try projects in different areas: composing game music, designing a solar inverter, or reducing crop irrigation water. Successful online results display **Live web research + AI ranking**; fallback results explicitly say they are catalog/topic matches.

Offline checks: `node scripts/check-faculty.mjs`.

Implementation: `src/lib/faculty/searchFacultyWeb.ts`, `src/lib/faculty/directory.ts`, `src/app/api/faculty/route.ts`, and `src/components/ai/FacultyFinder.tsx`.
