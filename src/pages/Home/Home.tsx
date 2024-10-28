import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AvailableDriversList } from "../../components";

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const walletAddress = localStorage.getItem('walletAddress'); 
        if (!walletAddress) {
            navigate('/sign-in');
        }
    }, [navigate]);  

    return (
        <AvailableDriversList/>
    );
};

export default Home;
