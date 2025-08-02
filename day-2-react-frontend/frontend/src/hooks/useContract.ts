'use client';

import { useState, useEffect } from 'react';
import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { network, contractAddress, contractName } from '@/lib/stacks';

export function useContractRead(functionName: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        const result = await fetchCallReadOnlyFunction({
          contractAddress,
          contractName,
          functionName,
          functionArgs: [],
          network,
          senderAddress: contractAddress, // Use contract address as sender for read-only calls
        });
        
        // Convert Clarity value to JavaScript
        const jsonResult = cvToJSON(result);
        setData(jsonResult.value);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error('Contract read error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [functionName]);

  return { data, isLoading, error };
}