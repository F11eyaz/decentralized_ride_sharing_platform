import * as React from 'react';
import { Box, Button, Typography, Stack, Card as MuiCard } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { initializeWeb3, getUser } from '../../services/ContractService'; // Импортируем сервисы для работы с контрактами
import { Web3 } from 'web3';
import { toast } from 'react-toastify';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  backgroundImage:
    'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
}));

const SignInCard = () => {
  const [walletAddress, setWalletAddress] = React.useState('');
  const [userData, setUserData] = React.useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = React.useState(true);
  const navigate = useNavigate()

  React.useEffect(()=>{
    const walletAddress = localStorage.getItem('walletAddress'); 
        if (walletAddress) {
            navigate('/');
            toast.error("Вы уже авторизованы")
        }
  }, [walletAddress])

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Очищаем данные предыдущего пользователя перед подключением нового
        setUserData(null);
        setWalletAddress('');
  
        await initializeWeb3(); // Инициализируем Web3 и подключаем MetaMask
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        setWalletAddress(address);
  
        // Перезаписываем адрес в localStorage
        localStorage.setItem('walletAddress', address);
  
        console.log('Connected wallet address:', address);
        navigate('/profile');
        return address;
      } catch (error) {
        console.error('MetaMask connection error:', error);
      }
    } else {
      setIsMetaMaskInstalled(false);
      console.error('MetaMask is not installed');
    }
  };
  
  const handleSignIn = async () => {
    try {
      const address = await connectMetaMask(); // Подключаем MetaMask и получаем адрес
      if (address) {
        const user = await getUser(address); // Получаем информацию о пользователе с контракта
        if (user) {
          setUserData(user); // Сохраняем данные пользователя
          console.log('User logged in:', user);
        } else {
          toast.error('Пользователь не найден.');
          console.log('User not found.');
        }
      }
    } catch (error) {
      toast.error('Ошибка при входе.');
      console.error('Error during sign-in:', error);
    }
  };
  

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Sign In
        </Typography>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              handleSignIn();  // Вызываем функцию для входа
            }}
          >
            {walletAddress ? `Connected: ${walletAddress}` : 'Sign In with MetaMask'}
          </Button>
          {userData && (
            <Typography sx={{ textAlign: 'center' }}>
              Welcome back, {userData.firstName} {userData.lastName}
            </Typography>
          )}
          {!isMetaMaskInstalled && (
            <Typography color="error" sx={{ textAlign: 'center' }}>
              MetaMask is not installed. Please install MetaMask and try again.
            </Typography>
          )}
          <Typography sx={{ textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link style={{ color: 'black' }} to={'/sign-up'}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Card>
    </SignInContainer>
  );
};

export default SignInCard;
