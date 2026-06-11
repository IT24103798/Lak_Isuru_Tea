import Product from "../models/Product.js";
import ChatbotLog from "../models/ChatbotLog.js";
import Complaint from "../models/Complaint.js";
import { askGemini } from "../services/geminiService.js";
import { analyzeSentiment } from "../services/sentimentService.js";
import { detectIntent } from "../services/intentService.js";

const DEFAULT_SESSION_ID = "guest-session";

const contactFallback = `For more help, please contact Lak Isuru Tea directly:

📞 Phone:
+94778646780
+94776356412

📧 Email:
luckisuru@gmail.com

⏰ Email Response Time:
We usually reply to emails within 24 hours.`;

const contactDetails = `For more help, please contact Lak Isuru Tea directly:

📞 Phone:
+94778646780
+94776356412

📧 Email:
luckisuru@gmail.com

⏰ Email Response Time:
We usually reply to emails within 24 hours.`;

const faqAnswers = {
  empty:
    "Please type your question. You can ask about tea products, delivery, payments, orders, gift packs, or contact details.",
  greeting:
    "Hello! Welcome to Lak Isuru Tea. You can ask me about tea products, prices, delivery, payments, orders, gift packs, or contact details.",
  polite_close:
    "You're welcome. I'm here whenever you need help with Lak Isuru Tea products or orders.",
  contact_location: contactFallback,
  tea_knowledge:
    "Sri Lankan Ceylon tea is known for its bright flavor, aroma, and quality. Orthodox tea is traditionally processed by withering, rolling, fermenting, drying, and grading the tea leaves.",
  gift_recommendation:
    "For gifts, choose a premium tea pack or a mixed tea selection. Strong tea suits daily milk tea drinkers, while lighter aromatic tea is good for someone who prefers a smooth cup.",
  product_recommendation:
    "For strong daily tea, choose a bold black tea. For a lighter cup, choose a mild or aromatic tea. For first-time buyers, a mixed selection is usually the safest choice.",
  product_info:
    "You can check the latest product prices, offers, and availability on the products page. If a product is not visible, it may be out of stock or temporarily unavailable.",
  order_support:
    "To place an order, add products to your cart, go to checkout, add your delivery details, choose a payment method, and confirm the order. You can view order status from your account.",
  cancel_order:
    "You can cancel an order from your order details if it has not already moved too far in the delivery process. If cancellation is unavailable, please contact support.",
  return_support:
    `For damaged, wrong, or return-related issues, please contact Lak Isuru Tea with your order details.

${contactFallback}`,
  review_support:
    "You can review products after buying them. Go to your completed order or product page and add your rating and feedback when review eligibility is available.",
  payment_support:
    "Lak Isuru Tea supports available checkout payment methods such as Cash on Delivery and online payment where enabled. Never share card OTPs or sensitive payment codes in chat.",
  delivery_support:
    "Delivery details and fees are shown during checkout. Please make sure your shipping address and phone number are correct before confirming the order.",
  account_support:
    "For account help, use login, register, forgot password, profile, and saved address options from your account pages. If OTP or login problems continue, contact support.",
  complaint:
    `I'm sorry about the trouble. Please share your order number and issue with Lak Isuru Tea support so they can check it.

${contactFallback}`,
  start_unclear:
    "I'm not quite sure what you mean. You can ask me about tea products, prices, delivery, payment, orders, gift packs, or contact details.",
  follow_up_unclear:
    "Could you please give me a little more detail? I can help with tea products, delivery, payments, orders, cancellations, reviews, and contact details.",
  random_text:
    "I'm not quite sure what you mean. Please ask a full question about tea products, prices, delivery, payment, orders, gift packs, or contact details.",
};

const buildGeminiPrompt = (message, intent, sentiment) => `You are the Lak Isuru Tea website customer support assistant.
Answer briefly and helpfully.
Only answer questions related to Lak Isuru Tea, tea products, orders, delivery, payments, cancellations, reviews, account help, contact details, or Sri Lankan tea knowledge.
If the question is unrelated or unclear, guide the customer back to those topics.

Customer sentiment: ${sentiment}
Detected intent: ${intent}
Customer message: ${message}`;



