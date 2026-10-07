# Firestore Security Specification: Numi Finance Multi-Device Sync

## 1. Data Invariants
1. **User Scope & Isolation**: A user can only read, create, update, and delete their own user profile document, transactions, and tags (`/users/{userId}/**`). No cross-user access or public reads.
2. **Identity Integrity**: For every document created or updated under `/users/{userId}/**`, the `userId` field inside document data must strictly match `request.auth.uid`, and the path `{userId}` must equal `request.auth.uid`.
3. **Transaction Immutability**: The `id`, `userId`, and `createdAt` fields of a transaction cannot be tampered with or reassigned to another user or id during updates.
4. **Volumetric Boundaries**:
   - Transaction titles cannot exceed 120 characters.
   - Transaction categories cannot exceed 60 characters.
   - Custom tag lists cannot exceed 20 items, and items must be strings.
   - Tag names cannot exceed 50 characters.
   - Tag colors cannot exceed 30 characters.
   - Transaction amounts must be non-negative numbers.
   - Path variables `{userId}`, `{transactionId}`, `{tagId}` must conform to safe regex `^[a-zA-Z0-9_\-]+$` and length <= 128.
5. **No Blanket Reads**: All read operations are restricted to the authenticated document owner (`request.auth.uid == userId`). Unauthenticated access is rejected by default.
6. **Catch-All Default Deny**: The root database rule defaults to denying all read and write operations.

## 2. The "Dirty Dozen" Payloads (Must be Denied)

1. **Payload 1 (Unauthenticated User Profile Read)**:
   - Target: `GET /users/victim-user-123`
   - Auth: `null`
   - Expected: `PERMISSION_DENIED`

2. **Payload 2 (Unauthenticated Transaction Write)**:
   - Target: `POST /users/victim-user-123/transactions/tx-malicious`
   - Auth: `null`
   - Expected: `PERMISSION_DENIED`

3. **Payload 3 (Cross-User Transaction Infiltration)**:
   - Target: `POST /users/victim-user-123/transactions/tx-spoof`
   - Auth: `uid = "attacker-456"`
   - Expected: `PERMISSION_DENIED` (Path mismatch: attacker attempting to write into victim's subtree)

4. **Payload 4 (Identity Spoofing in Payload Body)**:
   - Target: `POST /users/attacker-456/transactions/tx-spoof`
   - Auth: `uid = "attacker-456"`
   - Body: `{ id: "tx-spoof", userId: "victim-user-123", amount: 100, ... }`
   - Expected: `PERMISSION_DENIED` (Body userId does not match request.auth.uid)

5. **Payload 5 (Path Variable ID Poisoning / Oversized ID)**:
   - Target: `POST /users/attacker-456/transactions/<1500_char_string>`
   - Auth: `uid = "attacker-456"`
   - Expected: `PERMISSION_DENIED` (ID exceeds 128 characters or invalid characters)

6. **Payload 6 (Shadow Field / Ghost Field Injection)**:
   - Target: `POST /users/attacker-456/transactions/tx-ghost`
   - Auth: `uid = "attacker-456"`
   - Body: `{ id: "tx-ghost", userId: "attacker-456", isAdmin: true, role: "superadmin", ... }`
   - Expected: `PERMISSION_DENIED` (hasOnly schema check fails)

7. **Payload 7 (Oversized Title / Denial of Wallet Attack)**:
   - Target: `POST /users/attacker-456/transactions/tx-overflow`
   - Auth: `uid = "attacker-456"`
   - Body: `{ title: "<5000 character string>", ... }`
   - Expected: `PERMISSION_DENIED` (title.size() > 120)

8. **Payload 8 (Negative Transaction Amount)**:
   - Target: `POST /users/attacker-456/transactions/tx-neg`
   - Auth: `uid = "attacker-456"`
   - Body: `{ amount: -999999, ... }`
   - Expected: `PERMISSION_DENIED` (amount must be >= 0)

9. **Payload 9 (Unbounded Custom Tags Array Injection)**:
   - Target: `POST /users/attacker-456/transactions/tx-tag-flood`
   - Auth: `uid = "attacker-456"`
   - Body: `{ customTags: [1000 items], ... }`
   - Expected: `PERMISSION_DENIED` (customTags.size() > 20)

10. **Payload 10 (Immutability Bypass / Tampering with CreatedAt or Owner)**:
    - Target: `UPDATE /users/attacker-456/transactions/tx-legit`
    - Auth: `uid = "attacker-456"`
    - Diff: `{ userId: "other-user", createdAt: 0 }`
    - Expected: `PERMISSION_DENIED` (incoming().userId != existing().userId)

11. **Payload 11 (Cross-User Tag Stealing/Modification)**:
    - Target: `DELETE /users/victim-user-123/tags/tag-work`
    - Auth: `uid = "attacker-456"`
    - Expected: `PERMISSION_DENIED`

12. **Payload 12 (Root Blanket Read Probe)**:
    - Target: `GET /nonexistent_collection/doc-1`
    - Auth: `uid = "attacker-456"`
    - Expected: `PERMISSION_DENIED` (Default-deny catch-all rule)
