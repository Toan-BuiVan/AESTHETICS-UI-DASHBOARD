import Products from '~/pages/Products';
import Services from '~/pages/Services';
import ProductExamples from '~/pages/ProductExamples';
import Login from '~/pages/Login';
import Vouchers from '~/pages/Vouchers';
import Invoice from '~/pages/Invoice';
import Refund from '~/pages/Refund';
import DashBoard from '~/pages/DashBoard';
import Account from '~/pages/Account';
import Clinic from '~/pages/Clinic';
import ClinicStaff from '~/pages/ClinicStaff';
import Equipment from '~/pages/Equipment';
import Profile from '~/pages/Profile';
import Staff from '~/pages/Staff';
import Customer from '~/pages/Customer';
import Appointments from '~/pages/Appointments';
import AppointmentTimeLock from '~/pages/AppointmentTimeLock';
import StaffShift from '~/pages/StaffShift';
import ServiceType from '~/pages/ServiceType';
import Supplier from '~/pages/Supplier';
import SessionProduct from '~/pages/SessionProduct';
import TreatmentPlan from '~/pages/TreatmentPlan';
import TreatmentSessionDetail from '~/pages/TreatmentSessionDetail';

const publicRoutes = [
    { path: '/products', component: Products },
    { path: '/services', component: Services },
    { path: '/product-examples', component: ProductExamples },
    { path: '/', component: Login },
    { path: '/vouchers', component: Vouchers },
    { path: '/invoice', component: Invoice },
    { path: '/refund', component: Refund },
    { path: '/dashBoard', component: DashBoard },
    { path: '/account', component: Account },
    { path: '/clinic', component: Clinic },
    { path: '/clinic-staff', component: ClinicStaff },
    { path: '/equipment', component: Equipment },
    { path: '/staff', component: Staff },
    { path: '/customer', component: Customer },
    { path: '/appointments', component: Appointments },
    { path: '/appointment-time-lock', component: AppointmentTimeLock },
    { path: '/staff-shift', component: StaffShift },
    { path: '/service-type', component: ServiceType },
    { path: '/supplier', component: Supplier },
    { path: '/session-product', component: SessionProduct },
    { path: '/treatment-plan', component: TreatmentPlan },
    { path: '/treatment-session-detail/:treatmentPlanId', component: TreatmentSessionDetail },
    { path: '/profile', component: Profile },
];

export { publicRoutes };
