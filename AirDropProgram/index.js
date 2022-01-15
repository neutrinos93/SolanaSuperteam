// To import required modules
const {
 Connection,
 PublicKey,
 clusterApiUrl,
 Keypair, // Class imported
 LAMPORTS_PER_SOL,
 Transaction,
 Account,
} = require("@solana/web3.js");

const newPair = new Keypair(); // class to allow wallet creation.

// newPair holds the public and private key

const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
const secretKey = newPair._keypair.secretKey; // type is Uint8Array of length 64

// Get balance. getBalance methode from class Connection

const getWalletBalance = async() => {
  try {
    // connection object that'll be used to get the balance
    // clusterApiUrl provides URL to connect to devnet, a Solana cluster.
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // create wallet object
    const myWallet = await Keypair.fromSecretKey(secretKey);
    // query the balance
    const walletBalance = await connection.getBalance(
      new PublicKey(myWallet.publicKey)
    );
    console.log(`Wallet balance: ${walletBalance}`);
  } catch(err){
    console.log(err);
  }
};

// Function to airdrop some SOL into wallet (SOL is airdropped in term of LAMPORTS (?))
const airDropSol = async () => {
  try{
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletKeyPair = await Keypair.fromSecretKey(secretKey);
    // create airdrop signature using wallet details and the amount of SOL to airdrop.
    const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(walletKeyPair.publicKey),
    2 * LAMPORTS_PER_SOL
    );
    // await confirmation of transaction
    await connection.confirmTransaction(fromAirDropSignature);
  } catch(err) {
    console.log(err);
  }
};

// create a drive function to test
const driverFunction = async () => {
  await getWalletBalance();
  await airDropSol();
  await getWalletBalance();
};
driverFunction();
