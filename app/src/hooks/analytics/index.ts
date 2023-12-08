/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import { head } from 'lodash';
import { useGQLContext } from '../../contexts/graphql';

const HIGHEST_VOLUME_QUERY = gql`
  query GetTokenDayData($date: Int!) {
    tokenDayDatas(orderBy: dailyVolumeToken, orderDirection: desc, where: { date_gte: $date }) {
      token {
        name
        id
        symbol
      }
    }
  }
`;

const TRANSACTION_COUNT_QUERY = gql`
  query GetTokenDayData($date: Int!) {
    tokenDayDatas(orderBy: dailyTxns, orderDirection: desc, where: { date_gte: $date }) {
      token {
        name
        id
        symbol
      }
    }
  }
`;

const OVERVIEW_CHART_DATA = gql`
  query GetQuasarDayData($date: Int!) {
    quasarDayDatas(where: { date_gte: $date }) {
      txCount
      date
      totalLiquidityUSD
      totalVolumeUSD
    }
  }
`;

const PAIRS_QUERY = gql`
  {
    pairs(orderBy: txCount, orderDirection: desc) {
      token0 {
        name
        id
        symbol
      }
      token1 {
        name
        id
        symbol
      }
    }
  }
`;

const TOKENS_QUERY = gql`
  {
    tokens(orderBy: txCount, orderDirection: desc) {
      id
      name
      symbol
    }
  }
`;

const SINGLE_PAIR_QUERY = gql`
  query GetSinglePair($id: ID!) {
    pair(id: $id) {
      id
      token0Price
      token1Price
      volumeToken0
      volumeToken1
      volumeUSD
      txCount
      token0 {
        id
        name
        symbol
      }
      token1 {
        id
        name
        symbol
      }
      mints {
        id
        timestamp
        to
        amountUSD
        amount0
        amount1
        transaction {
          id
        }
        pair {
          token0 {
            id
            name
            symbol
          }
          token1 {
            id
            name
            symbol
          }
        }
      }
      burns {
        id
        timestamp
        to
        amountUSD
        amount0
        amount1
        transaction {
          id
        }
        pair {
          token0 {
            id
            name
            symbol
          }
          token1 {
            id
            name
            symbol
          }
        }
      }
      swaps {
        id
        to
        timestamp
        amountUSD
        amount0In
        amount0Out
        amount1In
        amount1Out
        transaction {
          id
        }
        pair {
          token0 {
            id
            name
            symbol
          }
          token1 {
            id
            name
            symbol
          }
        }
      }
      token0 {
        id
        name
        symbol
        tradeVolume
      }
      token1 {
        id
        name
        symbol
        tradeVolume
      }
    }
  }
`;

const SINGLE_TOKEN_QUERY = gql`
  query GetSingleToken($id: ID!) {
    token(id: $id) {
      id
      name
      symbol
      derivedUSD
      tradeVolumeUSD
      txCount
      totalLiquidity
      pairBase {
        id
        volumeUSD
        reserveETH
        mints {
          id
          timestamp
          to
          amountUSD
          amount0
          amount1
          transaction {
            id
          }
          pair {
            token0 {
              id
              name
              symbol
            }
            token1 {
              id
              name
              symbol
            }
          }
        }
        burns {
          id
          timestamp
          to
          amountUSD
          amount0
          amount1
          transaction {
            id
          }
          pair {
            token0 {
              id
              name
              symbol
            }
            token1 {
              id
              name
              symbol
            }
          }
        }
        swaps {
          id
          to
          timestamp
          amountUSD
          amount0In
          amount0Out
          amount1In
          amount1Out
          transaction {
            id
          }
          pair {
            token0 {
              id
              name
              symbol
            }
            token1 {
              id
              name
              symbol
            }
          }
        }
        token0 {
          id
          name
          symbol
          tradeVolume
        }
        token1 {
          id
          name
          symbol
          tradeVolume
        }
      }
      pairQuote {
        id
        volumeUSD
        reserveETH
        mints {
          id
          timestamp
          to
          amountUSD
          amount0
          amount1
          transaction {
            id
          }
          pair {
            token0 {
              id
              name
              symbol
            }
            token1 {
              id
              name
              symbol
            }
          }
        }
        burns {
          id
          timestamp
          to
          amountUSD
          amount0
          amount1
          transaction {
            id
          }
          pair {
            token0 {
              id
              name
              symbol
            }
            token1 {
              id
              name
              symbol
            }
          }
        }
        swaps {
          id
          to
          timestamp
          amountUSD
          amount0In
          amount0Out
          amount1In
          amount1Out
          transaction {
            id
          }
          pair {
            token0 {
              id
              name
              symbol
            }
            token1 {
              id
              name
              symbol
            }
          }
        }
        token0 {
          id
          name
          symbol
          tradeVolume
        }
        token1 {
          id
          name
          symbol
          tradeVolume
        }
      }
    }
  }
`;

const SINGLE_TOKEN_CHART_DATA_QUERY = gql`
  query GetTokenDayData($date: Int!, $token: String!) {
    tokenDayDatas(where: { date_gte: $date, token: $token }) {
      dailyTxns
      date
      totalLiquidityUSD
      priceUSD
      dailyVolumeUSD
    }
  }
`;

