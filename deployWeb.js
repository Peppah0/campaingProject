const fs = require("fs");
const Web3 = require("web3");
const mnemonic = "your metamask seeds"
const truffleURL = "your truffle"
const HDWalletProvider = require("truffle-hdwallet-provider");
const provider = new HDWalletProvider(mnemonic, truffleURL)
const web3 = new Web3(provider);
const abi = JSON.parse(fs.readFileSync('./build/__contracts_campaign_sol_CampaignFactory.abi'));
const bytecode = fs.readFileSync('./build/__contracts_campaign_sol_CampaignFactory.bin');
const deploy = async() => {
    accounts = await web3.eth.getAccounts()
    console.log("Trying to deploy from accounts ", accounts[0]);
    CampaignFactory = await 
    new web3.eth.Contract(abi)
        .deploy({ 
            data: '0x'+bytecode, 
        }).send({
            from: accounts[0], 
            gas:'1000000'
    });
    console.log('contract deployed to',CampaignFactory.options.address);
    process.exit();             
};
deploy();