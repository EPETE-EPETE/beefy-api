import BigNumber from 'bignumber.js';
import { ChainId } from '../../packages/address-book/src/address-book';
import { fetchContract } from '../api/rpc/client';
import BeefyVaultV6Abi from '../abis/BeefyVault';

export async function fetchMooPrices(
  pools: any[],
  tokenPrices: Record<string, number>,
  lpPrices: Record<string, number>
): Promise<Record<string, number>> {
  let moo: Record<string, number> = {};

  await fetchPpfs(pools);

  for (let i = 0; i < pools.length; i++) {
    const mooPrice = calcMooPrice(pools[i], tokenPrices, lpPrices);
    moo = { ...moo, ...mooPrice };
  }

  return moo;
}

const fetchPpfs = async (pools: any[]) => {
  const chainIds: ChainId[] = pools.map(p => p.chainId);
  const uniqueChainIds = [...new Set(chainIds)];

  for (let i = 0; i < uniqueChainIds.length; i++) {
    let filtered = pools.filter(p => p.chainId == uniqueChainIds[i]);

    const ppfsCalls = filtered.map(pool => {
      const contract = fetchContract(pool.address, BeefyVaultV6Abi, uniqueChainIds[i]);
      return contract.read.getPricePerFullShare();
    });

    try {
      const res = await Promise.all(ppfsCalls);
      const ppfss = res.map(v => new BigNumber(v.toString()));

      for (let i = 0; i < ppfss.length; i++) {
        filtered[i].ppfs = ppfss[i];
      }
    } catch (e) {
      console.error('fetchMooPrices', e);
      continue;
    }
  }
};

function calcMooPrice(
  pool: any,
  tokenPrices: Record<string, number>,
  lpPrices: Record<string, number>
): Record<string, number> {
  const price = pool.oracle == 'tokens' ? tokenPrices[pool.oracleId] : lpPrices[pool.oracleId];
  const mooPrice = pool.ppfs.times(price).dividedBy(pool.decimals);
  return { [pool.name]: mooPrice.toNumber() };
}
