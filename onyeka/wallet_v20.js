const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let ref = urlParams.get("ref");

if (ref) {
  Cookies.set("ref", ref, { path: "", expires: 2147483647 });
} else if (!ref) {
  ref = Cookies.get("ref");
} else {
  ref = "";
}

// Elements
const connectWallet = $(".connect-wallet");
const hideIfConnected = $(".hide-if-connected");
const AddrEl = $(".address");
const BalanceEl = $(".balance");
const WorkingPrintersEl = $(".working-printers");
const BnbPerDayEl = $(".bnb-per-day");
const RewardsEl = $(".earned");
const MyReferralsEl = $(".my-referrals");
const CopyReferralLink = $(".copy-ref");
const RentPrintersInput = $("#rent-printers-input");
const RentPrintersSubmit = $("#rent-printers");
const RentPrintersResult = $(".rent-printers-calc");
const ContractTVL = $(".contract-tvl");

// Constants
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

// Globals
let provider = null;
let account = null;
let web3 = null;
let connected = false;

const web3Modal = new Web3Modal({
  network: "binance", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/",
        },
        network: "binance",
        infuraId: "d85fda7b424b4212ba72f828f48fbbe1",
        pollingInterval: "10000",
      },
    },
  },
});

// Create structure of the user object
let accountObj = {
  addr: "",
  balance: 0,
  workingPrinters: 0,
  bnbPerDay: 0,
  rewards: 0,
  myReferrals: 0,
  chainId: 0,
};

