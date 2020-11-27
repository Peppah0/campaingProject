pragma solidity >=0.6.6 < 0.8.0;
contract CampaignFactory {
    Campaign[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (Campaign[] memory) {
        return deployedCampaigns;
    }
}
contract Campaign {
    struct Request {
        string description;
        uint amount;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
        
    } 
    
    address public manager;
    uint public minimumContribution;
    //address[] public approvers;
    mapping (address => bool) public approvers;
    Request[] public requests; 
    uint approversCount;
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    //constructor (uint minimum) public {
    constructor (uint minimum, address creator) public payable{
        //manager = msg.sender;
        manager = creator;
        minimumContribution = minimum;
    }
    
    
    function contribute() public payable {
        require(msg.value > minimumContribution);
        //approvers.push(msg.sender);
        approvers[msg.sender] = true;
        approversCount++;
        
    }
    function createRequest(string memory description, uint amount, address recipient) public restricted {
       
        Request memory newRequest = Request({
        //Request storage newRequest = Request({
            description: description,
            amount: amount,
           recipient: recipient,
           complete: false,
           approvalCount: 0 
           //we do not need to initilize mapping
           
        });

        requests.push(newRequest);
    }
    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    function finalizeRequest(uint index) public payable restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);
        address payable rec = payable (request.recipient);

        //request.recipient.transfer(request.amount);
        rec.transfer(request.amount);
        request.complete = true;
    }
}