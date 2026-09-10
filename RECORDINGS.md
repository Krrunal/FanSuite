### Keep messages safe
The attached screen recording demonstrates the message flows: **See Recording:** [Google Drive Recording](https://drive.google.com/file/d/1xbsiCxRVF9G6cUJj-LK_tUczsqvHNyhx/view?usp=sharing)
- Send While offline
- Received Inbound
- Failure Tap to resend 
- 50K+ old message scroll
- Clear all message

During Expo testing, if the actual connection is disabled to test the waiting/pending status, force-closing the app can prevent it from restarting through the Node manager. To handle this during testing, I added an Offline Simulation button. It allows the pending/waiting payment flow to be tested without requiring a real network connection.

### Handle payments and paid access
The attached screen recording demonstrates the product payment flows: **See Recording:** [Google Drive Recording](https://drive.google.com/file/d/1clJahz1RfJqRexpPJcijioY1PY9oXH4h/view?usp=sharing)
- Standard Purchase (Success): Simulates a normal successful payment. The payment completes in about 1.2 seconds and the receipt is successfully verified by the backend.
- Delayed Backend Verification: Adds a 4-second delay during backend verification. This checks that the app shows the pending confirmation message and does not unlock the product too early.
- User Cancellation: Simulates the user cancelling the payment. The process stops, buttons become active again, and the existing local data remains unchanged.
- Payment Failure: Simulates a failed payment. The app shows an error message while keeping the user's existing subscription active.
- Restore Purchases: Gets previous purchase IDs from the device without making a new payment. The purchases are checked with the backend to restore the user's access.
- Sandbox Reset: Clears the payment-related local data stored in AsyncStorage, allowing the payment flows to be tested again from a clean state.

After Successfully payment or confirmation, Special Feature has been enabled, so you can see the extra tab at bottom space.


