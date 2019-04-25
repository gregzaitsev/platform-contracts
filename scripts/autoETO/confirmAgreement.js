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
    ETOCommitment = await ETOCommitmentContract.at(addrs.ETO);

    console.log(`addrs.ETO = ${addrs.ETO}`);
    console.log(`addrs.Agreement = ${addrs.Agreement}`);

    await ETOCommitment.companySignsInvestmentAgreement(addrs.Agreement);
    await ETOCommitment.nomineeConfirmsInvestmentAgreement(addrs.Agreement);
    console.log("Confirmed ETO agreement");

  } catch (err) {
    console.log("ERROR signing agreements: ", err.message);
  }

}
