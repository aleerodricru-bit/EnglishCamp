# Security Specification: LingoCamp

## 1. Data Invariants
1. **Owner-Only Private Profile**: A `/users/{userId}` document may only be read, created, or updated by the verified authenticated user whose `request.auth.uid == userId`.
2. **PII Isolation**: Private fields (such as `email`) exist only in `/users/{userId}` and NEVER appear on `/leaderboard/{userId}`.
3. **Leaderboard Integrity**: A `/leaderboard/{userId}` document may only be created or updated by `request.auth.uid == userId` with strict numeric bounds (`xp <= 1000000`, `weekDaysCount <= 7`, `unlockedLevel <= 6`) and valid avatar/ageGroup enums.
4. **Master Gate on Subcollections**: `/users/{userId}/sessions/{sessionId}` requires the parent `/users/{userId}` document to exist (`exists()` / `get()`) and match `request.auth.uid`.
5. **Temporal Integrity**: `createdAt` must equal `request.time` on create and remain immutable on update; `updatedAt` must equal `request.time` on every write.
6. **Path & Payload Bounds**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (length <= 128), strings have explicit `.size()` bounds, and arrays have strict `.size()` bounds.
7. **Suggestion Ownership & Zero PII**: `/gameSuggestions/{suggestionId}` stores only `authorNickname` and `authorAvatarId` (never `email`), mandates `authorUid == request.auth.uid` on create, and restricts `delete` to `existing().authorUid == request.auth.uid`.
8. **Atomic 1-Vote-Per-User Guarantee**: Incrementing/decrementing `votesCount` on `/gameSuggestions/{suggestionId}` is strictly coupled via `existsAfter` / `getAfter` to creating/deleting the voter's single `/gameSuggestions/{suggestionId}/votes/{voterId}` receipt document.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Identity Spoofing on Profile**: Create `/users/victim_uid` while signed in as `attacker_uid` with `uid: "victim_uid"`.
2. **Shadow Field Injection**: Create `/users/attacker_uid` with an extra ghost field `isAdmin: true`.
3. **Unverified Email Write**: Attempt write with `request.auth.token.email_verified == false`.
4. **PII Scraping List Query**: Attempt `list` on `/users` collection by any signed-in user.
5. **Resource Exhaustion (1MB String)**: Create `/leaderboard/attacker_uid` with a 500KB `nickname`.
6. **Score Overflow Exploit**: Update `/leaderboard/attacker_uid` setting `xp: 999999999` or `weekDaysCount: 99`.
7. **Timestamp Forgery**: Create `/users/attacker_uid` with backdated `createdAt` instead of `request.time`.
8. **Immutable Field Tampering**: Update `/users/attacker_uid` changing `createdAt` or `uid`.
9. **Orphaned Session Write**: Create `/users/attacker_uid/sessions/s1` when parent `/users/attacker_uid` does not exist.
10. **Session Tampering**: Attempt to `update` or `delete` an immutable `/users/{userId}/sessions/{sessionId}` record.
11. **Array Explosion**: Update `/users/attacker_uid` with `weekDaysCompleted` containing 100 items (exceeds 7).
12. **Path Poisoning**: Attempt `get` or `create` with a document ID containing invalid characters or length > 128.
13. **Vote Inflation Attack**: Update `/gameSuggestions/{id}` jumping `votesCount` by `+50` or without atomically creating `/gameSuggestions/{id}/votes/{uid}`.
14. **Suggestion Hijack / Delete Spoof**: Attempt to `update` `title`/`description` or `delete` another user's `/gameSuggestions/{id}` document.
