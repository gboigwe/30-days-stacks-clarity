
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

// Get test accounts from simnet
const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk/guides/unit-testing

  Run the tests with `npm test`.
*/

describe('Hello World Contract', () => {
  beforeEach(() => {
    // Reset simnet state before each test if needed
  });

  describe('Read-only functions', () => {
    it('should return the default greeting', () => {
      const greeting = simnet.callReadOnlyFn(
        'hello-world',
        'get-greeting',
        [],
        deployer
      );

      expect(greeting.result).toBeAscii('Hello, Clarity 3.0!');
    });

    it('should return the correct owner', () => {
      const owner = simnet.callReadOnlyFn(
        'hello-world',
        'get-owner',
        [],
        deployer
      );

      expect(owner.result).toBePrincipal(deployer);
    });

    it('should return contract statistics', () => {
      const stats = simnet.callReadOnlyFn(
        'hello-world',
        'get-stats',
        [],
        deployer
      );

      expect(stats.result).toBeTuple({
        greeting: Cl.stringAscii('Hello, Clarity 3.0!'),
        owner: Cl.principal(deployer),
        'update-count': Cl.uint(0),
        'total-updates': Cl.uint(0)
      });
    });

    it('should return Clarity 3.0 block information', () => {
      const blockInfo = simnet.callReadOnlyFn(
        'hello-world',
        'get-block-info',
        [],
        deployer
      );

      // Verify the response contains the expected fields
      const result = blockInfo.result.expectTuple();
      expect(result['stacks-blocks']).toBeUint();
      expect(result['tenure-blocks']).toBeUint();
      expect(result['estimated-time']).toBeUint();
    });

    it('should correctly identify the owner', () => {
      // Check if deployer is owner (should be true)
      const deployerIsOwner = simnet.callReadOnlyFn(
        'hello-world',
        'is-owner',
        [Cl.principal(deployer)],
        deployer
      );
      expect(deployerIsOwner.result).toBeBool(true);

      // Check if wallet1 is owner (should be false)
      const wallet1IsOwner = simnet.callReadOnlyFn(
        'hello-world',
        'is-owner',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(wallet1IsOwner.result).toBeBool(false);
    });

    it('should return contract information', () => {
      const contractInfo = simnet.callReadOnlyFn(
        'hello-world',
        'get-contract-info',
        [],
        deployer
      );

      const result = contractInfo.result.expectTuple();
      expect(result['name']).toBeAscii('Hello World Clarity 3.0');
      expect(result['version']).toBeAscii('1.0.0');
      expect(result['description']).toBeAscii('A simple greeting contract demonstrating Clarity 3.0 features');
      expect(result['owner']).toBePrincipal(deployer);
    });
  });
})
