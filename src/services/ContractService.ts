// services/ContractService.ts
import Web3 from 'web3';
import RideSharing from '../artifacts/contracts/RideSharing.sol/RideSharing.json';
import RideToken from '../artifacts/contracts/RideToken.sol/RideToken.json';
import { toast } from 'react-toastify';

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

interface RideDetails {
  rideIndex: number;
  passengerWallet: string;
  passengerFirstName: string;
  passengerLastName: string;
  passengerPhoneNumber: string;
  passengerRating: number;
  passengerIsDriver: boolean;
  driverWallet: string;
  driverFirstName: string;
  driverLastName: string;
  driverPhoneNumber: string;
  driverRating: number;
  driverIsDriver: boolean;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleColor: string;
  pricePerRide: number;
  isAvailable: boolean;
  fare: number;
  completed: boolean;
}


// Контрактные адреса (замени на свои реальные адреса после деплоя)
const rideSharingAddress = "0x047A2Bed4949110d2306C70df8a760B9EC9005a3";
const rideTokenAddress = "0x9D98BEcb767520Bc8fefF6aDa8f6bEf5D870638f";

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
    const accounts = await web3.eth.requestAccounts();
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
  ensureWeb3Initialized();
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
  ensureWeb3Initialized();
  try {
    const accounts = await web3!.eth.getAccounts();
    const tx = await rideSharingContract.methods
      .registerUser(firstName, lastName, phoneNumber, isDriver, vehicleModel, vehicleNumber, vehicleColor, pricePerRide)
      .send({ from: accounts[0] });
    console.log('User registered successfully', tx);
  } catch (error: any) {
    console.error('Error registering user: ', error);
    toast.error(error.message)
    throw error;
  }
};

// Запрос поездки
// Запрос поездки с предварительным утверждением токенов
export const requestRide = async (driverAddress: string): Promise<void> => {
  ensureWeb3Initialized();
  try {
    const accounts = await web3!.eth.getAccounts();
    const passengerAddress = accounts[0];
    
    // Получаем цену поездки
    const driverUser = await rideSharingContract.methods.getUser(driverAddress).call();
    const fare = Number(driverUser.pricePerRide);

    // Одобряем передачу токенов контракту RideToken на сумму fare
    await rideTokenContract.methods.approve(rideSharingAddress, fare).send({ from: passengerAddress });
    console.log('Token transfer approved successfully');
    // Пассажир переводит токены водителю напрямую через requestRide
    const tx = await rideSharingContract.methods.requestRide(driverAddress).send({ from: passengerAddress });
    console.log('Ride requested successfully', tx);
  } catch (error: any) {
    console.error('Error requesting ride: ', error);
    toast.error(error.message);
    throw error;
  }
};

export const completeRide = async (rideId: number): Promise<void> => {
  ensureWeb3Initialized();
  try {
    const accounts = await web3!.eth.getAccounts();
    const tx = await rideSharingContract.methods.completeRide(rideId).send({ from: accounts[0] });
    console.log('Ride completed successfully', tx);
  } catch (error: any) {
    console.error('Error completing ride: ', error);
    toast.error(error.message);
    throw error;
  }
};



// Функция для установки доступности водителя
export const setDriverAvailability = async (availability: boolean): Promise<void> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы

  try {
    const accounts = await web3!.eth.getAccounts();
    const tx = await rideSharingContract.methods.setDriverAvailability(availability).send({ from: accounts[0] });
    console.log('Driver availability updated', tx);
  } catch (error: any) {
    console.error('Error setting driver availability: ', error);
    toast.error(error.message)
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


export const getCurrentRide = async (userAddress: string): Promise<RideDetails | null> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы

  try {
    // Вызываем метод getCurrentRide из контракта
    const rideData = await rideSharingContract.methods.getCurrentRide(userAddress).call();
    console.log(rideData, 'chama')
    // Преобразуем полученные данные в тип RideDetails
    const rideDetails: RideDetails = {
      rideIndex: Number(rideData.rideIndex),
      passengerWallet: rideData.passengerWallet,
      passengerFirstName: rideData.passengerFirstName,
      passengerLastName: rideData.passengerLastName,
      passengerPhoneNumber: rideData.passengerPhoneNumber,
      passengerRating: parseInt(rideData.passengerRating),
      passengerIsDriver: rideData.passengerIsDriver,
      driverWallet: rideData.driverWallet,
      driverFirstName: rideData.driverFirstName,
      driverLastName: rideData.driverLastName,
      driverPhoneNumber: rideData.driverPhoneNumber,
      driverRating: parseInt(rideData.driverRating),
      driverIsDriver: rideData.driverIsDriver,
      vehicleModel: rideData.vehicleModel,
      vehicleNumber: rideData.vehicleNumber,
      vehicleColor: rideData.vehicleColor,
      pricePerRide: parseInt(rideData.pricePerRide),
      isAvailable: rideData.isAvailable,
      fare: parseInt(rideData.fare),
      completed: rideData.completed,
    };

    return rideDetails;
  } catch (error) {
    console.error('Error fetching current ride data: ', error);
    return null;
  }
};

export const getBalance = async (address: string): Promise<string> => {
  ensureWeb3Initialized(); // Проверяем, что Web3 и контракт инициализированы

  try {
    const balanceWei = await web3!.eth.getBalance(address);
    return web3.utils.fromWei(balanceWei, 'ether'); // Преобразуем из Wei в Ether
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

// Обновление данных пользователя в контракте
export const updateUserDetails = async (
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
      .updateUserDetails(
        firstName,
        lastName,
        phoneNumber,
        isDriver,
        vehicleModel,
        vehicleNumber,
        vehicleColor,
        pricePerRide
      )
      .send({ from: accounts[0] }); // Отправляем транзакцию от имени текущего пользователя
    console.log('User details updated successfully', tx);
  } catch (error: any) {
    console.error('Error updating user details: ', error);
    toast.error(error.message); // Показываем уведомление об ошибке
    throw error;
  }
};

export const buyTokens = async (ethAmount: string): Promise<void> => {
  if (!web3 || !rideTokenContract) {
    throw new Error('Web3 is not initialized. Call initializeWeb3 first.');
  }

  try {
    const accounts = await web3.eth.getAccounts();
    const buyerAddress = accounts[0];

    const tx = await rideTokenContract.methods
      .buyTokens()
      .send({ from: buyerAddress, value: web3.utils.toWei(ethAmount, 'ether') });

    console.log(`Purchased tokens for ${ethAmount} ETH`, tx);
    toast.success(`Purchased tokens for ${ethAmount} ETH`);
  } catch (error: any) {
    console.error('Error purchasing tokens:', error);
    toast.error(error.message);
    throw error;
  }

};

export const rateDriver = async (driverAddress: string, rating: number): Promise<void> => {
  ensureWeb3Initialized();
  
  if (rating < 1 || rating > 5) {
    toast.error('Rating must be between 1 and 5');
    return;
  }
  
  try {
    const accounts = await web3!.eth.getAccounts();
    const tx = await rideSharingContract.methods.rateDriver(driverAddress, rating).send({ from: accounts[0] });
    console.log(`Rated driver ${driverAddress} with ${rating} stars`, tx);
    toast.success(`Rated driver successfully!`);
  } catch (error: any) {
    console.error('Error rating driver:', error);
    toast.error(error.message);
    throw error;
  }
}
