import React, { useState } from 'react';
import axios from 'axios';
import styles from './ItemEquipment.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function ItemEquipment({ equipments, clinics, onEdit, onDeleteSuccess }) {
    // Xử lý xóa equipment
    const handleDelete = async (equipmentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
            return;
        }

        try {
            const response = await axios.post(`${API_BASE}/Equipment/deleteequipment`, {
                id: equipmentId,
            });

            if (response.data && response.data.success) {
                if (onDeleteSuccess) {
                    onDeleteSuccess(equipmentId);
                }
            } else {
                alert('Lỗi khi xóa thiết bị');
            }
        } catch (error) {
            console.error('Lỗi khi xóa thiết bị:', error);
            alert('Lỗi khi xóa thiết bị');
        }
    };

    // Hàm lấy tên phòng khám từ ID
    const getClinicNameById = (clinicId) => {
        const clinic = clinics.find((c) => c.id === clinicId);
        return clinic ? clinic.clinicName : 'N/A';
    };

    if (!equipments || equipments.length === 0) {
        return <div className={cx('wrapper')}>Không có dữ liệu</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('equipment-table')}>
                <thead>
                    <tr>
                        <th>Mã Thiết Bị</th>
                        <th>Tên Thiết Bị</th>
                        <th>Phòng Khám</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {equipments.map((equipment) => (
                        <tr key={equipment.id} className={cx('equipment-row')}>
                            <td className={cx('equipment-id')}>#{equipment.id}</td>
                            <td className={cx('equipment-name')}>{equipment.equipmentName}</td>
                            <td className={cx('clinic-name')}>{getClinicNameById(equipment.clinicId)}</td>
                            <td>
                                <span className={cx('status', `status-${equipment.status}`)}>
                                    {equipment.status === 'Active' ? 'Hoạt Động' : 'Không Hoạt Động'}
                                </span>
                            </td>
                            <td>
                                <div className={cx('action-buttons')}>
                                    <button
                                        className={cx('btn-edit')}
                                        onClick={() => onEdit(equipment)}
                                        title="Chỉnh sửa"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button
                                        className={cx('btn-delete')}
                                        onClick={() => handleDelete(equipment.id)}
                                        title="Xóa"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ItemEquipment;
