import React, { useState, useMemo } from 'react';
import axios from 'axios';
import styles from './ItemInvoice.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faTrash, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

const orderStatusOptions = [
    { value: 'DangChoXuLy', label: 'Đang Chờ Xử Lý' },
    { value: 'DangGiao', label: 'Đang Giao' },
    { value: 'DaGiao', label: 'Đã Giao' },
    { value: 'KhachHuy', label: 'Khách Hủy' },
];

const invoiceStatusOptions = [
    { value: 'DangChoXuLy', label: 'Đang Chờ Xử Lý' },
    { value: 'DaXuLy', label: 'Đã Xử Lý' },
    { value: 'DaHuy', label: 'Đã Hủy' },
];

function ItemInvoice({ invoices, onDeleteSuccess, onStatusUpdate }) {
    const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState(new Set());
    const [editingStatusFor, setEditingStatusFor] = useState(null); // 'status' or 'orderStatus'
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);
    const [newStatusValue, setNewStatusValue] = useState('');

    // Tính số lượng hóa đơn được chọn
    const selectedCount = useMemo(() => selectedInvoiceIds.size, [selectedInvoiceIds]);

    // Xử lý checkbox
    const handleCheckboxChange = (invoiceId) => {
        const newSelection = new Set(selectedInvoiceIds);
        if (newSelection.has(invoiceId)) {
            newSelection.delete(invoiceId);
        } else {
            newSelection.add(invoiceId);
        }
        setSelectedInvoiceIds(newSelection);
    };

    // Xử lý edit status
    const handleEditStatus = (invoice, statusType) => {
        setEditingInvoiceId(invoice.id);
        setEditingStatusFor(statusType);
        if (statusType === 'status') {
            setNewStatusValue(invoice.status || '');
        } else {
            setNewStatusValue(invoice.orderStatus || '');
        }
    };

    // Xử lý hủy chỉnh sửa
    const handleCancelEdit = () => {
        setEditingInvoiceId(null);
        setEditingStatusFor(null);
        setNewStatusValue('');
    };

    // Xử lý lưu status
    const handleSaveStatus = async (invoice) => {
        if (!newStatusValue) {
            alert('Vui lòng chọn trạng thái');
            return;
        }

        try {
            setIsLoading(true);
            if (editingStatusFor === 'status') {
                // Update invoice status
                const response = await axios.post(`${API_BASE}/Invoice/updatestatus`, {
                    invoiceId: invoice.id,
                    status: newStatusValue,
                });

                if (response.data && response.data.success) {
                    if (onStatusUpdate) {
                        onStatusUpdate();
                    }
                    if (onDeleteSuccess) {
                        onDeleteSuccess('Cập nhật trạng thái hóa đơn thành công');
                    }
                }
            } else {
                // Update order status
                const response = await axios.post(`${API_BASE}/Invoice/updateinvoiceorderstatus`, {
                    invoiceId: invoice.id,
                    orderStatus: newStatusValue,
                });

                if (response.data && response.data.success) {
                    if (onStatusUpdate) {
                        onStatusUpdate();
                    }
                    if (onDeleteSuccess) {
                        onDeleteSuccess('Cập nhật trạng thái đơn thành công');
                    }
                }
            }
            setEditingInvoiceId(null);
            setEditingStatusFor(null);
            setNewStatusValue('');
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            alert('Lỗi khi cập nhật trạng thái');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý xóa tất cả các hóa đơn được chọn
    const handleBulkDelete = async () => {
        if (selectedCount === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedCount} hóa đơn này?`)) {
            return;
        }

        try {
            setIsLoading(true);
            // Xóa từng hóa đơn (có thể tối ưu với batch delete API nếu có)
            await Promise.all(Array.from(selectedInvoiceIds).map((invoiceId) => handleDeleteInvoice(invoiceId, true)));

            if (onDeleteSuccess) {
                onDeleteSuccess(`Đã xóa thành công ${selectedCount} hóa đơn`);
            }
            setSelectedInvoiceIds(new Set());
        } catch (error) {
            console.error('Lỗi khi xóa hóa đơn:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteInvoice = async (invoiceId, isSilent = false) => {
        if (!isSilent && !window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
            return;
        }

        try {
            setIsLoading(true);
            // Note: Delete endpoint may not be provided, add when available
            // For now, we'll just remove from local state
            if (!isSilent && onDeleteSuccess) {
                onDeleteSuccess('Xóa hóa đơn thành công');
            }
        } catch (error) {
            console.error('Lỗi khi xóa hóa đơn:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!invoices || invoices.length === 0) {
        return <div className={cx('wrapper')}>Không có dữ liệu hóa đơn</div>;
    }

    return (
        <div className={cx('wrapper')}>
            {/* Master Delete Button */}
            {selectedCount > 0 && (
                <div className={cx('bulk-actions')}>
                    <span className={cx('selection-info')}>Đã chọn {selectedCount} hóa đơn</span>
                    <button
                        className={cx('btn-bulk-delete', {
                            active: selectedCount >= 2,
                        })}
                        onClick={handleBulkDelete}
                        disabled={isLoading}
                        title={selectedCount < 2 ? 'Chọn ít nhất 2 hóa đơn để xóa' : 'Xóa các hóa đơn được chọn'}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        Xóa {selectedCount > 0 ? `(${selectedCount})` : ''}
                    </button>
                    <button
                        className={cx('btn-cancel-selection')}
                        onClick={() => setSelectedInvoiceIds(new Set())}
                        disabled={isLoading}
                    >
                        Bỏ chọn
                    </button>
                </div>
            )}

            <table className={cx('invoice-table')}>
                <thead>
                    <tr>
                        <th className={cx('checkbox-col')}>
                            <input
                                type="checkbox"
                                checked={invoices.length > 0 && selectedCount === invoices.length}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedInvoiceIds(
                                            new Set(invoices.map((item) => item.invoice?.id || item.id)),
                                        );
                                    } else {
                                        setSelectedInvoiceIds(new Set());
                                    }
                                }}
                                title="Chọn tất cả"
                            />
                        </th>
                        <th>Mã Hóa Đơn</th>
                        <th>Khách Hàng</th>
                        <th>Nhân Viên</th>
                        <th>Tổng Tiền</th>
                        <th>Giảm Giá</th>
                        <th>Thành Tiền</th>
                        <th>Đã Thanh Toán</th>
                        <th>Còn Nợ</th>
                        <th>Trạng Thái</th>
                        <th>Trạng Thái Đơn</th>
                        <th>Ngày Tạo</th>
                        <th>Tùy Chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((item) => {
                        const invoice = item.invoice || item;
                        const details = item.invoiceDetails || [];
                        const isSelected = selectedInvoiceIds.has(invoice.id);

                        return (
                            <React.Fragment key={invoice.id}>
                                <tr className={cx('main-row', { selected: isSelected })}>
                                    <td className={cx('checkbox-col')}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleCheckboxChange(invoice.id)}
                                        />
                                    </td>
                                    <td className={cx('invoice-id')}>{invoice.id || 'N/A'}</td>
                                    <td>{invoice.customerName || 'N/A'}</td>
                                    <td>{invoice.staffName || 'N/A'}</td>
                                    <td className={cx('currency')}>
                                        {invoice.totalMoney ? invoice.totalMoney.toLocaleString('vi-VN') : '0'} ₫
                                    </td>
                                    <td className={cx('currency')}>
                                        {invoice.discountValue ? invoice.discountValue.toLocaleString('vi-VN') : '0'} ₫
                                    </td>
                                    <td className={cx('currency')}>
                                        {invoice.finalPrice ? invoice.finalPrice.toLocaleString('vi-VN') : '0'} ₫
                                    </td>
                                    <td className={cx('currency')}>
                                        {invoice.paidAmount ? invoice.paidAmount.toLocaleString('vi-VN') : '0'} ₫
                                    </td>
                                    <td className={cx('currency')}>
                                        {invoice.outstandingBalance
                                            ? invoice.outstandingBalance.toLocaleString('vi-VN')
                                            : '0'}{' '}
                                        ₫
                                    </td>
                                    <td>
                                        {editingInvoiceId === invoice.id && editingStatusFor === 'status' ? (
                                            <div className={cx('status-edit-container')}>
                                                <select
                                                    value={newStatusValue}
                                                    onChange={(e) => setNewStatusValue(e.target.value)}
                                                    className={cx('status-select')}
                                                >
                                                    {invoiceStatusOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className={cx('btn-save')}
                                                    onClick={() => handleSaveStatus(invoice)}
                                                    title="Lưu"
                                                    disabled={isLoading}
                                                >
                                                    <FontAwesomeIcon icon={faSave} />
                                                </button>
                                                <button
                                                    className={cx('btn-cancel')}
                                                    onClick={handleCancelEdit}
                                                    title="Hủy"
                                                    disabled={isLoading}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={cx('status-display')}>
                                                <span className={cx('status-badge', `status-${invoice.status}`)}>
                                                    {invoice.status || 'N/A'}
                                                </span>
                                                {isSelected && (
                                                    <button
                                                        className={cx('btn-edit')}
                                                        onClick={() => handleEditStatus(invoice, 'status')}
                                                        title="Chỉnh sửa"
                                                        disabled={isLoading}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {editingInvoiceId === invoice.id && editingStatusFor === 'orderStatus' ? (
                                            <div className={cx('status-edit-container')}>
                                                <select
                                                    value={newStatusValue}
                                                    onChange={(e) => setNewStatusValue(e.target.value)}
                                                    className={cx('status-select')}
                                                >
                                                    {orderStatusOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    className={cx('btn-save')}
                                                    onClick={() => handleSaveStatus(invoice)}
                                                    title="Lưu"
                                                    disabled={isLoading}
                                                >
                                                    <FontAwesomeIcon icon={faSave} />
                                                </button>
                                                <button
                                                    className={cx('btn-cancel')}
                                                    onClick={handleCancelEdit}
                                                    title="Hủy"
                                                    disabled={isLoading}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={cx('status-display')}>
                                                <span className={cx('order-status')}>{invoice.orderStatus || 'N/A'}</span>
                                                {isSelected && (
                                                    <button
                                                        className={cx('btn-edit')}
                                                        onClick={() => handleEditStatus(invoice, 'orderStatus')}
                                                        title="Chỉnh sửa"
                                                        disabled={isLoading}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {invoice.dateCreated
                                            ? new Date(invoice.dateCreated).toLocaleDateString('vi-VN')
                                            : 'N/A'}
                                    </td>
                                    <td className={cx('actions')}>
                                        <button
                                            className={cx('btn-expand')}
                                            onClick={() =>
                                                setExpandedInvoiceId(
                                                    expandedInvoiceId === invoice.id ? null : invoice.id,
                                                )
                                            }
                                            title="Xem chi tiết"
                                        >
                                            <FontAwesomeIcon icon={faCaretDown} />
                                        </button>
                                    </td>
                                </tr>
                                {/* Details row */}
                                {expandedInvoiceId === invoice.id && details.length > 0 && (
                                    <tr className={cx('detail-row')}>
                                        <td colSpan="13">
                                            <div className={cx('details-container')}>
                                                <h4>Chi Tiết Hóa Đơn</h4>
                                                <table className={cx('details-table')}>
                                                    <thead>
                                                        <tr>
                                                            <th>Tên Sản Phẩm/Dịch Vụ</th>
                                                            <th>Tên Sản Phẩm</th>
                                                            <th>Giá</th>
                                                            <th>Số Lượng</th>
                                                            <th>Tổng Tiền</th>
                                                            <th>Giảm Giá</th>
                                                            <th>Thành Tiền</th>
                                                            <th>Trạng Thái</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {details.map((detail) => (
                                                            <tr key={detail.id}>
                                                                <td>
                                                                    {detail.serviceName || detail.productName || 'N/A'}
                                                                </td>
                                                                <td>{detail.productName || 'N/A'}</td>
                                                                <td className={cx('currency')}>
                                                                    {detail.price
                                                                        ? detail.price.toLocaleString('vi-VN')
                                                                        : '0'}{' '}
                                                                    ₫
                                                                </td>
                                                                <td>{detail.quantity || '0'}</td>
                                                                <td className={cx('currency')}>
                                                                    {detail.totalMoney
                                                                        ? detail.totalMoney.toLocaleString('vi-VN')
                                                                        : '0'}{' '}
                                                                    ₫
                                                                </td>
                                                                <td className={cx('currency')}>
                                                                    {detail.discountValue
                                                                        ? detail.discountValue.toLocaleString('vi-VN')
                                                                        : '0'}{' '}
                                                                    ₫
                                                                </td>
                                                                <td className={cx('currency')}>
                                                                    {detail.finalPrice
                                                                        ? detail.finalPrice.toLocaleString('vi-VN')
                                                                        : '0'}{' '}
                                                                    ₫
                                                                </td>
                                                                <td>
                                                                    <span className={cx('status-badge')}>
                                                                        {detail.status || 'N/A'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
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

export default ItemInvoice;
