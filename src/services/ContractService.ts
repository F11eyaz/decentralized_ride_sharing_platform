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
const rideSharingAddress = "0x9c0D4906e8add7295aC62dC7e4aE048E37Ec3f93";
const rideTokenAddress = "0xf83a108fefA722dA160e8f957a7B714614AfE3A3";

// Глобальные переменные для провайдера и контрактов
export let web3: Web3 | undefined;
export let rideSharingContract: any;
export let rideTokenContract: any;

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

// Получение списка доступных водителей
export const getAvailableDrivers = async (): Promise<string[]> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы
  try {
    const drivers = await rideSharingContract.methods.getAvailableDrivers().call();
    return drivers;
  } catch (error) {
    console.error('Error fetching available drivers: ', error);
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
  }
};

// services/ContractService.ts

// Функция для установки доступности водителя
export const setDriverAvailability = async (availability: boolean): Promise<void> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы

  try {
    const accounts = await web3!.eth.getAccounts();
    const tx = await rideSharingContract.methods.setDriverAvailability(availability).send({ from: accounts[0] });
    console.log('Driver availability updated', tx);
  } catch (error) {
    console.error('Error setting driver availability: ', error);
    throw error;
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