const startUnclearAnswer = `👋 Hello! Welcome to Lak Isuru Tea.

I'm not quite sure what you mean. You can ask me about tea products, prices, delivery, payment, orders, gift packs, contact details, or location.`;

const politeCloseAnswer = `You're welcome 😊

Let me know if you need help with tea products, orders, delivery, payments, gift packs, contact details, or location.`;

const fixedAnswerByIntent = (intent, previousIntent, message = "") => {
  const text = message.toLowerCase().trim();

  if (text.includes("what tea products do you have")) {
    return `🍃 Lak Isuru Tea offers Sri Lankan tea products such as:

1. BOPF Black Tea - strong taste and rich colour
2. BOP Black Tea - balanced daily tea
3. Green Tea - light and refreshing
4. Cinnamon Tea - warm cinnamon aroma
5. Cardamom Tea - traditional fragrant flavour
6. Vanilla Tea - smooth sweet aroma
7. Mint Tea - fresh and refreshing taste
8. Tea Gift Pack - suitable for birthdays, friends, family, and special occasions

You can check the Products page for available items and prices.`;
  }

  if (text.includes("recommend a strong tea")) {
    return `💪 I recommend BOPF Black Tea.

It has a strong taste, rich colour, and is best for customers who like strong milk tea or daily morning tea.

BOP Black Tea is also a good option for balanced daily tea.`;
  }

  if (text.includes("best tea for gift")) {
    return `🎁 I recommend the Tea Gift Pack.

It is suitable for birthdays, friends, family gifts, weddings, and special occasions.

It is a safe choice when you are not sure about the receiver's tea taste because they can enjoy different tea flavours.`;
  }

  if (text.includes("how to place an order")) {
    return `🛒 How to place an order:

1. Browse tea products.
2. Select your tea product.
3. Click Add to Cart.
4. Go to Checkout.
5. Enter delivery details.
6. Select payment method.
7. Place your order.

After placing the order, you can check the status from My Orders.`;
  }

  if (text.includes("delivery information")) {
    return `🚚 Delivery Information

You can enter your shipping address during checkout.

The delivery fee will be shown during checkout before placing the order.

Delivery time may depend on your location. After placing the order, you can check your order status from My Orders.`;
  }

  if (text.includes("what payment methods do you accept")) {
    return `💳 Payment Methods

Lak Isuru Tea may support:

💳 Online Payment, if enabled on the website

You can select the available payment method on the Payment page during checkout.

Please do not share card number, CVV, OTP, or bank password in chat.`;
  }

  if (intent === "contact_location") {
    return contactDetails;
  }

  if (intent === "tea_knowledge") {
    return `Sri Lankan Ceylon tea is known for its bright flavor, aroma, and quality. Orthodox tea is traditionally processed by withering, rolling, fermenting, drying, and grading the tea leaves.`;
  }

  if (intent === "start_unclear" || intent === "random_text") {
    return startUnclearAnswer;
  }

  if (intent === "polite_close") {
    return politeCloseAnswer;
  }

  if (intent === "cancel_order") {
    return `❌ You can cancel your order from the My Orders page.

Open the order details, click Cancel Order, select or type a reason, and submit the cancellation request.

Cancellation is only available before the order is shipped.`;
  }

  if (intent === "gift_recommendation") {
    return `🎁 I recommend the Tea Gift Pack.

It is best for birthdays, friends, family gifts, weddings, and special occasions.

It is suitable because the receiver can enjoy different tea flavours.`;
  }

  if (intent === "product_recommendation") {
    if (text.includes("strong")) {
      return `💪 I recommend BOPF Black Tea.

It has a strong taste and rich colour, so it is suitable for strong milk tea and daily morning tea.`;
    }

    if (text.includes("daily") || text.includes("normal")) {
      return `☕ I recommend BOP Black Tea.

It is a balanced black tea and suitable for daily drinking.`;
    }

    if (text.includes("light") || text.includes("mild")) {
      return `🍵 I recommend Green Tea.

It has a light, mild, and refreshing taste.`;
    }

    if (text.includes("refreshing")) {
      return `🌿 I recommend Mint Tea.

It has a fresh and refreshing taste.`;
    }

    if (text.includes("aromatic")) {
      return `✨ I recommend Cinnamon Tea or Cardamom Tea.

Both are good for customers who like aromatic Sri Lankan-style tea.`;
    }

    return `⭐ I can recommend tea based on your taste:

💪 Strong tea: BOPF Black Tea
☕ Daily tea: BOP Black Tea
🍵 Light tea: Green Tea
✨ Aromatic tea: Cinnamon or Cardamom Tea
🎁 Gift: Tea Gift Pack`;
  }

  if (intent === "order_support") {
    return `🛒 To place an order:

1. Browse tea products.
2. Add product to cart.
3. Go to checkout.
4. Enter delivery details.
5. Select payment method.
6. Place order.

After placing the order, you can check the status from My Orders.`;
  }

  if (intent === "delivery_support") {
    return `🚚 Delivery details are handled during checkout.

You can enter your shipping address, and the delivery fee will be shown before placing the order.

After placing the order, check My Orders for delivery status.`;
  }

  if (intent === "payment_support") {
    return `💳 Lak Isuru Tea may support:

💵 Cash on Delivery
💳 Online Payment, if enabled on the website

You can select the available payment method on the Payment page.

Please do not share card number, CVV, OTP, or bank password in chat.`;
  }

  if (intent === "return_support") {
    return `↩️ For returns, go to My Orders or Returns section and follow the return request steps if return is available.

Return eligibility may depend on product condition and order status.

Please contact Lak Isuru Tea support if you need help with a return.`;
  }

  if (intent === "review_support") {
    return `⭐ After receiving your order, you can review the product from the To Review section.

Your review helps other customers choose suitable tea products.`;
  }

  if (intent === "account_support") {
    return `👤 You can register, login, manage your profile, save addresses, and view your orders from your account.

If you have login problems, check your email/password or use forgot password if available.

Please do not share your password in chat.`;
  }

  if (intent === "follow_up_unclear" || intent === "need_more_details") {
    if (previousIntent === "cancel_order") {
      return `Sure, I will explain more clearly 😊

1. Login to your Lak Isuru Tea account.
2. Go to My Orders.
3. Find the order you want to cancel.
4. Click View Details.
5. If cancellation is allowed, you will see the Cancel Order button.
6. Click Cancel Order.
7. Select or type your reason.
8. Add a note if needed.
9. Submit the request.

Important:
If the order is already shipped or To Receive, the Cancel Order button may not show. In that case, please contact Lak Isuru Tea support.`;
    }

    if (previousIntent === "gift_recommendation") {
      return `No problem 😊

For a gift, I recommend the Tea Gift Pack first because:

🎁 It looks more special.
🍵 It gives different tea flavours.
✅ It is safer when you do not know your friend's exact taste.
🎉 It is suitable for birthdays and special occasions.

Alternative options:
- BOP Black Tea for normal daily tea lovers
- Cardamom Tea or Cinnamon Tea for aromatic tea lovers`;
    }

    if (previousIntent === "delivery_support") {
      return `Sure 😊

During checkout, you need to enter your shipping address. The delivery fee will be shown before placing the order.

After placing the order, you can check the status from My Orders:
- To Ship: preparing for delivery
- To Receive: shipped and waiting to receive
- To Review: completed and ready to review`;
    }

    if (previousIntent === "payment_support") {
      return `Sure 😊

Lak Isuru Tea may support:
💵 Cash on Delivery
💳 Online Payment, if enabled on the website

Please select your payment method on the Payment page during checkout.

Never share your card number, CVV, OTP, or bank password in chat.`;
    }

    if (previousIntent === "order_support") {
      return `Sure, here is the order process clearly 😊

1. Browse tea products.
2. Add your selected tea to cart.
3. Go to checkout.
4. Enter delivery details.
5. Select payment method.
6. Place the order.
7. Check order status from My Orders.`;
    }

    return `I may not have explained clearly 😊

You can ask me about tea products, gift packs, orders, checkout, delivery, payments, cancellations, returns, reviews, contact details, or location.`;
  }

  return null;
};

