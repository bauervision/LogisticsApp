// import { ReactNode, useContext } from 'react';
// import PropTypes from 'prop-types';
// import { Navigate } from 'react-router';
// import Terms from '../components/Pages/Terms/Terms';
// import Logout from '../components/Pages/Logout/Logout';
// import { UserContext } from '../hooks/providers/UserContext';

// const RolesAuthRoute = ({
//   children,
//   roles,
// }: {
//   children: ReactNode;
//   roles: Array<string>;
// }) => {
//   const { user } = useContext(UserContext);
//   if (user.Roles === undefined || user.Roles === null) return null;
//   if (user.LoggingOut) return <Logout />;
//   if (!user.AcceptedTerms) return <Terms />;
//   if (!user.Roles.some((userRole: string) => roles.includes(userRole)))
//     return <Navigate to="/error" />;
//   return children;
// };

// RolesAuthRoute.propTypes = {
//   children: PropTypes.node.isRequired,
//   roles: PropTypes.arrayOf(PropTypes.string).isRequired,
// };

// export default RolesAuthRoute;
