import { ethers } from 'ethers';

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => resolve(null)
      );
    } else {
      resolve(null);
    }
  });
};

export const isValidAddress = (address) => {
  return ethers.utils.isAddress(address);
};