const buildProductContext = (products) => {
  if (!products || products.length === 0) {
    return `
Default tea products:
1. BOPF Black Tea - Strong taste, rich colour, best for strong milk tea and daily morning tea.
2. BOP Black Tea - Balanced black tea, good for daily drinking and normal tea lovers.
3. Green Tea - Light, mild, refreshing. Do not make medical claims.
4. Cinnamon Tea - Warm cinnamon aroma, spicy aromatic tea, suitable for evening tea.
5. Cardamom Tea - Traditional Sri Lankan fragrant flavour.
6. Vanilla Tea - Smooth and sweet aroma.
7. Mint Tea - Refreshing, fresh and cool flavour.
8. Tea Gift Pack - Best for birthdays, friends, family gifts, special occasions, and customers not sure what to buy.
`;
  }

  return products
    .map((product) => {
      return `
Product Name: ${product.name}
Category: ${product.category || "Not specified"}
Price: Rs. ${product.price ?? "Not specified"}
Flavor: ${product.flavor || "Not specified"}
Best For: ${product.bestFor?.join(", ") || "General tea use"}
Description: ${product.description || "No description available"}
Stock: ${product.stock ?? "Not specified"}
`;
    })
    .join("\n");
};

const buildPrompt = ({
  message,
  intent,
  sentimentData,
  productContext,
  previousLog,
}) => {
  return `
You are the official AI customer support chatbot for Lak Isuru Tea.

Lak Isuru Tea is a Sri Lankan online tea selling website.
Your role is to help customers with tea products, gift packs, orders, checkout, delivery, payments, cancellations, returns, reviews, account support, contact details, location details, tea knowledge, Sri Lankan tea history, and website guidance.

You must answer like a real professional customer service assistant.

========================
BUSINESS IDENTITY
========================
Business name: Lak Isuru Tea
Business type: Online tea product website
Main product category: Sri Lankan tea
Target customers: Customers who want to buy tea online for personal use, family, friends, gifts, and special occasions.

========================
CONTACT AND LOCATION DETAILS
========================
Showroom & Head Office:
393/16, School Road,
Thanthirimulla, Panadura

Opening Hours:
Mon-Sat 08:00 - 18:00

Phone:
+94778646780
+94776356412

Email:
luckisuru@gmail.com

Email Response Time:
Emails are usually replied to within 24 hours.

If customer asks about location, address, showroom, shop, head office, opening hours, phone number, email, email response time, how to contact, or where Lak Isuru Tea is, give the contact and location details clearly.

========================
AVAILABLE TEA PRODUCTS
========================
Use this product information first:
${productContext}

Product recommendation rules:
- strong tea -> Recommend BOPF Black Tea
- daily tea -> Recommend BOP Black Tea
- normal tea -> Recommend BOP Black Tea
- light tea -> Recommend Green Tea
- mild tea -> Recommend Green Tea
- healthy tea -> Recommend Green Tea, but do not make medical claims
- flavoured tea -> Recommend Cinnamon, Cardamom, Vanilla, or Mint Tea
- refreshing tea -> Recommend Mint Tea
- aromatic tea -> Recommend Cinnamon Tea or Cardamom Tea
- sweet smell tea -> Recommend Vanilla Tea
- birthday gift -> Recommend Tea Gift Pack
- friend gift -> Recommend Tea Gift Pack
- family gift -> Recommend Tea Gift Pack
- present -> Recommend Tea Gift Pack
- not sure what to buy -> Recommend Tea Gift Pack or BOP Black Tea
- first time buyer -> Recommend BOP Black Tea or Tea Gift Pack
- tea for parents -> Recommend BOP Black Tea, Cardamom Tea, or Tea Gift Pack
- tea for office -> Recommend BOP Black Tea or BOPF Black Tea

Do not invent products that are not listed.
Do not invent discounts.
Do not invent stock availability.

========================
GIFT RECOMMENDATION RULES
========================
If customer asks for birthday gift, friend gift, family gift, present, wedding gift, or special occasion:
Recommend Tea Gift Pack first.

Explain that Tea Gift Pack is suitable because the receiver can enjoy different tea flavours.

If customer replies "hmm", "mm", "not sure", or "why":
Explain why Tea Gift Pack is better:
- It looks more special
- It gives different flavours
- It is safer when customer does not know friend's taste
- It is suitable for birthdays and special occasions

========================
ORDER SUPPORT RULES
========================
When customer asks how to order:
Explain:
1. Browse tea products
2. Add product to cart
3. Go to checkout
4. Enter delivery details
5. Select payment method
6. Place order

When customer asks about order status:
Explain that they can check order status from My Orders page after logging in.

Order status meanings:
- To Ship: Order is placed and preparing for delivery
- To Receive: Order has been shipped and customer is waiting to receive it
- To Review: Order is completed and customer can review the product
- Cancelled: Order has been cancelled

Do not invent real order status unless order data is provided by backend.

========================
ORDER CANCELLATION RULES
========================
If customer asks "How to cancel order?", first give a short clear answer:

"❌ You can cancel your order from the My Orders page. Open the order details, click Cancel Order, select or type a reason, and submit the cancellation request. Cancellation is only available before the order is shipped."

If customer asks again or gives short reply like "mm", "hmm", "not clear", "I don't understand", "tell me more", "how", "where", "explain", "details":
Give detailed step-by-step answer.

Important:
- If status is To Ship, cancellation may be available.
- If already shipped or To Receive, cancellation may not be available.
- If Cancel Order button is not visible, the order may no longer be cancellable.
- Do not promise cancellation approval.
- Do not promise refund unless policy is provided.
- Tell customer to contact support/admin if they cannot cancel from the website.

========================
RETURN RULES
========================
If customer asks about returns:
Explain:
- Go to My Orders or Returns section
- Select the order/product
- Follow the return request steps if return is available
- Return eligibility may depend on product condition and order status

Do not promise refund or replacement unless business policy is provided.

========================
REVIEW RULES
========================
If customer asks about reviews:
Explain:
- After receiving the order, they can review the product from To Review section
- Reviews help other customers choose tea products

========================
PAYMENT SUPPORT RULES
========================
Available payment methods:
- Cash on Delivery
- Online Payment, if enabled on the website

If customer asks about Cash on Delivery:
Explain that they can pay when the order is delivered.

If customer asks about online payment:
Explain that they can choose online payment at checkout if available.

Never ask customers to share:
- Card number
- CVV
- OTP
- Bank password
- Private payment details

If customer shares sensitive payment information:
Tell them not to share private payment details in chat.

========================
DELIVERY SUPPORT RULES
========================
Customers enter shipping address during checkout.
Customers can save address for future orders.
Customers may have shipping address and billing address.

If customer asks delivery time:
Do not give exact delivery days unless provided by business.
Say:
"Delivery time may depend on your location. You can check your order status from My Orders after placing the order."

If customer asks delivery fee:
Do not invent exact fee unless provided by backend.
Say:
"Delivery fee will be shown during checkout before placing the order."

========================
ACCOUNT SUPPORT RULES
========================
Customers can:
- Register
- Login
- Use Google login if enabled
- Reset password using OTP email if enabled
- Manage profile
- Manage saved addresses
- View orders

If customer has login problem:
Tell them to check email/password or use forgot password.
Do not ask for password.

========================
TEA KNOWLEDGE RULES
========================
If customer asks about Sri Lankan tea history, Ceylon tea, tea heritage, tea types, or tea preparation:
Answer using general tea knowledge.
Keep it short, trustworthy, and simple.
Do not make medical claims.
For health-related tea questions, say tea can be enjoyed as part of a balanced lifestyle, but it is not medical treatment.

========================
UNKNOWN ANSWER RULES
========================
If you cannot answer the customer question clearly:
Do not guess.
Give this contact guidance:

"I'm sorry, I couldn't find the exact answer for that. 😊

For more help, please contact Lak Isuru Tea directly:

📞 Phone:
+94778646780
+94776356412

📧 Email:
luckisuru@gmail.com

⏰ Email Response Time:
We usually reply to emails within 24 hours."

========================
UNRELATED QUESTION RULES
========================
If customer asks unrelated questions such as politics, homework, hacking, personal medical advice, random unrelated topic, adult or unsafe content:
Reply politely:
"👋 I'm here to help with Lak Isuru Tea products, orders, delivery, payments, gift packs, contact details, location, and website support. For more help, please call +94778646780 or +94776356412."

========================
ANSWER STYLE
========================
Always:
- Use simple English
- Be friendly
- Be professional
- Use emojis naturally
- Keep answers short but useful
- Give direct answer first
- Use step-by-step format when customer asks for more details
- Do not write very long paragraphs
- Do not invent unavailable products
- Do not invent discounts
- Do not invent delivery dates
- Do not invent stock availability
- Do not say you are Gemini
- Say you are Lak Isuru Tea assistant

Good answer length:
2 to 5 short sentences for normal answers.
Use steps only when customer asks for guidance or more details.

========================
CURRENT CHAT DATA
========================
Customer intent: ${intent}
Customer sentiment: ${sentimentData.sentiment}
Sentiment score: ${sentimentData.score}

Previous conversation:
${
  previousLog
    ? `
Previous user message: ${previousLog.userMessage}
Previous bot response: ${previousLog.botResponse}
Previous intent: ${previousLog.intent}
`
    : "No previous conversation."
}

Current customer message:
${message}

Answer as Lak Isuru Tea assistant:
`;
};

