const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RideSharing Contract", function () {
  let RideToken, rideToken;
  let RideSharing, rideSharing;
  let owner, addr1, addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the RideToken contract with an initial supply
    const initialSupply = ethers.utils.parseEther("1000000"); // 1 million tokens
    RideToken = await ethers.getContractFactory("RideToken");
    rideToken = await RideToken.deploy(initialSupply);
    await rideToken.deployed();

    // Deploy the RideSharing contract, passing the RideToken address
    RideSharing = await ethers.getContractFactory("RideSharing");
    rideSharing = await RideSharing.deploy(rideToken.address);
    await rideSharing.deployed();
  });

  it("should register a driver", async function () {
    // Register addr1 as a driver
    await rideSharing.connect(addr1).registerUser(
      "John", 
      "Doe", 
      "123456789", 
      true,  // isDriver
      "Tesla", 
      "123-ABC", 
      "Red", 
      100 // price per ride
    );

    // Fetch the user details and check
    const user = await rideSharing.getUser(addr1.address);

    expect(user.firstName).to.equal("John");
    expect(user.lastName).to.equal("Doe");
    expect(user.phoneNumber).to.equal("123456789");
    expect(user.isDriver).to.be.true;
    expect(user.vehicleModel).to.equal("Tesla");
    expect(user.vehicleNumber).to.equal("123-ABC");
    expect(user.vehicleColor).to.equal("Red");
    expect(user.pricePerRide).to.equal(100);
  });

  it("should register a passenger", async function () {
    // Register addr2 as a passenger
    await rideSharing.connect(addr2).registerUser(
      "Jane", 
      "Smith", 
      "987654321", 
      false, // isDriver
      "",    // vehicleModel
      "",    // vehicleNumber
      "",    // vehicleColor
      0      // price per ride (irrelevant for passengers)
    );

    // Fetch the user details and check
    const user = await rideSharing.getUser(addr2.address);

    expect(user.firstName).to.equal("Jane");
    expect(user.lastName).to.equal("Smith");
    expect(user.phoneNumber).to.equal("987654321");
    expect(user.isDriver).to.be.false;
    expect(user.vehicleModel).to.equal("");
  });

  it("should allow a passenger to request a ride from a driver", async function () {
    // Register addr1 as a driver
    await rideSharing.connect(addr1).registerUser(
      "John", 
      "Doe", 
      "123456789", 
      true,  // isDriver
      "Tesla", 
      "123-ABC", 
      "Red", 
      100 // price per ride
    );

    // Register addr2 as a passenger
    await rideSharing.connect(addr2).registerUser(
      "Jane", 
      "Smith", 
      "987654321", 
      false, // isDriver
      "",    // vehicleModel
      "",    // vehicleNumber
      "",    // vehicleColor
      0      // price per ride (irrelevant for passengers)
    );

    // Transfer tokens to addr2 (so they have tokens to pay for the ride)
    await rideToken.transfer(addr2.address, 500);

    // Approve RideSharing contract to spend tokens on behalf of addr2
    await rideToken.connect(addr2).approve(rideSharing.address, 100);

    // Request a ride from addr2 (passenger) to addr1 (driver)
    await rideSharing.connect(addr2).requestRide(addr1.address);

    // Check the ride details
    const ride = await rideSharing.rides(0);
    expect(ride.passenger).to.equal(addr2.address);
    expect(ride.driver).to.equal(addr1.address);
    expect(ride.fare).to.equal(100);
    expect(ride.completed).to.be.false;
  });

  it("should complete a ride", async function () {
    // Register addr1 as a driver
    await rideSharing.connect(addr1).registerUser(
      "John", 
      "Doe", 
      "123456789", 
      true,  // isDriver
      "Tesla", 
      "123-ABC", 
      "Red", 
      100 // price per ride
    );

    // Register addr2 as a passenger
    await rideSharing.connect(addr2).registerUser(
      "Jane", 
      "Smith", 
      "987654321", 
      false, // isDriver
      "",    // vehicleModel
      "",    // vehicleNumber
      "",    // vehicleColor
      0      // price per ride (irrelevant for passengers)
    );

    // Transfer tokens to addr2 (so they have tokens to pay for the ride)
    await rideToken.transfer(addr2.address, 500);

    // Approve RideSharing contract to spend tokens on behalf of addr2
    await rideToken.connect(addr2).approve(rideSharing.address, 100);

    // Request a ride from addr2 (passenger) to addr1 (driver)
    await rideSharing.connect(addr2).requestRide(addr1.address);

    // Complete the ride by addr1 (driver)
    await rideSharing.connect(addr1).completeRide(0);

    // Check the ride details
    const ride = await rideSharing.rides(0);
    expect(ride.completed).to.be.true;
  });
});