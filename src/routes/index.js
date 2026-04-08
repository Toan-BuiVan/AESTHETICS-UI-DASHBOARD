import { Component } from 'react';
import Products from '~/pages/Products';
import Servicess from '~/pages/Servicess';
import Login from '~/pages/Login';
import Vouchers from '~/pages/Vouchers';
import User from '~/pages/User';
import Bookings from '~/pages/Bookings';
import BookingAssignment from '~/pages/BookingAssignment';
import Invoice from '~/pages/Invoice';
import CombinedPage from '~/pages/CombinedPage';
import CombinedBookingsPage from '~/pages/CombinedBookingsPage';
import CombinedClinicPage from '~/pages/CombinedClinicPage';
import DashBoard from '~/pages/DashBoard';

const publicRoutes = [
    { path: '/products', component: Servicess },
    { path: '/services', component: Products },
    { path: '/', component: Login },
    { path: '/vouchers', component: Vouchers },
    { path: '/user', component: User },
    { path: '/invoice', component: Invoice },
    { path: '/combinedPage', component: CombinedPage },
    { path: '/combinedBookingsPage', component: CombinedBookingsPage },
    { path: '/combinedClinicPage', component: CombinedClinicPage },
    { path: '/dashBoard', component: DashBoard },
];

export { publicRoutes };
