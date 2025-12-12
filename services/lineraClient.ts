import type { Signer, Faucet, Wallet, Client, Frontend, Application } from '@linera/client';

export const LINERA_FAUCET_URL: string = import.meta.env.VITE_LINERA_FAUCET_URL || 'https://faucet.testnet-conway.linera.net';
export const LINERA_APPLICATION_ID: string = import.meta.env.VITE_LINERA_APPLICATION_ID || '';

export const isLineraConfigured = (): boolean => {
  return Boolean(LINERA_FAUCET_URL) && Boolean(LINERA_APPLICATION_ID);
};

const toHex = (bytes: Uint8Array): string => '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

class MetaMaskSigner implements Signer {
  async sign(owner: string, value: Uint8Array): Promise<string> {
    if (!window.ethereum) throw new Error('MetaMask not found');
    const msg = toHex(value);
    // EIP-191 personal_sign
    const sig = await window.ethereum.request({ method: 'personal_sign', params: [msg, owner] });
    return sig as string;
  }
  async containsKey(owner: string): Promise<boolean> {
    if (!window.ethereum) return false;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return Array.isArray(accounts) && accounts.map((a: string) => a.toLowerCase()).includes(owner.toLowerCase());
  }
}

let clientPromise: Promise<Client> | null = null;

async function initClient(): Promise<Client> {
  const accounts = await window.ethereum?.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) throw new Error('No MetaMask accounts');
  const owner = accounts[0];

  const signer = new MetaMaskSigner();
  // Dynamically import to avoid bundling when not configured
  const mod = await import('@linera/client');
  const faucet: Faucet = new mod.Faucet(LINERA_FAUCET_URL);
  const wallet: Wallet = await faucet.createWallet();
  await faucet.claimChain(wallet, owner);
  const client: Client = new mod.Client(wallet, signer, false);
  return client;
}

export async function getClient(): Promise<Client> {
  if (!clientPromise) clientPromise = initClient();
  return clientPromise;
}

export async function queryApplication(query: string): Promise<string> {
  const client = await getClient();
  const frontend: Frontend = client.frontend();
  const mod = await import('@linera/client');
  const app: Application = await frontend.application(LINERA_APPLICATION_ID);
  return app.query(query);
}
