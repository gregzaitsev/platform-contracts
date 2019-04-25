# Set the deployer address here:
#DEPLOYER=0x18fb6a7ab24fa7be8f1aac5a221e145cbe60989a
DEPLOYER=0x09660DbFb4dcEDfA097c1caBa8B6c492C374D314

# Import deployer address
geth --rinkeby --datadir=$HOME/.rinkeby account import account1.txt --password password.txt

# Start geth node with unlocked account
geth --networkid=4 --cache=512 --rpc --rpcapi eth,web3,debug,admin,net --datadir=$HOME/.rinkeby \
--bootnodes=enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303,enode://a979fb575495b8d6db44f750317d0f4622bf4c2aa3365d6af7c284339968eef29b69ad0dce72a4d8db5ebb4968de0e3bec910127f134779fbcb0cb6d3331163c@52.16.188.185:30303,enode://7380948a43c765e54fbfedb79dd32d755e97f0548cf0fef232adb49ac4a2525f02c84075dae217663199e45d92f3c1bf7b2c3746417677bdae668e05b8b6c202@174.112.32.157:30303 \
--unlock $DEPLOYER --password password.txt
