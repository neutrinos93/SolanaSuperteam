const {Keypair} = require("@solana/web3.js");
const {getWalletBalance, transferSOL, airDropSol} = require("./SolanaHelper.js");
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');

const inquirer = require("inquirer");

// Create user wallet
const userWallet = Keypair.generate();
//console.log("User wallet: ", userWallet);

// Create treasury wallet
const treasuryWallet = Keypair.generate();
//console.log("Treasury wallet: ", treasuryWallet);

const askQuestions = () => {
  const questions = [
      {
          name: "SOL",
          type: "number",
          message: "What is the amount of SOL you want to stake?",
      },
      {
          type: "rawlist",
          name: "RATIO",
          message: "What is the ratio of your staking?",
          choices: ["1:1.25", "1:1.5", "1.75", "1:2"],
          filter: function(val) {
              const stakeFactor = val.split(":")[1];
              return stakeFactor;
          },
      },
      {
          type:"number",
          name:"RANDOM",
          message:"Guess a random number from 1 to 5 (both 1, 5 included)",
          when:async (val)=>{
              if (parseFloat(totalAmtToBePaid(val.SOL))>5) {
                  console.log(`You have violated the max stake limit. Stake with smaller amount.`)
                  return false;
              } else {
                  // console.log("In when")
                  console.log(`You need to pay ${`${totalAmtToBePaid(val.SOL)}`} to move forward`)
                  const userBalance = await getWalletBalance(userWallet.publicKey.toString())
                  if (userBalance < totalAmtToBePaid(val.SOL)) {
                      console.log(`You don't have enough balance in your wallet`);
                      return false;
                  } else {
                      console.log(`You will get ${getReturnAmount(val.SOL,parseFloat(val.RATIO))} if guessing the number correctly`)
                      return true;    
                  }
              }
          },
      }
  ];
  return inquirer.prompt(questions);
};

const gameExecution = async () => {
  // Airdrop funds in the user wallet
  console.log("Airdropping some SOL in user wallet.");
  await airDropSol(userWallet, 5);
  const startBalance = await getWalletBalance(userWallet.publicKey);
  console.log("Starting balance: ", startBalance);

  const generateRandomNumber = randomNumber(1,5);
  // console.log("Generated number",generateRandomNumber);
  const answers = await askQuestions();
  console.log("The value of RANDOM is:", answers.RANDOM)
  if (answers.RANDOM) {
      const paymentSignature = await transferSOL(userWallet,treasuryWallet,totalAmtToBePaid(answers.SOL));
      console.log(`Signature of payment for playing the game`,`${paymentSignature}`);
      if (answers.RANDOM===generateRandomNumber) {
          //AirDrop Winning Amount
          await airDropSol(treasuryWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)));
          //guess is successfull
          const prizeSignature = await transferSOL(treasuryWallet,userWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)))
          console.log(`Your guess is absolutely correct`);
          console.log(`Here is the price signature `,`${prizeSignature}`);
      } else {
          //better luck next time
          console.log(`Better luck next time`);
      }
  }
  // Print out new balance in wallet
  console.log("New balance: ", await getWalletBalance(userWallet.publicKey.toString()));
}

gameExecution();