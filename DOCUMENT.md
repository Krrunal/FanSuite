### Duplicate Message
When a request reached the backend, the server successfully wrote the message to the database. However, the acknowledgment response back to the client was dropped by NETWORK_TIMEOUT_ACK_LOST or a real network drop. The client assumed the request failed, while the server considered it complete.
Without checking for a matching client-generated identifier, every subsequent retry sent by the client treated the payload as a brand-new message, So It may be a duplicate entry.

### Architecture Decisions
- Client Outbox Pattern: `ClientOutboxManager` storage marked pending prior to network transit, enabling crash recovery and resilient offline replay.
- Stable Client IDs: Guaranteed unique IDs (cid__) generated at initial submission rather than relying on server-assigned sequence IDs (srv_*).
- Implemented an inverted list structure with paginated local history slicing (PAGE_SIZE = 30) to avoid maintaining 50,000 active nodes directly in memory.

### Test Results

| Test Case | Scenario & Steps | Observed Outcome | Status |
|------|-----|------|------|
| TC-01: Network Flakiness (Drop ACK) | Enable "Drop ACK", send message. Retry after failure. | Backend ingests once; outbox reconciles cleanly on retry without duplicate bubbles. | PASS |
| TC-02: Offline Interleaving | Offline mode -> enqueue message -> stage 4 inbounds -> reconnect. | Messages serialize chronologically based on base timestamp via runSequentialCatchUp. | PASS |
| TC-03: Deep Pagination | Toggle 50k history mode and fling-scroll upwards. | Virtualized chunks append smoothly without thread stutter or message mutation. | PASS |
| TC-04: Waiting Status | Toggle Offline button, Send 2 or n numbers of message, All Showing Waiting Status, Toggle Offline | All Message Submitted without Duplication | PASS |

### Performance Measurements
- Memory Footprint: Heap overhead remained steady at ~42 MB during active scrolling; removeClippedSubviews effectively recycled off-screen views on Android.
- Reconciliation Latency: Thread reconciliation took 4–12 ms for standard threads (<100 messages) and 18–25 ms during large history pagination passes.

### Platform Limitations
- AsyncStorage Serial Overhead: Operating large threads directly against AsyncStorage creates serialization blocking when storing large arrays. Production setups should use SQLite (e.g., op-sqlite or any other modules).
- Image Picker Permission Model: Expo Image Picker requires strict runtime permission checks (requestMediaLibraryPermissionsAsync), failing silently if permission states are undetermined.

### Time Spent
- Catch-Up Synchronisation & Implementation: 4-5 Hours
- UI/UX Polish, Accessibility & Testing: 1.5 hours
