#!/usr/bin/env bash
# Simple script that flattens all smart contracts up for deployment

#Smart contract paths
path[0]=../contracts/PaymentTokens/EtherToken.sol
path[1]=../contracts/PaymentTokens/EuroToken.sol
path[2]=../contracts/ICBM/LockedAccount.sol
path[3]=../contracts/ETO/ETOCommitment.sol
path[4]=../contracts/Universe.sol
path[5]=../contracts/Identity/IdentityRegistry.sol
path[6]=../contracts/SimpleExchange.sol
path[7]=../contracts/Company/EquityToken.sol
path[8]=../contracts/Company/PlaceholderEquityTokenController.sol
path[9]=../contracts/PaymentTokens/EuroTokenController.sol
path[10]=../contracts/PlatformTerms.sol

path[11]=../contracts/ETO/ETOTerms.sol
path[12]=../contracts/Company/ShareholderRights.sol
path[13]=../contracts/ETO/ETOTokenTerms.sol
path[14]=../contracts/ETO/ETODurationTerms.sol
path[15]=../contracts/Company/EquityToken.sol
path[16]=../contracts/FeeDisbursal/FeeDisbursal.sol
path[17]=../contracts/FeeDisbursal/FeeDisbursalController.sol

#Output directory
output=./build/flatten

for i in {16..17}
do
  echo Flattening ${path[i]} to $output
  yarn truffle-flattener ${path[i]} $output
done
