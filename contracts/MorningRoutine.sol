// SPDX-License-Identifier: MIT
/*
 __    __     ______     ______     __   __     __     __   __     ______    
/\ "-./  \   /\  __ \   /\  == \   /\ "-.\ \   /\ \   /\ "-.\ \   /\  ___\   
\ \ \-./\ \  \ \ \/\ \  \ \  __<   \ \ \-.  \  \ \ \  \ \ \-.  \  \ \ \__ \  
 \ \_\ \ \_\  \ \_____\  \ \_\ \_\  \ \_\\"\_\  \ \_\  \ \_\\"\_\  \ \_____\ 
  \/_/  \/_/   \/_____/   \/_/ /_/   \/_/ \/_/   \/_/   \/_/ \/_/   \/_____/ 
                                                                             
 ______     ______     __  __     ______   __     __   __     ______         
/\  == \   /\  __ \   /\ \/\ \   /\__  _\ /\ \   /\ "-.\ \   /\  ___\        
\ \  __<   \ \ \/\ \  \ \ \_\ \  \/_/\ \/ \ \ \  \ \ \-.  \  \ \  __\        
 \ \_\ \_\  \ \_____\  \ \_____\    \ \_\  \ \_\  \ \_\\"\_\  \ \_____\      
  \/_/ /_/   \/_____/   \/_____/     \/_/   \/_/   \/_/ \/_/   \/_____/      
                                                                          
                                                                                                                                 
DROP 002                                                                                
by BASEMENT
*/

pragma solidity ^0.8.20;

