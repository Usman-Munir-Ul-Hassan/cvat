# Definition of Done: Annotation Analytics (Items 1–4)

This checklist establishes the acceptance criteria for the mandatory floor (Items 1 to 4). Per assessment rules, each checked item must include concrete evidence (raw output, screenshot, or test result).

---

## 1. Mandatory Floor Checklist (Items 1 – 4)

- [x] **Item 1: API Endpoint Returns Correct Counts**
  - *Criteria*: Endpoint `/api/test/tasks/<id>/counts/` returns JSON per-class counts matching direct database query on Task #1 (person: 12, bottle: 8, cup: 4, wine glass: 3, cell phone: 2, spoon: 2, dining table: 1, knife: 1, oven: 1, refrigerator: 1, handbag: 1, clock: 1).
  - *Evidence*: **VERIFIED**. Direct HTTP GET to `http://localhost:8080/api/test/tasks/1/counts/` returns HTTP 200 with all 12 classes matching PostgreSQL `LabeledShape` aggregation identically: `[{"label":"person","count":12},{"label":"bottle","count":8},{"label":"cup","count":4},{"label":"wine glass","count":3},{"label":"cell phone","count":2},{"label":"spoon","count":2},{"label":"clock","count":1},{"label":"dining table","count":1},{"label":"handbag","count":1},{"label":"knife","count":1},{"label":"oven","count":1},{"label":"refrigerator","count":1}]`. Tested Task #2 returning `[]` (HTTP 200) and Task #99999 returning `404 Not Found`.

- [x] **Item 2: Web Interface Page Calls the Endpoint**
  - *Criteria*: A page/tab exists in CVAT web interface that triggers an HTTP GET to `/api/test/tasks/<id>/counts/`.
  - *Evidence*: **VERIFIED**. Navigating to `/tasks/1/analytics` or opening `/tasks/1` triggers an asynchronous HTTP GET request to `/api/test/tasks/1/counts/`, displays loading spinner while fetching, and receives the JSON count array.

- [x] **Item 3: Counts Shown as a Visual Graph**
  - *Criteria*: Graph component renders class labels and numeric count bars cleanly.
  - *Evidence*: **VERIFIED**. Bar Chart renders all 12 classes with distinct colors, horizontal proportional bars, class names, and numeric count badges (`person: 12`, `bottle: 8`, etc.).

- [x] **Item 4: Clean Handling of Empty and Error Cases**
  - *Criteria*:
    - **No Data**: A task with 0 annotations shows a clear Ant Design `<Empty>` state message instead of a broken chart.
    - **Failed Request**: A 404 or network failure shows a clear `<Alert>` with an error message and retry button.
  - *Evidence*: **VERIFIED**. Tested Task #3 (`/tasks/3/analytics`) with 0 annotations, confirming clean Ant Design `<Empty>` state ("No annotations found for this task") and "Back to Task #3" action button. Tested non-existent task (`/tasks/99999/analytics`), confirming red Ant Design `<Alert type="error">` with message "Task 99999 not found" and functional "Retry" button that dispatches a fresh API request.

- [x] **Item 5: Authentication & Task Permissions**
  - *Criteria*: Endpoint uses CVAT's existing authentication. Refuses unauthenticated requests (HTTP 401), refuses users without task access (HTTP 403), and permits authorized users/owners (HTTP 200).
  - *Evidence*: **VERIFIED**.
    1. Unauthenticated request (`curl http://localhost:8080/api/test/tasks/1/counts/`) returns `HTTP/1.1 401 Unauthorized` with `{"detail":"Authentication credentials were not provided."}`.
    2. Restricted non-owner user request (`restricted_user` token) returns `HTTP/1.1 403 Forbidden` with `{"detail":"You do not have permission to view this task."}`.
    3. Authorized owner request (`admin` token) returns `HTTP/1.1 200 OK` with complete 12-class dataset.
    4. Frontend catches 401/403 status codes and renders an Ant Design Access Denied alert with a "Back to Tasks" navigation button.

- [x] **Item 6: Speed Target Measurement**
  - *Criteria*: Endpoint response time measured over 5 consecutive runs. Objective target set, raw numbers saved, median and spread reported.
  - *Evidence*: **VERIFIED**.
    - Target: Median latency $\le$ 60 ms.
    - Raw 5-run outputs: `[52.3 ms, 50.5 ms, 51.0 ms, 60.9 ms, 52.2 ms]`.
    - Computed metrics: **Median = 52.2 ms**, **Spread = 50.5 ms – 60.9 ms** (Range: 10.4 ms).
    - Status: Target achieved.

---

## 2. Declared Unfinished Work (Required by Assessment Rules)
The following items were intentionally not attempted or deferred to ensure delivered items (1–6) are rock-solid:
- **Item 7 (Custom Filter / Grouping)**: Deferred to secondary milestone.
- **Item 8 (WebSocket Live Updates)**: Skipped due to architectural complexity within 8 hours.
- **Item 9 (WebSocket Reconnection)**: Skipped alongside Item 8.
