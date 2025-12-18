import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    navigate(path);
  };

  const goToDashboard = () => navigate('/dashboard');
  const goToInventory = () => navigate('/inventory');
  const goToPOS = () => navigate('/pos');
  const goToSales = () => navigate('/sales');
  const goToNewsletter = () => navigate('/newsletter');
  const goToUsers = () => navigate('/users');
  const goToTournaments = () => navigate('/tournaments');

  return {
    goTo,
    goToDashboard,
    goToInventory,
    goToPOS,
    goToSales,
    goToNewsletter,
    goToUsers,
    goToTournaments,
  };
};