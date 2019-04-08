# initialize
cd ../..
yarn install
cd scripts/autoETO

# generate ETO definitions
node generateEtoDefinition.js

# Compile contracts
cd ../..
yarn truffle compile --all
cd scripts/autoETO

# Verify that everything we need is OK with Universe
truffle exec verifyDeployment.js --network rinkeby
if [ $? -eq 1 ]
then
    echo ""
    echo "ERROR: Something is wrong with universe, see the output above"
    echo ""
    exit
fi

# Deploy ETO
echo ""
echo "Deploying ETO"
deplog=eto_deploy_$(date +"%y%m%d_%H").log
truffle exec autoDeployETO.js --network rinkeby > $deplog

# Sign agreements
echo ""
echo "Signing agreements"
echo ""
truffle exec postDeployment.js --network rinkeby --deploylog $deplog
