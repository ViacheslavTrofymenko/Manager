// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


/// @dev SafeMath contract is used to prevent overflow / lowerflow;

contract SafeMath {
    function safeAdd(uint a, uint b) public pure returns (uint c) {
        c = a + b;
        require(c >= a, "'c' should be greater than 'a'");
    }
    function safeSub(uint a, uint b) public pure returns (uint c) {
        require(b <= a, "'a' should be greater than 'b'");
        c = a - b;
    }
}

abstract contract ERC20Interface {
    function totalSupply() virtual public view returns (uint);
    function balanceOf(address tokenOwner) virtual public view returns (uint balance);
    function allowance(address tokenOwner, address spender) virtual public view returns (uint remaining);
    function transfer(address to, uint tokens) virtual public returns (bool success);
    function approve(address spender, uint tokens) virtual public returns (bool success);
    function transferFrom(address from, address to, uint tokens) virtual public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract SkyToken is ERC20Interface, SafeMath {
    string public _symbol;
    string public  _name;
    uint8 public _decimals;
    uint public _totalSupply;
    uint public _ownerSupply;
    uint public _contractSupply;
    uint public tokenPrice;
    address public owner;

    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;

    /** @dev Sets the values for {name} and {symbol}.
      The value of {decimals} is 0.     
      All two of these values are immutable: they can only be set once during
      construction.
     */
    constructor() {
        _symbol = "SKY";
        _name = "SKYToken";
        _decimals = 0;
        tokenPrice = 0.0001 ether;
        _ownerSupply = 10000;
        _contractSupply = 10000;
        _totalSupply = _ownerSupply + _contractSupply;
        owner = msg.sender;

        balances[msg.sender] = _ownerSupply;
        balances[address(this)] = _contractSupply;
        emit Transfer(address(0), msg.sender, _ownerSupply);
        emit Transfer(address(0), address(this), _contractSupply);
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "You are not the owner");
        _;
    }

    /// @dev Returns the name of the token.
    function name() public view returns (string memory) {
        return _name;
    }

    /// @dev Returns the symbol of the token, ussually a shorter version of the name.
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 0;
    }
    
    function totalSupply() public override view returns (uint) {
        return _totalSupply - balances[address(0)];
    }
    
    function balanceOf(address tokenOwner) public override view returns (uint balance) {
        return balances[tokenOwner];
    }
    
    /** @dev 'Receiver" cannot be the zero address.
        The caller should have a balance at least 'amount'.
    */
    function transfer(address receiver, uint tokens) public override returns (bool success) {
        require(receiver != address(0), "try to send to zero address");
        require(balanceOf(msg.sender) >= tokens, "Not enough tokens");

        balances[msg.sender] = safeSub(balances[msg.sender], tokens);
        balances[receiver] = safeAdd(balances[receiver], tokens);
        emit Transfer(msg.sender, receiver, tokens);
        return true;
    }
    
    function approve(address spender, uint tokens) public override returns (bool success) {
        require(spender != address(0),"Check spender address");
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }
    
    function transferFrom(address sender, address receiver, uint tokens) 
        public override returns (bool success) {
        balances[sender] = safeSub(balances[sender], tokens);
        allowed[sender][msg.sender] = safeSub(allowed[sender][msg.sender], tokens);
        balances[receiver] = safeAdd(balances[receiver], tokens);
        emit Transfer(sender, receiver, tokens);
        return true;
    }
    
    function allowance(address tokenOwner, address spender)
        public override view returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }

    /** @notice You can buy a token directly from SKY Token smart contract
        -   Should be enough tokens on balance of smart contract
        -   Should be sufficient ethers on buyer address to buy tokens
    */
    function buyToken (uint _tokenAmount) public payable returns (bool success) {
        require(msg.value == _tokenAmount * tokenPrice, "Check the value");
        require(balanceOf(address(this)) >= _tokenAmount, "Not enough tokens on balance");
        
        balances[address(this)] = safeSub(balances[address(this)], _tokenAmount);
        balances[msg.sender] = safeAdd(balances[msg.sender], _tokenAmount);

        emit Transfer(address(this), msg.sender, _tokenAmount);
        return true;
    }

    function withdraw (address payable _to) external onlyOwner {
        _to.transfer(address(this).balance);
    }
    /// @notice get Ethers balance of this smart contract
    function getBalance() public view returns (uint) {
    return address(this).balance;
    }
}