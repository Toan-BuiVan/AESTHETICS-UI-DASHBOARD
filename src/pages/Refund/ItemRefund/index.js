import React, { useState, useMemo } from 'react';
import styles from './ItemRefund.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const refundStatusOptions = [
    { value: 'PendingApproval', label: 'Chờ Duyệt', color: '#ffc107' },
    { value: 'Approved', label: 'Đã Duyệt', color: '#28a745' },
    { value: 'Rejected', label: 'Từ Chối', color: '#dc3545' },
];

const refundMethodLabels = {
    CHUYENKHOAN: 'Chuyển Khoản',
    TIENMAT: 'Tiền Mặt',
    KHAC: 'Khác',
};

function ItemRefund({ refunds, onStatusUpdate }) {
    const [expandedRefundId, setExpandedRefundId] = useState(null);
    const [selectedRefundIds, setSelectedRefundIds] = useState(new Set());
    const [editingId, setEditingId] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    const selectedCount = useMemo(() => selectedRefundIds.size, [selectedRefundIds]);

    // Xử lý checkbox
    const handleCheckboxChange = (refundId) => {
        const newSelection = new Set(selectedRefundIds);
        if (newSelection.has(refundId)) {
            newSelection.delete(refundId);
        } else {
            newSelection.add(refundId);
        }
        setSelectedRefundIds(newSelection);
    };

    // Xử lý mở chế độ chỉnh sửa trạng thái
    const handleEdit = (refund) => {
        setEditingId(refund.id);
        setNewStatus(refund.status);
    };

    // Xử lý hủy chỉnh sửa
    const handleCancel = () => {
        setEditingId(null);
        setNewStatus('');
    };

    // Xử lý lưu trạng thái
    const handleSave = (refund) => {
        if (!newStatus) {
            alert('Vui lòng chọn trạng thái');
            return;
        }
        onStatusUpdate(refund.id, newStatus);
        setEditingId(null);
        setNewStatus('');
    };

    const getStatusBadgeColor = (status) => {
        const option = refundStatusOptions.find((opt) => opt.value === status);
        return option ? option.color : '#6c757d';
    };

    const getStatusLabel = (status) => {
        const option = refundStatusOptions.find((opt) => opt.value === status);
        return option ? option.label : status;
    };

    if (!refunds || refunds.length === 0) {
        return <div className={cx('wrapper')}>Không có dữ liệu hoàn tiền</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <table className={cx('refund-table')}>
                <thead>
                    <tr>
                        <th className={cx('checkbox-col')}>
                            <input
                                type="checkbox"
                                checked={refunds.length > 0 && selectedCount === refunds.length}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedRefundIds(new Set(refunds.map((r) => r.id)));
                                    } else {
                                        setSelectedRefundIds(new Set());
                                    }
                                }}
                                title="Chọn tất cả"
                            />
                        </th>
                        <th>ID</th>
                        <th>Hóa Đơn</th>
                        <th>Khách Hàng</th>
                        <th>Số Tiền</th>
                        <th>Phương Thức</th>
                        <th>Lý Do</th>
                        <th>Trạng Thái</th>
                        <th>Nhân Viên Xử Lý</th>
                        <th>Ngày Tạo</th>
                        <th>Tùy Chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {refunds.map((refund) => {
                        const isSelected = selectedRefundIds.has(refund.id);

                        return (
                            <React.Fragment key={refund.id}>
                                <tr className={cx('main-row', { selected: isSelected })}>
                                    <td className={cx('checkbox-col')}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleCheckboxChange(refund.id)}
                                        />
                                    </td>
                                    <td className={cx('refund-id')}>#{refund.id}</td>
                                    <td>HĐ-{refund.invoiceId}</td>
                                    <td>{refund.customerId || 'N/A'}</td>
                                    <td className={cx('currency')}>
                                        {refund.refundAmount ? refund.refundAmount.toLocaleString('vi-VN') : '0'} ₫
                                    </td>
                                    <td>
                                        <span className={cx('badge-method')}>
                                            {refundMethodLabels[refund.refundMethod] || refund.refundMethod}
                                        </span>
                                    </td>
                                    <td className={cx('reason')}>{refund.refundReason || 'N/A'}</td>
                                    <td>
                                        {editingId === refund.id ? (
                                            <div className={cx('status-edit-container')}>
                                                <select
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    className={cx('status-select')}
                                                >
                                                    {refundStatusOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className={cx('btn-save')}
                                                    onClick={() => handleSave(refund)}
                                                    title="Lưu"
                                                >
                                                    <FontAwesomeIcon icon={faSave} />
                                                </button>
                                                <button className={cx('btn-cancel')} onClick={handleCancel} title="Hủy">
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={cx('status-display')}>
                                                <span
                                                    className={cx('status-badge')}
                                                    style={{ backgroundColor: getStatusBadgeColor(refund.status) }}
                                                >
                                                    {getStatusLabel(refund.status)}
                                                </span>
                                                {isSelected && (
                                                    <button
                                                        className={cx('btn-edit')}
                                                        onClick={() => handleEdit(refund)}
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td>{refund.staffId || 'Chưa xử lý'}</td>
                                    <td>
                                        {refund.createdDate
                                            ? new Date(refund.createdDate).toLocaleDateString('vi-VN')
                                            : 'N/A'}
                                    </td>
                                    <td className={cx('actions')}>
                                        <button
                                            className={cx('btn-expand')}
                                            onClick={() =>
                                                setExpandedRefundId(expandedRefundId === refund.id ? null : refund.id)
                                            }
                                            title="Xem chi tiết"
                                        >
                                            <FontAwesomeIcon icon={faCaretDown} />
                                        </button>
                                    </td>
                                </tr>
                                {/* Details row */}
                                {expandedRefundId === refund.id && (
                                    <tr className={cx('detail-row')}>
                                        <td colSpan="11">
                                            <div className={cx('details-container')}>
                                                <h4>Chi Tiết Hoàn Tiền</h4>
                                                <div className={cx('details-grid')}>
                                                    <div className={cx('detail-item')}>
                                                        <span className={cx('label')}>ID Hoàn Tiền:</span>
                                                        <span className={cx('value')}>#{refund.id}</span>
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        <span className={cx('label')}>Hóa Đơn:</span>
                                                        <span className={cx('value')}>HĐ-{refund.invoiceId}</span>
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        <span className={cx('label')}>Khách Hàng:</span>
                                                        <span className={cx('value')}>{refund.customerId}</span>
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        <span className={cx('label')}>Số Tiền:</span>
                                                        <span className={cx('value', 'currency')}>
                                                            {refund.refundAmount?.toLocaleString('vi-VN')} ₫
                                                        </span>
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        <span className={cx('label')}>Phương Thức:</span>
                                                        <span className={cx('value')}>
                                                            {refundMethodLabels[refund.refundMethod] ||
                                                                refund.refundMethod}
                                                        </span>
                                                    </div>
                                                    <div className={cx('detail-item')}>
                                                        <span className={cx('label')}>Trạng Thái:</span>
                                                        <span
                                                            className={cx('value', 'status-badge')}
                                                            style={{
                                                                backgroundColor: getStatusBadgeColor(refund.status),
                                                            }}
                                                        >
                                                            {getStatusLabel(refund.status)}
                                                        </span>
                                                    </div>
                                                    {refund.bankName && (
                                                        <>
                                                            <div className={cx('detail-item')}>
                                                                <span className={cx('label')}>Tên Ngân Hàng:</span>
                                                                <span className={cx('value')}>{refund.bankName}</span>
                                                            </div>
                                                            <div className={cx('detail-item')}>
                                                                <span className={cx('label')}>Số Tài Khoản:</span>
                                                                <span className={cx('value')}>
                                                                    {refund.bankAccount}
                                                                </span>
                                                            </div>
                                                            <div className={cx('detail-item')}>
                                                                <span className={cx('label')}>Chủ Tài Khoản:</span>
                                                                <span className={cx('value')}>
                                                                    {refund.bankAccountName}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className={cx('detail-item', 'full-width')}>
                                                        <span className={cx('label')}>Lý Do Hoàn Tiền:</span>
                                                        <span className={cx('value')}>
                                                            {refund.refundReason || 'N/A'}
                                                        </span>
                                                    </div>
                                                    {refund.refundImages && (
                                                        <div className={cx('detail-item', 'full-width')}>
                                                            <span className={cx('label')}>Hình Ảnh:</span>
                                                            <span className={cx('value')}>{refund.refundImages}</span>
                                                        </div>
                                                    )}
                                                    {refund.approvedDate && (
                                                        <div className={cx('detail-item')}>
                                                            <span className={cx('label')}>Ngày Duyệt:</span>
                                                            <span className={cx('value')}>
                                                                {new Date(refund.approvedDate).toLocaleDateString(
                                                                    'vi-VN',
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {refund.completedDate && (
                                                        <div className={cx('detail-item')}>
                                                            <span className={cx('label')}>Ngày Hoàn Thành:</span>
                                                            <span className={cx('value')}>
                                                                {new Date(refund.completedDate).toLocaleDateString(
                                                                    'vi-VN',
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ItemRefund;
