// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentContract {
    event PaymentSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string transactionId,
        uint256 timestamp
    );

    event PaymentReceived(
        address indexed from,
        uint256 amount,
        string reference,
        uint256 timestamp
    );

    mapping(address => uint256) public balances;
    mapping(string => bool) public processedTransactions;

    function sendPayment(
        address payable recipient,
        string memory transactionId
    ) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        require(!processedTransactions[transactionId], "Transaction already processed");

        processedTransactions[transactionId] = true;
        balances[msg.sender] += msg.value;
        balances[recipient] += msg.value;

        recipient.transfer(msg.value);

        emit PaymentSent(
            msg.sender,
            recipient,
            msg.value,
            transactionId,
            block.timestamp
        );
    }

    function deposit(string memory reference) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        balances[msg.sender] += msg.value;

        emit PaymentReceived(
            msg.sender,
            msg.value,
            reference,
            block.timestamp
        );
    }

    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }
}
