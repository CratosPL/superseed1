// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SuperseedGameScores {
    mapping(address => uint256) public playerScores;
    event ScoreUpdated(address indexed player, uint256 score, uint256 timestamp);

    function saveScore(uint256 _score) public {
        playerScores[msg.sender] = _score;
        emit ScoreUpdated(msg.sender, _score, block.timestamp);
    }

    function getScore(address _player) public view returns (uint256) {
        return playerScores[_player];
    }
}