export const FINE_RULES = [
  {
    reason: "Travelling without proper pass/ticket",
    section: "Sec. 138 Railway Act",
    code: "138",
    autofill: (fare=0) => Math.max(250, Number(fare) || 0),
    description: "Rs.250/- or fare, whichever is more"
  },
  {
    reason: "Travelling Fraudulently",
    section: "Sec. 137 Railway Act",
    code: "137",
    autofill: () => 1000,
    description: "Rs.1000/- or 6 months jail or both"
  },
  {
    reason: "Alarm Chain Pulling",
    section: "Sec. 141 Railway Act",
    code: "141",
    autofill: () => 1000,
    description: "Rs.1000/- or 12 months jail or both"
  },
  {
    reason: "Coach Reserved for Handicapped",
    section: "Sec. 155(a) Railway Act",
    code: "155a",
    autofill: () => 500,
    description: "Rs.500/- or 3 months jail or both"
  },
  {
    reason: "Travelling on Roof Top",
    section: "Sec. 156 Railway Act",
    code: "156",
    autofill: () => 500,
    description: "Rs.500/- or 3 months jail or both"
  },
  {
    reason: "Trespassing",
    section: "Sec. 147 Railway Act",
    code: "147",
    autofill: () => 1000,
    description: "Rs.1000/- or 6 months jail or both"
  },
  {
    reason: "Nuisance and Littering",
    section: "Sec. 145(b) Railway Act",
    code: "145b",
    autofill: (prior=1) => (prior > 1 ? 250 : 100),
    description: "Rs.100/- 1st, Rs.250/- repeat offences"
  },
  {
    reason: "Bill Pasting",
    section: "Sec. 166(b) Railway Act",
    code: "166b",
    autofill: () => 500,
    description: "Rs.500/- or 6 months jail or both"
  },
  {
    reason: "Touting",
    section: "Sec. 143 Railway Act",
    code: "143",
    autofill: () => 10000,
    description: "Rs.10,000/- or 3 years jail or both"
  },
  {
    reason: "Unauthorised Hawking",
    section: "Sec. 144 Railway Act",
    code: "144",
    autofill: () => 1000,
    description: "Rs.1000/- to Rs.2000/- or 1 year jail or both"
  }
];
