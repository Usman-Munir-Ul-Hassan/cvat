# Objectives: Annotation Analytics

## 1. Functional Objectives

### OBJ-1: Backend API returns accurate per-class annotation counts

| ID | Field | Entry |
|---|---|---|
| **MO-1** | **What is measured** | Whether the endpoint `/api/test/tasks/{task_id}/counts/` returns a JSON response with correct per-class annotation counts matching the database. |
| | **How** | Compare the API JSON response against a direct Django ORM shell query (`LabeledShape.objects.filter(...).values('label__name').annotate(count=Count('id'))`) on the same task. |
| | **Target** | 100% match — every class name and count in the API response must exactly equal the database query result. |
| | **Conditions** | Task #1 loaded with 37 COCO annotations across 12 classes (person: 12, bottle: 8, cup: 4, wine glass: 3, etc.). |
| | **Not included** | Tasks belonging to other users or projects (tested separately under auth). |
| | **Actual Result** | **100% exact match**. Tested live against Task #1 (`person: 12, bottle: 8, cup: 4, wine glass: 3, cell phone: 2, spoon: 2, dining table: 1, knife: 1, oven: 1, refrigerator: 1, handbag: 1, clock: 1`). Task #2 (empty) returned `[]` (HTTP 200). Task #99999 returned HTTP 404. |
| | **Status** | **PASSED** ✅ |

### OBJ-2: Analytics page renders a readable bar chart

| ID | Field | Entry |
|---|---|---|
| **MO-2** | **What is measured** | Whether the analytics page at `/tasks/{id}/analytics` displays a visual bar chart with labeled class names and numeric counts. |
| | **How** | Open `http://localhost:8080/tasks/1/analytics` in Chrome and visually confirm 12 labeled bars are rendered, one per annotated class. |
| | **Target** | All 12 classes visible as distinct bars with their names and count values displayed. |
| | **Conditions** | Task #1 with annotations loaded, CVAT Docker stack running. |
| | **Not included** | Mobile responsive layout testing. |
| | **Actual Result** | **Verified in Chrome**. Visited `http://localhost:8080/tasks/1/analytics` and `http://localhost:8080/tasks/1`. Confirmed 12 labeled bars rendered with distinct colors, proportional widths, and bold count numbers (`person: 12, bottle: 8, cup: 4, wine glass: 3`, etc.). |
| | **Status** | **PASSED** ✅ |

### OBJ-3: Empty tasks display a clear "no data" message

| ID | Field | Entry |
|---|---|---|
| **MO-3** | **What is measured** | Whether a task with zero annotations shows a user-friendly empty-state message instead of a broken or blank chart. |
| | **How** | Create a new task with images but no annotations, navigate to its analytics page, and check for an empty-state message. |
| | **Target** | A visible "No annotations found for this task" message is displayed. No broken chart or blank screen. |
| | **Conditions** | A newly created task with uploaded images but zero drawn annotations. |
| | **Not included** | Tasks with annotations that were later deleted. |
| | **Actual Result** | **Verified in Chrome**. Visited `http://localhost:8080/tasks/3/analytics` (0 annotations). Confirmed clean Ant Design `<Empty>` state with "No annotations found for this task" and "Back to Task #3" action button. |
| | **Status** | **PASSED** ✅ |

### OBJ-4: API or network failures display a clear error message

| ID | Field | Entry |
|---|---|---|
| **MO-4** | **What is measured** | Whether the analytics page gracefully handles API errors (invalid task ID, server failure) by showing an error alert with a retry option. |
| | **How** | Navigate to `/tasks/99999/analytics` (non-existent task) and confirm an error banner appears instead of a crash or blank screen. |
| | **Target** | A visible error alert with the message "Failed to load annotation counts" and a clickable retry button. |
| | **Conditions** | CVAT Docker stack running, requesting a task ID that does not exist in the database. |
| | **Not included** | Simulated Docker container crashes or database offline scenarios. |
| | **Actual Result** | **Verified in Chrome**. Visited `http://localhost:8080/tasks/99999/analytics`. Confirmed red Ant Design `<Alert type="error">` banner displayed with "Failed to load annotation counts", server message "Task 99999 not found.", and a clickable "Retry" button that dispatches a fresh API call. |
| | **Status** | **PASSED** ✅ |

---
