export const getStatusIcon = (status) => {
  switch (status) {
    case "PENDING":
      return "⏳";
    case "CONFIRMED":
      return "✅";
    case "CANCELLED":
      return "❌";
    default:
      return "ℹ️";
  }
};
