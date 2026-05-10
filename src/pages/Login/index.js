import axios from 'axios';
import classNames from 'classnames/bind';
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faCode, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import { useNavigate } from 'react-router-dom';

import styles from './Login.module.scss';

const cx = classNames.bind(styles);

function Login() {
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [loginStatus, setLoginStatus] = useState('form');
    const [successMessage, setSuccessMessage] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef(null);
    const loginTitleRef = useRef(null);
    const registerTitleRef = useRef(null);
    const navigate = useNavigate();

    const loginFunction = () => {
        setIsLoginForm(true);
        setLoginStatus('form');
        if (wrapperRef.current) {
            wrapperRef.current.style.height = '500px';
        }
        if (loginTitleRef.current) {
            loginTitleRef.current.style.top = '50%';
            loginTitleRef.current.style.opacity = '1';
        }
        if (registerTitleRef.current) {
            registerTitleRef.current.style.top = '50px';
            registerTitleRef.current.style.opacity = '0';
        }
    };

    const registerFunction = () => {
        setIsLoginForm(false);
        setLoginStatus('form');
        if (wrapperRef.current) {
            wrapperRef.current.style.height = '580px';
        }
        if (loginTitleRef.current) {
            loginTitleRef.current.style.top = '-60px';
            loginTitleRef.current.style.opacity = '0';
        }
        if (registerTitleRef.current) {
            registerTitleRef.current.style.top = '50%';
            registerTitleRef.current.style.opacity = '1';
        }
    };

    useEffect(() => {
        loginFunction();
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();

        const userName = document.getElementById('log-email').value;
        const password = document.getElementById('log-pass').value;

        if (!userName || !password) {
            setSuccessMessage('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.');
            setShowSuccessMessage(true);
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5122/api/Authentication/login', {
                userName,
                password,
            });
            const data = response.data;
            console.log('Phản hồi từ API:', data);

            // Kiểm tra nếu token tồn tại và không phải null
            if (data.token && data.token !== null) {
                // Decode token để lấy thông tin user
                const decodedToken = jwtDecode(data.token);
                console.log('Decoded Token:', decodedToken);

                // setSuccessMessage('Đăng nhập thành công!');
                setShowSuccessMessage(true);

                // Lưu token và refreshToken
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);

                // Lấy thông tin từ token
                const userName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
                const userID = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'];
                const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                const staffId = decodedToken['StaffId'];
                const deviceName = decodedToken['DeviceName'] || 'Unknown Device'; // Lấy DeviceName từ token

                localStorage.setItem('userID', userID || '');
                localStorage.setItem('userName', userName || '');
                localStorage.setItem('role', role || '');
                localStorage.setItem('staffId', staffId || '');
                localStorage.setItem('deviceName', deviceName); // Lưu DeviceName vào localStorage
                localStorage.setItem('isAuthenticated', 'true');

                window.dispatchEvent(new Event('storageChange'));

                setTimeout(() => {
                    navigate('/services');
                }, 1500);
            } else {
                // Token là null - Đăng nhập thất bại
                setSuccessMessage('Tên tài khoản hoặc mật khẩu không chính xác.');
                setShowSuccessMessage(true);
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Lỗi đăng nhập:', err);
            let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';

            if (err.response?.data?.token === null && err.response?.data?.refreshToken === null) {
                errorMessage = 'Tên tài khoản hoặc mật khẩu không chính xác.';
            } else if (err.message === 'Network Error') {
                errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra kết nối internet.';
            }

            setSuccessMessage(errorMessage);
            setShowSuccessMessage(true);
            setIsLoading(false);
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        const userName = document.getElementById('reg-name').value;
        const passWord = document.getElementById('reg-pass').value;
        const referralCode = document.getElementById('reg-code').value || null;
        const agree = document.getElementById('agree').checked;

        if (!userName || !passWord) {
            setSuccessMessage('Vui lòng nhập đầy đủ tên người dùng và mật khẩu.');
            setShowSuccessMessage(true);
            return;
        }

        if (!agree) {
            setSuccessMessage('Vui lòng đồng ý với các điều khoản và điều kiện.');
            setShowSuccessMessage(true);
            return;
        }

        try {
            const response = await axios.post('https://buitoandev.somee.com/api/Users/Create_Account', {
                userName,
                passWord,
                referralCode,
                typePersson: 'Customer',
            });
            const data = response.data;
            console.log('Phản hồi từ API:', data);
            if (data.responseCode === 1) {
                const message = data.responseMessage || 'Đăng ký thành công!';
                setSuccessMessage(message);
                setShowSuccessMessage(true);
            } else {
                const message = data.responseMessage || 'Đăng ký thất bại.';
                setSuccessMessage(message);
                setShowSuccessMessage(true);
            }
        } catch (err) {
            setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        }
    };

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={cx('wrapper')} ref={wrapperRef}>
            {showSuccessMessage && <SuccessMessage message={successMessage} />}
            {loginStatus === 'form' && (
                <>
                    <div className={cx('form-header')}>
                        <div className={cx('titles')}>
                            <div className={cx('title-login')} ref={loginTitleRef}>
                                Login
                            </div>
                            <div className={cx('title-register')} ref={registerTitleRef}>
                                Register
                            </div>
                        </div>
                    </div>
                    <form
                        onSubmit={handleLogin}
                        className={cx('login-form', { active: isLoginForm })}
                        autoComplete="off"
                    >
                        <div className={cx('input-box')}>
                            <input type="text" className={cx('input-field')} id="log-email" required />
                            <label htmlFor="log-email" className={cx('label')}>
                                Tài Khoản
                            </label>
                            <FontAwesomeIcon
                                className={cx('bx', 'bx-envelope', 'icon')}
                                icon={faEnvelope}
                            ></FontAwesomeIcon>
                        </div>
                        <div className={cx('input-box')}>
                            <input type="password" className={cx('input-field')} id="log-pass" required />
                            <label htmlFor="log-pass" className={cx('label')}>
                                Mật Khẩu
                            </label>
                            <FontAwesomeIcon
                                className={cx('bx', 'bx-lock-alt', 'icon')}
                                icon={faLock}
                            ></FontAwesomeIcon>
                        </div>
                        <div className={cx('form-cols')}>
                            <div className={cx('col-1')}></div>
                            <div className={cx('col-2')}>
                                <a href="#">Quên mật khẩu?</a>
                            </div>
                        </div>
                        <div className={cx('input-box')}>
                            <button type="submit" className={cx('btn-submit')} id="SignInBtn" disabled={isLoading}>
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                                <FontAwesomeIcon
                                    className={cx('bx', 'bx-log-in', { loading: isLoading })}
                                    icon={faUserPlus}
                                    style={{ opacity: isLoading ? 0.6 : 1 }}
                                ></FontAwesomeIcon>
                            </button>
                        </div>
                        <div className={cx('switch-form')}>
                            <span>
                                Chưa có tài khoản?{' '}
                                <a href="#" onClick={registerFunction}>
                                    Đăng Kí
                                </a>
                            </span>
                        </div>
                    </form>
                    <form
                        onSubmit={handleRegister}
                        className={cx('register-form', { active: !isLoginForm })}
                        autoComplete="off"
                    >
                        <div className={cx('input-box')}>
                            <input type="text" className={cx('input-field')} id="reg-name" required />
                            <label htmlFor="reg-name" className={cx('label')}>
                                Tài Khoản
                            </label>
                            <FontAwesomeIcon className={cx('bx', 'bx-user', 'icon')} icon={faUser}></FontAwesomeIcon>
                        </div>
                        <div className={cx('input-box')}>
                            <input type="password" className={cx('input-field')} id="reg-pass" required />
                            <label htmlFor="reg-pass" className={cx('label')}>
                                Mật Khẩu
                            </label>
                            <FontAwesomeIcon
                                className={cx('bx', 'bx-lock-alt', 'icon')}
                                icon={faLock}
                            ></FontAwesomeIcon>
                        </div>
                        <div className={cx('input-box')}>
                            <input type="text" className={cx('input-field')} id="reg-code" />
                            <label htmlFor="reg-pass" className={cx('label')}>
                                Mã Giới Thiệu
                            </label>
                            <FontAwesomeIcon className={cx('fa-solid', 'fa-code')} icon={faCode}></FontAwesomeIcon>
                        </div>
                        <div className={cx('form-cols')}>
                            <div className={cx('col-1')}>
                                <input type="checkbox" id="agree" />
                                <label className={cx('label-regis')} htmlFor="agree">
                                    Đồng ý với các điều khoản và điều kiện
                                </label>
                            </div>
                            <div className={cx('col-2')}></div>
                        </div>
                        <div className={cx('input-box')}>
                            <button className={cx('btn-submit')} id="SignUpBtn">
                                Đăng Kí
                                <FontAwesomeIcon
                                    className={cx('bx', 'bx-user-plus')}
                                    icon={faUserPlus}
                                ></FontAwesomeIcon>
                            </button>
                        </div>
                        <div className={cx('switch-form')}>
                            <span>
                                Bạn đã có tài khoản?{' '}
                                <a href="#" onClick={loginFunction}>
                                    Đăng Nhập
                                </a>
                            </span>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

export default Login;
