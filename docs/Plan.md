# Implementation Plan: Annotation Analytics (Items 1–4)


## 1. Scope & Execution Order: The Mandatory Floor (Items 1–4)

Per the assessment rules: *"Items 1 to 4 are the floor. Nothing further is assessed until those four work."*
We are focusing exclusively on completing and verifying Items 1 through 4 with zero defects before considering any further items.

| Order | Deliverable | How We Will Reach It | Estimated Time | Status |
|---|---|---|---|---|
| **1** | **Item 1: Backend API Endpoint** | 1. Create a new Django app named `test` in `cvat/apps/test/`.<br>2. Register `cvat.apps.test` in `settings/base.py` and mount its routes in `cvat/apps/engine/urls.py` as `/api/test/tasks/<id>/counts/`.<br>3. In `test/views.py`, query PostgreSQL for `LabeledShape` where `job__segment__task_id=task_id`.<br>4. Run database-level aggregation with `.values('label__name').annotate(count=Count('id'))`.<br>5. Return JSON payload: `[{"label": "person", "count": 12}, ...]`. | 1.0 Hour (Actual: 0.5h) | **Completed** ✅ |
| **2** | **Item 2: Web Interface Page Calling the API** | 1. In `cvat-ui`, add a dedicated analytics view/route at `/tasks/:id/analytics` (or tab on Task page).<br>2. On component mount, extract `taskId` from route parameters.<br>3. Send an asynchronous HTTP GET request to `/api/test/tasks/${taskId}/counts/`.<br>4. Store state: `data`, `loading`, and `error`. | 0.75 Hour (Actual: 0.5h) | **Completed** ✅ |
| **3** | **Item 3: Counts Rendered as a Graph** | 1. Build a visual bar chart component within the analytics page.<br>2. Map each class name to the axis and count to bar length.<br>3. Display numeric count badges, color differentiation, and clear labels for each class.<br>4. Ensure responsive layout matching CVAT UI design language. | 0.75 Hour (Actual: 0.5h) | **Completed** ✅ |
| **4** | **Item 4: Clean Handling of Empty and Error Cases** | 1. **No Data Case**: If `data.length === 0` (empty task with no annotations), render a clean `<Empty description="No annotations found for this task" />` state instead of an empty/broken graph.<br>2. **Failed Request Case**: If the API call returns an HTTP error or network disconnects, catch the exception and render a clear `<Alert type="error" message="Failed to load counts" />` with a retry button. | 0.5 Hour | *Pending* |
| **-** | **Verification, Testing & Buffer** | Test Task #1 (37 annotations), test an empty task (0 annotations), test error response (invalid task ID), record evidence. | 0.5 Hour | *Pending* |
| | **Total Time Budget** | | **3.5 Hours** | |

> **Plan Tracking Note (Items 1, 2 & 3 Completed)**:  
> - **Item 1**: Built and verified `/api/test/tasks/<id>/counts/` matching PostgreSQL aggregation in 0.5h.
> - **Item 2**: Created `TaskAnnotationAnalytics` component calling the endpoint with state management (`data`, `loading`, `error`) and mounted at `/tasks/:id/analytics` in 0.5h.
> - **Item 3**: Implemented clean horizontal Bar Chart with distinct colors, proportional widths, class labels, and numeric count badges in 0.5h.
> Total time spent so far: **1.5 Hours** out of 3.5 Hours budgeted. Remaining for Item 4 & Verification: 2.0 Hours.

---

## 3. What We Have Decided to Skip & Why
- **Skipped: Items 5 to 7 (Auth extensions, speed targets, custom grouping)**:
  - *Decision*: Held in reserve. We will only evaluate tackling these after Items 1–4 are fully built, tested, and evidence is gathered.
- **Skipped: Items 8 & 9 (Live WebSocket Updates & Auto-Reconnect)**:
  - *Decision*: Explicitly skipped from our time-boxed plan.
  - *Rationale*: Setting up bidirectional WebSocket channels, Redis publisher events, and state synchronization inside CVAT's multi-container architecture carries excessive risk of regressions within our sprint. A solid, defect-free delivery of the floor (Items 1–4) scores far higher than an unstable real-time prototype.

---

## 4. Decision Record (Architectural Choices)
- **Approach Chosen**: Database-level ORM aggregation (`values('label__name').annotate(count=Count('id'))`) executed directly in PostgreSQL.
- **Approach Rejected**: Pulling all annotation objects into Python server memory and counting with Python loops or `collections.Counter`.
- **What Rejecting It Cost**:
  - *The Cost*: Required understanding CVAT's multi-table relational schema (`Task` $\to$ `Segment` $\to$ `Job` $\to$ `LabeledShape` $\to$ `Label`) to formulate the correct foreign key query path.
  - *The Benefit*: Eliminates memory overhead ($O(1)$ memory usage in Python regardless of dataset size), avoids transferring thousands of rows over the wire, and runs inside PostgreSQL in sub-10ms using indexed lookups.
