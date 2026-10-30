# MahaAgri Guard — UI/UX and AI Risk Audit

## UX issues found and addressed in this pass

- The farmer page previously opened directly into weather and a dense two-column workflow, without a clear first action. Added a concise welcome panel, a 3-step process, and a primary “Check a crop” action.
- Image selection relied on clicking a drop-zone styled as a `div`. Added keyboard activation, drag-and-drop, accepted image types, a 10 MB limit, and clear validation feedback.
- The analysis state was a small status strip with no sense of progress. Added a more visible progress state and reminded users that screening is not a confirmed diagnosis.
- The empty results panel was visually quiet but did not teach users how to get a useful result. Added a short photo-quality checklist.
- The welcome area was English-only despite the app offering Hindi and Marathi. Added localized copy for the new area.
- Added stronger hierarchy, more consistent spacing, responsive layouts, accessible focus states, reduced-motion handling, and clearer touch targets while retaining the existing dark green agricultural identity.

## AI/product risks that remain

1. **Model validation:** the API itself states that the MobileNetV2 checkpoint is not independently field-validated. A high softmax score is not real-world accuracy. Keep the “Model score” wording and do not present it as certainty. Before deployment, evaluate on independent, locally collected images across districts, seasons, phone cameras, crop stages and disease severity; publish per-class precision/recall and calibration.
2. **Out-of-distribution photos:** soil, hands, multiple leaves, low light, non-supported crops or unfamiliar diseases can still receive a class label. Add an explicit image-quality/OOD gate and an “unable to assess—retake or contact expert” outcome rather than forcing a disease prediction.
3. **Crop mismatch:** user-selected crop hints and predicted crop may differ. Show both clearly and ask the farmer to confirm before using crop-specific recommendations.
4. **Treatment safety:** recommendations can have financial, health and environmental consequences. Never invent product registration, dose, waiting period or local approval. Require official, crop/disease-specific sources, label instructions and expert review; avoid automatic pesticide recommendations based only on a model score.
5. **Weather risk vs diagnosis:** weather-based risk is a signal, not evidence that a disease is present. Visually separate “weather risk” from “photo screening” and show the source/time of weather data.
6. **Assistant reliability:** generated answers may be wrong, stale or overconfident. Keep it grounded in approved advisory content, show source/updated date where possible, and provide a clear escalation path to KVK/agronomists. Do not let it override label instructions or local authorities.
7. **Dashboard access:** the frontend lets users switch to the government dashboard, and UI-only hiding is not security. Implement server-side officer roles, authorization checks on every dashboard endpoint, audit logs, and separate farmer/officer permissions before using real field data.
8. **Privacy and consent:** explain why GPS is requested, allow district-only use, and state whether images and coordinates are stored. Provide deletion/retention rules and do not imply the service is government-approved unless that is formally true.
9. **Report ownership:** authenticated accounts are not yet clearly associated with all diagnosis/report history. Scope report queries and mutations to the authenticated owner or authorized officer; do not rely on client-side IDs.
10. **Operational transparency:** distinguish live API data from demo/sample content, show last-updated timestamps and backend errors, and provide a retry action without losing the selected photo.

## Recommended next priorities

- P0: server-side officer roles and endpoint authorization; verified advisory sources; image-quality/OOD handling; transparent live-vs-demo status.
- P1: account-specific diagnosis history, save/follow-up states, retry without re-upload, crop confirmation when model and user selection disagree.
- P2: usability testing with Marathi/Hindi-speaking farmers on low-end Android phones, weak networks and large text settings; measure task completion and comprehension rather than visual polish alone.
