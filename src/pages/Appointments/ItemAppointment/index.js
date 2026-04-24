import React, { useState } from 'react';
import axios from 'axios';
import styles from './ItemAppointment.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

const statusMapping = {
    Booked: 1,
    InProgress: 2,
    Completed: 3,
    Cancelled: 4,
};

const statusLabels = {
    Booked: 'Đã Đặt',
    InProgress: 'Đang Thực Hiện',
    Completed: 'Hoàn Thành',
    Cancelled: 'Hủy',
};

const paymentStatusLabels = {
    0: 'Trả Sau',
    1: 'Trả Trước',
    2: 'Trả Một Phần',
};

function ItemAppointment({ appointments, onDeleteSuccess, onStatusUpdate }) {
    const [editingId, setEditingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    // Xử lý xóa appointment
    const handleDelete = async (appointmentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đặt lịch này?')) {
            return;
        }

        try {
            const response = await axios.post(`${API_BASE}/Appointment/deleteappointment`, { id: appointmentId });

            if (response.data && response.data.success) {
                if (onDeleteSuccess) {
                    onDeleteSuccess(appointmentId);
                }
            } else {
                alert('Lỗi khi xóa đặt lịch');
            }
        } catch (error) {
            console.error('Lỗi khi xóa đặt lịch:', error);
            alert('Lỗi khi xóa đặt lịch');
        }
    };

    // Xử lý cập nhật status
    const handleStatusUpdate = async (appointment) => {
        if (!newStatus) {
            alert('Vui lòng chọn trạng thái');
            return;
        }

        try {
            setUpdatingId(appointment.id);
            const payload = {
                customerTreatmentSessionId: appointment.customerTreatmentSession?.id || 0,
                serviceId: appointment.service?.id || 0,
                customerId: appointment.customer?.id || 0,
                status: statusMapping[newStatus],
            };

            const response = await axios.post(`${API_BASE}/Appointment/updateappointmentstatus`, payload);

            if (response.data && response.data.success) {
                setEditingId(null);
                setNewStatus('');
                if (onStatusUpdate) {
                    onStatusUpdate();
                }
            } else {
                alert('Lỗi khi cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            alert('Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdatingId(null);
        }
    };

    // Xử lý mở chế độ chỉnh sửa
    const handleEdit = (appointment) => {
        setEditingId(appointment.id);
        setNewStatus(appointment.status);
    };

    // Xử lý hủy chỉnh sửa
    const handleCancel = () => {
        setEditingId(null);
        setNewStatus('');
    };

    if (!appointments || appointments.length === 0) {
        return <div className={cx('wrapper')}>Không có dữ liệu</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('appointments-table')}>
                <thead>
                    <tr>
                        <th>Mã Đặt Lịch</th>
                        <th>Khách Hàng</th>
                        <th>Nhân Viên</th>
                        <th>Dịch Vụ</th>
                        <th>Thời Gian</th>
                        <th>Giá</th>
                        <th>Trạng Thái</th>
                        <th>Thanh Toán</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((appointment) => (
                        <tr key={`${appointment.id}`} className={cx('appointment-row')}>
                            <td className={cx('appointment-id')}>#{appointment.id}</td>
                            <td>
                                <div className={cx('customer-info')}>
                                    <div className={cx('name')}>{appointment.customer?.fullName || 'N/A'}</div>
                                    <div className={cx('phone')}>{appointment.customer?.phoneNumber || 'N/A'}</div>
                                </div>
                            </td>
                            <td className={cx('staff-name')}>{appointment.staff?.fullName || 'N/A'}</td>
                            <td className={cx('service-name')}>{appointment.service?.serviceName || 'N/A'}</td>
                            <td className={cx('appointment-time')}>
                                <div className={cx('start-time')}>
                                    Bắt đầu: {new Date(appointment.startTime).toLocaleString('vi-VN')}
                                </div>
                                {appointment.endTime && (
                                    <div className={cx('end-time')}>
                                        Kết thúc: {new Date(appointment.endTime).toLocaleString('vi-VN')}
                                    </div>
                                )}
                            </td>
                            <td className={cx('price')}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(appointment.price || 0)}
                            </td>
                            <td>
                                {editingId === appointment.id ? (
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className={cx('status-select')}
                                    >
                                        <option value="">Chọn trạng thái</option>
                                        <option value="Booked">Đã Đặt</option>
                                        <option value="InProgress">Đang Thực Hiện</option>
                                        <option value="Completed">Hoàn Thành</option>
                                        <option value="Cancelled">Hủy</option>
                                    </select>
                                ) : (
                                    <span className={cx('status', `status-${appointment.status}`)}>
                                        {statusLabels[appointment.status] || appointment.status}
                                    </span>
                                )}
                            </td>
                            <td>
                                <span className={cx('payment-status', `payment-${appointment.paymentStatus}`)}>
                                    {paymentStatusLabels[appointment.paymentStatus] || 'Không xác định'}
                                </span>
                            </td>
                            <td>
                                <div className={cx('action-buttons')}>
                                    {editingId === appointment.id ? (
                                        <>
                                            <button
                                                className={cx('btn-save')}
                                                onClick={() => handleStatusUpdate(appointment)}
                                                disabled={updatingId === appointment.id}
                                                title="Lưu"
                                            >
                                                <FontAwesomeIcon icon={faSave} />
                                            </button>
                                            <button
                                                className={cx('btn-cancel-edit')}
                                                onClick={handleCancel}
                                                title="Hủy"
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className={cx('btn-edit')}
                                                onClick={() => handleEdit(appointment)}
                                                title="Chỉnh sửa trạng thái"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className={cx('btn-delete')}
                                                onClick={() => handleDelete(appointment.id)}
                                                title="Xóa"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemAppointment;