const saveChatLog = async ({
  userId,
  sessionId,
  userMessage,
  botResponse,
  sentimentData,
  intent,
}) => {
  await ChatbotLog.create({
    userId,
    sessionId: sessionId || DEFAULT_SESSION_ID,
    userMessage,
    botResponse,
    sentiment: sentimentData.sentiment,
    sentimentScore: sentimentData.score,
    intent,
  });
};

export const chatWithBot = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    // SECURITY: never accept API keys from clients. If provided, ignore and log.
    if (req.body.apiKey) {
      console.warn('Client attempted to provide an apiKey in /chat; ignoring.');
    }
    const userId = req.user?._id || null;
    const safeSessionId = sessionId || DEFAULT_SESSION_ID;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const previousLog = await ChatbotLog.findOne({
      sessionId: safeSessionId,
    }).sort({ createdAt: -1 });

    const previousIntent = previousLog?.intent || "general";
    // sanitize and limit message size to prevent prompt injection and huge requests
    const sanitizedMessage = String(message || "").trim().slice(0, 1500);
    const sentimentData = analyzeSentiment(sanitizedMessage);
    const intent = detectIntent(sanitizedMessage, previousIntent);

    const products = await Product.find({ isActive: true }).limit(40);
    const productContext = buildProductContext(products);

    const prompt = buildPrompt({
      message: sanitizedMessage,
      intent,
      sentimentData,
      productContext,
      previousLog,
    });

    const aiResponse = await askGemini(prompt);
    const finalResponse = (aiResponse && String(aiResponse).trim()) || contactFallback;

    if (intent === "complaint" || sentimentData.sentiment === "angry") {
      await Complaint.create({
        userId,
        sessionId: safeSessionId,
        priority: sentimentData.sentiment === "angry" ? "high" : "normal",
        status: "pending",
      });
    }

    await saveChatLog({
      userId,
      sessionId: safeSessionId,
      userMessage: message,
      botResponse: finalResponse,
      sentimentData,
      intent,
    });

    return res.status(200).json({
      success: true,
      response: finalResponse,
      sentiment: sentimentData.sentiment,
      sentimentScore: sentimentData.score,
      intent,
      isComplaint: intent === "complaint" || sentimentData.sentiment === "angry",
    });
  } catch (error) {
    console.error("Chatbot controller error:", error.message);

    return res.status(500).json({
      success: false,
      response: contactFallback,
      message: "Chatbot error",
      error: error.message,
    });
  }
};

export const getChatbotLogs = async (req, res) => {
  try {
    const logs = await ChatbotLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name email");

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chatbot logs",
      error: error.message,
    });
  }
};