import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract MorningRoutine is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant WINNER_ROLE = keccak256("WINNER_ROLE");
    using Address for address payable;

    uint256 public totalProceeds;
    uint256 public numWinners;
    uint256 public numQualified;
    uint256 public totalInvocations;
    uint256 public mintStartTimestamp;
    uint256 public mintEndTimestamp;
    uint256 public gameStartTimestamp;
    bool public gameIsOver;

    uint256 private _nextTokenId;
    bool private hasAdminClaimed;
    uint256 constant mintPrice = 0.005 ether;
    uint256 constant ADMIN_SHARE_BASIS_POINTS  = 2500; // 25%

    mapping(uint256 => bool) public tokenIdToTokenQualified;
    mapping(uint256 => bool) public tokenIdToIsWinner;
    mapping(address => bool) private addressAdded;
    mapping(address => bool) private winnerHasClaimed;
    address[] private qualifiedAddresses;
    address[] private prevQualifiedAddresses;
    uint256[] private qualifiedTokenIds;
    uint256[] private prevQualifiedTokenIds;
    // mapping of tokenId to timestamp of last interaction;
    mapping(uint256 => uint256) public tokenIdToLastInteractionTimestamp;

    // EVENTS
    event CheckIn(uint256 tokenId, address indexed owner);
    event WinnerFound(address indexed winnerAddress);

    constructor(address defaultAdmin) ERC721("Morning Routine", "MR") {
        _grantRole(ADMIN_ROLE, defaultAdmin);
    }

    // Function to configure mint start and end timestamps as well as game start timestamp
    function configureGame(uint256 _mintTimestampStart) external onlyRole(ADMIN_ROLE) {
        require(block.timestamp <= _mintTimestampStart, "Choose a future timestamp");
        require(mintStartTimestamp == 0, "Game already configured");

        mintStartTimestamp = _mintTimestampStart;
        mintEndTimestamp = _mintTimestampStart + 7 days;
        gameStartTimestamp = _mintTimestampStart + 8 days;
    }

    function safeMint(address to) public payable {
        require(block.timestamp >= mintStartTimestamp && block.timestamp <= mintEndTimestamp, "Minting closed");
        require(msg.value >= mintPrice, "Send value gte mint price");
        uint256 tokenId = _nextTokenId++;
        tokenIdToTokenQualified[tokenId] = true;
        totalProceeds += msg.value;
        numQualified++;
        totalInvocations++;

        _safeMint(to, tokenId);
    }

    function checkIn(uint256 tokenId) public {
        require(block.timestamp >= gameStartTimestamp, "Game not started");
        require(ownerOf(tokenId) == msg.sender, "Must own token");
        require(tokenIdToTokenQualified[tokenId] == true, "Token must be qualified");
        require(!gameIsOver, "Game is over");
        tokenIdToLastInteractionTimestamp[tokenId] = block.timestamp;
        emit CheckIn(tokenId, msg.sender);
    }

    // Function to check if a token is still qualified
    function isTokenQualified(uint256 tokenId) public view returns (bool) {
        require(block.timestamp >= gameStartTimestamp, "Game not started");
        
        uint256 lastInteraction = tokenIdToLastInteractionTimestamp[tokenId];
        uint256 startOfToday = (block.timestamp / 1 days) * 1 days; // Midnight today UTC
        uint256 startOfYesterday = startOfToday - 1 days; // Midnight yesterday UTC

        // Check if last interaction was yesterday up until now
        return (lastInteraction >= startOfYesterday && lastInteraction <= block.timestamp);
    }

    // Function to call to validate tokens are still qualified and check for winner
    function updateQualifications() external onlyRole(ADMIN_ROLE) {
        require(block.timestamp >= gameStartTimestamp, "Game not started");
        require(!gameIsOver, "Game is over");
        // Reset the tracking for addresses added to the array for the current snapshot
        for (uint256 i = 0; i < qualifiedAddresses.length; i++) {
            addressAdded[qualifiedAddresses[i]] = false;
        }

        // Clear previous list of qualified addresses and token Ids
        delete qualifiedAddresses;
        delete qualifiedTokenIds;

        for (uint256 j = 0; j < totalInvocations; j++) {
            // disqualify any token ids that didn't interact yday
            if (!isTokenQualified(j)) {
                // if previously qualified decrement num qualified
                if (tokenIdToTokenQualified[j]) {
                    numQualified--;
                }
                tokenIdToTokenQualified[j] = false;
            } else {
                address owner = ownerOf(j);
                if (!addressAdded[owner]) {
                    qualifiedAddresses.push(owner);
                    qualifiedTokenIds.push(j);
                    addressAdded[owner] = true;
                }
            }
        }
        // check for winner
        if (qualifiedAddresses.length == 1) {
            // One unique winner found
            address winningAddress = qualifiedAddresses[0];
            uint256 winningTokenId = qualifiedTokenIds[0];
            _grantRole(WINNER_ROLE, winningAddress);
            // set game over
            gameIsOver = true;
            numWinners = 1;
            tokenIdToIsWinner[winningTokenId] = true;
            emit WinnerFound(winningAddress);
        } else if (qualifiedAddresses.length == 0) {
            // No more qualified addresses, split proceeds with previous day qualified addresses
            qualifiedAddresses = prevQualifiedAddresses;
            qualifiedTokenIds = prevQualifiedTokenIds;
            gameIsOver = true;
            numWinners = prevQualifiedAddresses.length;
            for (uint256 k = 0; k < numWinners; k++) {
                tokenIdToIsWinner[prevQualifiedTokenIds[k]] = true;
                _grantRole(WINNER_ROLE, prevQualifiedAddresses[k]);
                emit WinnerFound(prevQualifiedAddresses[k]);
            }
        } else {
            prevQualifiedAddresses = qualifiedAddresses;
            prevQualifiedTokenIds = qualifiedTokenIds;
        }
    }

    // Function to allow deployer to claim team allocation after mint
    function claimTeamFunds() external onlyRole(ADMIN_ROLE) nonReentrant {
        require(!hasAdminClaimed, "Admin already claimed");
        require(totalProceeds > 0, "No proceeds to withdraw");
        uint256 amountToClaim = totalProceeds * ADMIN_SHARE_BASIS_POINTS / 10000;
        totalProceeds -= amountToClaim;
        hasAdminClaimed = true;

        payable(msg.sender).transfer(amountToClaim);
    }

    // Function to allow winner to claim proceeds
    function claimWinnerFunds() external onlyRole(WINNER_ROLE) nonReentrant {
        require(gameIsOver, "Game not over");
        require(totalProceeds > 0, "No proceeds to withdraw");
        require(winnerHasClaimed[msg.sender] == false, "Already claimed");
        uint256 amountToClaim = totalProceeds / numWinners;
        winnerHasClaimed[msg.sender] = true;
        // Transfer the claimable balance to the caller
        payable(msg.sender).transfer(amountToClaim);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(tokenId <= totalInvocations, "Query for nonexistent token");
        string memory tokenIsQualified = tokenIdToTokenQualified[tokenId] || tokenIdToIsWinner[tokenId] ? "True" : "False";
        string memory tokenIsWinner = tokenIdToIsWinner[tokenId] ? "True" : "False";
        string memory imageUrl = tokenIdToIsWinner[tokenId] ? "https://pgad3biwyjgacbeuuachfymgmhtzrf3yseqprvyg7kpgloupo7ha.arweave.net/eYA9hRbCTAEElKAEcuGGYeeYl3iRIPjXBvqeZbqPd84" : tokenIdToTokenQualified[tokenId] ? "https://cfjnfasgeqy2kukdrvxrvvwhuizqyymmdzn2v4io6vhepudfyoea.arweave.net/EVLSgkYkMaVRQ41vGtbHojMMYYweW6rxDvVOR9Blw4g" : "https://yvxd42kr2rec24iwjrl2mck4w6pluwvsmwnshputedwaqalezsoa.arweave.net/xW4-aVHUSC1xFkxXpglct566WrJlmyO-kyDsCAFkzJw";

        bytes memory json = abi.encodePacked(
            'data:application/json;utf8,{"name":"Morning Routine ', Strings.toString(tokenId),'",',
            '"description":"Morning Routine by BASEMENT, drop 002. Visit daily to stay qualified.",',
            '"attributes":[{"trait_type": "Qualified", "value":"', tokenIsQualified, '"},{"trait_type": "Winner", "value":"', tokenIsWinner, '"}],',
            '"image":"', imageUrl, '",',
            '"external_url":"https://www.basementxyz.io/drop/002"}'
        );

        return string(json);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
      address to,
      uint256 tokenId,
      address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
      return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
      super._increaseBalance(account, value);
    }

    receive() external payable {}
}