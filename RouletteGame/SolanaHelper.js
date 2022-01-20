const {Connection,
    clusterApiUrl,
    PublicKey,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    requestAirdrop}  = require("@solana/web3.js");

const getWalletBalance = async (publicKey) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"),"confirmed");
        const balance = await connection.getBalance(new PublicKey(publicKey));
        return balance/LAMPORTS_PER_SOL;
    } catch(err) {
        console.log(err);
    }
};

const airDropSol = async (wallet, transferAmt) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"),"confirmed");
        // const walletKeyPair=await web3.Keypair.fromSecretKey(Uint8Array.from())
        const fromAirDropSignature = await connection.requestAirdrop(new PublicKey(wallet.publicKey), transferAmt * LAMPORTS_PER_SOL);
        await connection.confirmTransaction(fromAirDropSignature);
    } catch(err) {
        console.log(err);
    }
}

const transferSOL = async (from, to, transferAmt) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"),"confirmed");
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey:new PublicKey(from.publicKey.toString()),
                toPubkey:new PublicKey(to.publicKey.toString()),
                lamports:transferAmt * LAMPORTS_PER_SOL
            })
        )
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        )
        return signature;
    }catch(err) {
        console.log(err);
    }
}

module.exports={
    getWalletBalance,
    transferSOL,
    airDropSol
}