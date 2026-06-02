const botPattern =
  /bot|crawler|spider|crawling|slurp|screenshot|chrome-lighthouse/i;

export const isBot = (userAgent: string) => {
  if (!userAgent) return true; // Block requests without User-Agent
  return botPattern.test(userAgent);
};
