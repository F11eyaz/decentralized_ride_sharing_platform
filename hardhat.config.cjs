require("@nomiclabs/hardhat-waffle");

module.exports = {
    solidity: "0.8.20",
    networks: {
        ganache: {
            url: "http://127.0.0.1:7545",
            accounts: [
                "PRIVATE_KEY_1",
                "PRIVATE_KEY_2",
                "PRIVATE_KEY_3",
                "PRIVATE_KEY_4",
            ], // Replace with your Ganache account private key
        },
    },
};
