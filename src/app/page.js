'use client';
import { providers} from 'near-api-js';
import { useState, useEffect } from 'react';
import { HelloNearContract, NetworkId } from '../config';
import styles from './app.module.css';
import { useAuth } from '../wallets/authContext';

const CONTRACT = HelloNearContract[NetworkId];



export default function HelloNear() {

  const [guest, setGuest] = useState('');
  const [guestList, setGuestList] = useState(["loading..."]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const { user, callContract} = useAuth();

  useEffect(() => {
    setLoggedIn(!!user);
    if(user){
      console.log("get guest list")
      const fetchGuestList = async (contractId, method, args = {}) => {{
        const provider = new providers.JsonRpcProvider({ url: 'https://rpc.testnet.near.org' });

        let res = await provider.query({
          request_type: 'call_function',
          account_id: contractId,
          method_name: method,
          args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
          finality: 'optimistic',
        });
        return JSON.parse(Buffer.from(res.result).toString());
      }};
      try {
      fetchGuestList(CONTRACT,"get_guests",{}).then(
        guestList => setGuestList(guestList)
      );
      } catch (error) {
        console.error(error);
      }
    }
  }, [user]);

  
  const saveGuest = async () => {


    setShowSpinner(true);
    const result = await callContract(CONTRACT, 'add_guest', { guest });
    console.log(`result: ${result}`)
    setShowSpinner(false);
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Interacting with the contract: &nbsp;
          <code className={styles.code}>{CONTRACT}</code>
        </p>
      </div>

      <div className={styles.center}> 
        <h1 className="w-100"> Guest List: 
          <div>
          {guestList.map((guest, index) => (
            <div key={index}>
              <code>{guest}</code>{index < guestList.length - 1 ? ',' : ''}
            </div>
          ))}
        </div>
      </h1>

        <div className="input-group" hidden={!loggedIn}>
          <input type="text" className="form-control w-20" placeholder="Put your name on the guest list" onChange={t => { setGuest(t.target.value); } } />
          <div className="input-group-append">
            <button className="btn btn-secondary" onClick={saveGuest}>
              <span hidden={showSpinner}> Save </span>
              <i className="spinner-border spinner-border-sm" hidden={!showSpinner}></i>
            </button>
          </div>
        </div>
        <div className='w-100 text-end align-text-center' hidden={loggedIn}>
          <p className='m-0'> Please login to add a guest </p>
        </div>
      </div>
    </main>
  );
}
