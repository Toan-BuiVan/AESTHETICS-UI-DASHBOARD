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
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const cx = classNames.bind(styles);

function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [isLoggedInState, setIsLoggedInState] = useState(localStorage.getItem('token') !== null);
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

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.post('https://buitoandev.somee.com/api/Authentication/LogOutALL_Account', {
                    accessToken: token,
                });
            } catch (error) {
                console.error('Lỗi khi đăng xuất:', error);
            }
        }
        // Xóa thông tin khỏi localStorage
        localStorage.removeItem('deviceName');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userID');
        localStorage.removeItem('typePerson');
        localStorage.removeItem('userName');
        // Cập nhật trạng thái đăng nhập
        setIsLoggedInState(false);
        // Chuyển hướng về trang đăng nhập
        navigate('/');
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
                                <a href="/dashBoard">Thống Kê</a>
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
                                <FontAwesomeIcon icon={faCalendarCheck} />
                                <a href="/combinedBookingsPage">Đặt Lịch & Chi Tiết</a>
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
                                <FontAwesomeIcon icon={faHouseMedicalFlag} />
                                <a href="/combinedClinicPage">Phòng Khám & Bác Sĩ</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faUser} />
                                <a href="/user">Người Dùng</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faParachuteBox} />
                                <a href="/combinedPage">Nhà Cung cấp & Loại Sản phẩm</a>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faSignOut} />
                                <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
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
        </aside>
    );
}

export default Sidebar;
