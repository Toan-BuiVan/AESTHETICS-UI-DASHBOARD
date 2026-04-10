import Products from '~/pages/Products';
import Services from '~/pages/Services';
import ProductExamples from '~/pages/ProductExamples';
import Login from '~/pages/Login';
import Vouchers from '~/pages/Vouchers';
import Invoice from '~/pages/Invoice';
import DashBoard from '~/pages/DashBoard';
import Account from '~/pages/Account';
import Clinic from '~/pages/Clinic';
import ClinicStaff from '~/pages/ClinicStaff';
import Profile from '~/pages/Profile';
import Staff from '~/pages/Staff';
import Customer from '~/pages/Customer';
import AppointmentTimeLock from '~/pages/AppointmentTimeLock';
import StaffShift from '~/pages/StaffShift';

const publicRoutes = [
    { path: '/products', component: Products },
    { path: '/services', component: Services },
    { path: '/product-examples', component: ProductExamples },
    { path: '/', component: Login },
    { path: '/vouchers', component: Vouchers },
    { path: '/invoice', component: Invoice },
    { path: '/dashBoard', component: DashBoard },
    { path: '/account', component: Account },
    { path: '/clinic', component: Clinic },
    { path: '/clinic-staff', component: ClinicStaff },
    { path: '/staff', component: Staff },
    { path: '/customer', component: Customer },
    { path: '/appointment-time-lock', component: AppointmentTimeLock },
    { path: '/staff-shift', component: StaffShift },
    { path: '/profile', component: Profile },
];

export { publicRoutes };
