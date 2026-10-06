# Definition of Done: Annotation Analytics (Items 1–4)

This checklist establishes the acceptance criteria for the mandatory floor (Items 1 to 4). Per assessment rules, each checked item must include concrete evidence (raw output, screenshot, or test result).

---

## 1. Mandatory Floor Checklist (Items 1 – 4)

- [ ] **Item 1: API Endpoint Returns Correct Counts**
  - *Criteria*: Endpoint `/api/test/tasks/<id>/counts/` returns JSON per-class counts matching direct database query on Task #1 (person: 12, bottle: 8, cup: 4, wine glass: 3, cell phone: 2, spoon: 2, dining table: 1, knife: 1, oven: 1, refrigerator: 1, handbag: 1, clock: 1).
  - *Evidence*: `pending`

- [ ] **Item 2: Web Interface Page Calls the Endpoint**
  - *Criteria*: A page/tab exists in CVAT web interface that triggers an HTTP GET to `/api/test/tasks/<id>/counts/`.
  - *Evidence*: `pending`

- [ ] **Item 3: Counts Shown as a Visual Graph**
  - *Criteria*: Graph component renders class labels and numeric count bars cleanly.
  - *Evidence*: `pending`

- [ ] **Item 4: Clean Handling of Empty and Error Cases**
  - *Criteria*:
    - **No Data**: A task with 0 annotations shows a clear Ant Design `<Empty>` state message instead of a broken chart.
    - **Failed Request**: A 404 or network failure shows a clear `<Alert>` with an error message and retry button.
  - *Evidence*: `pending`

---

## 2. Declared Unfinished Work (Required by Assessment Rules)
The following items were intentionally not attempted or deferred to ensure the mandatory floor is rock-solid:
- **Item 5 (Authentication & Task Permissions)**: Deferred to secondary milestone.
- **Item 6 (Speed Target Measurement)**: Deferred to secondary milestone.
- **Item 7 (Custom Filter / Grouping)**: Deferred to secondary milestone.
- **Item 8 (WebSocket Live Updates)**: Skipped due to architectural complexity within 8 hours.
- **Item 9 (WebSocket Reconnection)**: Skipped alongside Item 8.
