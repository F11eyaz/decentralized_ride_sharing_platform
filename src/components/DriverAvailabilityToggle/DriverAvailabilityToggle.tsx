import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { initializeWeb3, setDriverAvailability, getUser, web3 } from '../../services/ContractService';

const DriverAvailabilityToggle = ({profileData, setProfileData}: any) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleAvailabilityToggle = async () => {
    setLoading(true);
    try {
      await setDriverAvailability(!profileData.isAvailable);
      setProfileData({...profileData, isAvailable: !profileData.isAvailable}); 
    } catch (error) {
      console.error('Error setting availability:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        {loading
          ? 'Loading availability status...'
          : `Driver is currently ${profileData.isAvailable ? 'available' : 'not available'}`}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAvailabilityToggle}
        disabled={loading}
      >
        {profileData.isAvailable ? 'Set as Unavailable' : 'Set as Available'}
      </Button>
    </Box>
  );
};

export default DriverAvailabilityToggle;