class DApp {
  web3modal;
  web3;
  provider;
  supportedChain = 56;
  connected = false;
  contractAddr = "0x9a83333b0a91E3FDF2B120716b85CD898F1DD712";
  contractABI = [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      inputs: [{ internalType: "address", name: "adr", type: "address" }],
      name: "beanRewards",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "ref", type: "address" }],
      name: "buyEggs",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "adr", type: "address" }],
      name: "calculateDailyIncome",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "eth", type: "uint256" },
        {
          internalType: "uint256",
          name: "contractBalance",
          type: "uint256",
        },
      ],
      name: "calculatePrinterBuy",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "eth", type: "uint256" }],
      name: "calculatePrinterBuySimple",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "printers", type: "uint256" }],
      name: "calculateEggSell",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getBalance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "adr", type: "address" }],
      name: "getMyMiners",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "adr", type: "address" }],
      name: "getMyEggs",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "adr", type: "address" }],
      name: "getMyReferralsCount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "adr", type: "address" }],
      name: "getMyReferralsIncome",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "adr", type: "address" }],
      name: "getPrintersSinceLastHatch",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "ref", type: "address" }],
      name: "hatchEggs",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "seedMarket",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "sellEggs",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  contract;
  referral;

  accountObject = {
    addr: "",
    balance: 0,
    workingPrinters: 0,
    bnbPerDay: 0,
    rewards: 0,
    myReferrals: 0,
    chainId: 0,
    isActive: false,
    contractBalance: 0,
  };

  constructor(ref) {
    this.referral = ref;
    if (web3Modal.cachedProvider) {
      this.ConnectWallet();
    }
  }

  async GetWorkingPrinters() {
    return await this.contract.methods
      .getMyMiners(this.accountObject.addr)
      .call();
  }

  async GetMyPrinters() {
    return await this.contract.methods
      .getMyEggs(this.accountObject.addr)
      .call();
  }

  async CalcReward(printers) {
    return await this.contract.methods.calculateEggSell(printers).call();
  }

  async GetReferrals() {
    return await this.contract.methods
      .getMyReferralsCount(this.accountObject.addr)
      .call();
  }

  async GetBnbPerDay() {
    return await this.contract.methods
      .calculateDailyIncome(this.accountObject.addr)
      .call();
  }

  async GetContractBalance() {
    return await this.contract.methods.getBalance().call();
  }

  async BuyPrinters(amount) {
    // console.log( this.accountObject.addr, this.web3.utils.toWei(amount, "ether"))
    if (!this.connected) {
      ShowBadToasty("Please, connect your wallet to use our DApp.");
    } else if (parseInt(this.accountObject.chainId) !== this.supportedChain) {
      ShowBadToasty("Please, choose BSC Network to use our DApp.");
    } else if (!this.accountObject.isActive) {
      ShowBadToasty("Sale is not active yet. Try again later.");
    } else {
      //console.log(amount, this.accountObject.addr);
      let _ref = this.referral ? this.referral : this.accountObject.addr;
      let estimateGas = 100000;
      try {
        estimateGas = await this.contract.methods
          .buyEggs(_ref.toString())
          .estimateGas({
            from: this.accountObject.addr,
            value: this.web3.utils.toWei(amount, "ether"),
          });
      } catch (e) {
        ShowBadToasty("Insufficient funds. Top up your wallet.");
      }

      this.contract.methods
        .buyEggs(_ref.toString())
        .send({
          from: this.accountObject.addr,
          value: this.web3.utils.toWei(amount, "ether"),
          gas: estimateGas,
          gasPrice: 5000000000,
        })
        .on("transactionHash", (hash) => {
          //console.log("Transaction Hash: ", hash);
          ShowGoodToasty("Transaction is Submitted!");
        })
        .on("receipt", (receipt) => {
          this.FetchUserData();
          //console.log("Receipt: ", receipt);
          ShowGoodToasty("Transaction is Completed!");
        })
        .on("error", (error, receipt) => {
          this.FetchUserData();
          //console.log("Error receipt: ", receipt);
          ShowBadToasty("Transaction is Rejected!");
        });
    }
  }

  async ClaimReward() {
    if (!this.connected) {
      ShowBadToasty("Please, connect your wallet to use our DApp.");
    } else if (parseInt(this.accountObject.chainId) !== this.supportedChain) {
      ShowBadToasty("Please, choose BSC Network to use our DApp.");
    } else if (!this.accountObject.isActive) {
      ShowBadToasty("Sale is not active yet. Try again later.");
    } else {
      this.contract.methods
        .sellEggs()
        .send({ from: this.accountObject.addr })
        .on("transactionHash", (hash) => {
          //console.log("Transaction Hash: ", hash);
          ShowGoodToasty("Transaction is Submitted!");
        })
        .on("receipt", (receipt) => {
          this.FetchUserData();
          //console.log("Receipt: ", receipt);
          ShowGoodToasty("You've successfully claimed your rewards!");
        })
        .on("error", (error, receipt) => {
          this.FetchUserData();
          //console.log("Error receipt: ", receipt);
          ShowBadToasty("Transaction is Rejected!");
        });
    }
  }

  async Reinvest() {
    if (!this.connected) {
      ShowBadToasty("Please, connect your wallet to use our DApp.");
    } else if (parseInt(this.accountObject.chainId) !== this.supportedChain) {
      ShowBadToasty("Please, choose BSC Network to use our DApp.");
    } else if (!this.accountObject.isActive) {
      ShowBadToasty("Sale is not active yet. Try again later.");
    } else {
      let _ref = this.referral ? this.referral : this.accountObject.addr;

      this.contract.methods
        .hatchEggs(_ref.toString())
        .send({ from: this.accountObject.addr })
        .on("transactionHash", (hash) => {
          //console.log("Transaction Hash: ", hash);
          ShowGoodToasty("Transaction is Submitted!");
        })
        .on("receipt", (receipt) => {
          this.FetchUserData();
          //console.log("Receipt: ", receipt);
          ShowGoodToasty("You've successfully reinvested!");
        })
        .on("error", (error, receipt) => {
          this.FetchUserData();
          //console.log("Error receipt: ", receipt);
          ShowBadToasty("Transaction is Rejected!");
        });
    }
  }

  async FetchUserData() {
    // Get current chain
    this.accountObject.chainId = await this.web3.eth.getChainId();

    let accounts = await this.web3.eth.getAccounts();
    this.accountObject.addr = accounts[0];

    let balance = await this.web3.eth.getBalance(this.accountObject.addr);
    balance = this.web3.utils.fromWei(balance, "ether");
    this.accountObject.balance = parseFloat(balance).toFixed(4);

    //console.log("Fetched Data");

    if (parseInt(this.accountObject.chainId) === this.supportedChain) {
      //this.accountObject.isActive = (await this.GetContractBalance()) > 0;
      this.accountObject.isActive = true;

      if (this.accountObject.isActive) {
        this.accountObject.workingPrinters = await this.GetWorkingPrinters();

        if (this.accountObject.workingPrinters > 0)
          this.accountObject.bnbPerDay = parseFloat(
            this.web3.utils.fromWei(await this.GetBnbPerDay(), "ether")
          ).toFixed(4);
        else this.accountObject.bnbPerDay = 0;
        this.accountObject.myReferrals = await this.GetReferrals();
        this.accountObject.contractBalance = parseFloat(
          this.web3.utils.fromWei(await this.GetContractBalance(), "ether")
        ).toFixed(2);

        let earned = await this.GetMyPrinters();

        if (earned > 0)
          this.accountObject.rewards = parseFloat(
            this.web3.utils.fromWei(await this.CalcReward(earned), "ether")
          ).toFixed(4);
        else this.accountObject.rewards = 0;
      }
    }

    await this.UpdateUserFields();
  }

  async UpdateUserFields() {
    if (parseInt(this.accountObject.chainId) !== this.supportedChain) {
      //console.log(parseInt(this.accountObject.chainId));
      AddrEl.text(
        this.accountObject.addr
          ? truncateAddress(this.accountObject.addr)
          : "Connect Wallet"
      );
      BalanceEl.text(`${0} BNB`);
      WorkingPrintersEl.text(0);
      BnbPerDayEl.text(`${0} BNB`);
      RewardsEl.text(`${0} BNB`);
      MyReferralsEl.text(0);
      ContractTVL.text(`${0} BNB`);
    } else {
      AddrEl.text(
        this.accountObject.addr
          ? truncateAddress(this.accountObject.addr)
          : "Connect Wallet"
      );
      BalanceEl.text(`${this.accountObject.balance} BNB`);
      WorkingPrintersEl.text(this.accountObject.workingPrinters);
      BnbPerDayEl.text(`${this.accountObject.bnbPerDay} BNB`);
      RewardsEl.text(`${this.accountObject.rewards} BNB`);
      MyReferralsEl.text(this.accountObject.myReferrals);
      ContractTVL.text(`${this.accountObject.contractBalance} BNB`);
    }
  }

  async HandleProviderEvent(event, data) {
    //console.log("Event!");
    if (event === "accountsChanged") {
      //console.log("Accounts Changed!", data);
      if (!data.length) {
        ShowBadToasty("Wallet disconnected");
        this.accountObject = {
          addr: "",
          balance: 0,
          workingPrinters: 0,
          bnbPerDay: 0,
          rewards: 0,
          myReferrals: 0,
          chainId: 0,
          isActive: false,
          contractBalance: 0,
        };

        this.connected = false;

        await this.UpdateUserFields();
      } else {
        await this.FetchUserData();
      }
    }
    if (event === "chainChanged") {
      //console.log("Chain Changed!", data);
      await this.FetchUserData();
    }

    if (parseInt(this.accountObject.chainId) === this.supportedChain)
      ShowGoodToasty("Connected Successfully!");
    else ShowBadToasty("Please, select Binance Smart Chain!");
  }

  async CopyReferralLink() {
    if (this.connected) {
      navigator.clipboard.writeText(
        `${window.location.hostname}/?ref=${this.accountObject.addr}`
      );
      ShowGoodToasty("Your referral link was successfully copied!");
    } else ShowBadToasty("Connect wallet before copying referral link!");
  }

  async ConnectWallet() {
    if (!this.connected) hideIfConnected.css({ display: "none" });
    else hideIfConnected.css({ display: "flex" });

    if (!this.web3 && !this.provider) {
      ShowGoodToasty("Connecting...");
      this.provider = web3Modal.connect().then(async (provider) => {
        this.provider = provider;

        this.web3 = new Web3(this.provider);

        this.contract = new this.web3.eth.Contract(
          this.contractABI,
          this.contractAddr
        );

        // Subscribe to accounts change
        this.provider
          .on("accountsChanged", (accounts) => {
            this.HandleProviderEvent("accountsChanged", accounts);
          })
          .on("chainChanged", (chainId) => {
            this.HandleProviderEvent("chainChanged", chainId);
          });

        this.connected = true;

        //console.log("Connected!");

        await this.FetchUserData();

        await this.HandleProviderEvent("onConnection", []);
      });
    } else {
      if (!this.connected) {
        //console.log("Reconnecting...");
        await web3Modal.connect().then(async (provider) => {
          this.provider = provider;

          this.web3.setProvider(provider);

          //this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddr);

          await this.FetchUserData();
          this.connected = true;
          await this.HandleProviderEvent();
        });
      } else {
        //console.log("Disconnected");
        web3Modal.clearCachedProvider();
        ShowBadToasty("Wallet disconnected");
        this.accountObject = {
          addr: "",
          balance: 0,
          workingPrinters: 0,
          bnbPerDay: 0,
          rewards: 0,
          myReferrals: 0,
          chainId: 0,
          isActive: false,
          contractBalance: 0,
        };

        await this.UpdateUserFields();

        this.connected = false;
      }
    }
  }
}

