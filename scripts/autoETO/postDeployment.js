'use strict';

const getConfig = require("../../migrations/config").getConfig;
const fs = require('fs');
const readline = require('readline');
const once = require('events');
const commandLineArgs = require("command-line-args");

function getETOAddresses(logfile) {

  return new Promise((resolve, reject) => {
    try {
      let addresses = {
        Deployer: undefined,
        ETO: undefined,
        EquityToken: undefined,
        Agreement: undefined,
        ETOTerms: undefined
      };

      const rl = readline.createInterface({
        input: fs.createReadStream(logfile),
        crlfDelay: Infinity
      });

      const addrRegex = /0x[0-9a-f]{40}/i;
      const ipfsRegex = /ipfs:[0-9a-z]{46}/i;
      let tokenComingUp = false;
      let termsComingUp = false;

      rl.on('line', (line) => {

        if (line.includes('ETO COMMITMENT ADDRESS:')) {
          [addresses.ETO] = line.match(addrRegex);
        } else if (line.includes('Deploying EquityToken')) {
          tokenComingUp = true;
        } else if (tokenComingUp) {
          [addresses.EquityToken] = line.match(addrRegex);
          tokenComingUp = false;
        } else if (line.includes('INVESTMENT_AGREEMENT_TEMPLATE_URL:')) {
          [addresses.Agreement] = line.match(ipfsRegex);
        } else if (line.includes('DEPLOYER is')) {
          [addresses.Deployer] = line.match(addrRegex);
        } else if (line.includes('Deploying ETOTerms')) {
          termsComingUp = true;
        } else if (termsComingUp) {
          [addresses.ETOTerms] = line.match(addrRegex);
          termsComingUp = false;
        }

        if (addresses.ETO && addresses.EquityToken && addresses.Agreement && addresses.Deployer)
          resolve(addresses);
      });

    } catch (err) {
      reject(`Deploy log parsing error: ${err}`);
    }
  });

}

module.exports = async function deploy(deployer, network, accounts) {
  const optionDefinitions = [
    { name: "network", type: String },
    { name: "deploylog", type: String },
    { name: "exec", type: String, multiple: true, defaultOption: true },
  ];

  let options;
  try {
    options = commandLineArgs(optionDefinitions);
  } catch (e) {
    console.log(`Invalid command line: ${e}`);
    console.log(`Expected parameters:`);
    console.log(optionDefinitions);
    throw e;
  }

  // Get ETO and equity token addresses
  let addrs = await getETOAddresses(options.deploylog);
  let ETOCommitment;
  let EquityToken;

  // Amend agreements from deployer (who happens to be also nominee and company for testing purposes)
  try {
    const ETOCommitmentContract = artifacts.require("ETOCommitment");
    const EquityTokenContract   = artifacts.require("EquityToken");

    ETOCommitment = await ETOCommitmentContract.at(addrs.ETO);
    EquityToken = await EquityTokenContract.at(addrs.EquityToken);

    await ETOCommitment.amendAgreement(addrs.Agreement);
    console.log("Signed ETO agreement");
    await EquityToken.amendAgreement(addrs.Agreement);
    console.log("Signed Token agreement");

    // Verify signatures
    let allOk = true;
    const [etoAgreementSigner, tmp1, etoAgreementUrl] = await ETOCommitment.currentAgreement();
    if (etoAgreementSigner.toUpperCase() !== addrs.Deployer.toUpperCase()) {
      console.log("ERROR: Agreement failed to sign correctly (wrong signer)");
      allOk = false;
    }
    if (etoAgreementUrl.toUpperCase() !== addrs.Agreement.toUpperCase()) {
      console.log("ERROR: Agreement failed to sign correctly (wrong URL)");
      allOk = false;
    }

    const [tokenAgreementSigner, tmp2, tokenAgreementUrl] = await EquityToken.currentAgreement();
    if (tokenAgreementSigner.toUpperCase() !== addrs.Deployer.toUpperCase()) {
      console.log("ERROR: Agreement failed to sign correctly (wrong signer)");
      allOk = false;
    }
    if (tokenAgreementUrl.toUpperCase() !== addrs.Agreement.toUpperCase()) {
      console.log("ERROR: Agreement failed to sign correctly (wrong URL)");
      allOk = false;
    }
    if (allOk) console.log("Signatures verified OK");
    else console.log("ERROR: Some signing did not happen correctly");

  } catch (err) {
    console.log("ERROR signing agreements: ", err.message);
  }

  // Set ETO start date to "now"
  // Amend agreements from deployer (who happens to be also nominee and company for testing purposes)
  try {

    let timeNow = Math.floor(Date.now() / 1000) + 300;
    await ETOCommitment.setStartDate(addrs.ETOTerms, addrs.EquityToken, timeNow);
    console.log("ETO start date is set");

    const startOfStates = await ETOCommitment.startOfStates();
    const startWhiteList = new Date(startOfStates[1].mul(1000).toNumber());
    const startPublic = new Date(startOfStates[2].mul(1000).toNumber());
    const startSigning = new Date(startOfStates[3].mul(1000).toNumber());
    const startClaim = new Date(startOfStates[4].mul(1000).toNumber());
    const startPayout = new Date(startOfStates[5].mul(1000).toNumber());

    console.log(`---------------------------------------------------------`);
    console.log(`ETO was deployed successfully`);
    console.log(`ETO Address: ${addrs.ETO}`);
    console.log(`ETO Timing`);
    console.log(`   Public starts  : ${startPublic.toString()}`);
    console.log(`   Signing starts : ${startSigning.toString()}`);
    console.log(`   Claim starts   : ${startClaim.toString()}`);
    console.log(`   Payout starts  : ${startPayout.toString()}`);


  } catch (err) {
    console.log("ERROR setting start date: ", err.message);
  }

}
