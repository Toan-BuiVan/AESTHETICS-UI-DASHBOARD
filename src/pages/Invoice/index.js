import React, { useState, useEffect, useCallback } from 'react';
import styles from './Invoice.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faPlus,
    faSearch,
    faChevronDown,
    faChevronUp,
    faMoneyBillWave,
    faUniversity,
    faMobileAlt,
    faHandshake,
} from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemInvoice from './ItemInvoice';

const cx = classNames.bind(styles);

function Invoice() {
    const [customerID, setCustomerID] = useState('');
    const [employeeID, setEmployeeID] = useState('');
    const [voucherID, setVoucherID] = useState('');
    const [productIDs, setProductIDs] = useState([]);
    const [quantityProduct, setQuantityProduct] = useState([]);
    const [servicesIDs, setServicesIDs] = useState([]);
    const [quantityServices, setQuantityServices] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [invoicesList, setInvoicesList] = useState([]);
    const [loadingInvoices, setLoadingInvoices] = useState(true);
    const [errorInvoices, setErrorInvoices] = useState(null);
    const [isPaymentMethodVisible, setIsPaymentMethodVisible] = useState(false);

    const [searchCustomerID, setSearchCustomerID] = useState('');
    const [searchEmployeeID, setSearchEmployeeID] = useState('');
    const [searchInvoiceType, setSearchInvoiceType] = useState('');
    const [searchStartDate, setSearchStartDate] = useState('');
    const [searchEndDate, setSearchEndDate] = useState('');

    const refreshTokenOnLoad = async () => {
        try {
            const accessToken = localStorage.getItem('token') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';

            const response = await fetch('https://buitoandev.somee.com/api/Authentication/Refresh_Token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (!response.ok) throw new Error('Không thể làm mới token');

            const data = await response.json();
            if (data.responseCode === 1) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                console.log('Đã cập nhật token và refreshToken trong localStorage');
            } else {
                console.error('Làm mới token thất bại:', data.responseMessage);
            }
        } catch (error) {
            console.error('Lỗi khi làm mới token:', error);
        }
    };

    const fetchInvoicesList = useCallback(async (searchParams = {}) => {
        try {
            setLoadingInvoices(true);
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const userID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                UserID: userID,
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const params = {
                customerID: searchParams.customerID || null,
                employeeID: searchParams.employeeID || null,
                invoiceID: searchParams.invoiceID || null,
                invoiceType: searchParams.invoiceType || null,
                startDate: searchParams.startDate || null,
                endDate: searchParams.endDate || null,
            };

            const response = await fetch('https://buitoandev.somee.com/api/Invoice/GetList_SearchInvoicee', {
                method: 'POST',
                headers,
                body: JSON.stringify(params),
            });

            if (!response.ok) throw new Error('Lỗi khi gọi API');

            const data = await response.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setInvoicesList(proOf);
        } catch (error) {
            setErrorInvoices(error.message);
            setInvoicesList([]);
        } finally {
            setLoadingInvoices(false);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            fetchInvoicesList({ invoiceType: 'Output' });
        };
        initialize();
    }, [fetchInvoicesList]);

    const handleSearch = () => {
        let searchParams = {
            customerID: searchCustomerID ? parseInt(searchCustomerID, 10) : null,
            employeeID: searchEmployeeID ? parseInt(searchEmployeeID, 10) : null,
            invoiceType: searchInvoiceType || 'Output',
            startDate: searchStartDate ? new Date(searchStartDate).toISOString() : null,
            endDate: searchEndDate ? new Date(searchEndDate).toISOString() : null,
        };
        fetchInvoicesList(searchParams);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';
        const userID = localStorage.getItem('userID') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            Authorization: token ? `Bearer ${token}` : '',
            UserID: userID,
        };

        const formData = {};

        if (customerID && customerID.trim() !== '') {
            formData.customerID = parseInt(customerID, 10);
        }
        if (employeeID && employeeID.trim() !== '') {
            formData.employeeID = parseInt(employeeID, 10);
        }
        if (voucherID && voucherID.trim() !== '') {
            formData.voucherID = parseInt(voucherID, 10);
        }
        if (productIDs.length > 0 && productIDs[0].trim() !== '') {
            formData.productIDs = productIDs.filter((id) => id.trim() !== '').map((id) => parseInt(id, 10));
        }
        if (quantityProduct.length > 0 && quantityProduct[0].trim() !== '') {
            formData.quantityProduct = quantityProduct
                .filter((qty) => qty.trim() !== '')
                .map((qty) => parseInt(qty, 10));
        }
        if (servicesIDs.length > 0 && servicesIDs[0].trim() !== '') {
            formData.servicesIDs = servicesIDs.filter((id) => id.trim() !== '').map((id) => parseInt(id, 10));
        }
        if (quantityServices.length > 0 && quantityServices[0].trim() !== '') {
            formData.quantityServices = quantityServices
                .filter((qty) => qty.trim() !== '')
                .map((qty) => parseInt(qty, 10));
        }
        if (paymentMethod) {
            formData.paymentMethod = paymentMethod;
        }

        try {
            const response = await fetch('https://buitoandev.somee.com/api/Invoice/Insert_Invoice', {
                method: 'POST',
                headers,
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            if (!response.ok) {
                setSuccessMessage(result.resposeMessage || 'Thêm hóa đơn thất bại!');
            } else {
                setSuccessMessage(result.resposeMessage || 'Thêm hóa đơn thành công!');

                fetchInvoicesList({
                    customerID: null,
                    employeeID: null,
                    invoiceID: null,
                    invoiceType: null,
                    startDate: null,
                    endDate: null,
                });

                setCustomerID('');
                setEmployeeID('');
                setVoucherID('');
                setProductIDs([]);
                setQuantityProduct([]);
                setServicesIDs([]);
                setQuantityServices([]);
                setPaymentMethod('');
                setIsPaymentMethodVisible(false);

                setTimeout(() => {
                    setIsFormVisible(false);
                    setSuccessMessage('');
                }, 3500);
            }
        } catch (error) {
            setSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    const handleDelete = (invoiceID) => {
        setInvoicesList(invoicesList.filter((invoice) => invoice.invoiceID !== invoiceID));
    };

    const handleDeleteSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setCustomerID('');
            setEmployeeID('');
            setVoucherID('');
            setProductIDs([]);
            setQuantityProduct([]);
            setServicesIDs([]);
            setQuantityServices([]);
            setPaymentMethod('');
            setIsPaymentMethodVisible(false);
        }
    };

    const togglePaymentMethodVisibility = () => {
        setIsPaymentMethodVisible(!isPaymentMethodVisible);
    };

    return (
        <div className={cx('wrapper')}>
            {successMessage && <SuccessMessage message={successMessage} />}
            <div className={cx('header')}>
                <h1>Hóa Đơn</h1>
                <div className={cx('search-container')}>
                    {/* <input
                        type="text"
                        placeholder="Mã khách hàng..."
                        value={searchCustomerID}
                        onChange={(e) => setSearchCustomerID(e.target.value)}
                        className={cx('search-input')}
                    /> */}
                    <input
                        type="text"
                        placeholder="Mã nhân viên..."
                        value={searchEmployeeID}
                        onChange={(e) => setSearchEmployeeID(e.target.value)}
                        className={cx('search-input')}
                    />
                    <input
                        type="text"
                        placeholder="Loại hóa đơn..."
                        value={searchInvoiceType}
                        onChange={(e) => setSearchInvoiceType(e.target.value)}
                        className={cx('search-input')}
                    />
                    <input
                        type="date"
                        value={searchStartDate}
                        onChange={(e) => setSearchStartDate(e.target.value)}
                        className={cx('search-input')}
                    />
                    <input
                        type="date"
                        value={searchEndDate}
                        onChange={(e) => setSearchEndDate(e.target.value)}
                        className={cx('search-input')}
                    />
                    <button onClick={handleSearch} className={cx('search-button')}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
                {!isFormVisible && (
                    <div className={cx('open-form-icon')} onClick={toggleFormVisibility}>
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                )}
            </div>
            {isFormVisible && (
                <form className={cx('form-content')} onSubmit={handleSubmit}>
                    <div className={cx('form-header')}>
                        <FontAwesomeIcon icon={faTimes} className={cx('close-icon')} onClick={toggleFormVisibility} />
                    </div>
                    <div className={cx('form-columns')}>
                        <div>
                            <label htmlFor="customerID">Mã Khách Hàng:</label>
                            <input
                                type="text"
                                id="customerID"
                                value={customerID}
                                onChange={(e) => setCustomerID(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="employeeID">Mã Nhân Viên:</label>
                            <input
                                type="text"
                                id="employeeID"
                                value={employeeID}
                                onChange={(e) => setEmployeeID(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="voucherID">Mã Voucher:</label>
                            <input
                                type="text"
                                id="voucherID"
                                value={voucherID}
                                onChange={(e) => setVoucherID(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="productIDs">Mã Sản Phẩm (cách nhau dấu phẩy):</label>
                            <input
                                type="text"
                                id="productIDs"
                                value={productIDs.join(',')}
                                onChange={(e) => setProductIDs(e.target.value.split(','))}
                            />
                        </div>
                        <div>
                            <label htmlFor="quantityProduct">Số Lượng Sản Phẩm (cách nhau bằng dấu phẩy):</label>
                            <input
                                type="text"
                                id="quantityProduct"
                                value={quantityProduct.join(',')}
                                onChange={(e) => setQuantityProduct(e.target.value.split(','))}
                            />
                        </div>
                        <div>
                            <label htmlFor="servicesIDs">Mã Dịch Vụ (cách nhau bằng dấu phẩy):</label>
                            <input
                                type="text"
                                id="servicesIDs"
                                value={servicesIDs.join(',')}
                                onChange={(e) => setServicesIDs(e.target.value.split(','))}
                            />
                        </div>
                        <div>
                            <label htmlFor="quantityServices">Số Lượng Dịch Vụ (cách nhau bằng dấu phẩy):</label>
                            <input
                                type="text"
                                id="quantityServices"
                                value={quantityServices.join(',')}
                                onChange={(e) => setQuantityServices(e.target.value.split(','))}
                            />
                        </div>
                        <div>
                            <div className={cx('payment-method-toggle')} onClick={togglePaymentMethodVisibility}>
                                <label>Phương thức thanh toán:</label>
                                <FontAwesomeIcon icon={isPaymentMethodVisible ? faChevronUp : faChevronDown} />
                            </div>
                            {isPaymentMethodVisible && (
                                <div className={cx('payment-method-group')}>
                                    <div className={cx('payment-method-option')}>
                                        <input
                                            type="radio"
                                            id="cashOnDelivery"
                                            name="paymentMethod"
                                            value="Thanh Toán Khi Nhận Hàng"
                                            checked={paymentMethod === 'Thanh Toán Khi Nhận Hàng'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="cashOnDelivery">
                                            <FontAwesomeIcon icon={faMoneyBillWave} className={cx('payment-icon')} />
                                            Thanh Toán Khi Nhận Hàng
                                        </label>
                                    </div>
                                    <div className={cx('payment-method-option')}>
                                        <input
                                            type="radio"
                                            id="bankTransfer"
                                            name="paymentMethod"
                                            value="Chuyển Khoản Ngân Hàng"
                                            checked={paymentMethod === 'Chuyển Khoản Ngân Hàng'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="bankTransfer">
                                            <FontAwesomeIcon icon={faUniversity} className={cx('payment-icon')} />
                                            Chuyển Khoản Ngân Hàng
                                        </label>
                                    </div>
                                    <div className={cx('payment-method-option')}>
                                        <input
                                            type="radio"
                                            id="momo"
                                            name="paymentMethod"
                                            value="Ví Momo"
                                            checked={paymentMethod === 'Ví Momo'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="momo">
                                            <FontAwesomeIcon icon={faMobileAlt} className={cx('payment-icon')} />
                                            Ví Momo
                                        </label>
                                    </div>
                                    <div className={cx('payment-method-option')}>
                                        <input
                                            type="radio"
                                            id="directPayment"
                                            name="paymentMethod"
                                            value="Thanh Toán Trực Tiếp"
                                            checked={paymentMethod === 'Thanh Toán Trực Tiếp'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label htmlFor="directPayment">
                                            <FontAwesomeIcon icon={faHandshake} className={cx('payment-icon')} />
                                            Thanh Toán Trực Tiếp
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button className={cx('submit')} type="submit">
                        Thêm
                    </button>
                </form>
            )}
            {loadingInvoices ? (
                <div>Đang tải danh sách...</div>
            ) : errorInvoices ? (
                <div>Lỗi: {errorInvoices}</div>
            ) : (
                <ItemInvoice invoices={invoicesList} onDelete={handleDelete} onDeleteSuccess={handleDeleteSuccess} />
            )}
        </div>
    );
}

export default Invoice;
