import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Invoice.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemInvoice from './ItemInvoice';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Invoice() {
    // State quản lý danh sách hóa đơn
    const [invoices, setInvoices] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý danh sách khách hàng & nhân viên
    const [customers, setCustomers] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [products, setProducts] = useState([]);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        customerId: '',
        staffId: '',
        lineItems: [{ productId: '', quantity: '' }],
        type: 'DichVu',
        typeInvoice: '0', // PayAfterService (0), PayInAdvance (1), PartialPayment (2)
        voucherId: '',
        paidAmount: '',
        paymentMethod: 'Cash',
        notes: '',
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        customerId: '',
        staffId: '',
        orderStatuses: '',
        type: '',
        status: '',
        startDate: '',
        endDate: '',
    });

    // Lấy danh sách khách hàng
    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Customer/getlistcustomer`, {
                pageNo: 1,
                pageSize: 1000,
            });
            if (response.data && response.data.baseDatas) {
                setCustomers(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách khách hàng:', error);
        }
    }, []);

    // Lấy danh sách nhân viên
    const fetchStaffs = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Staff/get-list`, {
                pageNo: 1,
                pageSize: 1000,
            });
            if (response.data && response.data.baseDatas) {
                setStaffs(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách nhân viên:', error);
        }
    }, []);

    // Lấy danh sách sản phẩm
    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Product/getproductlist`, {
                pageNo: 1,
                pageSize: 1000,
            });
            if (response.data && response.data.baseDatas) {
                setProducts(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách sản phẩm:', error);
        }
    }, []);

    // Lấy danh sách hóa đơn
    const fetchInvoices = useCallback(
        async (page = 1, filters = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    customerId: filters.customerId ? parseInt(filters.customerId) : 0,
                    staffId: filters.staffId ? parseInt(filters.staffId) : 0,
                    orderStatuses: filters.orderStatuses && filters.orderStatuses.trim() ? [filters.orderStatuses] : [],
                    type: filters.type || null,
                    status: filters.status || null,
                    startDate: filters.startDate ? `${filters.startDate}T00:00:00Z` : null,
                    endDate: filters.endDate ? `${filters.endDate}T23:59:59Z` : null,
                };

                const response = await axios.post(`${API_BASE}/Invoice/getinvoicelist`, payload);
                if (response.data && response.data.baseDatas) {
                    setInvoices(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách hóa đơn:', error);
                setSuccessMessage('Lỗi lấy danh sách hóa đơn');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchCustomers();
        fetchStaffs();
        fetchProducts();
        fetchInvoices(1);
    }, [fetchCustomers, fetchStaffs, fetchProducts, fetchInvoices]);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    // Xử lý thay đổi form input
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý thay đổi line items
    const handleLineItemChange = (index, field, value) => {
        const newLineItems = [...formData.lineItems];
        newLineItems[index][field] = value;
        setFormData((prev) => ({
            ...prev,
            lineItems: newLineItems,
        }));
    };

    // Xử lý thêm line item
    const handleAddLineItem = () => {
        setFormData((prev) => ({
            ...prev,
            lineItems: [...prev.lineItems, { productId: '', quantity: '' }],
        }));
    };

    // Xử lý xóa line item
    const handleRemoveLineItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index),
        }));
    };

    // Xử lý thay đổi tìm kiếm
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        const newSearchData = {
            ...searchData,
            [name]: value,
        };
        setSearchData(newSearchData);
        // Gọi API ngay lập tức khi filter thay đổi (không chỉ đợi debounce)
        fetchInvoices(1, newSearchData);
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            const payload = {
                customerId: parseInt(formData.customerId),
                staffId: parseInt(formData.staffId),
                lineItems: formData.lineItems.map((item) => ({
                    productId: parseInt(item.productId),
                    quantity: parseInt(item.quantity),
                })),
                type: formData.type,
                voucherId: formData.voucherId ? parseInt(formData.voucherId) : 0,
                paidAmount: parseFloat(formData.paidAmount) || 0,
                paymentMethod: formData.paymentMethod,
                typeInvoice: parseInt(formData.typeInvoice),
                notes: formData.notes,
            };

            const response = await axios.post(`${API_BASE}/Invoice/createinvoice`, payload);

            if (response.data && response.data.success) {
                setSuccessMessage('Tạo hóa đơn thành công');
                setShowSuccessMessage(true);
                setIsFormVisible(false);
                setFormData({
                    customerId: '',
                    staffId: '',
                    lineItems: [{ productId: '', quantity: '' }],
                    type: 'DichVu',
                    voucherId: '',
                    paidAmount: '',
                    paymentMethod: 'Cash',
                    typeInvoice: '0',
                    notes: '',
                });
                fetchInvoices(1, searchData);
            } else {
                setSuccessMessage(response.data?.message || 'Lỗi khi tạo hóa đơn');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi khi tạo hóa đơn:', error);
            setSuccessMessage('Lỗi khi tạo hóa đơn');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý mở form thêm
    const handleOpenForm = () => {
        setFormData({
            customerId: '',
            staffId: '',
            lineItems: [{ productId: '', quantity: '' }],
            type: 'DichVu',
            typeInvoice: '0',
            voucherId: '',
            paidAmount: '',
            paymentMethod: 'Cash',
            notes: '',
        });
        setIsFormVisible(true);
    };

    // Xử lý đóng form
    const handleCloseForm = () => {
        setIsFormVisible(false);
    };

    // Xử lý xóa invoice
    const handleDeleteInvoice = (invoiceId) => {
        setInvoices((prev) => prev.filter((inv) => inv.invoice.id !== invoiceId));
        fetchInvoices(1, searchData);
    };

    // Xử lý cập nhật status
    const handleInvoiceStatusUpdate = () => {
        fetchInvoices(pageIndex, searchData);
    };

    // Xử lý pagination
    const handlePageChange = (newPage) => {
        fetchInvoices(newPage, searchData);
    };

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Hóa Đơn</h1>
                <div className={cx('header-actions')}>
                    <button className={cx('btn-add')} onClick={handleOpenForm}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Hóa Đơn
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className={cx('filter-section')}>
                <div className={cx('filter-group')}>
                    <label>Khách Hàng</label>
                    <select
                        name="customerId"
                        value={searchData.customerId}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    >
                        <option value="">Tất cả</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.fullName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <label>Nhân Viên</label>
                    <select
                        name="staffId"
                        value={searchData.staffId}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    >
                        <option value="">Tất cả</option>
                        {staffs.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                                {staff.fullName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <label>Trạng Thái Hóa Đơn</label>
                    <select
                        name="status"
                        value={searchData.status}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    >
                        <option value="">Tất cả</option>
                        <option value="DangChoXuLy">Đang Chờ Xử Lý</option>
                        <option value="DaXuLy">Đã Xử Lý</option>
                        <option value="DaHuy">Đã Hủy</option>
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <label>Trạng Thái Đơn</label>
                    <select
                        name="orderStatuses"
                        value={searchData.orderStatuses}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    >
                        <option value="">Tất cả</option>
                        <option value="DangChoXuLy">Đang Chờ Xử Lý</option>
                        <option value="DangGiao">Đang Giao</option>
                        <option value="DaGiao">Đã Giao</option>
                        <option value="KhachHuy">Khách Hủy</option>
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <label>Ngày Bắt Đầu</label>
                    <input
                        type="date"
                        name="startDate"
                        value={searchData.startDate}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    />
                </div>

                <div className={cx('filter-group')}>
                    <label>Ngày Kết Thúc</label>
                    <input
                        type="date"
                        name="endDate"
                        value={searchData.endDate}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    />
                </div>
            </div>

            {/* Form thêm hóa đơn */}
            {isFormVisible && (
                <div className={cx('form-overlay')}>
                    <div className={cx('form-container')}>
                        <div className={cx('form-header')}>
                            <h2>Thêm Hóa Đơn Mới</h2>
                            <button className={cx('btn-close')} onClick={handleCloseForm}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={cx('form-content')}>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="customerId">
                                        Khách Hàng <span className={cx('required')}>*</span>
                                    </label>
                                    <select
                                        id="customerId"
                                        name="customerId"
                                        value={formData.customerId}
                                        onChange={handleFormChange}
                                        required
                                        className={cx('form-input')}
                                    >
                                        <option value="">Chọn khách hàng</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={cx('form-group')}>
                                    <label htmlFor="staffId">
                                        Nhân Viên <span className={cx('required')}>*</span>
                                    </label>
                                    <select
                                        id="staffId"
                                        name="staffId"
                                        value={formData.staffId}
                                        onChange={handleFormChange}
                                        required
                                        className={cx('form-input')}
                                    >
                                        <option value="">Chọn nhân viên</option>
                                        {staffs.map((staff) => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Sản Phẩm/Dịch Vụ</label>
                                <div className={cx('line-items')}>
                                    {formData.lineItems.map((item, index) => (
                                        <div key={index} className={cx('line-item-row')}>
                                            <select
                                                value={item.productId}
                                                onChange={(e) =>
                                                    handleLineItemChange(index, 'productId', e.target.value)
                                                }
                                                className={cx('form-input')}
                                            >
                                                <option value="">Chọn sản phẩm</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.productName || product.serviceName}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleLineItemChange(index, 'quantity', e.target.value)
                                                }
                                                placeholder="Số lượng"
                                                className={cx('form-input')}
                                                min="1"
                                            />
                                            {formData.lineItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLineItem(index)}
                                                    className={cx('btn-remove')}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddLineItem} className={cx('btn-add-item')}>
                                    <FontAwesomeIcon icon={faPlus} /> Thêm Sản Phẩm
                                </button>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="type">Loại Hóa Đơn</label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleFormChange}
                                        className={cx('form-input')}
                                    >
                                        <option value="DichVu">Dịch Vụ</option>
                                        <option value="SanPham">Sản Phẩm</option>
                                    </select>
                                </div>

                                <div className={cx('form-group')}>
                                    <label htmlFor="paidAmount">Số Tiền Thanh Toán</label>
                                    <input
                                        id="paidAmount"
                                        type="number"
                                        name="paidAmount"
                                        value={formData.paidAmount}
                                        onChange={handleFormChange}
                                        className={cx('form-input')}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="paymentMethod">Hình Thức Thanh Toán</label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleFormChange}
                                        className={cx('form-input')}
                                    >
                                        <option value="Cash">Tiền Mặt</option>
                                        {/* <option value="CreditCard">Thẻ Tín Dụng</option> */}
                                        <option value="BankTransfer">Chuyển Khoản</option>
                                        {/* <option value="VNPay">VNPay</option> */}
                                    </select>
                                </div>

                                <div className={cx('form-group')}>
                                    <label htmlFor="typeInvoice">
                                        Phương Thức Thanh Toán <span className={cx('required')}>*</span>
                                    </label>
                                    <select
                                        id="typeInvoice"
                                        name="typeInvoice"
                                        value={formData.typeInvoice}
                                        onChange={handleFormChange}
                                        required
                                        className={cx('form-input')}
                                    >
                                        <option value="0">Trả Sau (Làm Xong Mới Thanh Toán)</option>
                                        <option value="1">Trả Trước Toàn Bộ</option>
                                        <option value="2">Trả Một Phần (Đặt Cọc)</option>
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="notes">Ghi Chú</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleFormChange}
                                    className={cx('form-textarea')}
                                    placeholder="Ghi chú thêm..."
                                    rows="3"
                                />
                            </div>

                            <div className={cx('form-actions')}>
                                <button type="button" className={cx('btn-cancel')} onClick={handleCloseForm}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('btn-submit')} disabled={isLoading}>
                                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Danh sách hóa đơn */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : invoices.length > 0 ? (
                    <>
                        <ItemInvoice
                            invoices={invoices}
                            onDeleteSuccess={handleDeleteInvoice}
                            onStatusUpdate={handleInvoiceStatusUpdate}
                        />
                        {/* Pagination */}
                        <div className={cx('pagination')}>
                            {pageIndex > 1 && (
                                <button
                                    className={cx('btn-pagination')}
                                    onClick={() => handlePageChange(pageIndex - 1)}
                                >
                                    Trang Trước
                                </button>
                            )}
                            <span className={cx('page-info')}>
                                Trang {pageIndex} / {Math.ceil(totalRecordCount / pageSize)}
                            </span>
                            {pageIndex < Math.ceil(totalRecordCount / pageSize) && (
                                <button
                                    className={cx('btn-pagination')}
                                    onClick={() => handlePageChange(pageIndex + 1)}
                                >
                                    Trang Sau
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={cx('no-data')}>Không có dữ liệu hóa đơn</div>
                )}
            </div>
        </div>
    );
}

export default Invoice;
