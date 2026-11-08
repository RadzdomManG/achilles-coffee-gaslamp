// Advanced Serverless Automation Gateway for GoHighLevel
// Target Sub-Account: 5ygjlutXObP4JJaHMD0b (Achilles Coffee Roasters)
// Portfolio Routing: gallegoleoppsalm@gmail.com / 09182518515

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, firstName, phone, email, contactName, company, eventDate, guestCount, notes, estimatedBudget, rating, feedbackText } = req.body;
  const GHL_API_KEY = process.env.GHL_API_KEY || "pit-us-d7448cce-4e58-40da-96c3-17e6a77a1321";
  const LOCATION_ID = "5ygjlutXObP4JJaHMD0b";
  const ADMIN_EMAIL = "gallegoleoppsalm@gmail.com";
  const ADMIN_PHONE = "09182518515";

  const headers = {
    "Authorization": `Bearer ${GHL_API_KEY}`,
    "Version": "2021-07-28",
    "Content-Type": "application/json"
  };

  try {
    // -------------------------------------------------------------
    // AUTOMATION 1: VIP SMS CLUB & $2.00 VOUCHER GENERATOR
    // -------------------------------------------------------------
    if (type === 'vip') {
      const ghlRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          firstName: firstName,
          name: firstName,
          email: email,
          phone: phone,
          locationId: LOCATION_ID,
          tags: ["gaslamp-vip-club", "website-voucher-lead", "portfolio-lead"],
          source: `Portfolio Lead via VIP Voucher (${ADMIN_EMAIL})`
        })
      });

      const data = await ghlRes.json();
      const contactId = data.contact ? data.contact.id : null;

      return res.status(200).json({ 
        success: true, 
        contactId,
        message: "Contact synced to GoHighLevel with VIP Voucher tag.",
        routedTo: ADMIN_EMAIL 
      });
    } 

    // -------------------------------------------------------------
    // AUTOMATION 2: CATERING INQUIRY & HIGH-VALUE PIPELINE DEAL
    // -------------------------------------------------------------
    else if (type === 'catering') {
      // Step A: Create or Update Contact
      const contactRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: contactName,
          companyName: company || "Private Host",
          email: email,
          phone: phone,
          locationId: LOCATION_ID,
          tags: ["convention-catering", "corporate-catering-lead", "portfolio-lead"],
          source: `Portfolio Catering Lead (${guestCount} Guests, $${estimatedBudget || 425})`
        })
      });

      const contactData = await contactRes.json();
      const contactId = contactData.contact ? contactData.contact.id : null;

      // Step B: Create Opportunity Card in "Corporate & Convention Catering" Pipeline
      let opportunityId = null;
      if (contactId) {
        const oppRes = await fetch("https://services.leadconnectorhq.com/opportunities/", {
          method: "POST",
          headers,
          body: JSON.stringify({
            pipelineId: "V9lkMxLvS1I3iPuzwxes",
            pipelineStageId: "219c77df-d66d-45dd-8dfa-d4e645039758", // Stage: New Inquiry
            locationId: LOCATION_ID,
            name: `${company || contactName} - Catering (${guestCount} Guests)`,
            status: "open",
            contactId: contactId,
            monetaryValue: parseInt(estimatedBudget) || 425
          })
        });
        const oppData = await oppRes.json();
        opportunityId = oppData.opportunity ? oppData.opportunity.id : null;
      }

      return res.status(200).json({ 
        success: true, 
        contactId, 
        opportunityId,
        message: "Catering Lead created in Pipeline Stage: New Inquiry.",
        routedTo: ADMIN_EMAIL 
      });
    }

    // -------------------------------------------------------------
    // AUTOMATION 3: REPUTATION SHIELD (5-Star Google vs Private Feedback)
    // -------------------------------------------------------------
    else if (type === 'review_shield') {
      const isPositive = parseInt(rating) >= 4;
      const tag = isPositive ? "review-shield-5star" : "review-shield-feedback";

      const contactRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: firstName || "Reviewer Guest",
          email: email || undefined,
          phone: phone || undefined,
          locationId: LOCATION_ID,
          tags: [tag, "portfolio-lead"],
          source: `Review Shield (${rating} Stars): ${feedbackText || "No comment"}`
        })
      });

      const data = await contactRes.json();
      return res.status(200).json({
        success: true,
        contactId: data.contact ? data.contact.id : null,
        isPositive,
        googleReviewUrl: "https://maps.google.com/?q=Achilles+Coffee+Roasters+Gaslamp"
      });
    }

    // -------------------------------------------------------------
    // AUTOMATION 4: AI CONCIERGE BOT FAQ RESPONDER
    // -------------------------------------------------------------
    else if (type === 'ai_chat') {
      const userMessage = (req.body.message || "").toLowerCase();
      let reply = "Welcome to Achilles Coffee Roasters Gaslamp. How may I assist you today?";

      if (userMessage.includes("hour") || userMessage.includes("time") || userMessage.includes("open")) {
        reply = "We are open daily from 6:30 AM to 3:00 PM PST at 372 Fourth Avenue in San Diego's Gaslamp Quarter. Our scratch kitchen serves full breakfast daily!";
      } else if (userMessage.includes("wifi") || userMessage.includes("work") || userMessage.includes("laptop")) {
        reply = "Yes! We provide complimentary high-speed guest Wi-Fi and comfortable seating with power outlets for remote work and meetings.";
      } else if (userMessage.includes("parking")) {
        reply = "Metered street parking is available along 4th Ave and J St, with several paid parking structures within 1-2 blocks near Petco Park.";
      } else if (userMessage.includes("gluten") || userMessage.includes("vegan") || userMessage.includes("diet")) {
        reply = "We offer gluten-free bread options, plant-based oat and almond milk, organic acai bowls, and made-to-order scrambles.";
      } else if (userMessage.includes("catering") || userMessage.includes("event") || userMessage.includes("order")) {
        reply = "We cater corporate meetings and San Diego Convention Center gatherings from 10 to 150+ guests! You can use our on-page Catering Estimator to generate a formal quote.";
      } else if (userMessage.includes("contact") || userMessage.includes("phone") || userMessage.includes("email")) {
        reply = `You can reach our lead specialist directly at ${ADMIN_PHONE} or email ${ADMIN_EMAIL}.`;
      } else {
        reply = "Thank you for asking! For custom orders or catering, feel free to use our quote request on the site or contact us at " + ADMIN_EMAIL + ".";
      }

      return res.status(200).json({ reply });
    }

    return res.status(400).json({ error: "Invalid automation type" });
  } catch (error) {
    console.error("GHL Automation Gateway Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
