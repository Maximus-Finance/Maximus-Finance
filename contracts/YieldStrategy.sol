// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Interfaces for BENQI protocols with live data fetching
interface IBenqiLST {
    function stake() external payable returns (uint256);
    function unstake(uint256 amount) external returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function getExchangeRate() external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

interface IBenqiComptroller {
    function enterMarkets(address[] calldata qiTokens) external returns (uint256[] memory);
    function exitMarket(address qiToken) external returns (uint256);
    function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256);
    function markets(address qiToken) external view returns (bool, uint256, bool);
    function oracle() external view returns (address);
    function getAllMarkets() external view returns (address[] memory);
}

interface IBenqiQiToken {
    function mint(uint256 mintAmount) external returns (uint256);
    function borrow(uint256 borrowAmount) external returns (uint256);
    function repayBorrow(uint256 repayAmount) external returns (uint256);
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function balanceOfUnderlying(address owner) external returns (uint256);
    function borrowBalanceCurrent(address account) external returns (uint256);
    function exchangeRateCurrent() external returns (uint256);
    function supplyRatePerSecond() external view returns (uint256);
    function borrowRatePerSecond() external view returns (uint256);
    function getCash() external view returns (uint256);
    function totalBorrows() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function totalReserves() external view returns (uint256);
    function reserveFactorMantissa() external view returns (uint256);
    function interestRateModel() external view returns (address);
}

interface IBenqiQiAvax {
    function mint() external payable;
    function borrow(uint256 borrowAmount) external returns (uint256);
    function repayBorrow() external payable;
    function redeemUnderlying(uint256 redeemAmount) external returns (uint256);
    function balanceOfUnderlying(address owner) external returns (uint256);
    function borrowBalanceCurrent(address account) external returns (uint256);
    function exchangeRateCurrent() external returns (uint256);
    function supplyRatePerSecond() external view returns (uint256);
    function borrowRatePerSecond() external view returns (uint256);
    function getCash() external view returns (uint256);
    function totalBorrows() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function totalReserves() external view returns (uint256);
    function reserveFactorMantissa() external view returns (uint256);
    function interestRateModel() external view returns (address);
}

interface IBenqiRewards {
    function claimReward(uint8 rewardType, address holder) external;
    function rewardAccrued(uint8 rewardType, address holder) external view returns (uint256);
    function supplyRewardSpeeds(uint8 rewardType, address qiToken) external view returns (uint256);
    function borrowRewardSpeeds(uint8 rewardType, address qiToken) external view returns (uint256);
    function rewardSupplyState(uint8 rewardType, address qiToken) external view returns (uint224, uint32);
    function rewardBorrowState(uint8 rewardType, address qiToken) external view returns (uint224, uint32);
}

interface IPriceOracle {
    function getUnderlyingPrice(address qiToken) external view returns (uint256);
}

interface IERC20Extended is IERC20 {
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
}

/**
 * @title LiveDataProvider
 * @dev Provides live market data from BENQI and other sources
 */
