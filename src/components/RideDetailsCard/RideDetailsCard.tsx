import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Divider, Button, Dialog, DialogActions, DialogContent, DialogTitle, Rating } from '@mui/material';
import { getCurrentRide, completeRide, rateDriver } from '../../services/ContractService';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

// Подключение к серверу
const socket = io('http://localhost:3000');

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

interface RideDetailsCardProps {
  userAddress: string;
}

const RideDetailsCard: React.FC<RideDetailsCardProps> = ({ userAddress }) => {
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [openRateDialog, setOpenRateDialog] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const details: RideDetails | null = await getCurrentRide(userAddress);
        setRideDetails(details);
        socket.emit('completeRide', {
          rideIndex: rideDetails?.rideIndex,
          passengerId: rideDetails?.passengerWallet,
          driverId: rideDetails?.driverWallet,
        });
      } catch (error: any) {
        toast.error("Error fetching ride details");
        console.error(error);
      }
    };

    fetchRideDetails();
  }, [userAddress]);

  // Обработчик завершения поездки
  const handleCompleteRide = async () => {
    if (!rideDetails) return;

    setLoading(true);
    try {
      await completeRide(Number(rideDetails.rideIndex));
      toast.success("Ride completed successfully!");

      // Обновить статус поездки в UI
      setRideDetails({ ...rideDetails, completed: true });
      setOpenRateDialog(true); // Открыть диалоговое окно для оценки водителя
    } catch (error) {
      toast.error("Error completing ride");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик оценки водителя
  const handleRateDriver = async () => {
    if (rating && rideDetails) {
      try {
        await rateDriver(rideDetails.driverWallet, rating);
        toast.success("Driver rated successfully!");
        setOpenRateDialog(false);
      } catch (error) {
        toast.error("Error rating driver");
        console.error(error);
      }
    }
  };

  if (!rideDetails) {
    return <Typography>Loading ride details...</Typography>;
  }

  return (
    <Card sx={{ maxWidth: 500, margin: '20px auto', padding: '16px' }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Ride Details
        </Typography>

        <Divider sx={{ marginBottom: '16px' }} />

        <Typography variant="h6" component="div">
          Passenger Details
        </Typography>
        <Typography variant="body1">Name: {rideDetails.passengerFirstName} {rideDetails.passengerLastName}</Typography>
        <Typography variant="body1">Phone: {rideDetails.passengerPhoneNumber}</Typography>
        <Typography variant="body1">Rating: {rideDetails.passengerRating}</Typography>

        <Divider sx={{ marginY: '16px' }} />

        <Typography variant="h6" component="div">
          Driver Details
        </Typography>
        <Typography variant="body1">Name: {rideDetails.driverFirstName} {rideDetails.driverLastName}</Typography>
        <Typography variant="body1">Phone: {rideDetails.driverPhoneNumber}</Typography>
        <Typography variant="body1">Rating: {rideDetails.driverRating}</Typography>
        <Typography variant="body1">Vehicle: {rideDetails.vehicleModel} ({rideDetails.vehicleColor})</Typography>
        <Typography variant="body1">Number: {rideDetails.vehicleNumber}</Typography>

        <Divider sx={{ marginY: '16px' }} />

        <Typography variant="body1">
          Fare: {rideDetails.fare} tokens
        </Typography>
        <Typography variant="body1">
          Status: {rideDetails.completed ? "Completed" : "In Progress"}
        </Typography>

        {/* Кнопка завершения поездки */}
        {!rideDetails.completed && (
          <Button 
            onClick={handleCompleteRide} 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            disabled={loading}
          >
            Complete Ride
          </Button>
        )}
      </CardContent>

      {/* Диалоговое окно для оценки водителя */}
      <Dialog open={openRateDialog} onClose={() => setOpenRateDialog(false)}>
        <DialogTitle>Rate the Driver</DialogTitle>
        <DialogContent>
          <Typography>Please rate your driver:</Typography>
          <Rating
            name="driver-rating"
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            precision={1}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRateDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRateDriver} color="primary" disabled={!rating}>
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default RideDetailsCard;