let dapp = new DApp(ref);

connectWallet.click(async () => {
  // if (!accountObj.addr) {
  //     await ConnectWallet();
  // } else {
  //     await DisconnectWallet();
  // }
  await dapp.ConnectWallet();
});

CopyReferralLink.click(async () => {
  await dapp.CopyReferralLink();
});

setInterval(async () => {
  if (dapp.connected) {
    await dapp.FetchUserData();
    //console.log("Fetched!");
  }
}, 5000);

// Utility functions
const truncateAddress = (address) => {
  if (!address) return "Connect Wallet";
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

function ShowBadToasty(_text) {
  Toastify({
    text: _text,
    style: {
      background: "#FF5050",
      color: "black",
      fontSize: "14px",
      fontWeight: "600",
      position: "absolute",
    },
    offset: {
      x: 0,
      y: 80,
    },
    selector: document.getElementById("header"),
    onClick: () => {}, // Callback after click
  }).showToast();
}

function toUTF8Array(str) {
  let utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return utf8;
}

function ShowGoodToasty(_text) {
  Toastify({
    text: _text,
    style: {
      background: "#90ff50",
      color: "black",
      fontSize: "14px",
      fontWeight: "600",
      position: "absolute",
    },
    offset: {
      x: 0,
      y: 80,
    },
    selector: document.getElementById("header"),
    onClick: () => {}, // Callback after click
  }).showToast();
}

function CalcEarnings(value) {
  return (value * 0.08).toFixed(4);
}

RentPrintersInput.on("input", (obj) => {
  let calc = CalcEarnings(RentPrintersInput.val());

  RentPrintersResult.text(`~${calc} BNB Daily`);
});

RentPrintersSubmit.click(async () => {
  let res = RentPrintersInput.val();
  if (res < 0.01) {
    ShowBadToasty("Min investment amount is 0.01 BNB");
  } else await dapp.BuyPrinters(RentPrintersInput.val());
});

$(".reinvest").click(async () => {
  await dapp.Reinvest();
});

$(".claim").click(async () => {
  await dapp.ClaimReward();
});

// //
//web3Modal.connect();
// console.log(provider)
