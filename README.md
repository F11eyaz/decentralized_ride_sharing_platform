# Decentralized Ride Sharing Platform

# Setup Instructions

#  Prerequisites 
1) Node.js
2) Git
3) Metamask: A crypto wallet extension for interacting with the blockchain in the frontend.
4) Ganache ( local deployment )


# Install and Configure Smart Contract part

1) git clone --branch smart_contract https://github.com/F11eyaz/decentralized_ride_sharing_platform.git smart_contract
2) cd smart_contract
3) npm install
4) In hardhat.config replace PRIVATE_KEY's with your actual private keys from Ganache
5) Deploy Smart Contract:
   - npx hardhat run scripts/deploy.cjs --network ganache
   - after that 'artifacts' folder will be generated -> later move it frontend/src directory
7) npm run dev 




# Install and Configure Frontend part
  1)  First leave the smart_contract directory:
     cd ..

2) git clone --branch master https://github.com/F11eyaz/decentralized_ride_sharing_platform.git frontend
3) cd frontend
4) npm install
5) npm run dev



# Screenshots and Examples

1) Sign Up page 
![Снимок экрана 2024-10-21 184147](https://github.com/user-attachments/assets/dccdd445-3cae-4130-9e43-9c6472c36bee)


2) Sign In page
![Снимок экрана 2024-10-21 184117](https://github.com/user-attachments/assets/6fb85356-b935-40d3-bc66-3daebe580daf)

