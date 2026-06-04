export const detectIntent = (message) => {
  const text = message.toLowerCase();
  if (text.includes("price") || text.includes("discount") || text.includes("offer")) {
    return "negotiation";
  }

  if (text.includes("recommend") || text.includes("best tea") || text.includes("gift")) {
    return "recommendation";
  }

  // Physical location / address queries
  if (
    text.includes("where are you") ||
    text.includes("where is") ||
    text.includes("address") ||
    text.includes("location") ||
    text.includes("physical") ||
    text.includes("shop") ||
    text.includes("store") ||
    text.includes("head office") ||
    text.includes("located")
  ) {
    return "location";
  }

  if (text.includes("order") || text.includes("delivery") || text.includes("payment")) {
    return "order_support";
  }

  if (
    text.includes("damaged") ||
    text.includes("late") ||
    text.includes("refund") ||
    text.includes("not received")
  ) {
    return "complaint";
  }

  return "general";
};