const { expect } = require("chai");
const { ethers } = require("hardhat");

describe.only("MorningRoutine", function () {
  let morningRoutine;
  let deployer, minter, other;
  // Run before each describe
  beforeEach(async function () {
    [deployer, playerOne, playerTwo, playerThree, playerFour, playerFive, other] = await ethers.getSigners();
    const MorningRoutine = await ethers.getContractFactory("MorningRoutine");

    // deploy contract
    morningRoutine = await MorningRoutine.deploy(deployer.address);
    morningRoutineAddress = await morningRoutine.getAddress();
  });

  describe("Configue open mint + game tests", function() {
    it("Non-admin should not be able to configure mint + game", async function () {
      const mintStartTime = (await ethers.provider.getBlock('latest')).timestamp + 10;
      await expect(morningRoutine.connect(other).configureGame(mintStartTime))
        .to.be.reverted;
    });
    it("Admin can configure mint + game", async function () {
      const mintStartTime = (await ethers.provider.getBlock('latest')).timestamp + 10;
  
      await morningRoutine.connect(deployer).configureGame(mintStartTime)
  
      // can't configure game twice
      await expect(morningRoutine.connect(deployer).configureGame(mintStartTime))
      .to.be.revertedWith("Game already configured");
  
      expect(await morningRoutine.mintStartTimestamp()).to.equal(mintStartTime);
      expect(await morningRoutine.mintEndTimestamp()).to.equal(mintStartTime + 7 * 86400);
      expect(await morningRoutine.gameStartTimestamp()).to.equal(mintStartTime + 8 * 86400);
    });
  })

  describe("Minting tests", function() {
    it("Cannot mint before configured", async function () {
      await expect(morningRoutine.connect(other).safeMint(other.address))
        .to.be.revertedWith("Minting closed")
    });
    it("Mint successful only during mint period", async function () {
      const mintStartTime = (await ethers.provider.getBlock('latest')).timestamp + 10;
  
      await morningRoutine.connect(deployer).configureGame(mintStartTime);
      // Fast forward one day to open mint period
      await network.provider.send("evm_increaseTime", [86400]); // Increase time by 1 day
      await network.provider.send("evm_mine"); // Mine the next block

      // Must send mint price
      const mintPrice = ethers.parseEther("0.005");
      const lowerThanMintPrice = ethers.parseEther("0.0001");
      await expect(morningRoutine.connect(other).safeMint(other.address, { value: lowerThanMintPrice }))
      .to.be.revertedWith("Send value gte mint price")

      // Admin and non-admin able to mint
      const mintTx1 = await morningRoutine.connect(other).safeMint(other.address, {value: mintPrice});
      await mintTx1.wait();

      const mintTx2 = await morningRoutine.connect(playerOne).safeMint(playerOne.address, {value: mintPrice});
      await mintTx2.wait();


      const mintTx3 = await morningRoutine.connect(playerTwo).safeMint(playerTwo.address, {value: mintPrice});
      await mintTx3.wait();

      const mintTx4 = await morningRoutine.connect(deployer).safeMint(deployer.address, {value: mintPrice});
      await mintTx4.wait();

      // check state
      // all tokens start out as qualified
      expect(await morningRoutine.tokenIdToTokenQualified(0)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(2)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(3)).to.equal(true);
      expect(await morningRoutine.numQualified()).to.equal(4);

      // not minted yet
      expect(await morningRoutine.tokenIdToTokenQualified(4)).to.equal(false);

      // total proceeds and total invocations are correct
      expect(await morningRoutine.totalProceeds()).to.equal(ethers.parseEther("0.02"));
      expect(await morningRoutine.totalInvocations()).to.equal(4);
    });
  })
  describe("Game test - 1 winner", function() {
    it("Single winner of game", async function () {
      const mintStartTime = 1717693200; // June 6th, 1PM EST
      const gameStartTime = 1718384400; // June 14th, 1PM EST
  
      await morningRoutine.connect(deployer).configureGame(mintStartTime);
      // Fast forward to open mint period with 1s buffer
      await network.provider.send("evm_setNextBlockTimestamp", [mintStartTime + 1]);
      await network.provider.send("evm_mine"); // Mine the next block

      // Must send mint price
      const mintPrice = ethers.parseEther("0.005");
      const lowerThanMintPrice = ethers.parseEther("0.0001");
      await expect(morningRoutine.connect(other).safeMint(other.address, { value: lowerThanMintPrice }))
      .to.be.revertedWith("Send value gte mint price")

      // Admin and non-admin able to mint
      const mintTx1 = await morningRoutine.connect(other).safeMint(other.address, {value: mintPrice});
      await mintTx1.wait();
      const mintTx2 = await morningRoutine.connect(playerOne).safeMint(playerOne.address, {value: mintPrice});
      await mintTx2.wait();
      const mintTx3 = await morningRoutine.connect(playerTwo).safeMint(playerTwo.address, {value: mintPrice});
      await mintTx3.wait();
      const mintTx4 = await morningRoutine.connect(deployer).safeMint(deployer.address, {value: mintPrice});
      await mintTx4.wait();
      const mintTx5 = await morningRoutine.connect(playerThree).safeMint(playerThree.address, {value: mintPrice});
      await mintTx5.wait();
      expect(await morningRoutine.numQualified()).to.equal(5);

      // non-admin cannot claim team funds
      await expect(morningRoutine.connect(other).claimTeamFunds())
        .to.be.reverted;
      
      // admin can claim team funds
      const initialBalanceDeployerWallet = await ethers.provider.getBalance(deployer.address);
      const teamClaimTx = await morningRoutine.connect(deployer).claimTeamFunds();
      const receiptTeamClaimWithdrawal = await teamClaimTx.wait();
      const gasUsedTeamClaimWithdrawal = receiptTeamClaimWithdrawal.gasUsed * receiptTeamClaimWithdrawal.gasPrice;    
      const finalBalanceDeployerWallet = await ethers.provider.getBalance(deployer.address);
        
      const expectedFinalBalanceDeployerWallet = (initialBalanceDeployerWallet + ethers.parseEther("0.00625")) - gasUsedTeamClaimWithdrawal;
      expect(finalBalanceDeployerWallet).to.be.closeTo(expectedFinalBalanceDeployerWallet, ethers.parseEther("0.0001"));
  
      // admin cannot claim team funds twice
      await expect(morningRoutine.connect(deployer).claimTeamFunds())
        .to.be.reverted;

      // cant check in yet
      await expect(morningRoutine.connect(other).checkIn(0))
        .to.be.revertedWith("Game not started")

      // Fast forward to game start
      await network.provider.send("evm_setNextBlockTimestamp", [gameStartTime + 1]);
      await network.provider.send("evm_mine"); // Mine the next block

      // Cannot mint anymore
      await expect(morningRoutine.connect(deployer).safeMint(deployer.address, { value: mintPrice }))
        .to.be.revertedWith("Minting closed")
      
      // can't check in token unless owner
      await expect(morningRoutine.connect(other).checkIn(1))
        .to.be.revertedWith("Must own token")
      // Fast forward to first check in, all first check-ins happen on 6-14, check-in validation on 6-15
      await network.provider.send("evm_setNextBlockTimestamp", [1718398800]); // 6-14-2024
      await network.provider.send("evm_mine"); // Mine the next block
      
      // player 3 and 2 check in
      const checkInTx = await morningRoutine.connect(playerThree).checkIn(4);
      const checkInReceipt = await checkInTx.wait();
      const checkInBlockNumber = checkInReceipt.blockNumber;
      const checkInBlock = await ethers.provider.getBlock(checkInBlockNumber);
      const checkIn2Tx = await morningRoutine.connect(playerTwo).checkIn(2);
      const checkIn2Receipt = await checkIn2Tx.wait();
      const checkIn2BlockNumber = checkIn2Receipt.blockNumber;
      const checkIn2Block = await ethers.provider.getBlock(checkIn2BlockNumber);

      // validate state recorded correctly
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(4)).to.equal(checkInBlock.timestamp);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(2)).to.equal(checkIn2Block.timestamp);

      // validate event was emitted
      const checkInLog = checkInReceipt.logs;
      expect(checkInLog[0].fragment.name).to.equal("CheckIn");
      expect(checkInLog[0].args[0]).to.equal(4);
      expect(checkInLog[0].args[1]).to.equal(playerThree.address);

      // Fast forward to second check in, all first check-ins happen on 6-14, check-in validation on 6-15
      await network.provider.send("evm_setNextBlockTimestamp", [1718402400]); // 06-14-24 later
      await network.provider.send("evm_mine"); // Mine the next block
      // player one and other check in, deployer does not
      const checkIn3Tx = await morningRoutine.connect(playerOne).checkIn(1);
      const checkIn3Receipt = await checkIn3Tx.wait();
      const checkIn3BlockNumber = checkIn3Receipt.blockNumber;
      const checkIn3Block = await ethers.provider.getBlock(checkIn3BlockNumber);
      const checkIn4Tx = await morningRoutine.connect(other).checkIn(0);
      const checkIn4Receipt = await checkIn4Tx.wait();
      const checkIn4BlockNumber = checkIn4Receipt.blockNumber;
      const checkIn4Block = await ethers.provider.getBlock(checkIn4BlockNumber);

      // validate state recorded correctly
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(1)).to.equal(checkIn3Block.timestamp);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(0)).to.equal(checkIn4Block.timestamp);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(3)).to.equal(0); // hasn't checked in

      // fast forward to check in day
      await network.provider.send("evm_setNextBlockTimestamp", [1718488800]); // 06-15-24
      await network.provider.send("evm_mine"); // Mine the next block

      // before calling updateQualification, all tokens are qualified
      expect(await morningRoutine.tokenIdToTokenQualified(0)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(2)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(3)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(4)).to.equal(true);
      expect(await morningRoutine.numQualified()).to.equal(5);
      // check token qualification
      await morningRoutine.connect(deployer).updateQualifications();

      // token ID 3 should not be qualified but the rest are
      expect(await morningRoutine.tokenIdToTokenQualified(0)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(2)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(3)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(4)).to.equal(true);
      expect(await morningRoutine.numQualified()).to.equal(4);

      // checking token qualification again, same results
      await morningRoutine.connect(deployer).updateQualifications();

      // token ID 3 should not be qualified but the rest are
      expect(await morningRoutine.tokenIdToTokenQualified(0)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(2)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(3)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(4)).to.equal(true);
      expect(await morningRoutine.numQualified()).to.equal(4);
      // token ID 3 can't check in
      await expect(morningRoutine.connect(deployer).checkIn(3))
        .to.be.revertedWith("Token must be qualified")
      
      // token IDs 1 and 2 check in (0 and 4 will be disqualified, in addition to 3)
      const checkIn5Tx = await morningRoutine.connect(playerTwo).checkIn(2);
      const checkIn5Receipt = await checkIn5Tx.wait();
      const checkIn5BlockNumber = checkIn5Receipt.blockNumber;
      const checkIn5Block = await ethers.provider.getBlock(checkIn5BlockNumber);
      const checkIn6Tx = await morningRoutine.connect(playerOne).checkIn(1);
      const checkIn6Receipt = await checkIn6Tx.wait();
      const checkIn6BlockNumber = checkIn6Receipt.blockNumber;
      const checkIn6Block = await ethers.provider.getBlock(checkIn6BlockNumber);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(1)).to.equal(checkIn6Block.timestamp);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(2)).to.equal(checkIn5Block.timestamp);

      // the other tokens haven't changed
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(4)).to.equal(checkInBlock.timestamp);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(3)).to.equal(0); // hasn't checked in
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(0)).to.equal(checkIn4Block.timestamp);

      // fast forward to next day check in ()
      await network.provider.send("evm_setNextBlockTimestamp", [1718575200]); // 06-16-24
      await network.provider.send("evm_mine"); // Mine the next block
      
      // call check in
      await morningRoutine.connect(deployer).updateQualifications();

      // check token qualifications (1 and 2 are still in the game)
      expect(await morningRoutine.tokenIdToTokenQualified(0)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(2)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(3)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(4)).to.equal(false);
      expect(await morningRoutine.numQualified()).to.equal(2);

      // fast forward to midnight, cutting it close
      await network.provider.send("evm_setNextBlockTimestamp", [1718582400]); // 06-16-24 midnight (6-17) UTC
      await network.provider.send("evm_mine"); // Mine the next block

      // token ID 1 checks in
      const checkIn7Tx = await morningRoutine.connect(playerOne).checkIn(1);
      const checkIn7Receipt = await checkIn7Tx.wait();
      const checkIn7BlockNumber = checkIn7Receipt.blockNumber;
      const checkIn7Block = await ethers.provider.getBlock(checkIn7BlockNumber);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(1)).to.equal(checkIn7Block.timestamp);

      // fast forward to next day check in ()
      await network.provider.send("evm_setNextBlockTimestamp", [1718658000]); // 06-17-24
      await network.provider.send("evm_mine"); // Mine the next block
      // call check in -> winner found and it is player one good job player one
      const lastUpdateTx = await morningRoutine.connect(deployer).updateQualifications();
      const lastUpdateReceipt = await lastUpdateTx.wait();
      const lastUpdateLog = lastUpdateReceipt.logs;
      expect(lastUpdateLog[1].fragment.name).to.equal("WinnerFound");
      expect(lastUpdateLog[1].args[0]).to.equal(playerOne.address);

      expect(await morningRoutine.tokenIdToTokenQualified(0)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(2)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(3)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(4)).to.equal(false);
      expect(await morningRoutine.numQualified()).to.equal(1);

      // expect game is over to be true
      expect(await morningRoutine.gameIsOver()).to.equal(true);
      expect(await morningRoutine.numWinners()).to.equal(1);
      // non-winner cannot claim winner funds
      await expect(morningRoutine.connect(deployer).claimWinnerFunds())
        .to.be.reverted;
      // no more checking in
      await expect(morningRoutine.connect(playerOne).checkIn(1))
        .to.be.revertedWith("Game is over")
      
      // winner is able to claim funds
      const initialBalancePlayerOneWallet = await ethers.provider.getBalance(playerOne.address);
      const withdrawWinningsTx = await morningRoutine.connect(playerOne).claimWinnerFunds();
      const receiptWinningWithdrawal = await withdrawWinningsTx.wait();
      const gasUsedWinningWithdrawal = receiptWinningWithdrawal.gasUsed * receiptWinningWithdrawal.gasPrice;    
      const finalBalancePlayerOneWallet = await ethers.provider.getBalance(playerOne.address);
      
      const expectedFinalBalancePlayerOneWallet = (initialBalancePlayerOneWallet + ethers.parseEther("0.01875")) - gasUsedWinningWithdrawal;
      expect(finalBalancePlayerOneWallet).to.be.closeTo(expectedFinalBalancePlayerOneWallet, ethers.parseEther("0.0001"));

      // test that token ID 1 is a winner
      expect(await morningRoutine.tokenIdToIsWinner(0)).to.equal(false);
      expect(await morningRoutine.tokenIdToIsWinner(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToIsWinner(2)).to.equal(false);
      expect(await morningRoutine.tokenIdToIsWinner(3)).to.equal(false);
      expect(await morningRoutine.tokenIdToIsWinner(4)).to.equal(false);
      expect(await morningRoutine.numQualified()).to.equal(1);
    });
  });
  describe("Game test - Multiple winners", function() {
    it("Three winners of game", async function () {
      const mintStartTime = 1749229200; // 06-06-2025
      const gameStartTime = 1749920400; // 06-14-2025
  
      await morningRoutine.connect(deployer).configureGame(mintStartTime);
      // Fast forward to open mint period with 1s buffer
      await network.provider.send("evm_setNextBlockTimestamp", [mintStartTime + 1]);
      await network.provider.send("evm_mine"); // Mine the next block

      // Must send mint price
      const mintPrice = ethers.parseEther("0.005");
      const lowerThanMintPrice = ethers.parseEther("0.0001");
      await expect(morningRoutine.connect(other).safeMint(other.address, { value: lowerThanMintPrice }))
      .to.be.revertedWith("Send value gte mint price")

      // Admin and non-admin able to mint
      const mintTx1 = await morningRoutine.connect(other).safeMint(other.address, {value: mintPrice});
      await mintTx1.wait();
      const mintTx2 = await morningRoutine.connect(playerOne).safeMint(playerOne.address, {value: mintPrice});
      await mintTx2.wait();
      const mintTx3 = await morningRoutine.connect(playerTwo).safeMint(playerTwo.address, {value: mintPrice});
      await mintTx3.wait();
      const mintTx4 = await morningRoutine.connect(deployer).safeMint(deployer.address, {value: mintPrice});
      await mintTx4.wait();
      const mintTx5 = await morningRoutine.connect(playerThree).safeMint(playerThree.address, {value: mintPrice});
      await mintTx5.wait();
      expect(await morningRoutine.numQualified()).to.equal(5);

      // cant check in yet
      await expect(morningRoutine.connect(other).checkIn(0))
        .to.be.revertedWith("Game not started")
      
      // admin can claim team funds
      const initialBalanceDeployerWallet = await ethers.provider.getBalance(deployer.address);
      const teamClaimTx = await morningRoutine.connect(deployer).claimTeamFunds();
      const receiptTeamClaimWithdrawal = await teamClaimTx.wait();
      const gasUsedTeamClaimWithdrawal = receiptTeamClaimWithdrawal.gasUsed * receiptTeamClaimWithdrawal.gasPrice;    
      const finalBalanceDeployerWallet = await ethers.provider.getBalance(deployer.address);
        
      const expectedFinalBalanceDeployerWallet = (initialBalanceDeployerWallet + ethers.parseEther("0.00625")) - gasUsedTeamClaimWithdrawal;
      expect(finalBalanceDeployerWallet).to.be.closeTo(expectedFinalBalanceDeployerWallet, ethers.parseEther("0.0001"));
        

      // Fast forward to game start
      await network.provider.send("evm_setNextBlockTimestamp", [gameStartTime + 1]);
      await network.provider.send("evm_mine"); // Mine the next block
      
      // can't check in token unless owner
      await expect(morningRoutine.connect(other).checkIn(1))
        .to.be.revertedWith("Must own token")
      // Fast forward to first check in, all first check-ins happen on 6-14, check-in validation on 6-15
      await network.provider.send("evm_setNextBlockTimestamp", [1749934800]); // 06-14-2025
      await network.provider.send("evm_mine"); // Mine the next block

      // player 3 and 2 check in
      const checkInTx = await morningRoutine.connect(playerThree).checkIn(4);
      const checkInReceipt = await checkInTx.wait();
      const checkInBlockNumber = checkInReceipt.blockNumber;
      const checkInBlock = await ethers.provider.getBlock(checkInBlockNumber);
      const checkIn2Tx = await morningRoutine.connect(playerTwo).checkIn(2);
      const checkIn2Receipt = await checkIn2Tx.wait();
      const checkIn2BlockNumber = checkIn2Receipt.blockNumber;
      const checkIn2Block = await ethers.provider.getBlock(checkIn2BlockNumber);

      // validate state recorded correctly
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(4)).to.equal(checkInBlock.timestamp);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(2)).to.equal(checkIn2Block.timestamp);

      // validate event was emitted
      const checkInLog = checkInReceipt.logs;
      expect(checkInLog[0].fragment.name).to.equal("CheckIn");
      expect(checkInLog[0].args[0]).to.equal(4);
      expect(checkInLog[0].args[1]).to.equal(playerThree.address);

      // Fast forward to second check in, all first check-ins happen on 6-14, check-in validation on 6-15
      await network.provider.send("evm_setNextBlockTimestamp", [1749938400]); // 06-14 later
      await network.provider.send("evm_mine"); // Mine the next block
      // player one and other check in, deployer does not
      await morningRoutine.connect(playerOne).checkIn(1);
      const checkIn4Tx = await morningRoutine.connect(other).checkIn(0);
      const checkIn4Receipt = await checkIn4Tx.wait();
      const checkIn4BlockNumber = checkIn4Receipt.blockNumber;
      const checkIn4Block = await ethers.provider.getBlock(checkIn4BlockNumber);

      // fast forward to check in day
      await network.provider.send("evm_setNextBlockTimestamp", [1750024800]); // 06-15
      await network.provider.send("evm_mine"); // Mine the next block

      // check token qualification
      await morningRoutine.connect(deployer).updateQualifications();
      
      // token IDs 1, 2 and 4 check in (0 will be disqualified, in addition to 3)
      const checkIn5Tx = await morningRoutine.connect(playerTwo).checkIn(2);
      const checkIn5Receipt = await checkIn5Tx.wait();
      const checkIn5BlockNumber = checkIn5Receipt.blockNumber;
      const checkIn5Block = await ethers.provider.getBlock(checkIn5BlockNumber);
      const checkIn6Tx = await morningRoutine.connect(playerOne).checkIn(1);
      const checkIn6Receipt = await checkIn6Tx.wait();
      const checkIn6BlockNumber = checkIn6Receipt.blockNumber;
      const checkIn6Block = await ethers.provider.getBlock(checkIn6BlockNumber);
      const checkIn7Tx = await morningRoutine.connect(playerThree).checkIn(4);
      const checkIn7Receipt = await checkIn7Tx.wait();
      const checkIn7BlockNumber = checkIn7Receipt.blockNumber;
      const checkIn7Block = await ethers.provider.getBlock(checkIn7BlockNumber);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(1)).to.equal(checkIn6Block.timestamp);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(2)).to.equal(checkIn5Block.timestamp);
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(4)).to.equal(checkIn7Block.timestamp);

      // the other tokens haven't changed
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(3)).to.equal(0); // hasn't checked in
      expect(await morningRoutine.tokenIdToLastInteractionTimestamp(0)).to.equal(checkIn4Block.timestamp);

      // fast forward to next day check in ()
      await network.provider.send("evm_setNextBlockTimestamp", [1750111200]); // 06-16-25
      await network.provider.send("evm_mine"); // Mine the next block
      
      // call check in
      await morningRoutine.connect(deployer).updateQualifications();

      // check token qualifications (1 and 2 and 4 are still in the game)
      expect(await morningRoutine.tokenIdToTokenQualified(0)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(2)).to.equal(true);
      expect(await morningRoutine.tokenIdToTokenQualified(3)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(4)).to.equal(true);
      expect(await morningRoutine.numQualified()).to.equal(3);

      // fast forward to next day check in ()
      await network.provider.send("evm_setNextBlockTimestamp", [1750197600]); // 06-17-25
      await network.provider.send("evm_mine"); // Mine the next block

      // fast forward to next day check in, everyone forgot to check in the previous day
      await network.provider.send("evm_setNextBlockTimestamp", [1750284000]); // 06-18-25
      await network.provider.send("evm_mine"); // Mine the next block
      // call check in -> winners found and it is player one, player two, and player three
      const lastUpdateTx = await morningRoutine.connect(deployer).updateQualifications();
      const lastUpdateReceipt = await lastUpdateTx.wait();
      const lastUpdateLog = lastUpdateReceipt.logs;
      expect(lastUpdateLog[1].fragment.name).to.equal("WinnerFound");
      expect(lastUpdateLog[1].args[0]).to.equal(playerOne.address);
      expect(lastUpdateLog[3].fragment.name).to.equal("WinnerFound");
      expect(lastUpdateLog[3].args[0]).to.equal(playerTwo.address);
      expect(lastUpdateLog[5].fragment.name).to.equal("WinnerFound");
      expect(lastUpdateLog[5].args[0]).to.equal(playerThree.address);

      expect(await morningRoutine.tokenIdToTokenQualified(0)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(1)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(2)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(3)).to.equal(false);
      expect(await morningRoutine.tokenIdToTokenQualified(4)).to.equal(false);
      expect(await morningRoutine.numQualified()).to.equal(0);

      // test that token IDs 1, 2, and 4 are marked as winners
      expect(await morningRoutine.tokenIdToIsWinner(0)).to.equal(false);
      expect(await morningRoutine.tokenIdToIsWinner(1)).to.equal(true);
      expect(await morningRoutine.tokenIdToIsWinner(2)).to.equal(true);
      expect(await morningRoutine.tokenIdToIsWinner(3)).to.equal(false);
      expect(await morningRoutine.tokenIdToIsWinner(4)).to.equal(true);

      // expect game is over to be true
      expect(await morningRoutine.gameIsOver()).to.equal(true);
      expect(await morningRoutine.numWinners()).to.equal(3);
      // non-winner cannot claim winner funds
      await expect(morningRoutine.connect(deployer).claimWinnerFunds())
        .to.be.reverted;
      // no more checking in
      await expect(morningRoutine.connect(playerOne).checkIn(1))
        .to.be.revertedWith("Token must be qualified")
      
      // winners are able to claim funds
      const initialBalancePlayerOneWallet = await ethers.provider.getBalance(playerOne.address);
      const withdrawWinningsTx = await morningRoutine.connect(playerOne).claimWinnerFunds();
      const receiptWinningWithdrawal = await withdrawWinningsTx.wait();
      const gasUsedWinningWithdrawal = receiptWinningWithdrawal.gasUsed * receiptWinningWithdrawal.gasPrice;    
      const finalBalancePlayerOneWallet = await ethers.provider.getBalance(playerOne.address);
      
      const expectedFinalBalancePlayerOneWallet = (initialBalancePlayerOneWallet + ethers.parseEther("0.00625")) - gasUsedWinningWithdrawal;
      expect(finalBalancePlayerOneWallet).to.be.closeTo(expectedFinalBalancePlayerOneWallet, ethers.parseEther("0.0001"));

      const initialBalancePlayerTwoWallet = await ethers.provider.getBalance(playerTwo.address);
      const withdrawWinnings2Tx = await morningRoutine.connect(playerTwo).claimWinnerFunds();
      const receiptWinning2Withdrawal = await withdrawWinnings2Tx.wait();
      const gasUsedWinning2Withdrawal = receiptWinning2Withdrawal.gasUsed * receiptWinning2Withdrawal.gasPrice;    
      const finalBalancePlayerTwoWallet = await ethers.provider.getBalance(playerTwo.address);
      
      const expectedFinalBalancePlayerTwoWallet = (initialBalancePlayerTwoWallet + ethers.parseEther("0.00625")) - gasUsedWinning2Withdrawal;
      expect(finalBalancePlayerTwoWallet).to.be.closeTo(expectedFinalBalancePlayerTwoWallet, ethers.parseEther("0.0001"));

      const initialBalancePlayerThreeWallet = await ethers.provider.getBalance(playerThree.address);
      const withdrawWinning32Tx = await morningRoutine.connect(playerThree).claimWinnerFunds();
      const receiptWinning3Withdrawal = await withdrawWinning32Tx.wait();
      const gasUsedWinning3Withdrawal = receiptWinning3Withdrawal.gasUsed * receiptWinning3Withdrawal.gasPrice;    
      const finalBalancePlayerThreeWallet = await ethers.provider.getBalance(playerThree.address);
      
      const expectedFinalBalancePlayerThreeWallet = (initialBalancePlayerThreeWallet + ethers.parseEther("0.00625")) - gasUsedWinning3Withdrawal;
      expect(finalBalancePlayerThreeWallet).to.be.closeTo(expectedFinalBalancePlayerThreeWallet, ethers.parseEther("0.0001"));
    });
  })
});
