const axios = require("axios");

const HUBSPOT_BASE = "https://api.hubapi.com";

function hubspotClient() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error("HUBSPOT_ACCESS_TOKEN is not set");

  return axios.create({
    baseURL: HUBSPOT_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// ─── Search for an existing contact by phone number ────────────────────
async function findContactByPhone(phone) {
  const client = hubspotClient();

  const { data } = await client.post("/crm/v3/objects/contacts/search", {
    filterGroups: [
      {
        filters: [
          { propertyName: "phone", operator: "EQ", value: phone },
        ],
      },
    ],
    properties: ["phone", "firstname", "lastname", "email"],
  });

  return data.total > 0 ? data.results[0] : null;
}

// ─── Create a new contact ──────────────────────────────────────────────
async function createContact(phone) {
  const client = hubspotClient();

  const { data } = await client.post("/crm/v3/objects/contacts", {
    properties: {
      phone,
      firstname: "Unknown caller",
      lifecyclestage: "lead",
    },
  });

  console.log(`✅  Created new HubSpot contact ${data.id} for ${phone}`);
  return data;
}

// ─── Log a call as a note on a contact (v1 Engagements API) ───────────
// Uses the v1 API — only requires crm.objects.contacts.write scope
async function createCallNote(contactId, callData) {
  const client = hubspotClient();

  const { data } = await client.post("/engagements/v1/engagements", {
    engagement: {
      active: true,
      type: "NOTE",
      timestamp: Date.now(),
    },
    associations: {
      contactIds: [Number(contactId)],
      companyIds: [],
      dealIds: [],
      ownerIds: [],
    },
    metadata: {
      body: buildCallNotes(callData),
    },
  });

  console.log(`📝  Logged note ${data.engagement.id} for contact ${contactId}`);
  return { id: data.engagement.id };
}

// ─── Build human-readable call notes ───────────────────────────────────
function buildCallNotes(callData) {
  const lines = [
    `Call SID: ${callData.CallSid}`,
    `From: ${callData.From}`,
    `To: ${callData.To}`,
    `Status: ${callData.CallStatus}`,
    `Duration: ${callData.CallDuration}s`,
  ];

  if (callData.RecordingUrl) {
    lines.push(`Recording: ${callData.RecordingUrl}`);
  }

  return lines.join("\n");
}

module.exports = {
  findContactByPhone,
  createContact,
  createCallNote,
};
