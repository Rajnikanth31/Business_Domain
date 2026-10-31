# User-provided RichMan screenshot reference

Reviewed 28 October 2026. Eleven JPEG screenshots are in `E:/Projests/Business_Domain/Images`. This records visible evidence from the supplied Android game, superseding assumptions based on generic store screenshots. It does not establish unseen business mechanics or complete feature parity.

## Reference inventory

| Filename suffix (all start `WhatsApp Image 2026-10-27 at `) | Visible screen | Main observations |
| --- | --- | --- |
| `8.24.59 PM.jpeg` | Loading | Teal-to-navy gradient, centered cash-bundle illustration, title and loading indicator |
| `8.24.59 PM (1).jpeg` | Earnings | Gradient header with rounded bottom corners; charcoal bank card with dotted world graphic; translucent upgrade panel; large white tap region |
| `8.25.00 PM.jpeg` | Investing / Shares | Shares, Real Estate, Cryptocurrency tabs; blue portfolio header; value, total return and estimated hourly yield; stock-market entry and dividend recommendations |
| `8.25.00 PM (1).jpeg` | Investing / Real Estate | Rental income summary; illustrated Real estate market and My property entries |
| `8.25.00 PM (2).jpeg` | Investing / Cryptocurrency | Dark-blue value/return card, Buy action, owned-coins section and empty state |
| `8.25.01 PM.jpeg` | Cryptoexchange | Full-page exchange with back arrow; Hot, Gainers, Losers, Highest Cap, Lowest Cap filters; coin icons, availability, prices and colored percentage changes |
| `8.25.01 PM (1).jpeg` | Business | Total hourly income card; temporary +30% / 4-hour income boost; Start a business and Business mergers actions; company counter 0/10 |
| `8.25.01 PM (2).jpeg` | Business catalog, upper section | Two-column category tiles with circular icons and starting prices |
| `8.25.02 PM.jpeg` | Business catalog, lower section | IT company, Bank, Sports Club, Oil and Gas Company, Airlines, and continuation of other categories |
| `8.25.02 PM (1).jpeg` | Business mergers | Clothing-brand requirements, progress bars/checklists, required opening capital and potential hourly income |
| `8.25.23 PM.jpeg` | Wealth ranking | Green header, top-three podium, ranked fictionalized tycoons, wealth amounts, sectors and edit action |

## Differences confirmed against NextGen 1.1

1. **Navigation hierarchy:** keep Investing / Business / Earnings / Items / Profile. Move property investing into Investing > Real Estate; current NextGen places it under Items. Items needs its own possessions/collection organization.
2. **Earnings layout:** replace the flat earnings page treatment with a gradient top section, dark balance card, compact upgrade panel and larger tap region. Screens show level 1 earning $2.50/click, a +$1.60 next-step increase and a $1,000 upgrade target. NextGen currently uses $10/click, +$10 steps and a $500 first upgrade. These are reference values, not a reason to overwrite existing player cash or saves.
3. **Shares landing page:** current flat market list needs a portfolio landing page, total/percentage returns, dividend income, market entry and dividend recommendations. Currently there is no dividend engine, so hourly yield must not be fabricated.
4. **Crypto hierarchy:** separate the holdings summary from the exchange. Implement the displayed filters against real simulated asset data and show computed percentage changes.
5. **Business hierarchy:** add the illustrated category grid and merger entry. A true 10-slot company model requires multiple company instances, saved IDs and migration from the current five-element levels array; displaying `0/10` alone would be misleading.
6. **Business types:** the supplied category screens visibly include Shop, Taxi company, Shipping company, Factory, Construction Company, Car dealership, IT company, Bank, Sports Club, Oil and Gas Company and Airlines. These require their own working management rules, not renamed copies of the existing generic businesses.
7. **Merger flow:** implement eligibility and progress from actual company, fleet and cash state before enabling completion. The reference shows a Clothing brand requiring shop stage 10, shipping assets (2 intercity and 8 city cars), factory stage 20, and $3,000,000 opening capital. It displays potential income of $421,300/hour. The screenshot uses Indian digit grouping; the dollar values are interpreted accordingly.
8. **Ranking:** add a clearly simulated/offline wealth comparison driven by actual player net worth and configured fictional rivals. A real online leaderboard is a separate server-backed feature; the screenshot alone does not prove one.
9. **Visual assets:** use original illustrations/icons for category cards, properties, collections and the loading screen. Reference screenshots establish composition and hierarchy; they are not runtime game assets.

## Visible category starting prices

| Category | Price shown in screenshot |
| --- | ---: |
| Shop | $4,899 |
| Taxi company | $9,999 |
| Shipping company | $19,899 |
| Factory | $24,999 |
| Construction Company | $35,400 |
| Car dealership | $40,000 |
| IT company | $350,000 |
| Bank | $10,000,000 |
| Sports Club | $40,000,000 |
| Oil and Gas Company | $1,500,000,000 |
| Airlines | $13,000,000,000 |

## Recommended next implementation order

1. Correct the already-audited valuation and transaction-history defects; preserve dollar cents and existing saves.
2. Implement company instances and save migration, then the 10-slot catalog and specialized first industries.
3. Reorganize Investing and property navigation, implement dividends and exchange filtering, then build the corresponding screenshot-based landing pages.
4. Add merger prerequisites and transactions once their required industries and fleet assets exist.
5. Apply the reference earnings composition and original illustrations across light/dark appearances; add the simulated wealth ranking.
6. Verify the updated APK on Android and compare every supplied screen against the actual running game.

No application files or APK were changed during this screenshot review. Missing detail: business-specific management screens, stock order/detail screens, property detail/improvement screens, Items catalog, main Profile screen and dark-theme counterparts are not supplied here. Their exact layouts cannot be inferred from these screenshots.
