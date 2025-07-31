import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

// Get test accounts from simnet
const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;

describe('Hello World Contract', () => {
  // Test the default greeting message
  it('returns the default greeting', () => {
    const greeting = simnet.callReadOnlyFn(
      'hello-world',      // contract name
      'get-greeting',     // function to call
      [],                 // no arguments
      deployer            // caller identity
    );

    // Check that the result matches the expected string
    expect(greeting.result).toBeAscii('Hello, Clarity 3.0!');
  });

  // Test who the contract owner is
  it('returns the contract owner', () => {
    const owner = simnet.callReadOnlyFn(
      'hello-world',
      'get-owner',
      [],
      deployer
    );

    // Check that the owner is the deployer
    expect(owner.result).toBePrincipal(deployer);
  });
});
