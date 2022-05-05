// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./SkyNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address, uint) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract Manager is SkyNftFactory {
    uint256 public tokenDepositeTime;
    address public tokenContract;
    IERC20 public tokenSKY = IERC20(tokenContract);


    event TransferSent(address _from, address _to, uint _amount);

    /// @dev Represent who deposite tokens to this address
    mapping(address => address ) internal _balanceOfDeposite;

    constructor(address _tokenContract) {
        _transferOwnership(_msgSender());
        tokenContract = _tokenContract;
    }

    /// @notice Sending ERC20 tokens to the "Manager" smart contract
    /// @notice 1 SkyNFT = 2 SKY tokens.
    function depositTokens(uint _amountIn) public returns(bool success) {
        require(_amountIn <= tokenSKY.balanceOf(msg.sender), "Not enough tokens"); 
        require(_amountIn == 2, "1 SkyNFT = 2 SKY tokens");     
        tokenSKY.transferFrom(msg.sender, address(this), _amountIn);
        
        // solhint-disable-next-line
        tokenDepositeTime = block.timestamp;

        _balanceOfDeposite[msg.sender] = address(this);
        emit TransferSent(msg.sender, address(this), _amountIn);
        return true;
    }

    ///@notice Withdraw ERC20 tokens to the owner adress of Manager smart contract 
    function withdraw(address _to, uint _amountOut) public onlyOwner returns(bool success){
       
        require(mintSkyNft(), "SkyNft is not created");
        

        uint erc20balance = tokenSKY.balanceOf(address(this));
        
        require(_amountOut <= erc20balance,"balance is low");
        tokenSKY.transfer(_to, _amountOut);

        emit TransferSent(address(this), _to, _amountOut);
        return true;       
    }

    ///@notice ERC20 tokens balance of Manager smart contracts
    function balanceOfManager () public view returns (uint){
        return tokenSKY.balanceOf(address(this));
    }

    function mintSkyNft() public returns(bool success) {
        // solhint-disable-next-line
        require(block.timestamp >= tokenDepositeTime + 1 minutes, "Nft is still locked");
        require(_balanceOfDeposite[msg.sender] == address(this), "First send 2 SKY tokens");
        SkyNftFactory.safeMint(msg.sender);
        return true;
    }      
}