contract LiveDataProvider {
    
    // BENQI contract addresses (Avalanche mainnet)
    IBenqiLST public constant SAVAX = IBenqiLST(0x2B2c81e08F1Af8835ab6492A2bbDaD4Ef17F9d27);
    IBenqiComptroller public constant COMPTROLLER = IBenqiComptroller(0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4);
    IBenqiQiToken public constant QI_SAVAX = IBenqiQiToken(0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c);
    IBenqiQiAvax public constant QI_AVAX = IBenqiQiAvax(0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c);
    IBenqiRewards public constant REWARDS = IBenqiRewards(0xD2307793e7f5D8b5E44c3a04fd1B4D42142E4238);
    IERC20Extended public constant QI_TOKEN = IERC20Extended(0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5);
    
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    uint256 public constant MANTISSA = 1e18;
    
    struct MarketData {
        uint256 supplyAPY;
        uint256 borrowAPY;
        uint256 supplyRewardAPY;
        uint256 borrowRewardAPY;
        uint256 collateralFactor;
        uint256 totalSupply;
        uint256 totalBorrows;
        uint256 exchangeRate;
        uint256 cash;
        uint256 reserves;
    }
    
    struct RewardData {
        uint256 qiSupplySpeed;
        uint256 qiBorrowSpeed;
        uint256 avaxSupplySpeed;
        uint256 avaxBorrowSpeed;
        uint256 qiPrice;
        uint256 avaxPrice;
    }
    
    /**
     * @dev Get live market data for sAVAX market
     */
    function getSAvaxMarketData() external returns (MarketData memory) {
        // Get supply and borrow rates
        uint256 supplyRatePerSecond = QI_SAVAX.supplyRatePerSecond();
        uint256 borrowRatePerSecond = QI_SAVAX.borrowRatePerSecond();
        
        // Convert to APY (compound interest)
        uint256 supplyAPY = _calculateAPYFromRate(supplyRatePerSecond);
        uint256 borrowAPY = _calculateAPYFromRate(borrowRatePerSecond);
        
        // Get collateral factor
        (, uint256 collateralFactor,) = COMPTROLLER.markets(address(QI_SAVAX));
        
        // Get reward APYs
        RewardData memory rewards = _getRewardData();
        uint256 supplyRewardAPY = _calculateSupplyRewardAPY(rewards);
        uint256 borrowRewardAPY = _calculateBorrowRewardAPY(rewards);
        
        return MarketData({
            supplyAPY: supplyAPY,
            borrowAPY: borrowAPY,
            supplyRewardAPY: supplyRewardAPY,
            borrowRewardAPY: borrowRewardAPY,
            collateralFactor: collateralFactor,
            totalSupply: QI_SAVAX.totalSupply(),
            totalBorrows: QI_SAVAX.totalBorrows(),
            exchangeRate: QI_SAVAX.exchangeRateCurrent(),
            cash: QI_SAVAX.getCash(),
            reserves: QI_SAVAX.totalReserves()
        });
    }
    
    /**
     * @dev Get sAVAX staking APY from liquid staking
     */
    function getSAvaxStakingAPY() external pure returns (uint256) {
        // This would integrate with BENQI's sAVAX staking rewards
        // For now, we calculate based on AVAX staking rewards and validator commission
        
        // In a real implementation, you'd track rate changes over time
        // For now, return estimated APY based on Avalanche validator rewards (~9-11%)
        // minus BENQI's fee (~1-2%)
        return 850; // 8.5% in basis points (8500/10000)
    }
    
    /**
     * @dev Get current optimal strategy parameters
     */
    function getOptimalParameters() external returns (uint256 maxLoops, uint256 targetLTV, uint256 safetyBuffer) {
        MarketData memory market = this.getSAvaxMarketData();
        
        // Calculate optimal LTV based on current rates
        uint256 netBorrowRate = market.borrowAPY > market.borrowRewardAPY ? 
            market.borrowAPY - market.borrowRewardAPY : 0;
        
        uint256 netSupplyRate = market.supplyAPY + market.supplyRewardAPY;
        
        // Optimal LTV where marginal benefit equals marginal cost
        uint256 optimalLTV = (netSupplyRate * 8000) / (netSupplyRate + netBorrowRate); // Max 80%
        
        // Safety buffer based on volatility (5-10%)
        uint256 volatilityBuffer = 500; // 5%
        uint256 safeLTV = optimalLTV > volatilityBuffer ? optimalLTV - volatilityBuffer : optimalLTV;
        
        // Calculate optimal number of loops
        uint256 loops = 8; // Default max
        if (netSupplyRate <= netBorrowRate) {
            loops = 1; // No looping if not profitable
        }
        
        return (loops, safeLTV, volatilityBuffer);
    }
    
    /**
     * @dev Calculate APY from per-second rate
     */
    function _calculateAPYFromRate(uint256 ratePerSecond) internal pure returns (uint256) {
        if (ratePerSecond == 0) return 0;
        
        // APY = (1 + rate)^seconds_per_year - 1
        // Approximation for small rates: APY ≈ rate * seconds_per_year
        uint256 annualRate = ratePerSecond * SECONDS_PER_YEAR;
        
        // Convert to percentage (basis points)
        return (annualRate * 10000) / MANTISSA;
    }
    
    /**
     * @dev Get reward speeds and prices
     */
    function _getRewardData() internal view returns (RewardData memory) {
        // Get QI reward speeds
        uint256 qiSupplySpeed = REWARDS.supplyRewardSpeeds(0, address(QI_SAVAX));
        uint256 qiBorrowSpeed = REWARDS.borrowRewardSpeeds(0, address(QI_SAVAX));
        
        // Get AVAX reward speeds
        uint256 avaxSupplySpeed = REWARDS.supplyRewardSpeeds(1, address(QI_SAVAX));
        uint256 avaxBorrowSpeed = REWARDS.borrowRewardSpeeds(1, address(QI_SAVAX));
        
        // Get prices from oracle
        IPriceOracle oracle = IPriceOracle(COMPTROLLER.oracle());
        uint256 qiPrice = oracle.getUnderlyingPrice(address(QI_TOKEN));
        uint256 avaxPrice = oracle.getUnderlyingPrice(address(QI_AVAX));
        
        return RewardData({
            qiSupplySpeed: qiSupplySpeed,
            qiBorrowSpeed: qiBorrowSpeed,
            avaxSupplySpeed: avaxSupplySpeed,
            avaxBorrowSpeed: avaxBorrowSpeed,
            qiPrice: qiPrice,
            avaxPrice: avaxPrice
        });
    }
    
    /**
     * @dev Calculate supply reward APY
     */
    function _calculateSupplyRewardAPY(RewardData memory rewards) internal view returns (uint256) {
        uint256 totalSupply = QI_SAVAX.totalSupply();
        if (totalSupply == 0) return 0;
        
        // QI rewards APY
        uint256 qiRewardsPerYear = rewards.qiSupplySpeed * SECONDS_PER_YEAR;
        uint256 qiRewardValue = (qiRewardsPerYear * rewards.qiPrice) / MANTISSA;
        uint256 qiSupplyAPY = (qiRewardValue * 10000) / (totalSupply * rewards.avaxPrice / MANTISSA);
        
        // AVAX rewards APY
        uint256 avaxRewardsPerYear = rewards.avaxSupplySpeed * SECONDS_PER_YEAR;
        uint256 avaxSupplyAPY = (avaxRewardsPerYear * 10000) / totalSupply;
        
        return qiSupplyAPY + avaxSupplyAPY;
    }
    
    /**
     * @dev Calculate borrow reward APY
     */
    function _calculateBorrowRewardAPY(RewardData memory rewards) internal view returns (uint256) {
        uint256 totalBorrows = QI_SAVAX.totalBorrows();
        if (totalBorrows == 0) return 0;
        
        // QI rewards APY
        uint256 qiRewardsPerYear = rewards.qiBorrowSpeed * SECONDS_PER_YEAR;
        uint256 qiRewardValue = (qiRewardsPerYear * rewards.qiPrice) / MANTISSA;
        uint256 qiBorrowAPY = (qiRewardValue * 10000) / (totalBorrows * rewards.avaxPrice / MANTISSA);
        
        // AVAX rewards APY
        uint256 avaxRewardsPerYear = rewards.avaxBorrowSpeed * SECONDS_PER_YEAR;
        uint256 avaxBorrowAPY = (avaxRewardsPerYear * 10000) / totalBorrows;
        
        return qiBorrowAPY + avaxBorrowAPY;
    }
}

