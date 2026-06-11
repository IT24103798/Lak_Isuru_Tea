export const detectIntent = (message, previousIntent = "general") => {
  const text = message.toLowerCase().trim();

  if (!text) return "empty";

  const shortThinkingWords = [
    "mm",
    "mmm",
    "mmmm",
    "hm",
    "hmm",
    "hmmm",
    "uh",
    "ah",
    "oh",
  ];

  const politeCloseWords = [
    "ok",
    "okay",
    "thanks",
    "thank you",
    "got it",
    "i see",
  ];

  const moreDetailWords = [
    "not clear",
    "i don't understand",
    "dont understand",
    "tell me more",
    "explain",
    "details",
    "again",
    "how",
    "where",
    "why",
  ];

  if (shortThinkingWords.includes(text)) {
    return previousIntent && previousIntent !== "general"
      ? "follow_up_unclear"
      : "start_unclear";
  }

  if (politeCloseWords.includes(text)) {
    return "polite_close";
  }

  if (moreDetailWords.some((word) => text.includes(word))) {
    return previousIntent && previousIntent !== "general"
      ? "need_more_details"
      : "start_unclear";
  }

  if (
    text.includes("hi") ||
    text.includes("hello") ||
    text.includes("hey") ||
    text.includes("good morning") ||
    text.includes("good evening")
  ) {
    return "greeting";
  }

  if (
    text.includes("location") ||
    text.includes("address") ||
    text.includes("showroom") ||
    text.includes("shop") ||
    text.includes("head office") ||
    text.includes("opening hours") ||
    text.includes("open time") ||
    text.includes("closing time") ||
    text.includes("phone") ||
    text.includes("contact") ||
    text.includes("email") ||
    text.includes("reply to email") ||
    text.includes("where is lak isuru tea") ||
    text.includes("where are you")
  ) {
    return "contact_location";
  }

  if (
    text.includes("tea history") ||
    text.includes("sri lankan tea history") ||
    text.includes("ceylon tea") ||
    text.includes("tea heritage") ||
    text.includes("orthodox tea") ||
    text.includes("how tea is made") ||
    text.includes("tea making")
  ) {
    return "tea_knowledge";
  }

  if (
    text.includes("gift") ||
    text.includes("birthday") ||
    text.includes("present") ||
    text.includes("friend") ||
    text.includes("family") ||
    text.includes("wedding") ||
    text.includes("corporate")
  ) {
    return "gift_recommendation";
  }

  if (
    text.includes("recommend") ||
    text.includes("best tea") ||
    text.includes("strong tea") ||
    text.includes("daily tea") ||
    text.includes("normal tea") ||
    text.includes("light tea") ||
    text.includes("mild tea") ||
    text.includes("flavoured tea") ||
    text.includes("flavored tea") ||
    text.includes("refreshing tea") ||
    text.includes("aromatic tea") ||
    text.includes("sweet smell") ||
    text.includes("first time buyer") ||
    text.includes("tea for parents") ||
    text.includes("tea for office")
  ) {
    return "product_recommendation";
  }

  if (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("discount") ||
    text.includes("offer") ||
    text.includes("stock") ||
    text.includes("available")
  ) {
    return "product_info";
  }

  if (
    text.includes("how to order") ||
    text.includes("place order") ||
    text.includes("cart") ||
    text.includes("checkout") ||
    text.includes("my orders") ||
    text.includes("order status") ||
    text.includes("to ship") ||
    text.includes("to receive") ||
    text.includes("to review")
  ) {
    return "order_support";
  }

  if (
    text.includes("cancel order") ||
    text.includes("cancel my order") ||
    text.includes("how to cancel") ||
    text.includes("cancellation")
  ) {
    return "cancel_order";
  }

  if (
    text.includes("return") ||
    text.includes("refund") ||
    text.includes("damaged") ||
    text.includes("wrong product") ||
    text.includes("replacement")
  ) {
    return "return_support";
  }

  if (
    text.includes("review") ||
    text.includes("rating") ||
    text.includes("feedback")
  ) {
    return "review_support";
  }

  if (
    text.includes("payment") ||
    text.includes("pay") ||
    text.includes("cash on delivery") ||
    text.includes("cod") ||
    text.includes("online payment") ||
    text.includes("card") ||
    text.includes("cvv") ||
    text.includes("otp")
  ) {
    return "payment_support";
  }

  if (
    text.includes("delivery") ||
    text.includes("shipping") ||
    text.includes("deliver") ||
    text.includes("delivery fee") ||
    text.includes("delivery time") ||
    text.includes("billing address") ||
    text.includes("shipping address")
  ) {
    return "delivery_support";
  }

  if (
    text.includes("login") ||
    text.includes("register") ||
    text.includes("account") ||
    text.includes("password") ||
    text.includes("forgot password") ||
    text.includes("otp") ||
    text.includes("profile") ||
    text.includes("saved address")
  ) {
    return "account_support";
  }

  if (
    text.includes("angry") ||
    text.includes("bad service") ||
    text.includes("worst") ||
    text.includes("not received") ||
    text.includes("late") ||
    text.includes("problem") ||
    text.includes("issue")
  ) {
    return "complaint";
  }

  const onlyRandomLetters = /^[a-z]{1,4}$/i.test(text);
  const repeatedLetters = /^(.)\1{2,}$/i.test(text);
  const symbolsOnly = /^[^a-z0-9]+$/i.test(text);

  if (onlyRandomLetters || repeatedLetters || symbolsOnly) {
    return previousIntent && previousIntent !== "general"
      ? "follow_up_unclear"
      : "random_text";
  }

  return "general";
};