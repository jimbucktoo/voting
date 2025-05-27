let provider;
let signer;
let contract;

const contractAddress = "0x1136f22dc6bdd1cbc10f4db44313b6fe55a79923";

const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "removeCandidate",
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
  if (!window.ethereum) return alert("Please install MetaMask.");

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  const address = await signer.getAddress();

  document.getElementById("walletAddress").innerText = `Connected: ${address}`;
  contract = new ethers.Contract(contractAddress, contractABI, signer);

  const admin = await contract.admin();
  const isAdmin = address.toLowerCase() === admin.toLowerCase();
  document.getElementById("adminSection").style.display = isAdmin
    ? "block"
    : "none";
  document.getElementById("votingControl").style.display = isAdmin
    ? "block"
    : "none";

  loadCandidates();
}

async function loadCandidates() {
  const count = await contract.candidatesCount();
  let html = "<h2>Candidates</h2>";
  for (let i = 1; i <= count; i++) {
    try {
      const c = await contract.getCandidate(i);
      if (c.name) {
        html += `<p><strong>👤 ID:</strong> ${i} - ${c.name} | Votes: ${c.voteCount}</p>`;
      }
    } catch {}
  }
  document.getElementById("candidates").innerHTML = html;
  document.getElementById("voteSection").style.display = "block";
}

async function vote() {
  const idInput = document.getElementById("candidateId");
  const id = idInput.value;
  const btn = document.getElementById("voteBtn");
  const msg = document.getElementById("voteMessage");
  const spinner = document.getElementById("voteSpinner");
  const text = document.getElementById("voteLoadingText");

  try {
    btn.disabled = true;
    msg.innerText = "";
    text.style.display = spinner.style.display = "block";

    const tx = await contract.vote(id);
    await tx.wait();

    msg.innerText = "✅ Vote Submitted";
    idInput.value = "";
    loadCandidates();
  } catch (err) {
    msg.innerText = `❌ ${err.reason || err.message}`;
  } finally {
    btn.disabled = false;
    spinner.style.display = text.style.display = "none";
  }
}

async function addCandidate() {
  const nameInput = document.getElementById("newCandidateName");
  const name = nameInput.value;
  const btn = document.getElementById("addCandidateBtn");
  const msg = document.getElementById("adminMessage");
  const spinner = document.getElementById("adminSpinner");
  const text = document.getElementById("adminLoadingText");

  if (!name.trim()) return (msg.innerText = "❌ Name Required");

  try {
    btn.disabled = true;
    text.style.display = spinner.style.display = "block";

    const tx = await contract.addCandidate(name);
    await tx.wait();

    msg.innerText = `✅ Candidate "${name}" Added`;
    nameInput.value = "";
    loadCandidates();
  } catch (err) {
    msg.innerText = `❌ ${err.reason || err.message}`;
  } finally {
    btn.disabled = false;
    spinner.style.display = text.style.display = "none";
  }
}

async function removeCandidate() {
  const idInput = document.getElementById("removeCandidateId");
  const id = idInput.value;
  const btn = document.getElementById("removeCandidateBtn");
  const msg = document.getElementById("removeMessage");
  const spinner = document.getElementById("removeSpinner");
  const text = document.getElementById("removeLoadingText");

  try {
    btn.disabled = true;
    text.style.display = spinner.style.display = "block";

    const tx = await contract.removeCandidate(id);
    await tx.wait();

    msg.innerText = `✅ Candidate ID ${id} Removed`;
    idInput.value = "";
    loadCandidates();
  } catch (err) {
    msg.innerText = `❌ ${err.reason || err.message}`;
  } finally {
    btn.disabled = false;
    spinner.style.display = text.style.display = "none";
  }
}

async function startVoting() {
  const btn = document.getElementById("startVotingBtn");
  const msg = document.getElementById("votingStatusMessage");
  const spinner = document.getElementById("votingSpinner");
  const text = document.getElementById("votingLoadingText");

  try {
    btn.disabled = true;
    text.style.display = spinner.style.display = "block";

    const tx = await contract.startVoting();
    await tx.wait();

    msg.innerText = "✅ Voting Started";
  } catch (err) {
    msg.innerText = `❌ ${err.reason || err.message}`;
  } finally {
    btn.disabled = false;
    spinner.style.display = text.style.display = "none";
  }
}

async function stopVoting() {
  const btn = document.getElementById("stopVotingBtn");
  const msg = document.getElementById("votingStatusMessage");
  const spinner = document.getElementById("votingSpinner");
  const text = document.getElementById("votingLoadingText");

  try {
    btn.disabled = true;
    text.style.display = spinner.style.display = "block";

    const tx = await contract.stopVoting();
    await tx.wait();

    msg.innerText = "🛑 Voting Stopped";
  } catch (err) {
    msg.innerText = `❌ ${err.reason || err.message}`;
  } finally {
    btn.disabled = false;
    spinner.style.display = text.style.display = "none";
  }
}