/**
 * @title YieldOptimizationVault
 * @dev Main vault contract with live data integration
 */
contract YieldOptimizationVault is ReentrancyGuard, Ownable, Pausable {
    
    struct UserDeposit {
        uint256 amount;
        uint256 shares;
        uint256 depositTime;
        bool isActive;
    }
    
    struct StrategyParams {
        uint256 maxLoops;
        uint256 targetLTV;
        uint256 safetyBuffer;
        uint256 minLoopAmount;
        uint256 rebalanceThreshold;
    }
    
    struct PositionData {
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 netPosition;
        uint256 healthFactor;
        uint256 currentLTV;
    }
    
    // State variables
    mapping(address => UserDeposit) public userDeposits;
    mapping(address => uint256) public userShares;
    
    uint256 public totalDeposits;
    uint256 public totalShares;
    uint256 public lastHarvest;
    uint256 public lastRebalance;
    
    // Contracts
    LiveDataProvider public immutable dataProvider;
    IBenqiLST public constant SAVAX = IBenqiLST(0x2B2c81e08F1Af8835ab6492A2bbDaD4Ef17F9d27);
    IBenqiComptroller public constant COMPTROLLER = IBenqiComptroller(0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4);
    IBenqiQiToken public constant QI_SAVAX = IBenqiQiToken(0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c);
    IBenqiQiAvax public constant QI_AVAX = IBenqiQiAvax(0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c);
    IBenqiRewards public constant REWARDS = IBenqiRewards(0xD2307793e7f5D8b5E44c3a04fd1B4D42142E4238);
    
    StrategyParams public strategyParams;
    
    
    // Events
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event StrategyExecuted(uint256 loops, uint256 totalSupply, uint256 totalBorrow, uint256 apy);
    event RewardsHarvested(uint256 qiAmount, uint256 avaxAmount);
    event PositionRebalanced(uint256 newLTV, uint256 healthFactor);
    event ParametersUpdated(uint256 maxLoops, uint256 targetLTV, uint256 safetyBuffer);
    
    constructor(address _dataProvider) Ownable(msg.sender) {
        dataProvider = LiveDataProvider(_dataProvider);
        
        // Initialize with dynamic parameters
        (uint256 maxLoops, uint256 targetLTV, uint256 safetyBuffer) = dataProvider.getOptimalParameters();
        
        strategyParams = StrategyParams({
            maxLoops: maxLoops,
            targetLTV: targetLTV,
            safetyBuffer: safetyBuffer,
            minLoopAmount: 1e17, // 0.1 AVAX
            rebalanceThreshold: 500 // 5% deviation triggers rebalance
        });
        
        // Enter markets
        address[] memory markets = new address[](2);
        markets[0] = address(QI_SAVAX);
        markets[1] = address(QI_AVAX);
        COMPTROLLER.enterMarkets(markets);
    }
    
    /**
     * @dev Deposit AVAX and execute yield optimization strategy with live parameters
     */
    function deposit() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");
        
        // Update strategy parameters based on current market conditions
        _updateStrategyParameters();
        
        uint256 depositAmount = msg.value;
        uint256 shares = calculateShares(depositAmount);
        
        // Update user deposit info
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        userDeposit.amount += depositAmount;
        userDeposit.shares += shares;
        userDeposit.depositTime = block.timestamp;
        userDeposit.isActive = true;
        
        userShares[msg.sender] += shares;
        totalDeposits += depositAmount;
        totalShares += shares;
        
        // Execute strategy with live data
        _executeStrategy(depositAmount);
        
        emit Deposit(msg.sender, depositAmount, shares);
    }
    
    /**
     * @dev Execute the looping strategy with live market data
     */
    function _executeStrategy(uint256 initialAmount) internal returns (uint256) {
        LiveDataProvider.MarketData memory marketData = dataProvider.getSAvaxMarketData();
        
        uint256 currentAmount = initialAmount;
        uint256 totalSupplied = 0;
        uint256 totalBorrowed = 0;
        uint256 loops = 0;
        
        // Convert AVAX to sAVAX
        uint256 sAvaxAmount = SAVAX.stake{value: currentAmount}();
        currentAmount = sAvaxAmount;
        
        while (loops < strategyParams.maxLoops && currentAmount >= strategyParams.minLoopAmount) {
            // Supply sAVAX as collateral
            require(SAVAX.transfer(address(QI_SAVAX), currentAmount), "Transfer failed");
            require(QI_SAVAX.mint(currentAmount) == 0, "Mint failed");
            totalSupplied += currentAmount;
            
            // Check if borrowing is still profitable
            uint256 netBorrowCost = marketData.borrowAPY > marketData.borrowRewardAPY ? 
                marketData.borrowAPY - marketData.borrowRewardAPY : 0;
            uint256 netSupplyEarn = marketData.supplyAPY + marketData.supplyRewardAPY;
            
            if (netBorrowCost >= netSupplyEarn) {
                break; // Stop looping if not profitable
            }
            
            // Calculate safe borrow amount
            uint256 borrowAmount = (currentAmount * strategyParams.targetLTV) / 10000;
            
            // Verify we're within safe collateral limits
            (, uint256 liquidity,) = COMPTROLLER.getAccountLiquidity(address(this));
            require(liquidity > 0, "Insufficient liquidity");
            
            // Borrow AVAX
            require(QI_AVAX.borrow(borrowAmount) == 0, "Borrow failed");
            totalBorrowed += borrowAmount;
            
            // Convert borrowed AVAX to sAVAX for next loop
            if (borrowAmount >= strategyParams.minLoopAmount) {
                uint256 newSAvax = SAVAX.stake{value: borrowAmount}();
                currentAmount = newSAvax;
            } else {
                break;
            }
            
            loops++;
        }
        
        // Calculate achieved APY based on live data
        uint256 achievedAPY = _calculateCurrentAPY(totalSupplied, totalBorrowed, marketData);
        
        emit StrategyExecuted(loops, totalSupplied, totalBorrowed, achievedAPY);
        
        return achievedAPY;
    }
    
    /**
     * @dev Update strategy parameters based on current market conditions
     */
    function _updateStrategyParameters() internal {
        (uint256 maxLoops, uint256 targetLTV, uint256 safetyBuffer) = dataProvider.getOptimalParameters();
        
        // Only update if significantly different to avoid gas waste
        if (
            _abs(int256(strategyParams.maxLoops) - int256(maxLoops)) > 1 ||
            _abs(int256(strategyParams.targetLTV) - int256(targetLTV)) > strategyParams.rebalanceThreshold ||
            _abs(int256(strategyParams.safetyBuffer) - int256(safetyBuffer)) > 100
        ) {
            strategyParams.maxLoops = maxLoops;
            strategyParams.targetLTV = targetLTV;
            strategyParams.safetyBuffer = safetyBuffer;
            
            emit ParametersUpdated(maxLoops, targetLTV, safetyBuffer);
        }
    }
    
    /**
     * @dev Calculate current APY based on live market data
     */
    function _calculateCurrentAPY(
        uint256 totalSupplied, 
        uint256 totalBorrowed, 
        LiveDataProvider.MarketData memory marketData
    ) internal view returns (uint256) {
        if (totalSupplied == 0) return 0;
        
        // Get sAVAX staking APY
        uint256 sAvaxStakingAPY = dataProvider.getSAvaxStakingAPY();
        
        // Calculate earnings
        uint256 stakingEarnings = (totalSupplied * sAvaxStakingAPY) / 10000;
        uint256 supplyRewards = (totalSupplied * marketData.supplyRewardAPY) / 10000;
        uint256 borrowRewards = (totalBorrowed * marketData.borrowRewardAPY) / 10000;
        
        // Calculate costs
        uint256 borrowCosts = (totalBorrowed * marketData.borrowAPY) / 10000;
        
        // Net APY
        uint256 netEarnings = stakingEarnings + supplyRewards + borrowRewards;
        if (netEarnings > borrowCosts) {
            return ((netEarnings - borrowCosts) * 10000) / (totalSupplied - totalBorrowed);
        }
        
        return 0;
    }
    
    /**
     * @dev Get current position data with live calculations
     */
    function getCurrentPosition() external returns (PositionData memory) {
        uint256 totalSupplied = QI_SAVAX.balanceOfUnderlying(address(this));
        uint256 totalBorrowed = QI_AVAX.borrowBalanceCurrent(address(this));
        uint256 netPosition = totalSupplied > totalBorrowed ? totalSupplied - totalBorrowed : 0;
        
        // Calculate health factor
        (, uint256 liquidity, uint256 shortfall) = COMPTROLLER.getAccountLiquidity(address(this));
        uint256 healthFactor = shortfall > 0 ? 0 : (liquidity * 10000) / totalBorrowed;
        
        // Calculate current LTV
        uint256 currentLTV = totalSupplied > 0 ? (totalBorrowed * 10000) / totalSupplied : 0;
        
        return PositionData({
            totalSupplied: totalSupplied,
            totalBorrowed: totalBorrowed,
            netPosition: netPosition,
            healthFactor: healthFactor,
            currentLTV: currentLTV
        });
    }
    
    /**
     * @dev Get live APY calculation
     */
    function getCurrentAPY() external returns (uint256) {
        PositionData memory position = this.getCurrentPosition();
        LiveDataProvider.MarketData memory marketData = dataProvider.getSAvaxMarketData();
        
        return _calculateCurrentAPY(position.totalSupplied, position.totalBorrowed, marketData);
    }
    
    /**
     * @dev Rebalance position if needed
     */
    function rebalancePosition() external {
        PositionData memory position = this.getCurrentPosition();
        
        // Check if rebalancing is needed
        uint256 targetLTV = strategyParams.targetLTV;
        uint256 currentLTV = position.currentLTV;
        uint256 deviation = _abs(int256(currentLTV) - int256(targetLTV));
        
        require(deviation > strategyParams.rebalanceThreshold, "Rebalancing not needed");
        require(position.healthFactor > 1000, "Position too risky"); // > 10% safety margin
        
        if (currentLTV > targetLTV) {
            // Reduce leverage by repaying debt
            uint256 excessBorrow = (position.totalBorrowed * (currentLTV - targetLTV)) / 10000;
            _repayDebt(excessBorrow);
        } else {
            // Increase leverage by borrowing more
            uint256 additionalBorrow = (position.totalSupplied * (targetLTV - currentLTV)) / 10000;
            _increaseLeverage(additionalBorrow);
        }
        
        lastRebalance = block.timestamp;
        emit PositionRebalanced(targetLTV, position.healthFactor);
    }
    
    /**
     * @dev Harvest rewards with live data
     */
    function harvestRewards() external {
        // Get pending rewards
        uint256 qiRewards = REWARDS.rewardAccrued(0, address(this));
        uint256 avaxRewards = REWARDS.rewardAccrued(1, address(this));
        
        // Claim rewards
        if (qiRewards > 0) {
            REWARDS.claimReward(0, address(this));
        }
        if (avaxRewards > 0) {
            REWARDS.claimReward(1, address(this));
        }
        
        // Auto-compound rewards back into strategy
        if (address(this).balance > 0) {
            uint256 compoundAmount = address(this).balance;
            uint256 sAvaxAmount = SAVAX.stake{value: compoundAmount}();
            
            // Supply compounded sAVAX
            SAVAX.transfer(address(QI_SAVAX), sAvaxAmount);
            QI_SAVAX.mint(sAvaxAmount);
        }
        
        lastHarvest = block.timestamp;
        emit RewardsHarvested(qiRewards, avaxRewards);
    }
    
    /**
     * @dev Helper function to calculate absolute difference
     */
    function _abs(int256 x) internal pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }
    
    /**
     * @dev Repay debt to reduce leverage
     */
    function _repayDebt(uint256 amount) internal {
        uint256 availableLiquidity = address(this).balance;
        if (availableLiquidity < amount) {
            // Redeem some sAVAX to get AVAX for repayment
            uint256 redeemAmount = amount - availableLiquidity;
            QI_SAVAX.redeemUnderlying(redeemAmount);
            
            // Unstake sAVAX to AVAX
            uint256 sAvaxBalance = SAVAX.balanceOf(address(this));
            SAVAX.unstake(sAvaxBalance);
            availableLiquidity = address(this).balance;
        }
        
        uint256 repayAmount = availableLiquidity < amount ? availableLiquidity : amount;
        QI_AVAX.repayBorrow{value: repayAmount}();
    }
    
    /**
     * @dev Increase leverage by borrowing more
     */
    function _increaseLeverage(uint256 amount) internal {
        // Check available liquidity
        (, uint256 liquidity,) = COMPTROLLER.getAccountLiquidity(address(this));
        require(liquidity > 0, "No liquidity available");
        
        uint256 borrowAmount = liquidity < amount ? liquidity : amount;
        
        // Borrow AVAX
        require(QI_AVAX.borrow(borrowAmount) == 0, "Borrow failed");
        
        // Convert to sAVAX and supply
        uint256 sAvaxAmount = SAVAX.stake{value: borrowAmount}();
        SAVAX.transfer(address(QI_SAVAX), sAvaxAmount);
        QI_SAVAX.mint(sAvaxAmount);
    }
    
    // Keep existing functions (withdraw, calculateShares, etc.) with minimal changes
    function withdraw(uint256 shares) external nonReentrant {
        require(shares > 0, "Shares must be greater than 0");
        require(userShares[msg.sender] >= shares, "Insufficient shares");
        
        uint256 withdrawAmount = calculateWithdrawAmount(shares);
        
        userShares[msg.sender] -= shares;
        totalShares -= shares;
        
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        userDeposit.shares -= shares;
        if (userDeposit.shares == 0) {
            userDeposit.isActive = false;
        }
        
        _unwindStrategy(withdrawAmount);
        
        (bool success, ) = msg.sender.call{value: withdrawAmount}("");
        require(success, "Transfer failed");
        
        emit Withdraw(msg.sender, withdrawAmount, shares);
    }
    
    function _unwindStrategy(uint256 withdrawAmount) internal {
        uint256 totalValue = getTotalValue();
        uint256 unwindRatio = (withdrawAmount * 1e18) / totalValue;
        
        uint256 currentBorrow = QI_AVAX.borrowBalanceCurrent(address(this));
        uint256 repayAmount = (currentBorrow * unwindRatio) / 1e18;
        
        if (repayAmount > 0) {
            uint256 redeemAmount = (repayAmount * 11000) / 10000; // Add 10% buffer
            QI_SAVAX.redeemUnderlying(redeemAmount);
            
            SAVAX.unstake(redeemAmount);
            QI_AVAX.repayBorrow{value: repayAmount}();
        }
    }
    
    function calculateShares(uint256 amount) public view returns (uint256) {
        if (totalShares == 0) {
            return amount;
        }
        return (amount * totalShares) / totalDeposits;
    }
    
    function calculateWithdrawAmount(uint256 shares) public returns (uint256) {
        uint256 totalValue = getTotalValue();
        return (shares * totalValue) / totalShares;
    }
    
    function getTotalValue() public returns (uint256) {
        uint256 suppliedValue = QI_SAVAX.balanceOfUnderlying(address(this));
        uint256 borrowedValue = QI_AVAX.borrowBalanceCurrent(address(this));
        
        return suppliedValue > borrowedValue ? suppliedValue - borrowedValue : 0;
    }
    
    function getUserDeposit(address user) external view returns (UserDeposit memory) {
        return userDeposits[user];
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    receive() external payable {}
}

