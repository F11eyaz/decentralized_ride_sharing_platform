// services/ContractService.ts
import Web3 from 'web3';
import RideSharing from '../artifacts/contracts/RideSharing.sol/RideSharing.json';
import RideToken from '../artifacts/contracts/RideToken.sol/RideToken.json';

// Типы для пользователей и контрактов
interface User {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  rating: number;
  isDriver: boolean;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleColor: string;
  pricePerRide: number;
  isAvailable: boolean;
}

// Контрактные адреса (замени на свои реальные адреса после деплоя)
const rideSharingAddress = "0x97b28ec218B170B24569B4fCD2C5B6D265f01EdB";
const rideTokenAddress = "0xDdFF2Ef12E80EaB2eB8Fd961cb5f7a5bf1Ebf888";

// Глобальные переменные для провайдера и контрактов
let web3: Web3 | undefined;
let rideSharingContract: any;
let rideTokenContract: any;

// Инициализация Web3 и подключение к MetaMask
export const initializeWeb3 = async (): Promise<void> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  web3 = new Web3(window.ethereum);
  try {
    const accounts = await web3.eth.requestAccounts(); // Запрашиваем доступ к MetaMask
    console.log('MetaMask connected:', accounts);

    // Загружаем контракты
    rideSharingContract = new web3.eth.Contract(RideSharing.abi, rideSharingAddress);
    rideTokenContract = new web3.eth.Contract(RideToken.abi, rideTokenAddress);
  } catch (error) {
    console.error('Error initializing Web3 or loading contracts: ', error);
    throw error;
  }
};

// Проверка инициализации Web3 и контрактов
const ensureWeb3Initialized = () => {
  if (!web3 || !rideSharingContract) {
    throw new Error('Web3 is not initialized. Call initializeWeb3 first.');
  }
};

// Регистрация нового пользователя в контракте RideSharing
export const registerUser = async (
  firstName: string,
  lastName: string,
  phoneNumber: string,
  isDriver: boolean,
  vehicleModel: string,
  vehicleNumber: string,
  vehicleColor: string,
  pricePerRide: number
): Promise<void> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы

  try {
    const accounts = await web3!.eth.getAccounts();
    const tx = await rideSharingContract.methods
      .registerUser(firstName, lastName, phoneNumber, isDriver, vehicleModel, vehicleNumber, vehicleColor, pricePerRide)
      .send({ from: accounts[0] });
    console.log('User registered successfully', tx);
  } catch (error) {
    console.error('Error registering user: ', error);
  }
};

// Запрос поездки
export const requestRide = async (driverAddress: string): Promise<void> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы

  try {
    const accounts = await web3!.eth.getAccounts();
    const tx = await rideSharingContract.methods.requestRide(driverAddress).send({ from: accounts[0] });
    console.log('Ride requested successfully', tx);
  } catch (error) {
    console.error('Error requesting ride: ', error);
  }
};

// Завершение поездки
export const completeRide = async (rideId: number): Promise<void> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы

  try {
    const accounts = await web3!.eth.getAccounts();
    const tx = await rideSharingContract.methods.completeRide(rideId).send({ from: accounts[0] });
    console.log('Ride completed successfully', tx);
  } catch (error) {
    console.error('Error completing ride: ', error);
  }
};

// Получение данных пользователя из контракта
export const getUser = async (address: string): Promise<User | null> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы

  try {
    const userData = await rideSharingContract.methods.getUser(address).call();
    const user: User = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      rating: parseInt(userData.rating),
      isDriver: userData.isDriver,
      vehicleModel: userData.vehicleModel,
      vehicleNumber: userData.vehicleNumber,
      vehicleColor: userData.vehicleColor,
      pricePerRide: parseInt(userData.pricePerRide),
      isAvailable: userData.isAvailable,
    };
    return user;
  } catch (error) {
    console.error('Error fetching user data: ', error);
    return null;
  }
};
