const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    // Deploy the RideToken contract
    const initialSupply = ethers.utils.parseEther("1000000"); // 1 million tokens
    const RideToken = await hre.ethers.getContractFactory("RideToken");
    const rideToken = await RideToken.deploy(initialSupply);
    await rideToken.deployed();
    console.log("RideToken deployed to:", rideToken.address);

    // Deploy the RideSharing contract with the RideToken address
    const RideSharing = await hre.ethers.getContractFactory("RideSharing");
    const rideSharing = await RideSharing.deploy(rideToken.address);
    await rideSharing.deployed();
    console.log("RideSharing deployed to:", rideSharing.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });