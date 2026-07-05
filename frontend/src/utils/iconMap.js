import {
  FaMoneyBillWave, FaLaptopCode, FaChartLine, FaGift, FaCoins,
  FaUtensils, FaCar, FaShoppingBag, FaFilm, FaFileInvoiceDollar,
  FaHeartbeat, FaGraduationCap, FaPlane, FaHome, FaEllipsisH, FaTag,
} from 'react-icons/fa';

const ICONS = {
  FaMoneyBillWave, FaLaptopCode, FaChartLine, FaGift, FaCoins,
  FaUtensils, FaCar, FaShoppingBag, FaFilm, FaFileInvoiceDollar,
  FaHeartbeat, FaGraduationCap, FaPlane, FaHome, FaEllipsisH, FaTag,
};

export const getIcon = (name) => ICONS[name] || FaTag;
