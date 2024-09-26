import { Article, Email, Home, Map, Navigation, NearMe, Person, Shield } from '@mui/icons-material';
import { baseUrl } from 'api';

export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${year}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

interface IconObject {
  [key: string]: any;
}

export const icons: IconObject = {
  Article: <Article />,
  Email: <Email />,
  Home: <Home />,
  Map: <Map />,
  Navigation: <Navigation />,
  NearMe: <NearMe />,
  Person: <Person />,
  Shield: <Shield />
};

export const convertMilesToKilometers = (miles: number): number => {
  return Math.round(miles * 1.60934 * 10) / 10;
};

export const convertKilometersToMiles = (kilometers: number): number => {
  return Math.round((kilometers / 1.60934) * 10) / 10;
};

export const getUserPFP = (userId?: number): string => {
  let url = `${baseUrl}/account/pfp`;
  if (userId) {
    url += `/${userId}`;
  }
  return url;
};