const SINGLE_PAIR_CHART_DATA_QUERY = gql`
  query GetPairDayData($date: Int!, $id: String!) {
    pairDayDatas(where: { date_gte: $date, pairAddress: $id }) {
      dailyTxns
      date
      dailyVolumeUSD
      dailyVolumeToken0
      dailyVolumeToken1
    }
  }
`;

const TOP_TOKENS_QUERY = gql`
  query GetTopTokens($skip: Int!, $orderDir: String!) {
    tokens(orderBy: tradeVolumeUSD, orderDirection: $orderDir, first: 10, skip: $skip) {
      tradeVolumeUSD
      id
      symbol
      name
      derivedUSD
      derivedETH
      totalSupply
      tokenDayData(orderBy: date, orderDirection: desc, first: 6) {
        priceUSD
        date
        dailyVolumeETH
      }
    }
  }
`;

const TOP_PAIRS_QUERY = gql`
  query GetTopPairs($skip: Int!) {
    pairs(orderBy: volumeUSD, orderDirection: desc, first: 10, skip: $skip) {
      id
      volumeUSD
      reserveETH
      token0 {
        id
        name
        symbol
        tradeVolume
      }
      token1 {
        id
        name
        symbol
        tradeVolume
      }
    }
  }
`;

const QUASAR_FACTORIES_STATS_QUERY = gql`
  {
    quasarFactories {
      pairCount
      txCount
      totalLiquidityUSD
      totalVolumeUSD
    }
  }
`;

const FETCH_ALL_TRANSACTIONS_QUERY = gql`
  query GetAllTransactions($skip: Int!, $order: String!) {
    transactions(orderBy: timestamp, orderDirection: $order, first: 10, skip: $skip) {
      id
      block
      timestamp
      swaps {
        id
        to
        amount0In
        amount1Out
        amountUSD
        pair {
          token0 {
            id
            name
            symbol
          }
          token1 {
            id
            name
            symbol
          }
        }
      }
      mints {
        id
        to
        amountUSD
        amount0
        amount1
        pair {
          token0 {
            id
            name
            symbol
          }
          token1 {
            id
            name
            symbol
          }
        }
      }
      burns {
        id
        to
        amountUSD
        amount0
        amount1
        pair {
          token0 {
            id
            name
            symbol
          }
          token1 {
            id
            name
            symbol
          }
        }
      }
    }
  }
`;

const FETCH_ALL_MINTS_QUERY = gql`
  query GetAllMints($skip: Int!, $order: String!) {
    mints(orderBy: timestamp, orderDirection: $order, first: 10, skip: $skip) {
      id
      to
      timestamp
      amountUSD
      amount0
      amount1
      transaction {
        id
      }
      pair {
        token0 {
          id
          name
          symbol
        }
        token1 {
          id
          name
          symbol
        }
      }
    }
  }
`;

const FETCH_ALL_BURNS_QUERY = gql`
  query GetAllBurns($skip: Int!, $order: String!) {
    burns(orderBy: timestamp, orderDirection: $order, first: 10, skip: $skip) {
      id
      to
      timestamp
      amountUSD
      amount0
      amount1
      transaction {
        id
      }
      pair {
        token0 {
          id
          name
          symbol
        }
        token1 {
          id
          name
          symbol
        }
      }
    }
  }
`;

const FETCH_ALL_SWAPS_QUERY = gql`
  query GetAllSwaps($skip: Int!, $order: String!) {
    swaps(orderBy: timestamp, orderDirection: $order, first: 10, skip: $skip) {
      id
      to
      timestamp
      amountUSD
      amount0In
      amount0Out
      amount1In
      amount1Out
      transaction {
        id
      }
      pair {
        token0 {
          id
          name
          symbol
        }
        token1 {
          id
          name
          symbol
        }
      }
    }
  }
`;

export const useHighestVolumeToken = () => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ name: string; id: string; symbol: string }>();
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(HIGHEST_VOLUME_QUERY, { date: Math.floor(Date.now() / 1000) - 3600 * 24 });
        setData((head(req.tokenDayDatas) as any).token);
        setIsLoading(false);
      } catch (error: any) {
        console.log(error);
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient]);

  return { isLoading, data, error };
};

export const useHighestTransactionToken = () => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ name: string; id: string; symbol: string }>();
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(TRANSACTION_COUNT_QUERY, { date: Math.floor(Date.now() / 1000) - 3600 * 24 });
        setData((head(req.tokenDayDatas) as any).token);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient]);

  return { isLoading, data, error };
};

export const useTopPair = () => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ token0: { name: string; id: string; symbol: string }; token1: { name: string; id: string; symbol: string } }>();
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(PAIRS_QUERY);
        setData(head(req.pairs) as any);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient]);

  return { isLoading, data, error };
};

export const useMostPopularToken = () => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ name: string; id: string; symbol: string }>();
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(TOKENS_QUERY);
        setData(head(req.tokens) as any);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient]);

  return { isLoading, data, error };
};

