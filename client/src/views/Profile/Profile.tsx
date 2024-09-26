import { useParams } from 'react-router-dom';

const Profile = () => {
  // username from the URL
  const { username } = useParams<{ username: string }>();

  return <div>{username}</div>;
};

export default Profile;
