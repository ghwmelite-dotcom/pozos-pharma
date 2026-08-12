# Practice Hub Pharmacist Review Packet

**Review status:** Awaiting registered-pharmacist review

**Feature:** PSGH-aligned Practice Hub

**Audience:** Registered pharmacist, clinical governance lead, and privacy owner

**Decision requested:** Approve for staging UAT, approve with changes, or reject pending redesign

## Approval process

The pharmacist does not approve source code or the production site. The project owner gives the reviewer:

1. The isolated staging URL and the exact Git commit under review.
2. A synthetic verified-pharmacist account. No real patient or production account may be used.
3. This review packet and `PRACTICE_HUB_APPROVAL_FORM.docx`.
4. A contact for reporting defects without placing clinical or patient information in email, chat, or GitHub.

The registered pharmacist completes the staging scenarios, records results in the approval form, supplies their Pharmacy Council registration number, selects one decision, signs, and returns the document to the project owner through the agreed private channel. The project owner records the decision against the commit in the pull request without publishing the reviewer's registration number or signature.

A valid approval record contains the staging URL, commit identifier, reviewer identity and registration number, completed checklist, decision, conditions, signature, and date. **Approve for staging pilot** permits a synthetic-data pilot only. Production requires a separate release decision after all conditions are closed.

## 1. What the reviewer is approving

The Practice Hub lets a verified pharmacist document a de-identified clinical intervention, view pharmacist-scoped 30-day metrics, retain an offline entry until connectivity returns, and export their records as CSV.

Approval means the workflow, labels, taxonomies, safety language, and calculated metrics are suitable for a controlled staging pilot. It does **not** approve the product as an official PSGH, NHIA, Ghana FDA, or Pharmacy Council reporting portal.

## 2. Claims boundary

Approved product language must remain within these boundaries:

- "PSGH-aligned" means the workspace is designed around the supplied PSGH/CPPA strategic context. It does not imply endorsement, certification, integration, or data submission.
- A "reportable" flag means the pharmacist marked a record for later professional assessment. It does not determine that a report is legally or clinically required.
- Condition trends are counts from the authenticated pharmacist's own interventions. They are not population prevalence, epidemiological surveillance, or national research data.
- The acceptance rate is the percentage of interventions in the last 30 days whose outcome is `accepted` or `resolved`. It is not a clinical-effectiveness measure.
- The direct-identifier check is a safety guardrail, not an anonymisation guarantee.

## 3. Workflow under review

1. Only an authenticated user with the `pharmacist` role and a verified pharmacist record can open the API workspace.
2. The pharmacist records a condition category, medicine names, issue type, severity, action, outcome, occurrence time, optional review flag, and optional notes.
3. The server validates allowlisted values, text lengths, future dates, and several obvious direct identifiers before writing through prepared D1 statements.
4. If the browser is offline, the record is queued in IndexedDB with a client request ID. Reconnect sync is idempotent per pharmacist and client request ID.
5. Dashboards and CSV exports are scoped to the authenticated pharmacist.

## 4. Clinical taxonomy to approve

### Condition categories

- Cardiovascular
- Diabetes
- Infectious disease
- Malaria
- Maternal health
- Mental health
- Pain management
- Respiratory
- Other

### Intervention issue types

- Contraindication
- Dose adjustment
- Duplicate therapy
- Drug interaction
- Non-adherence
- Prescribing error
- Other

### Severity

- Low
- Moderate
- High
- Critical

The reviewer must define or approve operational criteria for each severity. The current interface provides labels but no embedded severity rubric.

### Outcomes

- Recommendation accepted
- Partially accepted
- Patient referred
- Resolved
- Pending follow-up

The reviewer must confirm whether `accepted` and `resolved` belong in one dashboard numerator and whether a distinct `not accepted` outcome is required.

## 5. Mandatory review checklist

Mark each item **Pass**, **Change required**, or **Not applicable**, with a note for every non-pass result.

