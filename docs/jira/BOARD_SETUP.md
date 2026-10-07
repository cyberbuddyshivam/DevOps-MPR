# Jira Board Setup Guide & Screenshot Checklist (Experiment 1)

This guide walks you through importing the FindIT project into Atlassian Jira Cloud (Free Tier) to establish full Agile lifecycle compliance for **Experiment 1**.

---

## 1. Quick CSV Import into Jira Cloud (2 Minutes)

Jira Cloud provides a built-in CSV importer to load your backlog, epics, story points, and acceptance criteria instantly.

### Step 1: Open Jira External System Importer
1. Log in to your Jira Cloud workspace (e.g., `https://your-domain.atlassian.net`).
2. Click the **Settings Gear (⚙)** in the top navigation bar ➔ Select **System**.
3. Under the **Import and Export** section in the left sidebar, click **External System Import**.
4. Select **CSV** from the list of import sources.

### Step 2: Upload CSV File
1. Click **Choose File** and select:
   ```
   docs/jira/jira_issues.csv
   ```
2. Check the box **"Use an existing configuration file"** (leave unchecked if first time).
3. Set **File encoding** to `UTF-8` and **Delimiter** to `,` (comma).
4. Click **Next**.

### Step 3: Project Configuration
1. Select **Import to an existing project** (or create a new one named `FindIT`).
2. **Project Name**: `FindIT - Lost and Found`
3. **Project Key**: `FIND`
4. Click **Next**.

### Step 4: Map CSV Fields to Jira Fields
Map the CSV column headers to their corresponding Jira fields:

| CSV Header | Jira Target Field |
|---|---|
| `Issue Type` | **Issue Type** |
| `Issue Key` | **Issue ID** / **Issue Key** |
| `Summary` | **Summary** |
| `Description` | **Description** |
| `Epic Name` | **Epic Name** |
| `Epic Link` | **Epic Link** |
| `Priority` | **Priority** |
| `Story Points` | **Story Points** (or Story point estimate) |
| `Sprint` | **Sprint** |
| `Status` | **Status** |
| `Acceptance Criteria` | **Acceptance Criteria** (or map to Description) |

### Step 5: Map Field Values & Begin Import
1. Verify value mappings (e.g., `Epic` ➔ `Epic`, `Story` ➔ `Story`, `Task` ➔ `Task`, `Done` ➔ `Done`).
2. Click **Begin Import**.
3. The import wizard will report **14 issues imported successfully** (2 Epics, 6 Stories, 6 Tasks).

---

## 2. Configuring the 5-Column Scrum Board

To demonstrate genuine DevOps workflows, customize the board columns beyond the default 3-column setup.

### Step-by-Step Column Configuration:
1. Navigate to your project `FIND` ➔ Click **Board** ➔ Click the **three dots (...)** at top right ➔ **Board settings**.
2. Select **Columns** from the left navigation.
3. Click **Add Column** to configure the following exact workflow sequence:

```
+-----------+    +---------------+    +---------------+    +-----------+    +--------+
|   TO DO   | -> |  IN PROGRESS  | -> |  CODE REVIEW  | -> |  TESTING  | -> |  DONE  |
+-----------+    +---------------+    +---------------+    +-----------+    +--------+
```

### Status Mapping Table:
- **TO DO**: Status `To Do` / `Open` / `Backlog`
- **IN PROGRESS**: Status `In Progress`
- **CODE REVIEW**: Status `In Review` (represents GitHub Pull Request stage)
- **TESTING**: Status `In Test` (represents GitHub Actions CI / QA validation)
- **DONE**: Status `Done` / `Closed` / `Resolved`

---

## 3. Sprint Execution & Transition Flow

1. **Sprint 1 Execution**:
   - Drag `FIND-06`, `FIND-01`, `FIND-02`, `FIND-03`, `FIND-04` from Backlog into **Sprint 1**.
   - Click **Start Sprint** (Set 2-week duration).
   - Move tickets as features are developed: `To Do` ➔ `In Progress` ➔ `Code Review` (PR created) ➔ `Testing` (CI passing) ➔ `Done` (merged into `develop`).
   - Click **Complete Sprint**.

2. **Sprint 2 Execution**:
   - Drag `FIND-05`, `FIND-07`, `FIND-08`, `FIND-09`, `FIND-10`, `FIND-11`, `FIND-12` into **Sprint 2**.
   - Click **Start Sprint**.
   - Move cards across columns as CI/CD, Docker, Ansible, and Kubernetes tasks are completed.
   - Click **Complete Sprint**.

---

## 4. Screenshot Checklist for Project Report & Viva

Capture the following 5 screenshots for the academic report and viva demonstration:

| Screenshot # | Name | Where in Report | What it Must Visibly Show |
|:---:|---|---|---|
| **SS-JIRA-01** | **Product Backlog & Epics** | Section 8.1 (Exp 1: Agile Lifecycle) | The complete Jira Backlog view showing the two Epics (`FIND-EPIC-01: Application Development`, `FIND-EPIC-02: DevOps Pipeline`) and all 12 user stories with story points. |
| **SS-JIRA-02** | **Sprint 1 Active Board** | Section 8.1 (Exp 1: Agile Lifecycle) | The Active Sprint Board showing stories `FIND-01` through `FIND-04` and `FIND-06` progressing across the 5 columns (`To Do`, `In Progress`, `Code Review`, `Testing`, `Done`). |
| **SS-JIRA-03** | **Sprint 2 Active Board (DevOps)** | Section 8.1 (Exp 1: Agile Lifecycle) | The Sprint 2 Board showing DevOps cards (`FIND-07` GitHub Actions, `FIND-08` Docker, `FIND-10` Ansible, `FIND-11` Kubernetes) in progress or completed. |
| **SS-JIRA-04** | **Sprint Burndown Chart** | Section 8.1 (Exp 1: Agile Lifecycle) | The Jira Burndown Chart for Sprint 1 and Sprint 2 showing committed story points decreasing steadily toward 0 at the end of the sprint. |
| **SS-JIRA-05** | **Issue Traceability Detail** | Section 8.1 (Exp 1: Agile Lifecycle) | Detail view of ticket `FIND-01` or `FIND-07` showing description, acceptance criteria, story points, assignee, and the linked Git commit/branch name. |

---

## 5. Offline / Local Fallback Verification

If presenting without live internet access or Jira Cloud access in the viva:
1. Show `docs/jira/jira_issues.csv` and explain the CSV structure, issue keys, and field mappings.
2. Show `docs/jira/SPRINT_PLAN.md` to demonstrate sprint point calculations and Agile definitions (DoR, DoD).
3. Demonstrate Git branch names and commit messages matching the ticket IDs (`git log --grep="FIND-"`).
