// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SkyNftFactory is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    event NewSkyNft(uint tokenId, uint rare, uint date);

    /// @dev SkyNft struct includes all required fields in a task
    struct SkyNft {
        uint tokenId;
        uint8 rare;
        uint32 date;
        string uri;
    }

    SkyNft[] public skyNfts;

    // solhint-disable-next-line
    constructor() ERC721("SkyNftoken", "SNFT") {}
    
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmZPG55YkkazYd9PqwWZy9LyxsfeTFZnt8os6FqNs5ZR6y";
    }

    function _rand() internal view returns(uint) {
    // solhint-disable-next-line
    return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.difficulty))) % 100 + 1;
  }

    /// @return Rarity field as per the task #3.
    function _rarity() internal view returns (uint8) {
        if (_rand() >= 1 && _rand() <= 40) {
            return 1;
        } else if (_rand() >= 41 && _rand() <= 70) {
            return 2;
        } else if (_rand() >= 71 && _rand() <= 90) {
            return 3;
        } else return 4;
    }

    /// @dev Mint new NFT token with required NFT fields as per task #3.
    function safeMint(address to) public virtual onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        // solhint-disable-next-line
        uint32 date = uint32(block.timestamp);

        skyNfts.push(SkyNft(tokenId, _rarity(), date, _baseURI()));
    }
}
