"""
SwarnaDrishti Quantitative Calculations Module
===============================================
Provides documented, defensible relative-value transaction-cost estimations
and stress scenario simulations based on verified MCX gold contract specifications.

All formulas, statutory tax schedules, and friction models are documented below.
Assumptions that cannot be verified from active broker contracts or real-time L2 books
are explicitly tagged as "ILLUSTRATIVE".
"""

from typing import Any

# Baseline MCX Gold benchmark price for statutory nominal turnover calculations (Rs. per 10g)
MCX_GOLD_REFERENCE_PRICE_PER_10G = 75000.0

# Statutory tax and regulatory levy rates (MCX Commodity Derivatives):
# 1. Commodity Transaction Tax (CTT): 0.01% on non-agri futures sell turnover
CTT_RATE = 0.0001
# 2. MCX Exchange Turnover Fee: 0.00325% on both buy and sell legs
MCX_TURNOVER_FEE_RATE = 0.0000325
# 3. Goods & Services Tax (GST): 18% on (brokerage + exchange turnover fees)
GST_RATE = 0.18
# 4. Stamp Duty & SEBI Regulatory Turnover Proxy (~0.0025% composite buy/both)
STAMP_SEBI_PROXY_RATE = 0.000025


def estimate_transaction_costs(gross_edge: float, brokerage: float, slippage: float) -> dict[str, Any]:
    """
    Computes MCX futures round-trip friction model normalized to 10g of 999 fine gold.

    Parameters:
    -----------
    gross_edge: float
        Theoretical gross spread differential in Rs. per 10g.
    brokerage: float
        User-input broker commission in Rupees per order (standard retail rate, e.g. ₹20).
    slippage: float
        User-estimated execution slippage buffer in Rs. per 10g (bid-ask crossing drag).

    Friction Modeling Assumptions:
    ------------------------------
    1. Brokerage scaling: A standard retail broker charges flat ₹20/order per leg.
       On an MCX Gold Mini (GOLDM) 100g contract (10 units of 10g), a flat ₹20 order fee
       equals ₹2.00 per 10g per leg. A two-legged spread trade round-trip (entry & exit on
       both legs = 2 round trips) yields:
           brokerage_per_10g = (brokerage / 10.0) * 2.0
       For standard default input ₹20, this equals ₹4.00 per 10g.
    2. Statutory Taxes:
       - Sell CTT: 0.01% of nominal value (~₹7.50 / 10g).
       - MCX turnover fee: 0.00325% on buy + sell (~₹4.88 / 10g).
       - Stamp & SEBI proxy: ~₹1.88 / 10g.
       - GST: 18% on (brokerage + turnover fee).
    3. Slippage: Direct user input modeling combined round-trip spread execution friction.
    """
    gross = float(gross_edge)
    broker = float(brokerage)
    slip = float(slippage)

    # Documented brokerage normalization: ₹broker per order on 100g GOLDM lot (10 units) for 2 legs round-trip
    brokerage_normalized = round((broker / 10.0) * 2.0, 2)

    # Statutory levies per 10g basis:
    turnover_both_legs = MCX_GOLD_REFERENCE_PRICE_PER_10G * MCX_TURNOVER_FEE_RATE * 2.0
    ctt_sell_leg = MCX_GOLD_REFERENCE_PRICE_PER_10G * CTT_RATE
    stamp_sebi_levies = MCX_GOLD_REFERENCE_PRICE_PER_10G * STAMP_SEBI_PROXY_RATE
    gst_component = (brokerage_normalized + turnover_both_legs) * GST_RATE

    statutory_taxes = round(ctt_sell_leg + turnover_both_legs + stamp_sebi_levies + gst_component, 2)
    total_cost = round(brokerage_normalized + statutory_taxes + slip, 2)
    net_edge = round(gross - total_cost, 2)
    cost_to_edge = round(total_cost / gross, 3) if gross > 0 else 1.0

    return {
        "grossTheoreticalEdge": gross,
        "brokerageAndFees": brokerage_normalized,
        "statutoryTaxesAndCTT": statutory_taxes,
        "estimatedSlippage": slip,
        "totalEstimatedCost": total_cost,
        "estimatedNetEdge": net_edge,
        "costToEdgeRatio": cost_to_edge,
        "isActionable": bool(net_edge > 0 and cost_to_edge < 0.6),
        "assumptions": {
            "mode": "illustrative_decision_support",
            "quotationBasis": "Rs. per 10g 999 fine gold equivalent",
            "referenceNominalPrice": MCX_GOLD_REFERENCE_PRICE_PER_10G,
            "statutoryRates": "CTT 0.01% on sell, MCX turnover 0.00325% both legs, GST 18%",
            "brokerageInterpretation": f"Scaled from flat Rs. {broker:.2f}/order on 100g GOLDM basis for two-legged pair execution",
            "disclaimer": "All figures are illustrative friction estimates. Actual fills depend on broker tier and exchange execution.",
        },
    }


def simulate_scenario(pair: str, slippage: float, brokerage: float, entry_z: float, holding_days: int) -> dict[str, Any]:
    """
    Stress-test analytical assumptions and assess how signal survivability responds
    to elevated slippage or modified holding horizons.

    CRITICAL MODELING SAFEGUARD:
    A Z-score indicates statistical deviation from historical median spread only.
    It does NOT prove that an actionable trading opportunity exists or guarantee
    profitable mean reversion. Structural divergence, tender delivery pressure, or
    illiquidity can cause spreads to trend rather than mean-revert.
    """
    slip = float(slippage)
    broker = float(brokerage)
    z = float(entry_z)
    days = int(holding_days)

    # Illustrative gross edge proxy derived from historical spread volatility (~24.03 Rs/10g per sigma)
    # Tagged explicitly as an illustrative model proxy
    spread_volatility_sigma = 24.03
    illustrative_gross_edge = round(z * spread_volatility_sigma, 2)

    cost_result = estimate_transaction_costs(gross_edge=illustrative_gross_edge, brokerage=broker, slippage=slip)
    recalculated_cost = cost_result["totalEstimatedCost"]
    recalculated_net_edge = round(illustrative_gross_edge - recalculated_cost, 2)

    # Gatekeeper hurdle evaluation
    if recalculated_net_edge <= 0:
        signal_status = "REJECTED"
        risk_check = "Friction exceeds theoretical edge; trade is unviable"
    elif days > 12:
        signal_status = "WATCH"
        risk_check = "Holding window exceeds 12-day optimal walk-forward mean reversion horizon"
    elif recalculated_cost / illustrative_gross_edge > 0.45:
        signal_status = "WATCH"
        risk_check = "Cost-to-edge ratio exceeds 45% risk tolerance hurdle"
    else:
        signal_status = "ACTIONABLE"
        risk_check = "Passed: Surviving net edge withstands simulated friction"

    return {
        "pair": pair,
        "recalculatedCost": recalculated_cost,
        "recalculatedNetEdge": recalculated_net_edge,
        "signalStatus": signal_status,
        "riskCheck": risk_check,
        "simulatedGrossEdge": illustrative_gross_edge,
        "holdingDays": days,
        "entryZ": z,
        "modelCaveats": {
            "statisticalNotice": (
                "Z-score reflects statistical deviation from rolling historical median only. "
                "It does NOT guarantee mean reversion, profitable execution, or absence of structural delivery squeeze."
            ),
            "natureOfGrossEdge": "Illustrative proxy based on historical spread volatility (sigma = 24.03 Rs./10g); not a live market bid/ask.",
            "dataMode": "historical_backtest_simulation",
            "isLiveSignal": False,
        },
    }
