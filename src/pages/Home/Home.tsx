import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const walletAddress = localStorage.getItem('walletAddress'); 
        if (!walletAddress) {
            navigate('/sign-in');
        }
    }, [navigate]);  

    return (
        <h1>Not started home</h1>
    );
};

export default Home;
