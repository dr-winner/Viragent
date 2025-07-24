#!/bin/bash

# Cycecho "📋 Next Steps:"
echo "1. ✅ Redeem working coupon codes (DONE: 20 TC total available!)"
echo "2. ✅ Fix real OpenAI API calls in local development (DONE)"
echo "3. 🚀 Deploy to mainnet when ready (Excellent cycles balance!)"

echo ""
echo "🔧 Useful Commands:"
echo "• Check balance: dfx cycles --network ic --identity secure_identity balance"
echo "• Redeem coupon: dfx cycles --network ic --identity secure_identity redeem-faucet-coupon [CODE]"
echo "• Add cycles to local canister: dfx canister deposit-cycles [AMOUNT] [CANISTER_NAME]"
echo "• Create canister: dfx canister --network ic --identity secure_identity create [CANISTER_NAME] --with-cycles [AMOUNT]"

echo ""
echo "💡 Pro Tips:"
echo "• 20 TC is EXCELLENT for extensive testing and production deployment"
echo "• Test real OpenAI API locally before mainnet deployment"
echo "• Local HTTP outcalls need proper cycles management"
echo "• Each OpenAI call costs ~95M cycles (you can make 200,000+ calls!)"ript for Viragent
echo "💰 Viragent Cycles Management"
echo "=============================="

# Check current balance
echo "📊 Current Cycles Balance:"
dfx cycles --network ic --identity secure_identity balance

echo ""
echo "🎯 Cycles Usage Recommendations:"
echo "• Local Development: ~1-10 TC (trillion cycles)"
echo "• Production Deployment: ~50-100 TC"
echo "• HTTP Outcalls (OpenAI): ~0.1 TC per 1000 calls"
echo "• Storage: ~0.01 TC per GB"

echo ""
echo "📋 Next Steps:"
echo "1. ✅ Redeem working coupon codes (DONE: 10 TC available)"
echo "2. 🔧 Fix real OpenAI API calls in local development"
echo "3. 🚀 Deploy to mainnet when real API is tested"

echo ""
echo "🔧 Useful Commands:"
echo "• Check balance: dfx cycles --network ic --identity secure_identity balance"
echo "• Redeem coupon: dfx cycles --network ic --identity secure_identity redeem-faucet-coupon [CODE]"
echo "• Add cycles to local canister: dfx canister deposit-cycles [AMOUNT] [CANISTER_NAME]"
echo "• Create canister: dfx canister --network ic --identity secure_identity create [CANISTER_NAME] --with-cycles [AMOUNT]"

echo ""
echo "💡 Pro Tips:"
echo "• Test real OpenAI API locally before mainnet deployment"
echo "• Local HTTP outcalls need proper cycles management"
echo "• Keep 80% of cycles in wallet, use 20% for development"
