import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Refund.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemRefund from './ItemRefund';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Refund() {
    // State quản lý danh sách hoàn tiền
    const [refunds, setRefunds] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý danh sách hóa đơn & khách hàng & nhân viên
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staffs, setStaffs] = useState([]);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý form input
    const [formData, setFormData] = useState({
        invoiceId: '',
        customerId: '',
        refundReason: '',
        refundImages: '',
        refundMethod: 'CHUYENKHOAN', // CHUYENKHOAN, TIENMAT, etc.
    });

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        invoiceId: '',
        customerId: '',
        staffId: '',
        startDate: '',
        endDate: '',
    });

    // Lấy danh sách hóa đơn
    const fetchInvoices = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Invoice/getinvoicelist`, {
                pageNo: 1,
                pageSize: 1000,
            });
            if (response.data && response.data.baseDatas) {
                setInvoices(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách hóa đơn:', error);
        }
    }, []);

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

    // Lấy danh sách hoàn tiền
    const fetchRefunds = useCallback(
        async (page = 1, filters = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    request: {
                        pageNo: page,
                        pageSize: pageSize,
                        invoiceId: filters.invoiceId ? parseInt(filters.invoiceId) : null,
                        customerId: filters.customerId ? parseInt(filters.customerId) : null,
                        staffId: filters.staffId ? parseInt(filters.staffId) : null,
                        startDate: filters.startDate || null,
                        endDate: filters.endDate || null,
                    },
                };

                const response = await axios.post(`${API_BASE}/Refund/get-list`, payload);
                if (response.data && response.data.success && response.data.data) {
                    setRefunds(response.data.data);
                    setTotalRecords(response.data.pagination?.totalRecords || 0);
                    setPageIndex(response.data.pagination?.pageIndex || 1);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách hoàn tiền:', error);
                setSuccessMessage('Lỗi lấy danh sách hoàn tiền');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchInvoices();
        fetchCustomers();
        fetchStaffs();
        fetchRefunds(1);
    }, [fetchInvoices, fetchCustomers, fetchStaffs, fetchRefunds]);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    // Debounce search data
    const debouncedSearchData = useDebounce(searchData, 3000);

    // Call API when debounced search data changes
    useEffect(() => {
        fetchRefunds(1, debouncedSearchData);
    }, [debouncedSearchData, fetchRefunds]);

    // Xử lý thay đổi form input
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý thay đổi tìm kiếm
    const handleSearchChange = (e) => {
        const { name, value } = e.target;

        // Validation: endDate phải >= startDate
        if (name === 'startDate' || name === 'endDate') {
            const newData = { ...searchData, [name]: value };

            if (newData.startDate && newData.endDate) {
                const startDate = new Date(newData.startDate);
                const endDate = new Date(newData.endDate);

                if (endDate < startDate) {
                    setSuccessMessage('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu');
                    setShowSuccessMessage(true);
                    return;
                }
            }
        }

        setSearchData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            const payload = {
                invoiceId: parseInt(formData.invoiceId),
                customerId: parseInt(formData.customerId),
                refundReason: formData.refundReason,
                refundImages: formData.refundImages,
                refundMethod: formData.refundMethod,
            };

            const response = await axios.post(`${API_BASE}/Refund/create`, payload);

            if (response.data && response.data.success) {
                setSuccessMessage('Tạo yêu cầu hoàn tiền thành công');
                setShowSuccessMessage(true);
                setIsFormVisible(false);
                setFormData({
                    invoiceId: '',
                    customerId: '',
                    refundReason: '',
                    refundImages: '',
                    refundMethod: 'CHUYENKHOAN',
                });
                fetchRefunds(1, searchData);
            } else {
                setSuccessMessage(response.data?.message || 'Lỗi khi tạo yêu cầu hoàn tiền');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi khi tạo yêu cầu hoàn tiền:', error);
            setSuccessMessage('Lỗi khi tạo yêu cầu hoàn tiền');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý mở form thêm
    const handleOpenForm = () => {
        setFormData({
            invoiceId: '',
            customerId: '',
            refundReason: '',
            refundImages: '',
            refundMethod: 'CHUYENKHOAN',
        });
        setIsFormVisible(true);
    };

    // Xử lý đóng form
    const handleCloseForm = () => {
        setIsFormVisible(false);
    };

    // Xử lý cập nhật status hoàn tiền
    const handleStatusUpdate = async (refundId, newStatus) => {
        try {
            setIsLoading(true);
            const staffId = localStorage.getItem('staffId') || '';

            const response = await axios.post(`${API_BASE}/Refund/update-status`, {
                id: refundId,
                staffId: parseInt(staffId),
                status: newStatus,
            });

            if (response.data && response.data.message) {
                setSuccessMessage('Cập nhật trạng thái thành công');
                setShowSuccessMessage(true);
                fetchRefunds(pageIndex, searchData);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            setSuccessMessage('Lỗi khi cập nhật trạng thái hoàn tiền');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý hiển thị thông báo
    const handleNotify = (message) => {
        setSuccessMessage(message);
        setShowSuccessMessage(true);
    };

    // Xử lý refresh danh sách
    const handleRefreshList = () => {
        fetchRefunds(pageIndex, searchData);
    };

    // Xử lý pagination
    const handlePageChange = (newPage) => {
        fetchRefunds(newPage, searchData);
    };

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} isVisible={showSuccessMessage} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Hoàn Tiền</h1>
                <div className={cx('header-actions')}>
                    <button className={cx('btn-add')} onClick={handleOpenForm}>
                        <FontAwesomeIcon icon={faPlus} />
                        Tạo Yêu Cầu
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className={cx('filter-section')}>
                <div className={cx('filter-group')}>
                    <label>Hóa Đơn</label>
                    <select
                        name="invoiceId"
                        value={searchData.invoiceId}
                        onChange={handleSearchChange}
                        className={cx('filter-input')}
                    >
                        <option value="">Tất cả</option>
                        {invoices.map((invoice) => (
                            <option key={invoice.invoice?.id || invoice.id} value={invoice.invoice?.id || invoice.id}>
                                HĐ-{invoice.invoice?.id || invoice.id}
                            </option>
                        ))}
                    </select>
                </div>

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
                    <label>Nhân Viên Xử Lý</label>
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

            {/* Form tạo yêu cầu hoàn tiền */}
            {isFormVisible && (
                <div className={cx('form-overlay')}>
                    <div className={cx('form-container')}>
                        <div className={cx('form-header')}>
                            <h2>Tạo Yêu Cầu Hoàn Tiền</h2>
                            <button className={cx('btn-close')} onClick={handleCloseForm}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={cx('form-content')}>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="invoiceId">
                                        Hóa Đơn <span className={cx('required')}>*</span>
                                    </label>
                                    <select
                                        id="invoiceId"
                                        name="invoiceId"
                                        value={formData.invoiceId}
                                        onChange={handleFormChange}
                                        required
                                        className={cx('form-input')}
                                    >
                                        <option value="">Chọn hóa đơn</option>
                                        {invoices.map((invoice) => (
                                            <option
                                                key={invoice.invoice?.id || invoice.id}
                                                value={invoice.invoice?.id || invoice.id}
                                            >
                                                HĐ-{invoice.invoice?.id || invoice.id} (
                                                {invoice.invoice?.customerName || invoice.customerName})
                                            </option>
                                        ))}
                                    </select>
                                </div>

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
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label htmlFor="refundMethod">
                                        Phương Thức Hoàn Tiền <span className={cx('required')}>*</span>
                                    </label>
                                    <select
                                        id="refundMethod"
                                        name="refundMethod"
                                        value={formData.refundMethod}
                                        onChange={handleFormChange}
                                        required
                                        className={cx('form-input')}
                                    >
                                        <option value="CHUYENKHOAN">Chuyển Khoản</option>
                                        <option value="TIENMAT">Tiền Mặt</option>
                                        <option value="KHAC">Khác</option>
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="refundReason">
                                    Lý Do Hoàn Tiền <span className={cx('required')}>*</span>
                                </label>
                                <textarea
                                    id="refundReason"
                                    name="refundReason"
                                    value={formData.refundReason}
                                    onChange={handleFormChange}
                                    required
                                    className={cx('form-textarea')}
                                    placeholder="Nhập lý do hoàn tiền..."
                                    rows="4"
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label htmlFor="refundImages">Hình Ảnh Chứng Minh</label>
                                <input
                                    id="refundImages"
                                    type="text"
                                    name="refundImages"
                                    value={formData.refundImages}
                                    onChange={handleFormChange}
                                    className={cx('form-input')}
                                    placeholder="Tên hoặc đường dẫn hình ảnh"
                                />
                            </div>

                            <div className={cx('form-actions')}>
                                <button type="button" className={cx('btn-cancel')} onClick={handleCloseForm}>
                                    Hủy
                                </button>
                                <button type="submit" className={cx('btn-submit')} disabled={isLoading}>
                                    {isLoading ? 'Đang lưu...' : 'Tạo Yêu Cầu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Danh sách hoàn tiền */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : refunds.length > 0 ? (
                    <>
                        <ItemRefund refunds={refunds} onStatusUpdate={handleStatusUpdate} onNotify={handleNotify} onRefresh={handleRefreshList} />
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
                                Trang {pageIndex} / {Math.ceil(totalRecords / pageSize)}
                            </span>
                            {pageIndex < Math.ceil(totalRecords / pageSize) && (
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
                    <div className={cx('no-data')}>Không có dữ liệu hoàn tiền</div>
                )}
            </div>
        </div>
    );
}

export default Refund;
