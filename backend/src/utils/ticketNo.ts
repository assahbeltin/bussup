export function generateTicketNo(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `#TRV-${randomDigits}`;
}

export function generateBookingId(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `#BK-${randomDigits}`;
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-US')} FCFA`;
}
