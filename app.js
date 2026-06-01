// ===============================
// ToyPunks Mint Site Settings
// ===============================
const CONTRACT_ADDRESS = "PASTE_CONTRACT_ADDRESS_HERE";
const RPC_URL = "https://eth.llamarpc.com"; // Ethereum mainnet public RPC. Change if your collection is on another chain.
const MAX_SUPPLY = 10000;
const MINT_PRICE_ETH = "0.00005";
const MAX_PER_TX = 20;

// ABI works with common ERC721 mint contracts: mint(uint256) payable + totalSupply()
const ABI = [
  "function mint(uint256 quantity) payable",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)"
];

const images = [
  "punk01.jpg", "punk02.jpg", "punk03.jpg", "punk04.jpg", "punk05.jpg", "punk06.jpg", "punk07.jpg",
  "punk08.jpg", "punk09.jpg", "punk10.jpg", "punk11.jpg", "punk12.jpg", "punk13.jpg", "punk14.jpg"
];

const topGrid = document.getElementById("topGrid");
images.forEach((img) => {
  const div = document.createElement("div");
  div.className = "punk-card";
  div.innerHTML = `<img src="assets/${img}" alt="ToyPunk" />`;
  topGrid.appendChild(div);
});

const connectBtn = document.getElementById("connectBtn");
const mintBtn = document.getElementById("mintBtn");
const minusBtn = document.getElementById("minusBtn");
const plusBtn = document.getElementById("plusBtn");
const qtyInput = document.getElementById("qtyInput");
const statusEl = document.getElementById("status");
const mintedCount = document.getElementById("mintedCount");
const maxSupplyEl = document.getElementById("maxSupply");
const priceText = document.getElementById("priceText");
const totalPrice = document.getElementById("totalPrice");

let signer;
let writeContract;

maxSupplyEl.textContent = MAX_SUPPLY.toLocaleString();
priceText.textContent = `${MINT_PRICE_ETH} ETH`;
qtyInput.max = MAX_PER_TX;

function shortAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function updateTotal() {
  let qty = Number(qtyInput.value || 1);
  if (qty < 1) qty = 1;
  if (qty > MAX_PER_TX) qty = MAX_PER_TX;
  qtyInput.value = qty;
  totalPrice.textContent = (Number(MINT_PRICE_ETH) * qty).toFixed(5);
}

minusBtn.onclick = () => { qtyInput.value = Math.max(1, Number(qtyInput.value) - 1); updateTotal(); };
plusBtn.onclick = () => { qtyInput.value = Math.min(MAX_PER_TX, Number(qtyInput.value) + 1); updateTotal(); };
qtyInput.oninput = updateTotal;

async function loadMinted() {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "PASTE_CONTRACT_ADDRESS_HERE") {
    mintedCount.textContent = "0";
    return;
  }
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const readContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const supply = await readContract.totalSupply();
    mintedCount.textContent = Number(supply.toString()).toLocaleString();
  } catch (err) {
    console.log("Could not load totalSupply", err);
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("Open this site in MetaMask/Trust Wallet browser or install MetaMask.");
    return;
  }
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();
    writeContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    connectBtn.textContent = shortAddress(address);
    setStatus("Connected: " + shortAddress(address));
  } catch (err) {
    console.error(err);
    setStatus("Wallet connection failed");
  }
}

async function mint() {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "PASTE_CONTRACT_ADDRESS_HERE") {
    alert("Paste your contract address in app.js first.");
    return;
  }
  if (!writeContract) {
    await connectWallet();
    if (!writeContract) return;
  }
  const qty = Number(qtyInput.value || 1);
  const value = ethers.utils.parseEther((Number(MINT_PRICE_ETH) * qty).toFixed(18));
  try {
    setStatus("Confirm transaction in wallet...");
    const tx = await writeContract.mint(qty, { value });
    setStatus("Transaction sent: " + tx.hash.slice(0, 10) + "...");
    await tx.wait();
    setStatus("Mint successful!");
    loadMinted();
  } catch (err) {
    console.error(err);
    setStatus(err?.data?.message || err?.message || "Mint failed");
  }
}

connectBtn.onclick = connectWallet;
mintBtn.onclick = mint;
updateTotal();
loadMinted();
setInterval(loadMinted, 15000);
