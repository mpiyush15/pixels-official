#!/bin/bash

echo "=========================================="
echo "TESTING SALARY PAYMENT FLOW"
echo "=========================================="
echo ""

# Get current state
echo "📊 BEFORE SALARY PAYMENT:"
curl -s http://localhost:3000/api/dashboard/financial-stats | jq '{
  totalRevenue: .data.totalRevenue,
  totalExpenses: .data.totalExpenses,
  totalSalaries: .data.totalSalaries,
  netProfit: .data.netProfit,
  bankBalance: .data.bankBalance,
  totalBalance: .data.totalBalance
}'

echo ""
echo "=========================================="
echo "EXPECTED WHEN YOU PAY ₹25,000 SALARY:"
echo "=========================================="
echo "Total Revenue:     ₹78,000 (unchanged)"
echo "Total Expenses:    ₹37,000 (unchanged)"
echo "Total Salaries:    ₹25,000 (NEW)"
echo "Net Profit:        ₹16,000 (78,000 - 37,000 - 25,000)"
echo "Bank Balance:      ₹16,000 (41,000 - 25,000)"
echo "Total Balance:     ₹16,000 (same as bank)"
echo ""
echo "✅ Net Profit = Revenue - Expenses - Salaries"
echo "✅ Available Balance = Previous Balance - Salary Paid"
echo "=========================================="
