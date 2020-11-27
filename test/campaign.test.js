const assert = require("assert");
const ganache = require("ganache-cli");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const bytecode = fs.readFileSync('./build/__contracts_campaign_sol_CampaignFactory.bin');
const abi = JSON.parse(fs.readFileSync('./build/__contracts_campaign_sol_CampaignFactory.abi'));
const bytecode2 = fs.readFileSync('./build/__contracts_campaign_sol_Campaign.bin');
const abi2 = JSON.parse(fs.readFileSync('./build/__contracts_campaign_sol_Campaign.abi'));
var accounts;
var CampaignFactory;
var Campaign;
var campaignAddress;


beforeEach(async () => {
accounts = await web3.eth.getAccounts()
CampaignFactory = await

new web3.eth.Contract(abi)
.deploy({
data: '0x'+bytecode,

}).send({
from: accounts[0],
gas:'1000000'
});

await CampaignFactory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: '1000000'
  });
  const deployedCampaigns = await CampaignFactory.methods.getDeployedCampaigns().call();
  campaignAddress = deployedCampaigns[0];
  Campaign = await new web3.eth.Contract(abi2,campaignAddress);

});
describe('CampaignFactory',() => {
it('deploys a campaign factory contract', () => {
    console.log("contract address:  "+ CampaignFactory.options.address);
assert.ok(CampaignFactory.options.address);
});

it('manager is address of the person who is create', async() => {
    const manager = await Campaign.methods.manager().call();
    assert.strictEqual(accounts[0],manager);
});

it('requires minimum amount of ether to create campaign', async() => {
    var pass = "ok"
    try {
    await CampaignFactory.methods.createCampaign(minimum).send({
    from: accounts[0],
    value: web3.utils.toWei("0", "ether")
    });
    
    } catch (err) {
    pass = "not ok";
    
    }
    assert.strictEqual("not ok", pass);
});

it('test one campaign to be created ',async () => {
     const deployedCampaigns = await CampaignFactory.methods.getDeployedCampaigns().call({
     from: accounts[0]
     });
     //assert.strictEqual(accounts[0], deployedCampaigns[0]);
     assert.strictEqual(1, deployedCampaigns.length);
     });

it('test multi campaign to be created ',async () => {
    await CampaignFactory.methods.createCampaign('100').send({
        from: accounts[1],
        gas: '1000000'      
        });
    await CampaignFactory.methods.createCampaign('100').send({
        from: accounts[2],
        gas: '1000000'});
    const deployedCampaigns = await CampaignFactory.methods.getDeployedCampaigns().call({
        from: accounts[0]
        });

        //assert.strictEqual(accounts[0], deployedCampaigns[0]);
        assert.strictEqual(3, deployedCampaigns.length);
        });
});

describe('Campaign',() => {
    it('deploys a campaign contract', () => {
        console.log("contract address:  "+ Campaign.options.address);
    assert.ok(Campaign.options.address);
    });
    
    it('only manager can send a request', async () =>{
        var pass = "ok";
        try {
        await Campaign.methods.createRequest("buy a computer",5000,account[0]).send({
        from: accounts[0],
        value: web3.utils.toWei("0.01", "ether")
        });
        await Campaign.methods.createRequest("buy a computer",5000,account[0]).send({
        from: accounts[1]
        });
        }
        catch(err) {
        pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });

    it('join contributes', async () =>{
        var pass = "ok";
        try{
            await Campaign.methods.contribute().send({
                from: account[0],
                value: web3.utils.toWei("100", "ether")
            });
            await Campaign.methods.contribute().send({
                from: account[0],
                value: web3.utils.toWei("99", "ether")
        });
        }
        catch(err) {
        pass = "not ok"; 
        }
        assert.strictEqual("not ok",pass);
    });

    it ('only approvers can call approveRequest', async () => {
        //check approvers
        var pass = "ok";
        try {
            await Campaign.methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei("1", "ether")
            });
            await Campaign.methods.approveRequest().send({
                from: accounts[1]
            });
        }
        catch(err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });

        //check approvers never voted before
        it ('approvers can only vote once for each request', async () => {
        try {
            await Campaign.methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei("1", "ether")
            });
            await Campaign.methods.approveRequest().send({
                from: accounts[0]
            });
            await Campaign.methods.approveRequest().send({
                from: accounts[0]
            });
        }
        catch(err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
    });

    it('only manager can call finalizeRequest', async() => {
        //check manager
        const manager = await Campaign.methods.manager().call();
        assert.strictEqual(accounts[0],manager);

        //check approvalCount > (approversCount / 2)
        var pass = "ok";

        try {
            await Campaign.methods.createRequest().send({
                from: accounts[0]
            });

            await Campaign.methods.contribute().send({
                from: accounts[1],
                value: web3.utils.toWei("1", "ether")
            });
            await Campaign.methods.approveRequest().send({
                from: accounts[1]
            });
            await Campaign.methods.contribute().send({
                from: accounts[2],
                value: web3.utils.toWei("1", "ether")
            });
            await Campaign.methods.contribute().send({
                from: accounts[3],
                value: web3.utils.toWei("1", "ether")
            });

            //manager call finalizeRequest 
            await Campaign.methods.finalizeRequest().send({
                from: accounts[0],
            });
        }
        catch(err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);

        //request never complete 
   
        try {
            await Campaign.methods.createRequest('description',1,accounts[1]).send({
                from: accounts[0],
            });       
            await Campaign.methods.contribute().send({
                from: accounts[2],
                value: web3.utils.toWei("1", "ether")});
            await Campaign.methods.approveRequest(0).send({
                from: accounts[2]
            });        
            await Campaign.methods.finalizeRequest(0).send({
                from: accounts[0]
            });        
            await Campaign.methods.finalizeRequest(0).send({
                from: accounts[0]
            });        
        } catch (err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);

        //check that the recipient got money
        
        try {
        await Campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei("2", "ether")
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await Campaign.methods.finalizeRequest().send({
            from: accounts[0]
        });

        recipient = await Campaign.methods.recipient().call()
        assert.strictEqual(accounts[0], recipient)

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initialBalance;
        console.log(web3.utils.fromWei('0'+difference, "ether"));
        assert(difference < web3.utils.toWei("1.8", "ether"));
        }
        catch(err) {
            pass = "not ok";
        }
        assert.strictEqual("not ok", pass);
        
    });

});