| Area | Review question | Result | Notes |
|---|---|---|---|
| Scope | Does the intervention form match community-pharmacy practice without asking the pharmacist to diagnose? |  |  |
| Taxonomy | Are the condition and issue categories clinically useful and mutually understandable? |  |  |
| Severity | Are low, moderate, high, and critical suitable, and what exact rubric should users follow? |  |  |
| Outcome | Are the five outcomes complete and unambiguous? |  |  |
| Metrics | Is `accepted or resolved / all interventions` an appropriate displayed rate? |  |  |
| Review flag | Is "Mark for PSGH/FDA/NHIA review assessment" safe and accurate wording? |  |  |
| Privacy | Can pharmacists use the free-text fields without entering direct or indirect identifiers? |  |  |
| Offline mode | Is retaining a queued record on the pharmacist's device acceptable under the intended device policy? |  |  |
| Export | Does the CSV contain the correct fields and omit prohibited data? |  |  |
| Access | Is access by verified pharmacists only the correct professional boundary? |  |  |
| Retention | What retention, correction, deletion, and audit policies must apply? |  |  |
| Escalation | What workflow should follow when a record is marked for professional review? |  |  |
| Language | Do all PSGH, NHIA, Ghana FDA, and Pharmacy Council references avoid implying endorsement? |  |  |

## 6. Residual risks requiring a named owner

These are staging blockers until accepted or remediated:

1. **Free-text de-identification is incomplete.** The server rejects email addresses, common Ghana phone formats, and explicit NHIS/patient identifier labels. It cannot reliably detect names, addresses, rare conditions, facility identifiers, or contextual combinations that may re-identify a person.
2. **Offline records use browser IndexedDB.** They are not encrypted by application code. A shared or compromised device could expose queued content.
3. **No retention or deletion workflow is implemented.** The schema records creation and update times but the feature has no correction, deletion, legal-hold, or retention-policy controls.
4. **The review flag has no downstream case workflow.** Marking a record does not submit it or notify PSGH, NHIA, Ghana FDA, or the Pharmacy Council.
5. **Severity is self-classified.** No rubric or second review is enforced.
6. **Aggregates are not k-anonymised.** The current dashboard is pharmacist-scoped, but any future cross-pharmacist research view must introduce disclosure controls and governance approval.

## 7. Staging UAT scenarios

The reviewer should complete each scenario with synthetic data only:

1. Record a routine dose-adjustment intervention and confirm the reference code, record view, and 30-day metrics.
2. Record a high-severity interaction and confirm the high-priority count.
3. Mark an intervention for review and confirm no external-submission claim is made.
4. Attempt to enter an email address, Ghana phone number, and NHIS-labelled identifier; confirm each is rejected.
5. Attempt to enter a person name or street address; document the current guardrail limitation.
6. Record while offline, inspect the pending state, reconnect, and confirm exactly one server record is created.
7. Export CSV and verify scope, fields, dates, formula-injection protection, and absence of patient identifiers.
8. Sign in as an unverified applicant and as a normal user; confirm both are denied.

## 8. Evidence map

| Control | Implementation | Automated evidence |
|---|---|---|
| Verified-pharmacist access | `worker/src/routes/practice.js` and `worker/src/middleware/auth.js` | `worker/test/practice.test.js`, `worker/test/auth-role.test.js` |
| Pharmacist-scoped queries | `worker/src/routes/practice.js` | `worker/test/practice.test.js` |
| Prepared statements and allowlists | `worker/src/routes/practice.js` | `worker/test/practice.test.js` |
| Offline idempotency | `frontend/src/utils/practiceOffline.js` and unique database constraint | `worker/test/practice.test.js`, `worker/test/practice-migration.test.js` |
| CSV formula protection | `worker/src/routes/practice.js` | `worker/test/practice.test.js` |
| Schema and role repair | `worker/src/migrations/2026-08-12-practice-hub.sql` | `worker/test/practice-migration.test.js` |

## 9. Sign-off

| Role | Name and registration or authority | Decision | Date | Conditions |
|---|---|---|---|---|
| Registered pharmacist reviewer |  |  |  |  |
| Clinical governance owner |  |  |  |  |
| Privacy/data-protection owner |  |  |  |  |

Allowed decisions: **Approve for staging UAT**, **Approve with changes**, or **Reject pending redesign**.
