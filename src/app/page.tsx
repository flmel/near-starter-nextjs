"use client"
import { Navigation } from '@/app/components/navigation';
import { HelloNearContract, NetworkId } from '@/config';
import { NearContext, Wallet } from '@/wallets/near';
import { useEffect, useState } from "react";
import Image from "next/image";

// Contract that the app will interact with
const CONTRACT = HelloNearContract;

// Wallet instance
// const wallet: Wallet = new Wallet({ networkId: NetworkId });
// Optional: Create an access key so the user does not need to sign transactions. Read more about access keys here: https://docs.near.org/concepts/protocol/access-keys
const wallet: Wallet = new Wallet({ networkId: NetworkId, createAccessKeyFor: HelloNearContract });

export default function Home() {
  const [signedAccountId, setSignedAccountId] = useState('');
  useEffect(() => { wallet.startUp(setSignedAccountId) }, []);

  const [greeting, setGreeting] = useState('loading...');
  const [newGreeting, setNewGreeting] = useState('loading...');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!wallet) return;

    wallet.viewMethod({ contractId: CONTRACT, method: 'get_greeting' }).then((greeting) => setGreeting(greeting));
  }, []);

  useEffect(() => {
    setLoggedIn(!!signedAccountId);
  }, [signedAccountId]);

  const saveGreeting = async () => {
    // Try to store greeting, revert if it fails
    wallet.callMethod({ contractId: CONTRACT, method: 'set_greeting', args: { greeting: newGreeting } })
      .then(async () => {
        const greeting = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_greeting' });
        setGreeting(greeting);
      });

    // Assume the transaction will be successful and update the UI optimistically
    setShowSpinner(true);
    await new Promise(resolve => setTimeout(resolve, 300));  // 300ms delay to show spinner
    setGreeting(newGreeting);
    setShowSpinner(false);
  };

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <Navigation />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h2 className="font-bold">Interacting with contract: <span className="text-pink-600">{CONTRACT}</span></h2>
          <h2 className="font-bold text-4xl">Current greeting: <span className="text-pink-500">{greeting}</span></h2>
          <div className="w-100">
            <div className="flex rounded-full h-12 transition-all border border-black focus-within:border-white hover:border-white duration-300" hidden={!loggedIn}>
              <input
                type="text"
                className="rounded-l-full  px-4 focus:outline-none "
                placeholder="Store a new greeting"
                onChange={(t) => setNewGreeting(t.target.value)}
              />
                <button className="px-4" onClick={saveGreeting}>
                  <span hidden={showSpinner}>Save new greeting</span>
                  <i className="spinner-border spinner-border-sm" hidden={!showSpinner}></i>
                </button>
            </div>
            <div className="w-100 text-end align-text-center" hidden={loggedIn}>
              <p className="m-0"> Please login to change the greeting </p>
            </div>
          </div>
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to nextjs.org →
          </a>
        </footer>
      </div>
    </NearContext.Provider>
  );
}
