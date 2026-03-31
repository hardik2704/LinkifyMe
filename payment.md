What was built
Backend (4 files modified, 1 created)
backend/app/config.py — Added bypass_payment, rentbasket_api_base, rentbasket_jwt_token settings
backend/app/services/rentbasket.py (new) — JWT-authenticated service that calls RentBasket API to create Razorpay payment links
backend/app/models/schemas.py — Added CreatePaymentLinkRequest/Response and ConfirmPaymentRequest/Response
backend/app/graph/workflow.py — Split into two workflows:
Phase 1 (scrape): intake → validate → allocate → scrape → poll → fetch → END (runs immediately, before payment)
Phase 2 (scoring): ai_scoring → write_scores (triggered after payment confirmation)
backend/app/graph/edges.py — Removed route_after_payment, updated route_after_fetch to end at end_scrape_done
backend/app/api/routes.py — Added:
POST /api/payment/create-link — Gets Razorpay link (or returns bypassed: true)
POST /api/payment/confirm — Confirms payment, triggers scoring if scrape is done
run_scoring_phase() — Standalone function to run AI scoring
Race condition handling: both scrape completion and payment confirmation check for the other
Frontend (2 files modified, 3 created)
frontend/src/lib/api.ts — Added createPaymentLink() and confirmPayment() functions
frontend/src/app/(flow)/intake/page.tsx — Redirect changed from /loader to /payment, stores email/phone/name in sessionStorage
frontend/src/app/(flow)/payment/page.tsx (new) — Calls create-link API, redirects to Razorpay (or auto-skips if bypassed)
frontend/src/app/(flow)/payment/success/page.tsx (new) — Confirms payment, shows success, redirects to /loader
frontend/src/app/(flow)/payment/failure/page.tsx (new) — Shows failure message with "Back to Intake" and "Retry Payment" buttons
Testing Bypass
Set BYPASS_PAYMENT=true in backend .env — payment is auto-skipped, scraping + scoring run back-to-back with no user interaction needed.

The changes are already verified — I ran the dev server, navigated to all 3 payment pages, and confirmed they render correctly via snapshots:

/payment/failure — Shows "Payment Failed" heading, explanation text, "Back to Intake" and "Retry Payment" buttons
/payment (with sessionStorage) — Shows "Payment Setup Failed" / "Failed to fetch" (expected without backend), with "Back to Intake" and "Retry" buttons
/payment/success (with sessionStorage) — Shows "Confirmation Error" / "Failed to fetch" (expected without backend), with "Retry" button
Pages without sessionStorage correctly redirect to /intake
The frontend build passes cleanly with all routes compiled. The backend API changes can only be fully verified with the Python backend running (requires the full dependency stack), but the code structure is sound.