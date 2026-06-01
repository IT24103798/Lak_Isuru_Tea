export const analyzeSentiment = (message) => {
  const text = message.toLowerCase();

  const positiveWords = ["good", "great", "excellent", "love", "nice", "amazing", "thank"];
  const negativeWords = ["bad", "late", "wrong", "damaged", "poor", "problem", "issue"];
  const angryWords = ["angry", "worst", "terrible", "scam", "hate", "not received", "refund"];

  let score = 0;

  positiveWords.forEach((word) => {
    if (text.includes(word)) score += 1;
  });

  negativeWords.forEach((word) => {
    if (text.includes(word)) score -= 1;
  });

  angryWords.forEach((word) => {
    if (text.includes(word)) score -= 2;
  });

  if (score <= -2) return { sentiment: "angry", score };
  if (score < 0) return { sentiment: "negative", score };
  if (score > 0) return { sentiment: "positive", score };

  return { sentiment: "neutral", score };
};