/* __backup__ 2025-08-12 15:02 */
// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { ChevronDown, Menu, X, Globe } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { countries } from '../data/countries';
// 
// const Navbar = () => {
//   const [isCountriesOpen, setIsCountriesOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, profile, signOut } = useAuth();
// 
//   const navigation = [
//     { name: 'Countries', href: '/countries', hasDropdown: true },
//     { name: 'Services', href: '/services', hasDropdown: false },
//     { name: 'About Us', href: '/about', hasDropdown: false },
//     { name: 'Contact', href: '/contact', hasDropdown: false },
//     { name: 'Blog', href: '/blog', hasDropdown: false },
//   ];
// 
//   const isActive = (href: string) => {
//     if (href === '/') return location.pathname === '/';
//     return location.pathname.startsWith(href);
//   };
// 
//   const handleServicesClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (location.pathname === '/') {
//       // If already on homepage, scroll to services section
//       const servicesSection = document.getElementById('services');
//       if (servicesSection) {
//         servicesSection.scrollIntoView({ behavior: 'smooth' });
//       }
//     } else {
//       // If on another page, navigate to homepage then scroll
//       navigate('/');
//       setTimeout(() => {
//         const servicesSection = document.getElementById('services');
//         if (servicesSection) {
//           servicesSection.scrollIntoView({ behavior: 'smooth' });
//         }
//       }, 100);
//     }
//   };
//   return (
//     <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center space-x-2">
//               <img 
//                 src="/image.png" 
//                 alt="Consulting19 Logo" 
//                 className="h-16 w-32"
//                 onError={(e) => {
//                   // Fallback to icon if logo fails to load
//                   e.currentTarget.style.display = 'none';
//                   e.currentTarget.nextElementSibling?.classList.remove('hidden');
//                 }}
//               />
//               <Globe className="h-16 w-32 text-purple-600 hidden" />
//             </Link>
//           </div>
// 
//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">
//             {navigation.map((item) => (
//               <div key={item.name} className="relative">
//                 {item.hasDropdown ? (
//                   <div className="relative">
//                     <button
//                       onClick={() => setIsCountriesOpen(!isCountriesOpen)}
//                       className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                         isActive(item.href)
//                           ? 'text-purple-600 bg-purple-50'
//                           : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
//                       }`}
//                     >
//                       <span>{item.name}</span>
//                       <ChevronDown className={`h-4 w-4 transition-transform ${isCountriesOpen ? 'rotate-180' : ''}`} />
//                     </button>
// 
//                     {/* Countries Dropdown */}
//                     {isCountriesOpen && (
//                       <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-4 z-50">
//                         <div className="px-4 py-2 border-b border-gray-100">
//                           <h3 className="text-sm font-semibold text-gray-900">Choose Your Jurisdiction</h3>
//                         </div>
//                         <div className="max-h-96 overflow-y-auto">
//                           {countries.map((country) => (
//                             <Link
//                               key={country.id}
//                               to={`/countries/${country.slug}`}
//                               className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
//                               onClick={() => setIsCountriesOpen(false)}
//                             >
//                               <span className="text-2xl">{country.flag}</span>
//                               <div className="flex-1">
//                                 <div className="text-sm font-medium text-gray-900">{country.name}</div>
//                                 <div className="text-xs text-gray-500">{country.description.slice(0, 50)}...</div>
//                               </div>
//                             </Link>
//                           ))}
//                         </div>
//                         <div className="px-4 py-2 border-t border-gray-100">
//                           <Link
//                             to="/countries"
//                             className="text-sm text-purple-600 hover:text-purple-700 font-medium"
//                             onClick={() => setIsCountriesOpen(false)}
//                           >
//                             View All Countries →
//                           </Link>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <button
//                     
//                     className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                       isActive(item.href)
//                         ? 'text-purple-600 bg-purple-50'
//                         : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
//                     }`}
//                   >
//                     {item.name === 'Services' ? (
//                       item.name
//                     ) : (
//                       <Link to={item.href}>{item.name}</Link>
//                     )}
//                   </button>
//                 )}
//               </div>
//             ))}
// 
//             <Link
//               to="/get-started"
//               className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
//             >
//               Get Started
//             </Link>
//             
//             {/* User Menu */}
//             {user && profile ? (
//               <div className="flex items-center space-x-4">
//                 {/* Role-based Dashboard Links */}
//                 {profile.role === 'admin' && (
//                   <Link
//                     to="/admin-dashboard"
//                     className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm text-sm"
//                   >
//                     Admin Panel
//                   </Link>
//                 )}
//                 
//                 {profile.role === 'consultant' && (
//                   <Link
//                     to="/consultant-dashboard"
//                     className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm text-sm"
//                   >
//                     Consultant Panel
//                   </Link>
//                 )}
//                 
//                 {profile.role === 'client' && (
//                   <Link
//                     to="/client-accounting"
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
//                   >
//                     My Dashboard
//                   </Link>
//                 )}
// 
//                 {/* User Profile & Logout */}
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-gray-700">
//                     {profile.full_name 
//                       ? profile.full_name
//                       : profile.email}
//                   </span>
//                   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                     {profile.role}
//                   </span>
//                   <button
//                     onClick={signOut}
//                     className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
//                   >
//                     Sign Out
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <Link
//                 to="/login"
//                 className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
// 
//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-50"
//             >
//               {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>
// 
//         {/* Mobile Navigation */}
//         {isMobileMenuOpen && (
//           <div className="md:hidden bg-white border-t border-gray-100">
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               {navigation.map((item) => (
//                 <div key={item.name}>
//                   {item.hasDropdown ? (
//                     <div>
//                       <button
//                         onClick={() => setIsCountriesOpen(!isCountriesOpen)}
//                         className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
//                       >
//                         <span>{item.name}</span>
//                         <ChevronDown className={`h-4 w-4 transition-transform ${isCountriesOpen ? 'rotate-180' : ''}`} />
//                       </button>
//                       {isCountriesOpen && (
//                         <div className="pl-4 space-y-1">
//                           {countries.slice(0, 5).map((country) => (
//                             <Link
//                               key={country.id}
//                               to={`/countries/${country.slug}`}
//                               className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-purple-600 hover:bg-gray-50"
//                               onClick={() => {
//                                 setIsCountriesOpen(false);
//                                 setIsMobileMenuOpen(false);
//                               }}
//                             >
//                               <span>{country.flag}</span>
//                               <span>{country.name}</span>
//                             </Link>
//                           ))}
//                           <Link
//                             to="/countries"
//                             className="block px-3 py-2 text-sm text-purple-600 font-medium"
//                             onClick={() => {
//                               setIsCountriesOpen(false);
//                               setIsMobileMenuOpen(false);
//                             }}
//                           >
//                             View All Countries →
//                           </Link>
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <button
//                       className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
//                         isActive(item.href)
//                           ? 'text-purple-600 bg-purple-50'
//                           : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
//                       }`}
//                       onClick={(e) => {
//                         if (item.name === 'Services') {
//                           handleServicesClick(e);
//                         }
//                         setIsMobileMenuOpen(false);
//                       }}
//                     >
//                       {item.name === 'Services' ? (
//                         item.name
//                       ) : (
//                         <Link to={item.href} onClick={() => setIsMobileMenuOpen(false)}>
//                           {item.name}
//                         </Link>
//                       )}
//                     </button>
//                   )}
//                 </div>
//               ))}
//               <Link
//                 to="/get-started"
//                 className="block w-full text-center bg-purple-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-purple-700 transition-colors mt-4"
//                 onClick={() => setIsMobileMenuOpen(false)}
//               >
//                 Get Started
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
// 
//       {/* Overlay for dropdown */}
//       {isCountriesOpen && (
//         <div
//           className="fixed inset-0 z-40"
//           onClick={() => setIsCountriesOpen(false)}
//         />
//       )}
//     </nav>
//   );
// };
// 
// export default Navbar;
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, Globe } from 'lucide-react';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../contexts/LanguageContext';
import { useCountries } from '../hooks/useCountries';
import NotificationDropdown from './NotificationDropdown';
import useNotifications from '../hooks/useNotifications';

const Navbar = () => {
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();
  const { countries } = useCountries(true);
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: t('nav.countries'), href: '/countries', hasDropdown: true },
    { name: t('nav.services'), href: '/services', hasDropdown: false },
    { name: t('nav.about'), href: '/about', hasDropdown: false },
    { name: t('nav.contact'), href: '/contact', hasDropdown: false },
    { name: t('nav.blog'), href: '/blog', hasDropdown: false },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };
  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/image.png"
                alt="Consulting19 Logo"
                className="h-16 w-32"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Globe className="h-16 w-32 text-purple-600 hidden" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsCountriesOpen(!isCountriesOpen)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-purple-600 bg-purple-50'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCountriesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Countries Dropdown */}
                    {isCountriesOpen && (
                      <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-4 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900">{t('nav.chooseJurisdiction') || 'Choose Your Jurisdiction'}</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {countries.filter(country => country.is_active && country.slug !== 'singapore').slice(0, 10).map((country) => (
                            <Link
                              key={country.id}
                              to={`/countries/${country.slug}`}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsCountriesOpen(false)}
                            >
                              <span className="text-2xl">{country.flag_emoji || '🌍'}</span>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{country.name}</div>
                                <div className="text-xs text-gray-500">{country.description ? country.description.slice(0, 60) + '...' : 'Business-friendly jurisdiction'}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100">
                          <Link
                            to="/countries"
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                            onClick={() => setIsCountriesOpen(false)}
                          >
                            {t('nav.viewAllCountries') || 'View All Countries'} →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={item.name === 'Services' ? handleServicesClick : undefined}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name === 'Services' ? (
                      item.name
                    ) : (
                      <Link to={item.href}>{item.name}</Link>
                    )}
                  </button>
                )}
              </div>
            ))}
            {user && profile ? (
              <div className="flex items-center space-x-4">
                {/* Language Selector */}
                <LanguageSelector variant="navbar" showLabel={false} />
                
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  <NotificationDropdown
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                  />
                </div>
                
                {profile.role === 'admin' && (
                  <Link
                    to="/admin-dashboard"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm text-sm"
                  >
                    Admin Panel
                  </Link>
                )}

                {profile.role === 'consultant' && (
                  <Link
                    to="/consultant-dashboard"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm text-sm"
                  >
                    Consultant Panel
                  </Link>
                )}

                {profile.role === 'client' && (
                  <Link
                    to="/client-accounting"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  >
                    My Dashboard
                  </Link>
                )}

                {/* User Profile & Logout */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    {profile.full_name ? profile.full_name : profile.email}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {profile.role}
                  </span>
                  <Link
                    to="/my-profile"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setIsCountriesOpen(!isCountriesOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isCountriesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isCountriesOpen && (
                        <div className="pl-4 space-y-1">
                          {countries.filter(country => country.is_active && country.slug !== 'singapore').slice(0, 8).map((country) => (
                            <Link
                              key={country.id}
                              to={`/countries/${country.slug}`}
                              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-purple-600 hover:bg-gray-50"
                              onClick={() => {
                                setIsCountriesOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                            >
                              <span>{country.flag_emoji || '🌍'}</span>
                              <span>{country.name}</span>
                            </Link>
                          ))}
                          <Link
                            to="/countries"
                            className="block px-3 py-2 text-sm text-purple-600 font-medium"
                            onClick={() => {
                              setIsCountriesOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            View All Countries →
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-purple-600 bg-purple-50'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                      }`}
                      onClick={(e) => {
                        if (item.name === 'Services') {
                          handleServicesClick(e);
                        }
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.name === 'Services' ? (
                        item.name
                      ) : (
                        <Link to={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                          {item.name}
                        </Link>
                      )}
                    </button>
                  )}
                </div>
              ))}
              <Link
                to="/get-started"
                className="block w-full text-center bg-purple-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-purple-700 transition-colors mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for dropdown */}
      {isCountriesOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsCountriesOpen(false)}
        />
      )}
      
      {/* Overlay for notifications */}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationsOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;