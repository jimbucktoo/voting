// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public admin;
    bool public votingOpen;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;

    mapping(address => bool) public hasVoted;

    constructor() {
        admin = msg.sender;
        votingOpen = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }

    modifier voteIsOpen() {
        require(votingOpen, "Voting is not open");
        _;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function removeCandidate(uint256 _id) public onlyAdmin {
        require(_id > 0 && _id <= candidatesCount, "Invalid candidate ID");
        require(
            bytes(candidates[_id].name).length != 0,
            "Candidate already removed"
        );
        delete candidates[_id];
    }

    function startVoting() public onlyAdmin {
        votingOpen = true;
    }

    function stopVoting() public onlyAdmin {
        votingOpen = false;
    }

    function vote(uint256 _candidateId) public voteIsOpen {
        require(!hasVoted[msg.sender], "You have already voted");
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "Invalid candidate"
        );

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
    }

    function getCandidate(uint256 _candidateId)
        public
        view
        returns (string memory name, uint256 voteCount)
    {
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "Invalid candidate"
        );
        Candidate memory c = candidates[_candidateId];
        return (c.name, c.voteCount);
    }
}
