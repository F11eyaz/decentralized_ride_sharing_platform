import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { initializeWeb3, setDriverAvailability, getUser, web3 } from '../../services/ContractService'; // Импортируем необходимые функции

const DriverAvailabilityToggle = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null); // Текущее состояние доступности водителя
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Инициализация Web3 и получение данных пользователя при монтировании компонента
    const fetchUserData = async () => {
      try {
        await initializeWeb3(); // Инициализируем Web3
        const accounts = await web3!.eth.getAccounts(); // Получаем аккаунты из глобальной web3 переменной
        const userData = await getUser(accounts[0]); // Получаем данные пользователя
        if (userData && userData.isDriver) {
          setIsAvailable(userData.isAvailable); // Устанавливаем текущее состояние доступности
        }
      } catch (error) {
        console.error('Error fetching user data: ', error);
      }
    };

    fetchUserData();
  }, []);

  const handleAvailabilityToggle = async () => {
    // if (isAvailable === null) return; // Не выполняем действия, если состояние неизвестно
    setLoading(true);

    try {
      await setDriverAvailability(!isAvailable); // Меняем доступность на противоположное значение
      setIsAvailable(!isAvailable); // Обновляем локальное состояние
    } catch (error) {
      console.error('Error setting availability:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        {isAvailable 
          ? 'Loading availability status...'
          : `Driver is currently ${isAvailable ? 'available' : 'not available'}`}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAvailabilityToggle}
        disabled={loading || isAvailable}
      >
        {!isAvailable ? 'Set as Unavailable' : 'Set as Available'}
      </Button>
    </Box>
  );
};

export default DriverAvailabilityToggle;
