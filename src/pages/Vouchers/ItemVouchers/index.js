import React from 'react';
import styles from './ItemVouchers.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemVouchers({ vouchers, onEdit, onDelete, onDeleteSuccess }) {
    const handleDelete = async (voucherID) => {
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

            const response = await fetch('https://buitoandev.somee.com/api/Vouchers/Delete_Vouchers', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ voucherID: voucherID }),
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
                onDelete(voucherID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.resposeMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error.message);
        }
    };

    if (!vouchers || vouchers.length === 0) {
        return <div className={cx('wrapper')}>Dữ liệu trống...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('vouchers-table')}>
                <thead>
                    <tr>
                        <th>Mã Voucher</th>
                        <th>Code</th>
                        <th>Mô tả</th>
                        <th>Giảm giá</th>
                        <th>Hình ảnh</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Giá trị đơn tối thiểu</th>
                        <th>Giá trị tối đa</th>
                        <th>Hạng thành viên</th>
                        <th>Điểm mua hàng</th>
                        <th>Điểm giới thiệu</th>
                        <th>Trạng thái</th>
                        <th>Sửa</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {vouchers.map((item) => (
                        <tr key={item.voucherID}>
                            <td>{item.voucherID}</td>
                            <td>{item.code}</td>
                            <td>{item.description}</td>
                            <td>{item.discountValue}%</td>
                            <td>
                                {item.voucherImage ? (
                                    <img
                                        src={`https://buitoandev.somee.com/Images/${item.voucherImage}`}
                                        alt="Voucher Image"
                                        className={cx('voucher-image')}
                                    />
                                ) : (
                                    <span>Không có hình ảnh</span>
                                )}
                            </td>
                            <td>{new Date(item.startDate).toLocaleDateString()}</td>
                            <td>{new Date(item.endDate).toLocaleDateString()}</td>
                            <td>{item.minimumOrderValue.toLocaleString()} VND</td>
                            <td>{item.maxValue.toLocaleString()} VND</td>
                            <td>{item.rankMember}</td>
                            <td>{item.ratingPoints}</td>
                            <td>{item.accumulatedPoints}</td>
                            <td>{item.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className={cx('edit-icon')}
                                    onClick={() => onEdit(item.voucherID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(item.voucherID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemVouchers;
