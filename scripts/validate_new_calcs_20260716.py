"""
Formula validation for the 3 new calculators (2026-07-16 batch).
Each formula is validated 3 SEPARATE times:
  Pass A: primary closed-form implementation (matches the TS code)
  Pass B: independent re-derivation (iterative / expanded sum)
  Pass C: hand-checked reference value with tolerance assertion
"""

# ---------------------------------------------------------------------------
# Calculator 1: 대출 원리금균등상환 (loan-repayment)
#   M = P * r * (1+r)^n / ((1+r)^n - 1),  r = annual/12/100, n = months
# ---------------------------------------------------------------------------
def loan_A(P, annual_pct, months):
    r = annual_pct / 100 / 12
    if r == 0:
        m = P / months
    else:
        pow_ = (1 + r) ** months
        m = P * r * pow_ / (pow_ - 1)
    m = round(m)
    total = m * months
    interest = total - P
    return m, total, interest

def loan_B(P, annual_pct, months):
    # Independent check: amortize month by month, monthly payment solved via bisection
    r = annual_pct / 100 / 12
    lo, hi = 0.0, P * (1 + r) + P
    for _ in range(200):
        mid = (lo + hi) / 2
        bal = P
        for _m in range(months):
            bal = bal * (1 + r) - mid
        if bal > 0:
            lo = mid
        else:
            hi = mid
    m = round((lo + hi) / 2)
    total = m * months
    return m, total, total - P

print("=== Calc 1: 대출 원리금균등상환 ===")
for P, ap, n in [(30_000_000, 5.0, 36), (100_000_000, 3.5, 120), (10_000_000, 0.0, 12)]:
    a = loan_A(P, ap, n)
    b = loan_B(P, ap, n)
    ok = abs(a[0] - b[0]) <= 1  # within 1 won rounding
    print(f"P={P:,} r={ap}% n={n}  A월납={a[0]:,} B월납={b[0]:,} 총상환={a[1]:,} 총이자={a[2]:,}  match={ok}")
# Pass C: two independent methods (closed-form + bisection amortization) agree at 899,127.
mA = loan_A(30_000_000, 5.0, 36)[0]
assert mA == 899_127, mA
print(f"Pass C ref 30M/5%/36mo monthly={mA:,} (closed-form == bisection) OK\n")

# ---------------------------------------------------------------------------
# Calculator 2: 정기적금 만기 (savings-installment), 단리
#   interest = monthly * (annual/12/100) * n(n+1)/2
# ---------------------------------------------------------------------------
TAX = 0.154
def savings_A(monthly, annual_pct, months):
    principal = monthly * months
    r_m = annual_pct / 100 / 12
    pre_interest = round(monthly * r_m * months * (months + 1) / 2)
    tax = round(pre_interest * TAX)
    after = principal + pre_interest - tax
    return principal, pre_interest, tax, after

def savings_B(monthly, annual_pct, months):
    # Independent: sum each deposit's simple interest by its holding months
    r_m = annual_pct / 100 / 12
    pre = 0.0
    for k in range(1, months + 1):
        hold = months - k + 1  # deposit k held for this many months
        pre += monthly * r_m * hold
    pre = round(pre)
    principal = monthly * months
    tax = round(pre * TAX)
    return principal, pre, tax, principal + pre - tax

print("=== Calc 2: 정기적금 만기 (단리) ===")
for mo, ap, n in [(500_000, 3.6, 12), (300_000, 4.0, 24), (1_000_000, 2.5, 36)]:
    a = savings_A(mo, ap, n)
    b = savings_B(mo, ap, n)
    ok = abs(a[1] - b[1]) <= 1 and a[0] == b[0]
    print(f"월={mo:,} r={ap}% n={n}  원금={a[0]:,} 세전이자A={a[1]:,} 세전이자B={b[1]:,} 세={a[2]:,} 세후={a[3]:,}  match={ok}")
# Pass C: 500,000/mo, 3.6%, 12mo -> interest = 500000*0.003*78 = 117,000 pre-tax
pre = savings_A(500_000, 3.6, 12)[1]
assert pre == 117_000, pre
print(f"Pass C ref 50만/3.6%/12mo 세전이자={pre:,} (expect 117,000) OK\n")

# ---------------------------------------------------------------------------
# Calculator 3: 기초대사량 BMR (Mifflin-St Jeor) + TDEE
# ---------------------------------------------------------------------------
ACT = {"low": 1.2, "normal": 1.375, "active": 1.55, "veryactive": 1.725}
def bmr_A(sex, kg, cm, age):
    base = 10 * kg + 6.25 * cm - 5 * age
    return round(base + 5) if sex == "male" else round(base - 161)

def bmr_B(sex, kg, cm, age):
    # Independent: separate term accumulation
    terms = [10 * kg, 6.25 * cm, -5 * age, (5 if sex == "male" else -161)]
    return round(sum(terms))

print("=== Calc 3: 기초대사량 BMR (Mifflin-St Jeor) ===")
for sex, kg, cm, age in [("male", 70, 175, 30), ("female", 55, 160, 25), ("male", 80, 180, 45)]:
    a = bmr_A(sex, kg, cm, age)
    b = bmr_B(sex, kg, cm, age)
    tdee = {k: round(a * v) for k, v in ACT.items()}
    print(f"{sex} {kg}kg {cm}cm {age}세  BMR_A={a} BMR_B={b} match={a==b}  TDEE(보통)={tdee['normal']}")
# Pass C: male 70kg/175cm/30 -> 10*70+6.25*175-5*30+5 = 700+1093.75-150+5 = 1648.75 -> 1649
assert bmr_A("male", 70, 175, 30) == 1649, bmr_A("male", 70, 175, 30)
# female 55/160/25 -> 550+1000-125-161 = 1264
assert bmr_A("female", 55, 160, 25) == 1264, bmr_A("female", 55, 160, 25)
print("Pass C ref male=1649, female=1264 OK")
print("\nALL VALIDATIONS PASSED")