export const useTopPairs = (page: number) => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(TOP_PAIRS_QUERY, { skip: page * 10 });
        setData(req.pairs);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [page, dexGQLClient]);

  return { isLoading, data, error };
};

export const useQuasarFactoriesStats = () => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<{ pairCount: number; txCount: number; totalLiquidityUSD: number; totalVolumeUSD: number }>({
    pairCount: 0,
    txCount: 0,
    totalLiquidityUSD: 0,
    totalVolumeUSD: 0
  });
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(QUASAR_FACTORIES_STATS_QUERY);
        const d = head(req.quasarFactories) as any;
        setData({
          ...data,
          pairCount: d.pairCount,
          txCount: parseInt(d.txCount),
          totalLiquidityUSD: parseFloat(d.totalLiquidityUSD),
          totalVolumeUSD: parseFloat(d.totalVolumeUSD)
        });
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient]);

  return { isLoading, data, error };
};

export const useTopTokens = (page: number, orderDir: 'desc' | 'asc' = 'desc') => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(TOP_TOKENS_QUERY, { skip: page * 10, orderDir });
        setData(req.tokens);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient, orderDir, page]);

  return { isLoading, data, error };
};

export const useOverviewChartData = (gap: number) => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(OVERVIEW_CHART_DATA, { date: Math.floor(Date.now() / 1000) - gap });
        setData(req.quasarDayDatas);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient, gap]);

  return { isLoading, data, error };
};

export const useSingleTokenChartData = (gap: number, token: string) => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(SINGLE_TOKEN_CHART_DATA_QUERY, {
          date: Math.floor(Date.now() / 1000) - gap,
          token: token.toLowerCase()
        });
        setData(req.tokenDayDatas);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient, gap, token]);

  return { isLoading, data, error };
};

export const useSinglePairChartData = (gap: number, id: string) => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(SINGLE_PAIR_CHART_DATA_QUERY, {
          date: Math.floor(Date.now() / 1000) - gap,
          id: id.toLowerCase()
        });
        setData(req.pairDayDatas);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient, gap, id]);

  return { isLoading, data, error };
};

export const useAllTransactions = (page: number, order: 'desc' | 'asc' = 'desc') => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(FETCH_ALL_TRANSACTIONS_QUERY, { skip: page * 10, order });
        setData(req.transactions);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient, page, order]);
  return { isLoading, data, error };
};

export const useAllMints = (page: number, order: 'desc' | 'asc' = 'desc') => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(FETCH_ALL_MINTS_QUERY, { skip: page * 10, order });
        setData(req.mints);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient, page, order]);
  return { isLoading, data, error };
};

export const useAllSwaps = (page: number, order: 'desc' | 'asc' = 'desc') => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(FETCH_ALL_SWAPS_QUERY, { skip: page * 10, order });
        setData(req.swaps);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient, page, order]);
  return { isLoading, data, error };
};

export const useAllBurns = (page: number, order: 'desc' | 'asc' = 'desc') => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<Array<any>>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const req: any = await dexGQLClient?.request(FETCH_ALL_BURNS_QUERY, { skip: page * 10, order });
        setData(req.burns);
        setIsLoading(false);
      } catch (error: any) {
        setError(new Error('Could not fetch'));
        setIsLoading(false);
      }
    })();
  }, [dexGQLClient, page, order]);
  return { isLoading, data, error };
};

export const useSingleTokenQuery = (id: string) => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          setIsLoading(true);
          const req: any = await dexGQLClient?.request(SINGLE_TOKEN_QUERY, { id: id.toLowerCase() });
          setData({
            ...req.token,
            txCount: parseInt(req.token.txCount),
            tradeVolumeUSD: parseFloat(req.token.tradeVolumeUSD),
            derivedUSD: parseFloat(req.token.derivedUSD),
            totalLiquidity: parseFloat(req.token.totalLiquidity)
          });
          setIsLoading(false);
        } catch (error: any) {
          setError(new Error('Could not fetch'));
          setIsLoading(false);
        }
      })();
    }
  }, [dexGQLClient, id]);
  return { isLoading, data, error };
};

export const useSinglePairQuery = (id: string) => {
  const { dexGQLClient } = useGQLContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          setIsLoading(true);
          const req: any = await dexGQLClient?.request(SINGLE_PAIR_QUERY, { id: id.toLowerCase() });
          setData({
            ...req.pair,
            txCount: parseInt(req.pair.txCount),
            token0Price: parseFloat(req.pair.token0Price),
            token1Price: parseFloat(req.pair.token1Price),
            volumeToken0: parseFloat(req.pair.volumeToken0),
            volumeToken1: parseFloat(req.pair.volumeToken1),
            volumeUSD: parseFloat(req.pair.volumeUSD)
          });
          setIsLoading(false);
        } catch (error: any) {
          setError(new Error('Could not fetch'));
          setIsLoading(false);
        }
      })();
    }
  }, [dexGQLClient, id]);
  return { isLoading, data, error };
};
