const express = require("express");
const router = express.Router();
const {
  findContactByPhone,
  createContact,
  createCallNote,
} = require("../services/hubspot");

// POST /webhook/call — Twilio statusCallback / voice webhook
router.post("/call", async (req, res) => {
  try {
    const callData = req.body;
    const phone = callData.From;

    if (!phone) {
      console.warn("⚠️  Webhook received without a From number");
      return res.status(400).json({ error: "Missing From number" });
    }

    console.log(`📥  Incoming webhook — ${phone} → ${callData.To}`);

    // 1. Look up or create the contact
    let contact = await findContactByPhone(phone);

    if (contact) {
      console.log(`🔎  Existing contact found: ${contact.id}`);
    } else {
      console.log(`🆕  No contact found for ${phone} — creating…`);
      contact = await createContact(phone);
    }

    // 2. Log the call as a note on the contact
    const note = await createCallNote(contact.id, callData);

    return res.json({
      ok: true,
      contactId: contact.id,
      noteId: note.id,
      isNew: !contact.properties, // new contacts come from createContact
    });
  } catch (err) {
    console.error("❌  Webhook processing failed:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
