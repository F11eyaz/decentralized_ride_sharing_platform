import { useState, useEffect } from 'react';
import { Container, Paper, Box, TextField, Grid, Button, CircularProgress, Typography } from '@mui/material';
import { initializeWeb3, getUser, getBalance, getTokenBalance, updateUserDetails } from '../../services/ContractService';
import { useNavigate } from 'react-router-dom';
import DriverAvailabilityToggle from '../../components/DriverAvailabilityToggle/DriverAvailabilityToggle';
import { rideTokenContract } from '../../services/ContractService';
import { web3 } from '../../services/ContractService'
import BuyTokensComponent from '../../components/BuyTokensComponent/BuyTokensComponent';

interface VehicleDataI {
    model: string;
    vehicleNumber: string;
    color: string;
}

export interface ProfileDataI {
    id: string;
    fullName: string;
    phoneNumber: string;
    profilePictureUrl?: string;
    rating: number;
    role: 'driver' | 'passenger';
    vehicle: VehicleDataI;
    isAvailable: boolean;
    balance: string;
    tokenBalance: string;
    pricePerRide: number;
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
        vehicleNumber: '123ABC',
        color: 'White',
    },
    isAvailable: true,
    balance: '0.00',
    tokenBalance: '0.00',
    pricePerRide: 0,
};
const Profile = () => {
    const [profileData, setProfileData] = useState<ProfileDataI>(initialProfileData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState(localStorage.getItem('walletAddress'));
    const navigate = useNavigate();

    useEffect(() => {
        setWalletAddress(localStorage.getItem('walletAddress'));
        if (!walletAddress) {
            navigate('/sign-in');
        }
    }, [navigate]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                await initializeWeb3();
                const user = await getUser(walletAddress);
                if (user) {
                    setProfileData((prevState) => ({
                        ...prevState,
                        id: 'user123',
                        fullName: `${user.firstName} ${user.lastName}`,
                        phoneNumber: user.phoneNumber,
                        profilePictureUrl: 'https://example.com/profile/johndoe.jpg',
                        rating: user.rating,
                        role: user.isDriver ? 'driver' : 'passenger',
                        vehicle: {
                            model: user.vehicleModel,
                            vehicleNumber: user.vehicleNumber,
                            color: user.vehicleColor,
                        },
                        isAvailable: user.isAvailable,
                        pricePerRide: user.pricePerRide,
                    }));

                    // const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                    // const data = await response.json();
                    // const ethToUsdRate = data.ethereum.usd;
                    const balance = await getBalance(walletAddress);
                    const tokenBalance = await getTokenBalance(walletAddress);

                    setProfileData((prevState) => ({
                        ...prevState,
                        balance: parseFloat(balance).toFixed(2),
                        tokenBalance: tokenBalance,
                    }));
                }
            } catch (error) {
                setError('Failed to load user data. Please try again later.');
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [walletAddress]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
            vehicle: {
                ...prevData.vehicle,
                [name]: name in prevData.vehicle ? value : prevData.vehicle[name],
            },
        }));
    };

    const handleSave = async () => {
        try {
            await updateUserDetails(
                profileData.fullName.split(' ')[0],
                profileData.fullName.split(' ')[1],
                profileData.phoneNumber,
                profileData.role === 'driver',
                profileData.vehicle.model,
                profileData.vehicle.vehicleNumber,
                profileData.vehicle.color,
                profileData.pricePerRide
            );
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            {profileData.role === 'driver' && (
                <DriverAvailabilityToggle profileData={profileData} setProfileData={setProfileData} />
            )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap:2 }}>
                    <Paper elevation={4} sx={{ padding: 2 }}>Current balance: {profileData.balance} ETH</Paper>
                    <Paper elevation={4} sx={{ padding: 2 }}>Token balance: {profileData.tokenBalance} RIDE</Paper>
                    <BuyTokensComponent />
            </Box>
            </Box>

            {/* Поля для редактирования информации доступны только для водителей */}
            
                <>
                    {/* Поля для редактирования информации о цене за поездку */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" mb={2}>Profile Information</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Full Name"
                                    name="fullName"
                                    value={profileData.fullName}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={profileData.phoneNumber}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            {profileData.role === 'driver' && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Price Per Ride"
                                    name="pricePerRide"
                                    type="number"
                                    value={profileData.pricePerRide}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            )}
                        </Grid>
                    </Box>

                    {profileData.role === 'driver' && (
                    <Box>
                        <Typography variant="h6" mb={2}>Vehicle Information</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Model"
                                    name="model"
                                    value={profileData.vehicle.model}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Vehicle Number"
                                    name="vehicleNumber"
                                    value={profileData.vehicle.vehicleNumber}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Color"
                                    name="color"
                                    value={profileData.vehicle.color}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    )}

                    {/* Кнопка для сохранения изменений */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                        <Button variant="contained" onClick={handleSave}>
                            Save Changes
                        </Button>
                    </Box>
                </>
            
        </Container>
    );
};

export default Profile;
