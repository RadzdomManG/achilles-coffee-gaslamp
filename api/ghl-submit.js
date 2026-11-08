// Serverless Endpoint for GoHighLevel Integration
// Location: 5ygjlutXObP4JJaHMD0b (Achilles Coffee Roasters)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, firstName, phone, email, contactName, company, eventDate, guestCount, notes, estimatedBudget } = req.body;
  const GHL_API_KEY = process.env.GHL_API_KEY || "pit-us-d7448cce-4e58-40da-96c3-17e6a77a1321";
  const LOCATION_ID = "5ygjlutXObP4JJaHMD0b";

  try {
    if (type === 'vip') {
      // 1. Create or Update Contact in GHL with VIP tag
      const ghlResponse = await fetch("https://services.leadconnectorhq.com/contacts/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GHL_API_KEY}`,
          "Version": "2021-07-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: firstName,
          name: firstName,
          email: email,
          phone: phone,
          locationId: LOCATION_ID,
          tags: ["gaslamp-vip-club", "website-voucher-lead"],
          source: "Achilles Gaslamp Website VIP $2 Voucher"
        })
      });

      const data = await ghlResponse.json();
      return res.status(200).json({ success: true, contactId: data.contact ? data.contact.id : null });
    } 
    else if (type === 'catering') {
      // 2. Create Catering Lead in GHL & Create Opportunity
      const contactRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GHL_API_KEY}`,
          "Version": "2021-07-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: contactName,
          companyName: company,
          email: email,
          phone: phone,
          locationId: LOCATION_ID,
          tags: ["convention-catering", "corporate-catering-lead"],
          source: `Website Catering (${guestCount} Guests - ${eventDate})`
        })
      });

      const contactData = await contactRes.json();
      const contactId = contactData.contact ? contactData.contact.id : null;

      // Create Opportunity in Corporate & Convention Catering Pipeline
      if (contactId) {
        await fetch("https://services.leadconnectorhq.com/opportunities/", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GHL_API_KEY}`,
            "Version": "2021-07-28",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            pipelineId: "V9lkMxLvS1I3iPuzwxes",
            locationId: LOCATION_ID,
            name: `${company || contactName} - Catering (${guestCount} Guests)`,
            pipelineStageId: "New Inquiry",
            status: "open",
            contactId: contactId,
            monetaryValue: parseInt(estimatedBudget) || 425
          })
        });
      }

      return res.status(200).json({ success: true, contactId: contactId });
    }

    return res.status(400).json({ error: "Invalid form type" });
  } catch (error) {
    console.error("GHL integration error:", error);
    return res.status(500).json({ error: error.message });
  }
}
