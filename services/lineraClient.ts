export const LINERA_FAUCET_URL: string = import.meta.env.VITE_LINERA_FAUCET_URL;
export const LINERA_APPLICATION_ID: string = import.meta.env.VITE_LINERA_APPLICATION_ID;

export const isLineraConfigured = (): boolean => {
  return Boolean(LINERA_FAUCET_URL) && Boolean(LINERA_APPLICATION_ID);
};
