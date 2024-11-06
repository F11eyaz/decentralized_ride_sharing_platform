import * as React from 'react';
import { Box, Button, FormControl, TextField, Typography, Stack, Card as MuiCard, FormControlLabel, Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, initializeWeb3 } from '../../services/ContractService'; // Import contract service functions
import Web3 from 'web3';
import { toast } from 'react-toastify';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
}));

const SignUpCard = () => {
  const [walletAddress, setWalletAddress] = React.useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = React.useState(true);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    isDriver: false,
    vehicleModel: '',
    vehicleNumber: '',
    vehicleColor: '',
    pricePerRide: 0,
  });
  const navigate = useNavigate()

  React.useEffect(()=>{
    const walletAddress = localStorage.getItem('walletAddress'); 
        if (walletAddress) {
            navigate('/');
            toast.error("Вы уже авторизованы")
        }
  }, [walletAddress])

  // Connect MetaMask and initialize Web3
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await initializeWeb3(); // Initialize Web3 and connect MetaMask
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setWalletAddress(accounts[0]);
        console.log('Connected wallet address:', accounts[0]);
      } catch (error) {
        console.error('MetaMask connection error:', error);
      }
    } else {
      setIsMetaMaskInstalled(false);
      console.error('MetaMask is not installed');
    }
  };

  // Handle user registration
  const handleSignUp = async () => {
    if (!walletAddress) {
      console.error('Wallet is not connected. Please connect MetaMask first.');
      return;
    }

    try {
      const { firstName, lastName, phoneNumber, isDriver, vehicleModel, vehicleNumber, vehicleColor, pricePerRide } = formData;
      console.log(formData)

      // Call contract service to register user
      await registerUser(firstName, lastName, phoneNumber, isDriver, vehicleModel, vehicleNumber, vehicleColor, pricePerRide);
      window.location.href = '/profile';
      console.log('User registered successfully');
    } catch (error) {
      console.error('Error during sign-up:', error);
    }
  };

  return (
    <SignUpContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
          Sign up
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Input fields for user details */}
          <FormControl>
            <TextField
              placeholder="First Name"
              required
              fullWidth
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <TextField
              placeholder="Last Name"
              required
              fullWidth
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <TextField
              placeholder="Phone Number"
              required
              fullWidth
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </FormControl>

          <FormControlLabel
            control={<Switch checked={formData.isDriver} onChange={(e) => setFormData({...formData, isDriver: e.target.checked})} />}
            label="Are you a driver?"
          />

          <Button
            fullWidth
            variant="contained"
            onClick={async () => {
              await connectMetaMask(); 
              handleSignUp(); 
            }}
          >
            {walletAddress ? `Connected: ${walletAddress}` : 'Sign Up with MetaMask'}
          </Button>
          {!isMetaMaskInstalled && (
            <Typography color="error" sx={{ textAlign: 'center' }}>
              MetaMask is not installed. Please install MetaMask and try again.
            </Typography>
          )}
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link style={{ color: 'black' }} to={'/sign-in'}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Card>
    </SignUpContainer>
  );
};

export default SignUpCard;