// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RideToken.sol";

contract RideSharing {
    struct Vehicle {
        string model;
        string number;
        string color;
    }

    struct User {
        address payable wallet;
        string firstName;
        string lastName;
        string phoneNumber;
        uint8 rating; // Initially set to 5, 1 is the min, 5 is the max
        bool isDriver;
        Vehicle vehicleDetails; // Only populated if the user is a driver
        uint16 pricePerRide; // Only relevant for drivers
        bool isAvailable; // Only relevant for drivers
    }

    struct Ride {
        address passenger;
        address driver;
        uint256 fare;
        bool completed;
    }

    receive() external payable {}

    fallback() external payable {}

    mapping(address => User) public users; // Mapping to store all users
    Ride[] public rides;

    RideToken public rideToken;

    constructor(address tokenAddress) {
        rideToken = RideToken(tokenAddress);
    }

    event RideRequested(address indexed passenger, address indexed driver, uint256 fare);
    event RideCompleted(address indexed passenger, address indexed driver, uint256 fare);
    event DriverRated(address indexed driver, uint8 rating);
    event PassengerRated(address indexed passenger, uint8 rating);

    modifier onlyDriver() {
        require(users[msg.sender].isDriver, "Not a registered driver");
        _;
    }

    modifier onlyPassenger() {
        require(!users[msg.sender].isDriver, "Not a registered passenger");
        _;
    }

    // Register a user (either driver or passenger) based on the input
    function registerUser(
        string memory _firstName,
        string memory _lastName,
        string memory _phoneNumber,
        bool _isDriver,
        string memory _vehicleModel,
        string memory _vehicleNumber,
        string memory _vehicleColor,
        uint16 _pricePerRide
    ) public {
        require(users[msg.sender].wallet == address(0), "User already registered");

        Vehicle memory vehicle;

        if (_isDriver) {
            vehicle = Vehicle(_vehicleModel, _vehicleNumber, _vehicleColor);
            users[msg.sender] = User(
                payable(msg.sender),
                _firstName,
                _lastName,
                _phoneNumber,
                5, // Initial rating set to 5
                true, // isDriver
                vehicle,
                _pricePerRide,
                true // Drivers are initially available
            );
        } else {
            users[msg.sender] = User(
                payable(msg.sender),
                _firstName,
                _lastName,
                _phoneNumber,
                5, // Initial rating set to 5
                false, // isDriver
                Vehicle("", "", ""), // Empty vehicle details for passengers
                0, // No price per ride for passengers
                false // Not applicable for passengers
            );
        }
    }

    // Get user details to interact with frontend
    function getUser(address _user)
        public
        view
        returns (
            string memory firstName,
            string memory lastName,
            string memory phoneNumber,
            uint8 rating,
            bool isDriver,
            string memory vehicleModel,
            string memory vehicleNumber,
            string memory vehicleColor,
            uint16 pricePerRide,
            bool isAvailable
        )
    {
        User memory user = users[_user];

        firstName = user.firstName;
        lastName = user.lastName;
        phoneNumber = user.phoneNumber;
        rating = user.rating;
        isDriver = user.isDriver;
        vehicleModel = user.vehicleDetails.model;
        vehicleNumber = user.vehicleDetails.number;
        vehicleColor = user.vehicleDetails.color;
        pricePerRide = user.pricePerRide;
        isAvailable = user.isAvailable;
    }

    function requestRide(address _driver) public {
        require(users[_driver].isDriver && users[_driver].isAvailable, "Driver not available");
        uint256 fare = users[_driver].pricePerRide;

        // Transfer tokens from passenger to contract
        require(rideToken.transferFrom(msg.sender, address(this), fare), "Token transfer failed");

        // Create a new ride and store it
        rides.push(Ride(msg.sender, _driver, fare, false));
        
        emit RideRequested(msg.sender, _driver, fare);
    }

    function completeRide(uint256 rideIndex) public onlyDriver {
        Ride storage ride = rides[rideIndex];
        require(msg.sender == ride.driver, "Not the driver of this ride");
        require(!ride.completed, "Ride already completed");

        ride.completed = true;

        // Transfer fare to the driver in tokens
        rideToken.transfer(ride.driver, ride.fare);

        emit RideCompleted(ride.passenger, msg.sender, ride.fare);
    }

    function rateDriver(address _driver, uint8 _rating) public onlyPassenger {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(users[_driver].isDriver, "User is not a driver");
        users[_driver].rating = uint8(_min(users[_driver].rating + _rating, 5)); // Max rating is 5
        emit DriverRated(_driver, _rating);
    }

    function ratePassenger(address _passenger, uint8 _rating) public onlyDriver {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(!users[_passenger].isDriver, "User is not a passenger");
        users[_passenger].rating = uint8(_min(users[_passenger].rating + _rating, 5)); // Max rating is 5
        emit PassengerRated(_passenger, _rating);
    }

    function setDriverAvailability(bool _availability) public onlyDriver {
        users[msg.sender].isAvailable = _availability;
    }

    // Internal utility function to get the minimum of two values
    function _min(uint8 a, uint8 b) internal pure returns (uint8) {
        return a < b ? a : b;
    }
}