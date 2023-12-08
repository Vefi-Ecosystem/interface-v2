"use client"
import { createContext, useContext } from 'react';
import { GraphQLClient } from 'graphql-request';
import grapqlConfig from '../assets/graphql.json';
import { useGQLClient } from '../hooks/global';

type GraphQLContextType = {
  dexGQLClient: GraphQLClient | null;
  poolsGQLClient: GraphQLClient | null;
};

const GQLContext = createContext<GraphQLContextType>({} as GraphQLContextType);

export const GQLProvider = ({ children }: any) => {
  const dexGQLClient = useGQLClient(grapqlConfig, 'exchange');
  const poolsGQLClient = useGQLClient(grapqlConfig, 'pools');

  return <GQLContext.Provider value={{ dexGQLClient, poolsGQLClient }}>{children}</GQLContext.Provider>;
};

export const useGQLContext = () => useContext(GQLContext);
