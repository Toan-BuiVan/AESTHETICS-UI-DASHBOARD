import styles from './Sidebar.module.scss';
import classNames from 'classnames/bind';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBox,
    faCalendar,
    faCalendarCheck,
    faCalendarPlus,
    faCartShopping,
    faChartLine,
    faChartBar,
    faClinicMedical,
    faComment,
    faComputer,
    faCog,
    faFileInvoiceDollar,
    faHouseMedicalFlag,
    faLock,
    faParachuteBox,
    faPhone,
    faServer,
    faShield,
    faSignOut,
    faSpa,
    faTags,
    faThLarge,
    faUser,
    faUserTag,
    faUsers,
    faClock,
    faList,
    faTruck,
    faUndoAlt,
    faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [isLoggedInState, setIsLoggedInState] = useState(localStorage.getItem('token') !== null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({
        reports: true,
        services: true,
        finance: false,
        management: false,
        clinic: false,
        booking: false,
    });
    const navigate = useNavigate();

    // Menu structure
    const menuGroups = [
        {
            id: 'reports',
            label: 'Báo Cáo',
            icon: faChartBar,
            items: [
                { label: 'Hồ Sơ', href: '/profile', icon: faChartLine },
                { label: 'Thống Kê', href: '/statistics', icon: faChartBar },
            ],
        },
        {
            id: 'finance',
            label: 'Tài Chính',
            icon: faFileInvoiceDollar,
            items: [
                { label: 'Hóa Đơn', href: '/invoice', icon: faFileInvoiceDollar },
                { label: 'Quản Lý Hoàn Tiền', href: '/refund', icon: faUndoAlt },
                { label: 'Vouchers', href: '/vouchers', icon: faTags },
                { label: 'Nhà Cung Cấp', href: '/supplier', icon: faTruck },
            ],
        },
        {
            id: 'management',
            label: 'Quản Lý',
            icon: faCog,
            items: [
                { label: 'Tài Khoản', href: '/account', icon: faUserTag },
                { label: 'Nhân Viên', href: '/staff', icon: faUserTag },
                { label: 'Ca Làm Việc', href: '/staff-shift', icon: faClock },
                { label: 'Khách Hàng', href: '/customer', icon: faUsers },
                { label: 'Thiết Bị', href: '/equipment', icon: faComputer },
                { label: 'Khóa Thời Gian', href: '/appointment-time-lock', icon: faLock },
            ],
        },
        {
            id: 'services',
            label: 'Dịch Vụ',
            icon: faSpa,
            items: [
                { label: 'Dịch Vụ', href: '/services', icon: faSpa },
                { label: 'Loại Dịch Vụ', href: '/service-type', icon: faList },
                { label: 'Sản Phẩm', href: '/products', icon: faBox },
                { label: 'Sản Phẩm Sử Dụng', href: '/session-product', icon: faCartShopping },
                { label: 'Dịch Vụ Liệu Trình', href: '/treatment-plan', icon: faCalendarCheck },
            ],
        },
        {
            id: 'clinic',
            label: 'Phòng Khám',
            icon: faClinicMedical,
            items: [
                { label: 'Quản Lý Phòng Khám', href: '/clinic', icon: faClinicMedical },
                { label: 'Nhân Viên Phòng Khám', href: '/clinic-staff', icon: faComputer },
            ],
        },
        {
            id: 'booking',
            label: 'Lịch Hẹn',
            icon: faCalendarPlus,
            items: [{ label: 'Quản Lý Đặt Lịch', href: '/appointments', icon: faCalendarPlus }],
        },
    ];

    // Theo dõi sự thay đổi của localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            setIsLoggedInState(localStorage.getItem('token') !== null);
        };

        window.addEventListener('storageChange', handleStorageChange);
        return () => {
            window.removeEventListener('storageChange', handleStorageChange);
        };
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('deviceName');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        localStorage.removeItem('typePerson');
        localStorage.removeItem('userName');
        localStorage.removeItem('role');
        localStorage.removeItem('staffId');
        localStorage.removeItem('isAuthenticated');
        setIsLoggedInState(false);
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogout = async (logoutType) => {
        const token = localStorage.getItem('token');
        if (!token) {
            clearLocalStorage();
            navigate('/');
            return;
        }

        try {
            setIsLoggingOut(true);
            const endpoint =
                logoutType === 'device' ? `${API_BASE}/Authentication/logout` : `${API_BASE}/Authentication/logoutall`;

            await axios.post(endpoint, {
                accessToken: token,
            });
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        } finally {
            setIsLoggingOut(false);
            clearLocalStorage();
            setShowLogoutModal(false);
            navigate('/');
        }
    };

    const handleCloseModal = () => {
        if (!isLoggingOut) {
            setShowLogoutModal(false);
        }
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    return (
        <aside className={cx('wrapper')}>
            <div className={cx('sidebar-Item')}>
                <div className={cx('sidebar-system')} onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={faServer} />
                    <a>Hệ Thống</a>
                </div>

                <nav className={`${styles['sidebar-nav']} ${isOpen ? styles.show : ''}`}>
                    {isLoggedInState ? (
                        <>
                            {menuGroups.map((group) => (
                                <div key={group.id} className={cx('menu-group')}>
                                    <button
                                        className={cx('group-header', {
                                            expanded: expandedGroups[group.id],
                                        })}
                                        onClick={() => toggleGroup(group.id)}
                                    >
                                        <span className={cx('group-icon-label')}>
                                            <FontAwesomeIcon icon={group.icon} />
                                            <span>{group.label}</span>
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={cx('chevron', {
                                                rotated: expandedGroups[group.id],
                                            })}
                                        />
                                    </button>

                                    {expandedGroups[group.id] && (
                                        <ul className={cx('group-items')}>
                                            {group.items.map((item, idx) => (
                                                <li key={idx}>
                                                    <a href={item.href}>
                                                        <FontAwesomeIcon icon={item.icon} />
                                                        <span>{item.label}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}

                            <div className={cx('menu-group', 'logout-group')}>
                                <button className={cx('logout-btn')} onClick={handleLogoutClick}>
                                    <FontAwesomeIcon icon={faSignOut} />
                                    <span>Đăng Xuất</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <a href="/" className={cx('login-btn')}>
                            <FontAwesomeIcon icon={faSignOut} />
                            <span>Đăng Nhập</span>
                        </a>
                    )}
                </nav>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className={cx('modal-overlay')} onClick={handleCloseModal}>
                    <div className={cx('modal')} onClick={(e) => e.stopPropagation()}>
                        <div className={cx('modal-header')}>
                            <h2>Chọn Cách Đăng Xuất</h2>
                        </div>
                        <div className={cx('modal-body')}>
                            <p>Hãy chọn cách đăng xuất mà bạn muốn:</p>
                        </div>
                        <div className={cx('modal-footer')}>
                            <button
                                className={cx('btn', 'btn-device')}
                                onClick={() => handleLogout('device')}
                                disabled={isLoggingOut}
                                title="Đăng xuất khỏi thiết bị này"
                            >
                                {isLoggingOut ? 'Đang xử lý...' : 'Đăng Xuất Thiết Bị Này'}
                            </button>
                            <button
                                className={cx('btn', 'btn-all')}
                                onClick={() => handleLogout('all')}
                                disabled={isLoggingOut}
                                title="Đăng xuất khỏi tất cả các thiết bị"
                            >
                                {isLoggingOut ? 'Đang xử lý...' : 'Đăng Xuất Tất Cả Thiết Bị'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}

export default Sidebar;
