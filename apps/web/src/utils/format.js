export function formatHours(operatingHours) {
  // pick first entry's open/close time for display
  if (!operatingHours || operatingHours.length === 0) return "";
  const first = operatingHours[0];
  return `${first.openTime || ''} - ${first.closeTime || ''}`;
}

export function formatPrice(p) {
  if (p == null) return "-";
  return `Rs ${Number(p).toFixed(2)}`;
}
