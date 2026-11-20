export function annuity(principal: number, annualPercent: number, years: number) {
  const months = Math.round(years * 12);
  if (principal <= 0 || months <= 0) return 0;
  const monthly = annualPercent / 100 / 12;
  if (monthly === 0) return principal / months;
  const factor = (1 + monthly) ** months;
  return (principal * monthly * factor) / (factor - 1);
}

export function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let left = days;
  while (left > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return date;
}

export const MORTGAGE_PRESETS = [
  { id: "family", label: "Семейная", rate: 6, note: "сценарий 6%, если программа банка доступна" },
  { id: "it", label: "IT", rate: 6, note: "сценарий 6% для сотрудников аккредитованных компаний" },
  { id: "standard", label: "Стандарт", rate: 17.9, note: "рыночная ставка для сравнения, не оферта банка" },
] as const;
