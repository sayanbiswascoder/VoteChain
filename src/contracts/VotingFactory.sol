// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Voting
 * @notice A single voting instance with candidates, time window, and one-address-one-vote.
 */
contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public immutable creator;
    string public title;
    uint256 public startTime;
    uint256 public endTime;
    bool public finalized;

    Candidate[] private _candidates;
    mapping(address => bool) public hasVoted;

    event Voted(address indexed voter, uint256 indexed candidateIndex);
    event Finalized(uint256 winningCandidateIndex);

    modifier onlyCreator() {
        require(msg.sender == creator, "Not creator");
        _;
    }

    modifier withinVotingPeriod() {
        require(block.timestamp >= startTime, "Voting not started");
        require(block.timestamp <= endTime, "Voting ended");
        _;
    }

    constructor(
        address _creator,
        string memory _title,
        string[] memory candidateNames,
        uint256 _startTime,
        uint256 _endTime
    ) {
        require(candidateNames.length >= 2, "Need >= 2 candidates");
        require(_startTime < _endTime, "Invalid time range");
        require(_endTime > block.timestamp, "End must be in future");

        creator = _creator;
        title = _title;
        startTime = _startTime;
        endTime = _endTime;

        for (uint256 i = 0; i < candidateNames.length; i++) {
            _candidates.push(Candidate({name: candidateNames[i], voteCount: 0}));
        }
    }

    function candidatesCount() external view returns (uint256) {
        return _candidates.length;
    }

    function getCandidate(uint256 index) external view returns (string memory name, uint256 voteCount) {
        require(index < _candidates.length, "Invalid index");
        Candidate storage c = _candidates[index];
        return (c.name, c.voteCount);
    }

    function vote(uint256 candidateIndex) external withinVotingPeriod {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateIndex < _candidates.length, "Invalid candidate");

        hasVoted[msg.sender] = true;
        _candidates[candidateIndex].voteCount += 1;

        emit Voted(msg.sender, candidateIndex);
    }

    function winningCandidate() public view returns (uint256 winningIndex, uint256 winningVotes) {
        uint256 maxVotes = 0;
        uint256 winIndex = 0;
        for (uint256 i = 0; i < _candidates.length; i++) {
            if (_candidates[i].voteCount > maxVotes) {
                maxVotes = _candidates[i].voteCount;
                winIndex = i;
            }
        }
        return (winIndex, maxVotes);
    }

    function finalize() external onlyCreator {
        require(block.timestamp > endTime, "Voting not ended");
        require(!finalized, "Already finalized");
        finalized = true;
        (uint256 winIndex, ) = winningCandidate();
        emit Finalized(winIndex);
    }
}

/**
 * @title VotingFactory
 * @notice Deploys and tracks multiple Voting instances.
 */
contract VotingFactory {
    address[] public allVotings;
    mapping(address => address[]) public votingsByCreator;

    event VotingCreated(address indexed creator, address voting, string title);

    function createVoting(
        string memory title,
        string[] memory candidateNames,
        uint256 startTime,
        uint256 endTime
    ) external returns (address votingAddr) {
        Voting v = new Voting(msg.sender, title, candidateNames, startTime, endTime);
        votingAddr = address(v);
        allVotings.push(votingAddr);
        votingsByCreator[msg.sender].push(votingAddr);
        emit VotingCreated(msg.sender, votingAddr, title);
    }

    function getAllVotings() external view returns (address[] memory) {
        return allVotings;
    }

    function getVotingsByCreator(address creator) external view returns (address[] memory) {
        return votingsByCreator[creator];
    }
}
