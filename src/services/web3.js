import Web3 from 'web3';

let web3;

// Проверяем, есть ли провайдер (например, Metamask)
if (window.ethereum) {
  web3 = new Web3(window.ethereum);

  // Запрос разрешения на подключение аккаунта
  window.ethereum.request({ method: 'eth_requestAccounts' });

  // Отслеживание смены сети
  window.ethereum.on('chainChanged', (chainId) => {
    console.log(`Сеть изменилась на: ${chainId}`);
    window.location.reload();
  });

  // Отслеживание смены аккаунта
  window.ethereum.on('accountsChanged', (accounts) => {
    console.log('Аккаунты изменены:', accounts);
    // Можно добавить логику для обновления приложения при смене аккаунта
  });
} else {
  console.error('Web3 провайдер не найден. Установите Metamask.');
}

export default web3;
