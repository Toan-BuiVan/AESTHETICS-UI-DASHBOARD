import React, { useState } from 'react';
import styles from './ItemInvoice.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemInvoice({ invoices, onDelete, onDeleteSuccess }) {
    const [invoiceDetails, setInvoiceDetails] = useState({});
    const [openInvoiceID, setOpenInvoiceID] = useState(null);
    const [hoveredInvoiceID, setHoveredInvoiceID] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState({});

    const handleDelete = async (invoiceID) => {
        try {
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

            const response = await fetch('https://buitoandev.somee.com/api/Invoice/Delete_Invoice', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ invoiceID: invoiceID }),
            });

            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            if (!response.ok) {
                throw new Error('Xóa thất bại');
            }

            const data = await response.json();
            if (onDelete) {
                onDelete(invoiceID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.resposeMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error.message);
        }
    };

    const fetchInvoiceDetails = async (invoiceID) => {
        try {
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

            const requestBody = {
                invoiceID: invoiceID,
                invoiceDetailType: null,
                startDate: null,
                endDate: null,
            };

            const response = await fetch('https://buitoandev.somee.com/api/Invoice/GetList_SearchInvoiceDetail', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Lấy chi tiết hóa đơn thất bại');
            }

            const data = await response.json();
            setInvoiceDetails((prev) => ({
                ...prev,
                [invoiceID]: data.data || [],
            }));
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết hóa đơn:', error.message);
        }
    };

    const handleToggleDetails = (invoiceID) => {
        if (openInvoiceID === invoiceID) {
            setOpenInvoiceID(null);
        } else {
            setOpenInvoiceID(invoiceID);
            fetchInvoiceDetails(invoiceID);
        }
    };

    const closeDetails = () => {
        setOpenInvoiceID(null);
    };

    const handleStatusChange = async (invoiceID, newStatus) => {
        try {
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

            const requestBody = {
                invoiceID: invoiceID,
                status: newStatus,
            };

            const response = await fetch('https://buitoandev.somee.com/api/Invoice/UpdateOrderStatus', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            if (onDeleteSuccess) {
                onDeleteSuccess(data.resposeMessage);
            }
            if (!response.ok) {
                throw new Error('Cập nhật trạng thái thất bại');
            }

            setSelectedStatus((prev) => ({
                ...prev,
                [invoiceID]: newStatus,
            }));
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error.message);
        }
    };

    if (!invoices || invoices.length === 0) {
        return <div className={cx('wrapper')}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            {openInvoiceID && invoiceDetails[openInvoiceID] && (
                <div className={cx('floating-details')}>
                    <div className={cx('details-header')}>
                        <div className={cx('header-spacer')}></div>
                        <h3>Hóa Đơn: {openInvoiceID}</h3>
                        <FontAwesomeIcon icon={faTimes} className={cx('close-icon')} onClick={closeDetails} />
                    </div>
                    <div className={cx('details-content')}>
                        {invoiceDetails[openInvoiceID].map((detail, index) => (
                            <div key={index} className={cx('detail-container')}>
                                {detail.invoiceDetailID && (
                                    <div className={cx('detail-row', 'center-row')}>
                                        <span className={cx('label')}>Mã Chi Tiết Hóa Đơn:</span>
                                        <span className={cx('value')}>{detail.invoiceDetailID}</span>
                                    </div>
                                )}
                                {detail.customerName && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Tên khách hàng:</span>
                                        <span className={cx('value')}>{detail.customerName}</span>
                                    </div>
                                )}
                                {detail.productName && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Tên sản phẩm:</span>
                                        <span className={cx('value')}>{detail.productName}</span>
                                    </div>
                                )}
                                {detail.priceProduct != null && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Giá sản phẩm:</span>
                                        <span className={cx('value')}>{detail.priceProduct.toLocaleString()} VND</span>
                                    </div>
                                )}
                                {detail.totalQuantityProduct != null && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Số lượng sản phẩm:</span>
                                        <span className={cx('value')}>{detail.totalQuantityProduct}</span>
                                    </div>
                                )}
                                {detail.serviceName && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Tên dịch vụ:</span>
                                        <span className={cx('value')}>{detail.serviceName}</span>
                                    </div>
                                )}
                                {detail.priceService != null && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Giá dịch vụ:</span>
                                        <span className={cx('value')}>{detail.priceService.toLocaleString()} VND</span>
                                    </div>
                                )}
                                {detail.totalQuantityService != null && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Số lượng dịch vụ:</span>
                                        <span className={cx('value')}>{detail.totalQuantityService}</span>
                                    </div>
                                )}
                                {detail.code && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Mã Giảm Giá:</span>
                                        <span className={cx('value')}>{detail.code}</span>
                                    </div>
                                )}
                                {detail.discountValue != null && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Giá trị giảm giá:</span>
                                        <span className={cx('value')}>{detail.discountValue}</span>
                                    </div>
                                )}
                                {detail.totalMoney != null && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Tổng tiền:</span>
                                        <span className={cx('value')}>{detail.totalMoney.toLocaleString()} VND</span>
                                    </div>
                                )}
                                {detail.status && (
                                    <div className={cx('detail-row')}>
                                        <span className={cx('label')}>Trạng thái:</span>
                                        <span className={cx('value')}>{detail.status}</span>
                                    </div>
                                )}
                                <hr />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <table className={cx('invoice-table')}>
                <thead>
                    <tr>
                        <th>Mã Hóa Đơn</th>
                        <th>Tên Khách Hàng</th>
                        <th>Code</th>
                        <th>Giá Trị Giảm</th>
                        <th>Tổng Tiền</th>
                        <th>Tổng Thanh Toán</th>
                        <th>Trạng Thái</th>
                        <th>Ngày Tạo</th>
                        <th>Xóa</th>
                        <th>Chi Tiết</th>
                        <th>Trạng thái Đơn Hàng</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((item) => (
                        <tr key={item.invoiceID}>
                            <td>{item.invoiceID ? item.invoiceID : 'N/A'}</td>
                            <td>{item.customerName ? item.customerName : 'N/A'}</td>
                            <td>{item.code ? item.code : 'N/A'}</td>
                            <td>{item.discountValue ? item.discountValue : 'N/A'}</td>
                            <td>{item.totalMoney != null ? item.totalMoney.toLocaleString() + ' VND' : 'N/A'}</td>
                            <td>
                                {item.totalAmountAfterDiscount != null
                                    ? item.totalAmountAfterDiscount.toLocaleString() + ' VND'
                                    : 'N/A'}
                            </td>
                            <td>{item.status ? item.status : 'N/A'}</td>
                            <td>{item.dateCreated ? new Date(item.dateCreated).toLocaleDateString() : 'N/A'}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(item.invoiceID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faCaretDown}
                                    className={cx('caret-icon')}
                                    onClick={() => handleToggleDetails(item.invoiceID)}
                                />
                            </td>
                            <td
                                onMouseEnter={() => setHoveredInvoiceID(item.invoiceID)}
                                onMouseLeave={() => setHoveredInvoiceID(null)}
                            >
                                {item.orderStatus ? item.orderStatus : 'N/A'}{' '}
                                <FontAwesomeIcon
                                    icon={faCaretDown}
                                    className={cx('caret-icon')}
                                    onClick={() => handleToggleDetails(item.invoiceID)}
                                />
                                {hoveredInvoiceID === item.invoiceID && (
                                    <div className={cx('radio-group')}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`status-${item.invoiceID}`}
                                                value="Shipper đã lấy hàng"
                                                checked={selectedStatus[item.invoiceID] === 'Shipper đã lấy hàng'}
                                                onChange={() =>
                                                    handleStatusChange(item.invoiceID, 'Shipper đã lấy hàng')
                                                }
                                            />
                                            Shipper đã lấy hàng
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`status-${item.invoiceID}`}
                                                value="Đang Giao"
                                                checked={selectedStatus[item.invoiceID] === 'Đang Giao'}
                                                onChange={() => handleStatusChange(item.invoiceID, 'Đang Giao')}
                                            />
                                            Đang Giao
                                        </label>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemInvoice;
