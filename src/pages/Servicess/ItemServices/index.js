import React from 'react';
import styles from './ItemServices.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ItemServices({ services, onEdit, onDelete, onDeleteSuccess }) {
    const handleDelete = async (productID) => {
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

            const response = await fetch('https://buitoandev.somee.com/api/Products/Delete_Products', {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify({ productID: productID }),
            });

            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            if (!response.ok) {
                throw new Error('Xóa sản phẩm thất bại');
            }

            const data = await response.json();
            if (onDelete) {
                onDelete(productID);
            }
            if (onDeleteSuccess) {
                onDeleteSuccess(data.resposeMessage);
            }
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error.message);
        }
    };

    if (!services || services.length === 0) {
        return <div className={cx('wrapper')}>Đang tải dữ liệu...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('service-table')}>
                <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Tên sản phẩm</th>
                        <th>Số Lượng</th>
                        <th>Loại Sản Phẩm</th>
                        <th>Nhà Cung Cấp</th>
                        <th>Mô tả</th>
                        <th>Hình ảnh</th>
                        <th>Giá</th>
                        <th>Sửa</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((product) => (
                        <tr key={product.productID}>
                            <td>{product.productID}</td>
                            <td>{product.productName}</td>
                            <td>{product.quantity}</td>
                            <td>{product.productsOfServicesName}</td>
                            <td>{product.supplierName}</td>
                            <td>{product.productDescription}</td>
                            <td>
                                <img
                                    src={`https://buitoandev.somee.com/Images/${product.productImages}`}
                                    alt={product.productName}
                                    className={cx('service-image')}
                                />
                            </td>
                            <td>
                                {product.sellingPrice !== undefined && typeof product.sellingPrice === 'number'
                                    ? product.sellingPrice.toLocaleString('vi-VN', {
                                          style: 'currency',
                                          currency: 'VND',
                                      })
                                    : 'N/A'}
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className={cx('edit-icon')}
                                    onClick={() => onEdit(product.productID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={cx('delete-icon')}
                                    onClick={() => handleDelete(product.productID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemServices;
