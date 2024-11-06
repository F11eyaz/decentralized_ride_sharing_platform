// components/BuyTokensComponent.tsx
import React, { useState } from 'react';
import { buyTokens } from '../../services/ContractService';
import { toast } from 'react-toastify';
import { Box, TextField, Button, Typography } from '@mui/material';

const BuyTokensComponent: React.FC = () => {
  const [ethAmount, setEthAmount] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEthAmount(e.target.value);
  };

  const handleBuyTokens = async () => {
    if (!ethAmount || isNaN(Number(ethAmount)) || Number(ethAmount) <= 0) {
      toast.error('Please enter a valid ETH amount');
      return;
    }

    try {
      await buyTokens(ethAmount);
      toast.success(`Tokens purchased for ${ethAmount} ETH!`);
    } catch (error) {
      console.error('Error buying tokens:', error);
    }
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" gutterBottom>Buy Ride Tokens</Typography>
      <TextField
        label="1ETH - 100 RIDE Tokens"
        variant="outlined"
        value={ethAmount}
        onChange={handleInputChange}
        fullWidth
        sx={{ mb: 2, maxWidth: 300 }}
      />
      <Button variant="contained" color="primary" onClick={handleBuyTokens}>
        Buy Tokens
      </Button>
    </Box>
  );
};

export default BuyTokensComponent;
