import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card as MuiCard, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { initializeWeb3, getAvailableDrivers, getUser } from '../../services/ContractService'; // Импортируем методы

const Card = styled(MuiCard)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  width: '100%',
  maxWidth: 400,
}));

const AvailableDriversList = () => {
  const [availableDrivers, setAvailableDrivers] = useState<string[]>([]); // Для хранения адресов доступных водителей
  const [loading, setLoading] = useState(true);
  const [driversData, setDriversData] = useState<any[]>([]); // Данные водителей

  useEffect(() => {
    const fetchAvailableDrivers = async () => {
      try {
        // Инициализируем Web3 и контракты
        await initializeWeb3();

        // Получаем доступных водителей через контракт
        const drivers = await getAvailableDrivers();
        setAvailableDrivers(drivers);

        // Получаем данные каждого водителя
        const driverPromises = drivers.map(async (driver: string) => {
          const userData = await getUser(driver); // Получаем данные пользователя из контракта
          return { address: driver, ...userData };
        });

        const driverDataResults = await Promise.all(driverPromises); // Дожидаемся выполнения всех запросов
        setDriversData(driverDataResults);
      } catch (error) {
        console.error('Error fetching available drivers:', error);
      } finally {
        setLoading(false); // Отключаем индикатор загрузки
      }
    };

    fetchAvailableDrivers();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Drivers
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : availableDrivers.length === 0 ? (
        <Typography>No drivers are available at the moment.</Typography>
      ) : (
        driversData.map((driver) => (
          <Card key={driver.address}>
            <CardContent>
              <Typography variant="h6">
                {driver.firstName} {driver.lastName}
              </Typography>
              <Typography>
                Vehicle: {driver.vehicleModel} - {driver.vehicleColor}
              </Typography>
              <Typography>Price per Ride: {driver.pricePerRide} tokens</Typography>
              <Typography>Phone: {driver.phoneNumber}</Typography>
              <Typography>Rating: {driver.rating} / 5</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default AvailableDriversList;
