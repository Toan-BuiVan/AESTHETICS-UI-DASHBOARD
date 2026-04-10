import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Defaultlayout.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

function Defaultlayout({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập từ localStorage
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const isAuth = localStorage.getItem('isAuthenticated');
            setIsAuthenticated(!!token || isAuth === 'true');
        };

        checkAuth();

        // Lắng nghe sự kiện thay đổi localStorage
        window.addEventListener('storageChange', checkAuth);
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('storageChange', checkAuth);
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    // Nếu trên trang login, không hiển thị sidebar
    const isLoginPage = location.pathname === '/';

    if (isLoginPage) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('content')}>{children}</div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            {/* <Header /> */}
            <div className={cx('container')}>
                {isAuthenticated && <Sidebar />}
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

export default Defaultlayout;
