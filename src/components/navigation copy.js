import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import NearLogo from '../../public/near-logo.svg';
import { useWallet } from '@/wallets/wallet-selector';
import { Web3Auth } from "@web3auth/modal";
import styles from '../app/app.module.css';




export const Navigation = () => {

  const { signedAccountId, logOut, logIn } = useWallet();
  const [action, setAction] = useState(() => { });
  const [label, setLabel] = useState('Loading...');

  useEffect(() => {
    if (signedAccountId) {
      setAction(() => logOut);
      setLabel(`Logout ${signedAccountId}`);
    } else {
      setAction(() => logIn);
      setLabel('Login');
    }
  }, [signedAccountId, logOut, logIn, setAction, setLabel]);

  useEffect(() => {
    const initializeWeb3Auth = async () => {
      const web3auth = new Web3Auth({
  clientId: "BJPE1FmyrJkIR_tdF2wjsXaAcTGswchvYNHiAr3QEzjTtDkhUVizwEmZbbhOa5sLiurNLIB0x_CeNNeIfdGwNZ0", // get it from Web3Auth Dashboard
  web3AuthNetwork: "sapphire_devnet", // "testnet" or "mainnet, "sapphire_mainnet", "aqua"
  chainConfig: {
    chainNamespace: "other", // for all non EVM and SOLANA chains, use "other"
    rpcTarget: "https://rpc.testnet.near.org",
    displayName: "Near",
    blockExplorer: "https://explorer.testnet.near.org",
    ticker: "NEAR",
    tickerName: "NEAR",
  },
});
      await web3auth.initModal();
      const web3authProvider = await web3auth.connect();
      // Weitere Logik, falls erforderlich
    };
  
    initializeWeb3Auth();
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={styles.buttonContainer}>
        <button onClick={action} >
          <Link href="/" passHref legacyBehavior>
            <Image className={styles.near} priority src={NearLogo} alt="NEAR" width="30" height="24" />
          </Link>
          {label} 
        </button>
      </div>
    </nav>
    



  );
};