/**
 * @title YieldOptimizationFactory
 * @dev Factory contract with live data integration
 */
contract YieldOptimizationFactory is Ownable {
    
    struct VaultInfo {
        address vault;
        string strategyName;
        string asset;
        uint256 tvl;
        uint256 apy;
        bool isActive;
        uint256 createdAt;
    }
    
    VaultInfo[] public vaults;
    mapping(address => bool) public isValidVault;
    LiveDataProvider public immutable dataProvider;
    
    event VaultCreated(address indexed vault, string strategyName, string asset);
    event VaultUpdated(address indexed vault, uint256 tvl, uint256 apy);
    
    constructor() Ownable(msg.sender) {
        // Deploy data provider
        dataProvider = new LiveDataProvider();
    }
    
    function createVault(
        string memory strategyName,
        string memory asset
    ) external onlyOwner returns (address) {
        YieldOptimizationVault newVault = new YieldOptimizationVault(address(dataProvider));
        
        VaultInfo memory vaultInfo = VaultInfo({
            vault: address(newVault),
            strategyName: strategyName,
            asset: asset,
            tvl: 0,
            apy: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        vaults.push(vaultInfo);
        isValidVault[address(newVault)] = true;
        
        emit VaultCreated(address(newVault), strategyName, asset);
        
        return address(newVault);
    }
    
    function updateAllVaultMetrics() external {
        for (uint256 i = 0; i < vaults.length; i++) {
            if (vaults[i].isActive) {
                _updateVaultMetrics(i);
            }
        }
    }
    
    function _updateVaultMetrics(uint256 vaultIndex) internal {
        VaultInfo storage vault = vaults[vaultIndex];
        YieldOptimizationVault vaultContract = YieldOptimizationVault(payable(vault.vault));
        
        // Get live TVL
        uint256 tvl = vaultContract.getTotalValue();
        
        // Get live APY
        uint256 apy = vaultContract.getCurrentAPY();
        
        vault.tvl = tvl;
        vault.apy = apy;
        
        emit VaultUpdated(vault.vault, tvl, apy);
    }
    
    function getAllVaults() external view returns (VaultInfo[] memory) {
        return vaults;
    }
    
    function getVaultCount() external view returns (uint256) {
        return vaults.length;
    }
    
    function getActiveVaults() external view returns (VaultInfo[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < vaults.length; i++) {
            if (vaults[i].isActive) {
                activeCount++;
            }
        }
        
        VaultInfo[] memory activeVaults = new VaultInfo[](activeCount);
        uint256 activeIndex = 0;
        
        for (uint256 i = 0; i < vaults.length; i++) {
            if (vaults[i].isActive) {
                activeVaults[activeIndex] = vaults[i];
                activeIndex++;
            }
        }
        
        return activeVaults;
    }
}

/**
 * @title LiveAPYCalculator
 * @dev Standalone calculator for live APY calculations
 */
contract LiveAPYCalculator {
    
    LiveDataProvider public immutable dataProvider;
    
    struct LoopingResult {
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 leverage;
        uint256 netAPY;
        uint256 grossEarnings;
        uint256 borrowCosts;
        uint256 netEarnings;
    }
    
    constructor(address _dataProvider) {
        dataProvider = LiveDataProvider(_dataProvider);
    }
    
    /**
     * @dev Calculate looping strategy results with live data
     */
    function calculateLoopingStrategy(
        uint256 initialAmount,
        uint256 maxLoops,
        uint256 targetLTV
    ) external returns (LoopingResult memory) {
        
        LiveDataProvider.MarketData memory marketData = dataProvider.getSAvaxMarketData();
        uint256 sAvaxAPY = dataProvider.getSAvaxStakingAPY();
        
        uint256 totalSupplied = initialAmount;
        uint256 totalBorrowed = 0;
        uint256 currentAmount = initialAmount;
        
        // Simulate looping
        for (uint256 i = 0; i < maxLoops; i++) {
            uint256 borrowAmount = (currentAmount * targetLTV) / 10000;
            
            // Check if still profitable
            uint256 netBorrowCost = marketData.borrowAPY > marketData.borrowRewardAPY ? 
                marketData.borrowAPY - marketData.borrowRewardAPY : 0;
            uint256 netSupplyEarn = sAvaxAPY + marketData.supplyRewardAPY;
            
            if (netBorrowCost >= netSupplyEarn || borrowAmount < 1e17) {
                break;
            }
            
            totalBorrowed += borrowAmount;
            if (i < maxLoops - 1) {
                totalSupplied += borrowAmount;
                currentAmount = borrowAmount;
            }
        }
        
        uint256 leverage = totalSupplied * 10000 / initialAmount;
        
        // Calculate earnings and costs
        uint256 stakingEarnings = (totalSupplied * sAvaxAPY) / 10000;
        uint256 supplyRewards = (totalSupplied * marketData.supplyRewardAPY) / 10000;
        uint256 borrowRewards = (totalBorrowed * marketData.borrowRewardAPY) / 10000;
        uint256 grossEarnings = stakingEarnings + supplyRewards + borrowRewards;
        
        uint256 borrowCosts = (totalBorrowed * marketData.borrowAPY) / 10000;
        
        uint256 netEarnings = grossEarnings > borrowCosts ? grossEarnings - borrowCosts : 0;
        uint256 netAPY = (netEarnings * 10000) / initialAmount;
        
        return LoopingResult({
            totalSupplied: totalSupplied,
            totalBorrowed: totalBorrowed,
            leverage: leverage,
            netAPY: netAPY,
            grossEarnings: grossEarnings,
            borrowCosts: borrowCosts,
            netEarnings: netEarnings
        });
    }
    
    /**
     * @dev Get optimal strategy parameters based on current market conditions
     */
    function getOptimalStrategy(uint256 initialAmount) external returns (
        uint256 optimalLoops,
        uint256 optimalLTV,
        uint256 maxAPY
    ) {
        uint256 bestAPY = 0;
        uint256 bestLoops = 1;
        uint256 bestLTV = 5000; // 50%
        
        // Test different combinations
        for (uint256 loops = 1; loops <= 10; loops++) {
            for (uint256 ltv = 5000; ltv <= 8000; ltv += 500) { // 50% to 80% in 5% steps
                LoopingResult memory result = this.calculateLoopingStrategy(initialAmount, loops, ltv);
                
                if (result.netAPY > bestAPY) {
                    bestAPY = result.netAPY;
                    bestLoops = loops;
                    bestLTV = ltv;
                }
            }
        }
        
        return (bestLoops, bestLTV, bestAPY);
    }
    
    /**
     * @dev Get current market conditions summary
     */
    function getMarketSummary() external returns (
        uint256 sAvaxStakingAPY,
        uint256 supplyAPY,
        uint256 borrowAPY,
        uint256 supplyRewardAPY,
        uint256 borrowRewardAPY,
        uint256 collateralFactor,
        uint256 utilization
    ) {
        LiveDataProvider.MarketData memory marketData = dataProvider.getSAvaxMarketData();
        uint256 stakingAPY = dataProvider.getSAvaxStakingAPY();
        
        uint256 totalSupply = marketData.totalSupply;
        uint256 totalBorrows = marketData.totalBorrows;
        uint256 utilizationRate = totalSupply > 0 ? (totalBorrows * 10000) / totalSupply : 0;
        
        return (
            stakingAPY,
            marketData.supplyAPY,
            marketData.borrowAPY,
            marketData.supplyRewardAPY,
            marketData.borrowRewardAPY,
            marketData.collateralFactor,
            utilizationRate
        );
    }
    
    /**
     * @dev Simulate different scenarios
     */
    function simulateScenarios(uint256 initialAmount) external returns (
        LoopingResult memory conservative,
        LoopingResult memory balanced,
        LoopingResult memory aggressive
    ) {
        // Conservative: Lower leverage, fewer loops
        conservative = this.calculateLoopingStrategy(initialAmount, 4, 6000); // 60% LTV
        
        // Balanced: Medium leverage
        balanced = this.calculateLoopingStrategy(initialAmount, 6, 7000); // 70% LTV
        
        // Aggressive: Higher leverage, more loops
        aggressive = this.calculateLoopingStrategy(initialAmount, 8, 7500); // 75% LTV
        
        return (conservative, balanced, aggressive);
    }
}