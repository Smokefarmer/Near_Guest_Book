import React, { createContext, useContext, useState, useEffect } from 'react';
import {WEB3AUTH_NETWORK, WALLET_ADAPTERS  } from "@web3auth/base"
import { Web3Auth } from "@web3auth/modal";
import { connect, KeyPair, keyStores, utils } from "near-api-js";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [web3auth, setWeb3auth] = useState(null);
    const [provider, setProvider] = useState(null);
    const [user, setUser] = useState(null);
    const [accountId, setAccountId] = useState(null);
    const [balance, setBalance] = useState(null);
    const [account, setAccount] = useState(null);
  
    useEffect(() => {
      const init = async () => {
        try {
        const web3auth = new Web3Auth({
          clientId: "BD20qYbO4GTKBNz5-4WVWLcPpTbQ_E6Hj0CHM_jTRzxwG0KkV-orb1HNUdFo7LZGlmnfLxm1nefjxNXy35nSUpI",
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig: {
            chainId: "testnet",
            chainNamespace: "other",
            rpcTarget: "https://rpc.testnet.near.org",
            displayName: "Near",
            blockExplorer: "https://explorer.testnet.near.org",
            ticker: "NEAR",
            tickerName: "NEAR",
          },
          uiConfig: {
            appName: "Smokefarmers Guest List",
            appUrl: "https://web3auth.io",
            defaultLanguage: "en", 
            mode: "dark",
            primaryButton: "socialLogin",
            theme: {
              primary: "#d63384",
            },
          },      
        });
        setWeb3auth(web3auth);
        await web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.OPENLOGIN]: {
              label: "openlogin",
              loginMethods: {
                // Disable facebook and reddit
                twitter: {
                  name: "twitter",
                  showOnModal: false,
                },
                wechat: {
                  name: "wechat",
                  showOnModal: false,
                },
                weibo: {
                  name: "weibo",
                  showOnModal: false,
                },
                kakao: {
                  name: "kakao",
                  showOnModal: false,
                },
                line: {
                  name: "line",
                  showOnModal: false,
                },
                facebook: {
                  name: "facebook",
                  showOnModal: false,
                },
                reddit: {
                  name: "reddit",
                  showOnModal: false,
                },
                sms_passwordless: {
                  name: "sms_passwordless",
                  showOnModal: false,
                },
                [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
                  label: "wallet_connect",
                  showOnModal: false,
                },
                // Disable Metamask
                [WALLET_ADAPTERS.METAMASK]: {
                  label: "metamask",
                  showOnModal: false,
                },
              },
            },
          },
        });
        if (web3auth.provider) {
          setProvider(web3auth.provider);
        };
  
        } catch (error) {
          console.error(error);
        }
      };
  
      init();
    }, []);
  
    const login = async () => {
      if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
      }
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      getUserInfo()
    };
  
    const getUserInfo = async () => {
      if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
      }
      const user = await web3auth.getUserInfo();
      console.log(user.accountId)
      setUser(user)
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);

      if (!provider) {
        console.error("Provider is not available");
        return;
      }
      try{
        const privateKey = await provider.request({ method: "private_key" });
        
        // Convert the secp256k1 key to ed25519 key
        const { getED25519Key } = await import("@toruslabs/openlogin-ed25519");
        const privateKeyEd25519 = getED25519Key(privateKey).sk.toString("hex");

        // Convert the private key to Buffer
        const privateKeyEd25519Buffer = Buffer.from(privateKeyEd25519, "hex");

        // Convert the private key to base58
        const bs58encode = utils.serialize.base_encode(privateKeyEd25519Buffer);

        // Convert the base58 private key to KeyPair
        const keyPair = KeyPair.fromString(bs58encode);

        // publicAddress
        const publicAddress = keyPair?.getPublicKey().toString();
        console.log(publicAddress)
        // accountId is the account address which is where funds will be sent to.
        const accountId = utils.serialize.base_decode(publicAddress.split(":")[1]).toString("hex");
        setAccountId(accountId)
        
        const myKeyStore = new keyStores.InMemoryKeyStore();
        await myKeyStore.setKey("testnet", accountId, keyPair); // accountId and keyPair from above
        const connectionConfig = {
          networkId: "testnet",
          keyStore: myKeyStore,
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://wallet.testnet.near.org",
          helperUrl: "https://helper.testnet.near.org",
          explorerUrl: "https://explorer.testnet.near.org",
        };
        const nearConnection = await connect(connectionConfig);
        const account = await nearConnection.account(accountId);
        setAccount(account)
        const accountBalance = await account.getAccountBalance();
        const availableBalance = utils.format.formatNearAmount(accountBalance.available);
        if(availableBalance){
          setBalance(availableBalance)
        }else{
          setBalance(0)
        }
      } catch (error) {
        console.error(error);
      }
      
    };
  
    const logout = async () => {
      if (!web3auth) {
        console.log("web3auth not initialized yet");
        return;
      }
      await web3auth.logout();
      setProvider(null);
      setUser(null);
    };

  return (
    <AuthContext.Provider value={{ user, login, logout, provider, accountId, balance, account }}>
      {children}
    </AuthContext.Provider>
  );
};
