import { useState, useEffect } from 'react';
import { Container, Paper, Box, TextField, Grid, Button, CircularProgress, Typography } from '@mui/material';
import { initializeWeb3, getUser } from '../../services/ContractService'; // импортируем initializeWeb3 и getUser из ContractService
import { useNavigate } from 'react-router-dom';
import DriverAvailabilityToggle from '../../components/DriverAvailabilityToggle/DriverAvailabilityToggle';

interface VehicleDataI {
    model: string;
    licensePlate: string;
    color: string;
}

interface ProfileDataI {
    id: string;
    fullName: string;
    phoneNumber: string;
    profilePictureUrl?: string;
    rating: number;
    role: 'driver' | 'rider';
    vehicle: VehicleDataI;
}

const initialProfileData: ProfileDataI = {
    id: 'user123',
    fullName: 'John Doe',
    phoneNumber: '+1234567890',
    profilePictureUrl: 'https://example.com/profile/johndoe.jpg',
    rating: 4.8,
    role: 'driver',
    vehicle: {
        model: 'Toyota Camry',
        licensePlate: 'ABC1234',
        color: 'White',
    }
};

const Profile = () => {
    const [profileData, setProfileData] = useState<ProfileDataI>(initialProfileData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ walletAddress, setWalletAddress ] = useState<any>(localStorage.getItem('walletAddress'))

    const navigate = useNavigate();

    useEffect(() => {
        // const walletAddress = localStorage.getItem('walletAddress'); 
        setWalletAddress(localStorage.getItem('walletAddress'))
        if (!walletAddress) {
            navigate('/sign-in');

        }
    }, [navigate]);  

    useEffect(() => {
        // Здесь вызываем initializeWeb3, чтобы убедиться, что Web3 инициализирован
        const loadUserData = async () => {
            try {
                // Initialize Web3 and contracts
                await initializeWeb3();

                // Fetch the user's data
                const user = await getUser(walletAddress); // Замените на реальный адрес пользователя
                if (user) {
                    setProfileData({
                        id: 'user123', // ID можно извлечь по необходимости
                        fullName: `${user.firstName} ${user.lastName}`,
                        phoneNumber: user.phoneNumber,
                        profilePictureUrl: 'https://example.com/profile/johndoe.jpg', // URL также можно обновить
                        rating: user.rating,
                        role: user.isDriver ? 'driver' : 'rider',
                        vehicle: {
                            model: user.vehicleModel,
                            licensePlate: user.vehicleNumber,
                            color: user.vehicleColor,
                        },
                    });
                }
            } catch (error) {
                setError('Failed to load user data. Please try again later.');
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    // Функция для динамической генерации полей TextField
    const renderTextFields = (data: any) => {
        return Object.entries(data).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
                <TextField
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    name={key}
                    value={value}
                    fullWidth
                    disabled
                    type={typeof value === 'number' ? 'number' : 'text'}
                />
            </Grid>
        ));
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Container disableGutters maxWidth={false} component={Paper} elevation={4} sx={{ height: 'auto', minWidth: 0, mt: 2, padding: 4 }}>
            {/* Карточка для личных данных профиля */}

            <DriverAvailabilityToggle/>
            
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    borderColor: 'divider',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    padding: 2,
                    mb: 6,
                }}
            >
                <Typography variant="h6" mb={4}>
                    Profile Information
                </Typography>
                <Grid container spacing={2}>
                    {/* Рендеринг полей профиля */}
                    {renderTextFields({
                        fullName: profileData.fullName,
                        phoneNumber: profileData.phoneNumber,
                        rating: profileData.rating,
                    })}
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button variant="contained" disabled>
                        Сохранить
                    </Button>
                </Box>
            </Box>

            {/* Карточка для данных транспортного средства */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    borderColor: 'divider',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    padding: 4,
                }}
            >
                <Typography variant="h6" gutterBottom mb={4}>
                    Vehicle Information
                </Typography>
                <Grid container spacing={2}>
                    {/* Рендеринг полей автомобиля */}
                    {renderTextFields(profileData.vehicle)}
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button variant="contained" disabled>
                        Сохранить
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Profile;
