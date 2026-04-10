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
    faClinicMedical,
    faComment,
    faComputer,
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
    const navigate = useNavigate();

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

    return (
        <aside className={cx('wrapper')}>
            <div className={cx('sidebar-Item')}>
                <div className={cx('sidebar-system')} onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={faServer} />
                    <a>Hệ Thống</a>
                </div>

                <ul className={`${styles['sidebar-ul']} ${isOpen ? styles.show : ''}`}>
                    {isLoggedInState ? (
                        <>
                            <li>
                                <FontAwesomeIcon icon={faChartLine} />
                                <a href="/profile">Hồ Sơ</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faSpa} />
                                <a href="/services">Dịch Vụ</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                                <a href="/invoice">Hóa Đơn</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faBox} />
                                <a href="/products">Sản Phẩm</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faTags} />
                                <a href="/vouchers">Vouchers</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faUserTag} />
                                <a href="/account">Tài Khoản</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faClinicMedical} />
                                <a href="/clinic">Quản Lý Phòng Khám</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faComputer} />
                                <a href="/clinic-staff">Nhân Viên Phòng Khám</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faUserTag} />
                                <a href="/staff">Quản Lý Nhân Viên</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faClock} />
                                <a href="/staff-shift">Ca Làm Việc</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faUsers} />
                                <a href="/customer">Quản Lý Khách Hàng</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faLock} />
                                <a href="/appointment-time-lock">Khóa Thời Gian</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faSignOut} />
                                <a onClick={handleLogoutClick} style={{ cursor: 'pointer' }}>
                                    Đăng Xuất
                                </a>
                            </li>
                        </>
                    ) : (
                        <li>
                            <FontAwesomeIcon icon={faSignOut} />
                            <a href="/">Đăng Nhập</a>
                        </li>
                    )}
                </ul>
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
