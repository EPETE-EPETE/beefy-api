import { addressBook } from '../../../packages/address-book/address-book';

const configsByChain: Record<string, Config> = {};

interface Config {
  devMultisig: string;
  treasuryMultisig: string;
  strategyOwner: string;
  vaultOwner: string;
  keeper: string;
  treasurer: string;
  launchpoolOwner: string;
  rewardPool: string;
  treasury: string;
  beefyFeeRecipient: string;
  bifiMaxiStrategy: string;
  voter: string;
  beefyFeeConfig: string;
  multicall: string;
  vaultFactory: string;
  wrapperFactory: string;
  zap: string;
  zapTokenManager: string;
  treasurySwapper: string;
  clmFactory: string;
  clmStrategyFactory: string;
  clmRewardPoolFactory: string;
  beefySwapper: string;
  beefyOracle: string;
  beefyOracleChainlink: string;
  beefyOracleChainlinkEthBase: string;
  beefyOracleUniswapV3: string;
  beefyOracleSolidly: string;
}

export const initConfigService = () => {
  Object.keys(addressBook).forEach(chain => {
    const config = addressBook[chain].platforms.beefyfinance;
    // Prune ab fields
    configsByChain[chain] = {
      devMultisig: config.devMultisig,
      treasuryMultisig: config.treasuryMultisig,
      strategyOwner: config.strategyOwner,
      vaultOwner: config.vaultOwner,
      keeper: config.keeper,
      treasurer: config.treasurer,
      launchpoolOwner: config.launchpoolOwner,
      rewardPool: config.rewardPool,
      treasury: config.treasury,
      beefyFeeRecipient: config.beefyFeeRecipient,
      bifiMaxiStrategy: config.bifiMaxiStrategy,
      voter: config.voter,
      beefyFeeConfig: config.beefyFeeConfig,
      multicall: config.multicall,
      vaultFactory: config.vaultFactory,
      wrapperFactory: config.wrapperFactory,
      zap: config.zap,
      zapTokenManager: config.zapTokenManager,
      treasurySwapper: config.treasurySwapper,
      clmFactory: config.clmFactory,
      clmStrategyFactory: config.clmStrategyFactory,
      clmRewardPoolFactory: config.clmRewardPoolFactory,
      beefySwapper: config.beefySwapper,
      beefyOracle: config.beefyOracle,
      beefyOracleChainlink: config.beefyOracleChainlink,
      beefyOracleChainlinkEthBase: config.beefyOracleChainlinkEthBase,
      beefyOracleUniswapV3: config.beefyOracleUniswapV3,
      beefyOracleSolidly: config.beefyOracleSolidly,
    };
  });

  console.log('> Configs initialized');
};

export const getAllConfigs = () => {
  return configsByChain;
};

export const getSingleChainConfig = (chain: string) => {
  return configsByChain[chain] ?? {};
};
