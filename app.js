let provider;
let signer;
let contract;

const contractAddress = "0x6514bc813e6a910fc542b40fdb1c40a03b4efecf";

const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "addCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stopVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_candidateId",
        type: "uint256",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "candidatesCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_candidateId",
        type: "uint256",
      },
    ],
    name: "getCandidate",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "hasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "votingOpen",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();
    document.getElementById("walletAddress").innerText =
      `Connected: ${address}`;
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    loadCandidates();
  } else {
    alert("Please install MetaMask to use this app.");
  }
}

async function loadCandidates() {
  try {
    const count = await contract.candidatesCount();
    let html = "<h2>Candidates</h2>";
    for (let i = 1; i <= count; i++) {
      const candidate = await contract.getCandidate(i);
      html += `<p><strong>ID:</strong> ${i} - ${candidate.name} | 🗳️ Votes: ${candidate.voteCount}</p>`;
    }
    document.getElementById("candidates").innerHTML = html;
  } catch (error) {
    console.error("Error loading candidates:", error);
  }
}

async function vote() {
  const id = document.getElementById("candidateId").value;
  try {
    const tx = await contract.vote(id);
    await tx.wait();
    document.getElementById("voteMessage").innerText = "✅ Vote submitted!";
    loadCandidates();
  } catch (err) {
    console.error(err);
    document.getElementById("voteMessage").innerText =
      `❌ Error: ${err.reason || err.message}`;
  }
}

async function addCandidate() {
  const name = document.getElementById("newCandidateName").value;
  if (!name.trim()) {
    document.getElementById("adminMessage").innerText =
      "❌ Name cannot be empty.";
    return;
  }

  try {
    const tx = await contract.addCandidate(name);
    await tx.wait();
    document.getElementById("adminMessage").innerText =
      `✅ Added candidate: ${name}`;
    document.getElementById("newCandidateName").value = "";
    loadCandidates(); // refresh list
  } catch (err) {
    console.error(err);
    document.getElementById("adminMessage").innerText =
      `❌ Error: ${err.reason || err.message}`;
  }
}

async function startVoting() {
  try {
    const tx = await contract.startVoting();
    await tx.wait();
    document.getElementById("votingStatusMessage").innerText =
      "✅ Voting started.";
  } catch (err) {
    console.error(err);
    document.getElementById("votingStatusMessage").innerText =
      `❌ Error: ${err.reason || err.message}`;
  }
}

async function stopVoting() {
  try {
    const tx = await contract.stopVoting();
    await tx.wait();
    document.getElementById("votingStatusMessage").innerText =
      "🛑 Voting stopped.";
  } catch (err) {
    console.error(err);
    document.getElementById("votingStatusMessage").innerText =
      `❌ Error: ${err.reason || err.message}`;
  }
}
