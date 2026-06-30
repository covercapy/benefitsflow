/** Returns the semimonthly pay period containing the supplied date. */
export function currentPayPeriod(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()

  return now.getDate() <= 15
    ? `${year}-${month}-01/${year}-${month}-15`
    : `${year}-${month}-16/${year}-${month}-${lastDay}`
}
