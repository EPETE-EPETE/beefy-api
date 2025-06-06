import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import { balancerAvaxClient as client } from '../../../apollo/client';
const { getBalancerApys } = require('../common/balancer/getBalancerApys');
import { addressBook } from '../../../../packages/address-book/src/address-book';

const {
  avax: {
    platforms: { balancer },
  },
} = addressBook;

const balancerPools = require('../../../data/avax/balancerLpPools.json');
const balancerV3Pools = require('../../../data/avax/balancerV3Pools.json');
const pools = [...balancerPools, ...balancerV3Pools];

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';

const getBalancerAvaxApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

module.exports = getBalancerAvaxApys;
