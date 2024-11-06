import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card as MuiCard, CardContent, Button, Modal } from '@mui/material';
import { styled } from '@mui/material/styles';
import { initializeWeb3, getAvailableDrivers, getUser, requestRide, getCurrentRide } from '../../services/ContractService';
import { useNavigate } from 'react-router-dom';
import { RideDetailsCard } from '../RideDetailsCard';
import { io } from 'socket.io-client';
import { useGPS } from '../../context/GPSContext';

// WebSocket connection
const socket = io('http://localhost:3000');

const Card = styled(MuiCard)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  width: '100%',
  maxWidth: 400,
}));

const AvailableDriversList: React.FC = () => {
  const [availableDrivers, setAvailableDrivers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isDriver, setIsDriver] = useState<boolean | null>(null);
  const [driversData, setDriversData] = useState<any[]>([]);
  const [showRideDetails, setShowRideDetails] = useState(false);
  const [hasActiveRide, setHasActiveRide] = useState(false);
  const [currentRideAddress, setCurrentRideAddress] = useState<string | null>(null);
  const [rateDriverModal, setRateDriverModal] = useState(false); // Modal for rating
  const navigate = useNavigate();
  const { location, otherLocations } = useGPS();

  useEffect(() => {
    const wallet = localStorage.getItem('walletAddress');
    setWalletAddress(wallet);
    if (!wallet) {
      navigate('/sign-in');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await initializeWeb3();
        const user = await getUser(walletAddress!);
        
        if (user) {
          setIsDriver(user.isDriver); // Determine if the user is a driver
        }

        const activeRide = await getCurrentRide(walletAddress!);
        if (activeRide && !activeRide.completed) {
          setHasActiveRide(true);
          setCurrentRideAddress(walletAddress);
        } else if (!user?.isDriver) {
          const drivers = await getAvailableDrivers();
          const filteredDrivers = drivers.filter((driver: any) => walletAddress && driver !== walletAddress);
          setAvailableDrivers(filteredDrivers);

          const driverPromises = filteredDrivers.map(async (driver: string) => {
            const userData = await getUser(driver);
            return { address: driver, ...userData };
          });

          const driverDataResults = await Promise.all(driverPromises);
          setDriversData(driverDataResults);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [walletAddress]);

  useEffect(() => {
    socket.on('rideCompleted', ({ passengerId }) => {
      if (passengerId === walletAddress) {
        setRateDriverModal(true);
      }
    });

    return () => {
      socket.off('rideCompleted');
    };
  }, [walletAddress]);

  const handleRequestRide = async (driverAddress: string) => {
    try {
      await requestRide(driverAddress); // Асинхронный запрос на бронирование
      const activeRide = await getCurrentRide(walletAddress!); // Получаем данные о текущей поездке
      
      if (activeRide) {
        setCurrentRideAddress(walletAddress); // Обновляем состояние для модального окна
        setShowRideDetails(true); // Открываем модальное окно только после успешного получения данных
      } else {
        console.error("Failed to load ride details");
      }
    } catch (error) {
      console.error('Error requesting ride:', error);
    }
  };

  const handleCloseModal = () => setShowRideDetails(false);

  const handleShowRideDetails = () => setShowRideDetails(true);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isDriver ? "Your Rides" : "Available Drivers"}
      </Typography>

      {hasActiveRide ? (
        <Box sx={{ textAlign: 'center', marginTop: '20%' }}>
          <Typography variant="h6">You have an active ride</Typography>
          <Button variant="contained" color="primary" onClick={handleShowRideDetails}>
            View Details
          </Button>
        </Box>
      ) : isDriver ? (
        <Typography variant="body1">You are logged in as a driver. Available rides will appear here.</Typography>
      ) : availableDrivers.length === 0 ? (
        <Typography>No drivers are available at the moment.</Typography>
      ) : (
        driversData.map((driver) => (
          <Card key={driver.address} elevation={4}>
            <CardContent>
              <Typography variant="h6">
                {driver.firstName} {driver.lastName}
              </Typography>
              <Typography>
                Vehicle: {driver.vehicleModel} - {driver.vehicleColor} {driver.vehicleNumber}
              </Typography>
              <Typography>Price per Ride: {driver.pricePerRide} tokens</Typography>
              <Typography>Phone: {driver.phoneNumber}</Typography>
              <Typography>Rating: {driver.rating} / 5</Typography>
              <Typography>Latitude: {otherLocations[0]?.latitude || null}</Typography>
              <Typography>Longitude: {otherLocations[0]?.longitude || null}</Typography>
            </CardContent>
            <Button onClick={() => handleRequestRide(driver.address)}>Request ride</Button>
          </Card>
        ))
      )}

      {/* Ride Details Modal */}
      <Modal open={showRideDetails} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 }}>
          {currentRideAddress && <RideDetailsCard userAddress={currentRideAddress} />}
          <Button onClick={handleCloseModal} sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>

      {/* Rating Modal */}
      <Modal open={rateDriverModal} onClose={() => setRateDriverModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4 }}>
          <Typography variant="h6">Rate the Ride</Typography>
          {/* Rating form goes here */}
          <Button onClick={() => setRateDriverModal(false)} sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default AvailableDriversList;
