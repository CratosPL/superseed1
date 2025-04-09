// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SuperseedGameScores {
    mapping(address => uint256) public playerScores;
    
    struct Score {
        address player;
        uint256 score;
    }
    
    Score[] public topScores; // Tablica najlepszych wyników
    
    event ScoreUpdated(address indexed player, uint256 score, uint256 timestamp);

    function saveScore(uint256 _score) public {
        playerScores[msg.sender] = _score;
        updateTopScores(msg.sender, _score); // Aktualizacja listy najlepszych wyników
        emit ScoreUpdated(msg.sender, _score, block.timestamp);
    }

    function getScore(address _player) public view returns (uint256) {
        return playerScores[_player];
    }
    
    function getTopScores() public view returns (Score[] memory) {
        return topScores; // Zwraca tablicę najlepszych wyników
    }
    
    function updateTopScores(address _player, uint256 _score) internal {
        // Sprawdzamy, czy gracz już jest na liście
        bool playerExists = false;
        for (uint i = 0; i < topScores.length; i++) {
            if (topScores[i].player == _player) {
                playerExists = true;
                if (_score > topScores[i].score) {
                    topScores[i].score = _score; // Aktualizujemy wynik, jeśli jest lepszy
                }
                break;
            }
        }
        
        // Jeśli gracz nie istnieje, dodajemy go
        if (!playerExists) {
            topScores.push(Score(_player, _score));
        }
        
        // Sortowanie (bubble sort) i ograniczenie do 5 najlepszych
        for (uint i = 0; i < topScores.length - 1; i++) {
            for (uint j = i + 1; j < topScores.length; j++) {
                if (topScores[i].score < topScores[j].score) {
                    Score memory temp = topScores[i];
                    topScores[i] = topScores[j];
                    topScores[j] = temp;
                }
            }
        }
        
        // Jeśli mamy więcej niż 5 wyników, usuwamy najgorszy
        if (topScores.length > 5) {
            topScores.pop();
        }
    }
}