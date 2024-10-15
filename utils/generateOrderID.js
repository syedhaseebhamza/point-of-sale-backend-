const generateOrderId = () => {
  const now = new Date();
  const milliseconds = String(now.getMilliseconds()).padStart(4, "0");

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dayName = dayNames[now.getDay()];

  return `${dayName}-${milliseconds}`;
};

module.exports = generateOrderId;