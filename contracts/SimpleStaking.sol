// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleStaking is ReentrancyGuard, Ownable {
    
    struct UserDeposit {
        uint256 amount;
        uint256 depositTime;
        bool isActive;
    }
    
    mapping(address => UserDeposit) public userDeposits;
    uint256 public totalDeposits;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        userDeposit.amount += msg.value;
        userDeposit.depositTime = block.timestamp;
        userDeposit.isActive = true;
        
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.amount > 0, "No deposits found");
        require(userDeposit.isActive, "Deposit not active");
        
        uint256 amount = userDeposit.amount;
        userDeposit.amount = 0;
        userDeposit.isActive = false;
        totalDeposits -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    function getUserDeposit(address user) external view returns (uint256 amount, uint256 depositTime, bool isActive) {
        UserDeposit memory userDeposit = userDeposits[user];
        return (userDeposit.amount, userDeposit.depositTime, userDeposit.isActive);
    }
    
    function getTotalValue() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Owner can withdraw funds for yield farming
    function ownerWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
    }
}