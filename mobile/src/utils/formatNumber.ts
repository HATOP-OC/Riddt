/**
 * Format a number with compact notation (e.g., 1.2k, 3.4M)
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};

/**
 * Format karma with appropriate formatting
 */
export const formatKarma = (karma: number): string => {
  if (karma >= 10000) {
    return formatCompactNumber(karma);
  }
  return karma.toLocaleString();
};

/**
 * Format score with sign for positive/negative
 */
export const formatScore = (score: number): string => {
  return formatCompactNumber(score);
};

/**
 * Format member count
 */
export const formatMemberCount = (count: number): string => {
  if (count === 1) {
    return '1 member';
  }
  return `${formatCompactNumber(count)} members`;
};

/**
 * Format online count
 */
export const formatOnlineCount = (count: number): string => {
  if (count === 1) {
    return '1 online';
  }
  return `${formatCompactNumber(count)} online`;
};

/**
 * Format comment count
 */
export const formatCommentCount = (count: number): string => {
  if (count === 0) {
    return 'No comments';
  }
  if (count === 1) {
    return '1 comment';
  }
  return `${formatCompactNumber(count)} comments`;
};
