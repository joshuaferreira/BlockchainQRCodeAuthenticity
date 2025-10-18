export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

export const truncateString = (str, maxLength = 20) => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};