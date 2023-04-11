// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Ownable.sol";

contract MRCRYPTO is ERC721Enumerable, Ownable {
    
    using Strings for uint256;

    uint16 public immutable MAX_SUPPLY;
    uint8 public immutable MAX_PER_USER;
    uint public COST_PER_NFT = 0.001 ether ;
    bool public whitelistOn;
    bool public paused = true;
    bool public revealed;
    string public baseURI;

    mapping(address => bool) public isWhitelisted;
    mapping(address => uint) public userMints;
    
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        MAX_SUPPLY = 1000;
        MAX_PER_USER = 5;
        baseURI = "https://apinft.racksmafia.com/api/";
        addAdmin(msg.sender);
    }

    function addToWhitelist(address whitelistedUser) external onlyAdmin {
        isWhitelisted[whitelistedUser] = true;
    }

    function flipPause() external onlyAdmin {
        paused = !paused;
    }

    function mint(uint amount) external payable {
        if(whitelistOn) require(isWhitelisted[msg.sender], "User not whitelisted");
        require(msg.value >= amount * COST_PER_NFT);
        _mint(amount);
    }

    function _mint(uint amount) internal {
        require(amount > 0, "Amount must be greater than '0'");
        require(amount <= MAX_PER_USER, "Amount must be less than MAX_PER_USER '6'");
        require(totalSupply() + amount <= MAX_SUPPLY, "All NFTs have already been minted");
        require(!paused, "Contract is paused");
        userMints[msg.sender] += amount;
        uint totalsupply = totalSupply();

        for (uint i = 1; i <= amount; ) {
            _safeMint(msg.sender, totalsupply + i);          
            unchecked {
                ++i;
            }
        }
    }

    function reveal() external onlyAdmin {
        revealed = true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!revealed) return "Not revelated";
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    function withdraw(uint amount) public onlyOwner {
        require(amount < address(this).balance, "There is not so much amount in smart contract");
        (bool successOwner, ) = owner.call{value: amount}("");
        require(successOwner == true, "Transaction failed");
    }

    receive() external payable {}

}