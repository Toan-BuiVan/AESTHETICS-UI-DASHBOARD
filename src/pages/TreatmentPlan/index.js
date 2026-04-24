import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TreatmentPlan.module.scss';
import classNames from 'classnames/bind';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import useDebounce from '~/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function TreatmentPlan() {
    const navigate = useNavigate();
    const [treatmentPlans, setTreatmentPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [pageNo, setPageNo] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchId, setSearchId] = useState('');
    const [searchServiceId, setSearchServiceId] = useState('');
    const debouncedSearchId = useDebounce(searchId, 3000);
    const debouncedSearchServiceId = useDebounce(searchServiceId, 3000);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({});
    const [services, setServices] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailPlan, setSelectedDetailPlan] = useState(null);
    const [selectedRows, setSelectedRows] = useState(new Set());

    useEffect(() => {
        if (debouncedSearchId !== undefined || debouncedSearchServiceId !== undefined) {
            setPageNo(1);
        }
    }, [debouncedSearchId, debouncedSearchServiceId]);

    useEffect(() => {
        fetchTreatmentPlans();
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNo, debouncedSearchId, debouncedSearchServiceId]);

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    const fetchTreatmentPlans = async () => {
        try {
            setIsLoading(true);
            const payload = {
                pageNo,
                pageSize,
                id: searchId ? parseInt(searchId) : null,
                serviceId: searchServiceId ? parseInt(searchServiceId) : null,
            };

            const response = await axios.post(`${API_BASE}/TreatmentPlan/gettreatmentplanlist`, payload);

            if (response.data?.baseDatas) {
                setTreatmentPlans(response.data.baseDatas);
                setTotalRecords(response.data.totalRecordCount);
                setTotalPages(response.data.pageCount);
                setSelectedRows(new Set());
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách liệu trình:', error);
            setSuccessMessage('Lỗi lấy danh sách liệu trình');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const payload = { pageNo: 1, pageSize: 1000 };
            const response = await axios.post(`${API_BASE}/Service/getservicelist`, payload);
            if (response.data?.baseDatas) {
                setServices(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách dịch vụ:', error);
        }
    };

    const handleCreateClick = () => {
        setFormData({
            serviceId: '',
            planName: '',
            totalSessions: '',
            price: '',
            sessionInterval: '',
            description: '',
        });
        setShowCreateModal(true);
    };

    const handleEditClick = (plan) => {
        setFormData({
            id: plan.treatmentPlanInfomation.id,
            serviceId: plan.treatmentPlanInfomation.serviceId,
            planName: plan.treatmentPlanInfomation.planName,
            totalSessions: plan.treatmentPlanInfomation.totalSessions,
            price: plan.treatmentPlanInfomation.price,
            sessionInterval: plan.treatmentPlanInfomation.sessionInterval,
            description: plan.treatmentPlanInfomation.description,
        });
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setFormData({});
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleCreatePlan = async () => {
        if (!formData.serviceId || !formData.planName || !formData.totalSessions || !formData.price) {
            setSuccessMessage('Vui lòng điền tất cả các trường bắt buộc!');
            setMessageType('error');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                serviceId: parseInt(formData.serviceId),
                planName: formData.planName,
                totalSessions: parseInt(formData.totalSessions),
                price: parseInt(formData.price),
                sessionInterval: parseInt(formData.sessionInterval) || 0,
                description: formData.description || '',
                sessionProducts: [],
            };

            const response = await axios.post(`${API_BASE}/TreatmentPlan/createtreatmentplan`, payload);

            if (response.data?.success || response.data === true) {
                setSuccessMessage('Thêm liệu trình thành công!');
                setMessageType('success');
                setShowSuccessMessage(true);
                handleCloseModal();
                fetchTreatmentPlans();
            } else {
                setSuccessMessage('Thêm liệu trình thất bại!');
                setMessageType('error');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi thêm liệu trình:', error);
            setSuccessMessage('Lỗi thêm liệu trình');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!formData.serviceId || !formData.planName || !formData.totalSessions || !formData.price) {
            setSuccessMessage('Vui lòng điền tất cả các trường bắt buộc!');
            setMessageType('error');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                id: formData.id,
                serviceId: parseInt(formData.serviceId),
                planName: formData.planName,
                totalSessions: parseInt(formData.totalSessions),
                price: parseInt(formData.price),
                sessionInterval: parseInt(formData.sessionInterval) || 0,
                description: formData.description || '',
            };

            const response = await axios.post(`${API_BASE}/TreatmentPlan/updatetreatmentplan`, payload);

            if (response.data?.success || response.data === true) {
                setSuccessMessage('Cập nhật liệu trình thành công!');
                setMessageType('success');
                setShowSuccessMessage(true);
                handleCloseModal();
                fetchTreatmentPlans();
            } else {
                setSuccessMessage('Cập nhật liệu trình thất bại!');
                setMessageType('error');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi cập nhật liệu trình:', error);
            setSuccessMessage('Lỗi cập nhật liệu trình');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsSubmitting(true);
            const payload = { id: deleteId };
            const response = await axios.post(`${API_BASE}/TreatmentPlan/deletetreatmentplan`, payload);

            if (response.data?.success || response.data === true) {
                setSuccessMessage('Xóa liệu trình thành công!');
                setMessageType('success');
                setShowSuccessMessage(true);
                setShowDeleteConfirm(false);
                setDeleteId(null);
                setSelectedRows(new Set());
                fetchTreatmentPlans();
            } else {
                setSuccessMessage('Xóa liệu trình thất bại!');
                setMessageType('error');
                setShowSuccessMessage(true);
            }
        } catch (error) {
            console.error('Lỗi xóa liệu trình:', error);
            setSuccessMessage('Lỗi xóa liệu trình');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDetail = (plan) => {
        setSelectedDetailPlan(plan);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedDetailPlan(null);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    const getServiceName = (serviceId) => {
        const service = services.find((s) => s.id === serviceId);
        return service?.serviceName || `ID: ${serviceId}`;
    };

    const handleCheckboxChange = (id) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(id)) {
            newSelectedRows.delete(id);
        } else {
            newSelectedRows.add(id);
        }
        setSelectedRows(newSelectedRows);
    };

    const handleDeleteSelected = () => {
        if (selectedRows.size === 1) {
            const id = Array.from(selectedRows)[0];
            setDeleteId(id);
            setShowDeleteConfirm(true);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = treatmentPlans.map((plan) => plan.treatmentPlanInfomation.id);
            setSelectedRows(new Set(allIds));
        } else {
            setSelectedRows(new Set());
        }
    };

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} type={messageType} />}

            <div className={cx('container')}>
                <div className={cx('header')}>
                    <div className={cx('header-content')}>
                        <h1>Quản Lý Dịch Vụ Liệu Trình</h1>
                        {/* <p className={cx('subtitle')}>Quản lý các gói liệu trình trị liệu</p> */}
                    </div>
                    <div className={cx('header-actions')}>
                        <button
                            className={cx('btn-delete-shared')}
                            onClick={handleDeleteSelected}
                            disabled={selectedRows.size !== 1}
                        >
                            <FontAwesomeIcon icon={faTrash} /> Xóa
                        </button>
                        <button className={cx('btn-create')} onClick={handleCreateClick}>
                            <FontAwesomeIcon icon={faPlus} /> Thêm Liệu Trình
                        </button>
                    </div>
                </div>

                <div className={cx('search-section')}>
                    <div className={cx('search-group')}>
                        <input
                            type="number"
                            placeholder="Tìm kiếm theo ID"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className={cx('search-input')}
                        />
                    </div>
                    <div className={cx('search-group')}>
                        <input
                            type="number"
                            placeholder="Tìm kiếm theo ID dịch vụ"
                            value={searchServiceId}
                            onChange={(e) => setSearchServiceId(e.target.value)}
                            className={cx('search-input')}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : treatmentPlans.length > 0 ? (
                    <>
                        <div className={cx('table-container')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('checkbox-col')}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={
                                                    selectedRows.size === treatmentPlans.length &&
                                                    treatmentPlans.length > 0
                                                }
                                            />
                                        </th>
                                        <th>ID</th>
                                        <th>Tên Gói</th>
                                        <th>Dịch Vụ</th>
                                        <th>Số Buổi</th>
                                        <th>Giá</th>
                                        <th>Khoảng Cách Buổi</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {treatmentPlans.map((plan) => (
                                        <tr key={plan.treatmentPlanInfomation.id}>
                                            <td className={cx('checkbox-col')}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(plan.treatmentPlanInfomation.id)}
                                                    onChange={() =>
                                                        handleCheckboxChange(plan.treatmentPlanInfomation.id)
                                                    }
                                                />
                                            </td>
                                            <td>{plan.treatmentPlanInfomation.id}</td>
                                            <td>
                                                <span className={cx('plan-name')}>
                                                    {plan.treatmentPlanInfomation.planName}
                                                </span>
                                            </td>
                                            <td>{getServiceName(plan.treatmentPlanInfomation.serviceId)}</td>
                                            <td className={cx('center')}>
                                                {plan.treatmentPlanInfomation.totalSessions}
                                            </td>
                                            <td className={cx('price')}>
                                                {formatCurrency(plan.treatmentPlanInfomation.price)}
                                            </td>
                                            <td className={cx('center')}>
                                                {plan.treatmentPlanInfomation.sessionInterval} ngày
                                            </td>
                                            <td className={cx('actions')}>
                                                <button
                                                    className={cx('btn-view')}
                                                    onClick={() => handleViewDetail(plan)}
                                                    title="Xem Chi Tiết"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button
                                                    className={cx('btn-edit')}
                                                    onClick={() => handleEditClick(plan)}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={cx('pagination')}>
                            <button
                                className={cx('btn-pagination')}
                                disabled={pageNo === 1}
                                onClick={() => setPageNo(pageNo - 1)}
                            >
                                Trang Trước
                            </button>
                            <span className={cx('page-info')}>
                                Trang {pageNo} / {totalPages} ({totalRecords} bản ghi)
                            </span>
                            <button
                                className={cx('btn-pagination')}
                                disabled={pageNo === totalPages}
                                onClick={() => setPageNo(pageNo + 1)}
                            >
                                Trang Sau
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={cx('empty-state')}>Không có liệu trình nào</div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className={cx('modal-overlay')} onClick={() => setShowDeleteConfirm(false)}>
                    <div className={cx('modal-confirm')} onClick={(e) => e.stopPropagation()}>
                        <h3>Xác Nhận Xóa</h3>
                        <p>Bạn có chắc chắn muốn xóa liệu trình này không?</p>
                        <div className={cx('modal-footer')}>
                            <button className={cx('btn-cancel')} onClick={() => setShowDeleteConfirm(false)}>
                                Hủy
                            </button>
                            <button className={cx('btn-confirm')} onClick={handleConfirmDelete} disabled={isSubmitting}>
                                {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className={cx('modal-overlay')} onClick={handleCloseModal}>
                    <div className={cx('modal')} onClick={(e) => e.stopPropagation()}>
                        <div className={cx('modal-header')}>
                            <h2>{showEditModal ? 'Sửa Liệu Trình' : 'Thêm Liệu Trình'}</h2>
                            <button className={cx('modal-close')} onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <div className={cx('modal-body')}>
                            <div className={cx('form-grid')}>
                                {/* Dịch Vụ */}
                                <div className={cx('form-group')}>
                                    <label>Dịch Vụ *</label>
                                    <select
                                        value={formData.serviceId || ''}
                                        onChange={(e) => handleInputChange('serviceId', e.target.value)}
                                    >
                                        <option value="">-- Chọn Dịch Vụ --</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.serviceName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tên Gói */}
                                <div className={cx('form-group')}>
                                    <label>Tên Gói *</label>
                                    <input
                                        type="text"
                                        value={formData.planName || ''}
                                        onChange={(e) => handleInputChange('planName', e.target.value)}
                                        placeholder="Nhập tên gói"
                                    />
                                </div>

                                {/* Số Buổi */}
                                <div className={cx('form-group')}>
                                    <label>Số Buổi *</label>
                                    <input
                                        type="number"
                                        value={formData.totalSessions || ''}
                                        onChange={(e) => handleInputChange('totalSessions', e.target.value)}
                                        placeholder="Nhập số buổi"
                                        min="1"
                                    />
                                </div>

                                {/* Giá */}
                                <div className={cx('form-group')}>
                                    <label>Giá *</label>
                                    <input
                                        type="number"
                                        value={formData.price || ''}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        placeholder="Nhập giá"
                                        min="0"
                                    />
                                </div>

                                {/* Khoảng Cách Buổi */}
                                <div className={cx('form-group')}>
                                    <label>Khoảng Cách Buổi (ngày)</label>
                                    <input
                                        type="number"
                                        value={formData.sessionInterval || ''}
                                        onChange={(e) => handleInputChange('sessionInterval', e.target.value)}
                                        placeholder="Nhập khoảng cách (ngày)"
                                        min="0"
                                    />
                                </div>

                                {/* Mô Tả */}
                                <div className={cx('form-group', 'col-full')}>
                                    <label>Mô Tả</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Nhập mô tả"
                                        rows="4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={cx('modal-footer')}>
                            <button className={cx('btn-cancel')} onClick={handleCloseModal}>
                                Hủy
                            </button>
                            <button
                                className={cx('btn-save')}
                                onClick={showEditModal ? handleUpdatePlan : handleCreatePlan}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? showEditModal
                                        ? 'Đang lưu...'
                                        : 'Đang thêm...'
                                    : showEditModal
                                      ? 'Lưu Thay Đổi'
                                      : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedDetailPlan && (
                <div className={cx('modal-overlay')} onClick={handleCloseDetailModal}>
                    <div className={cx('modal-detail')} onClick={(e) => e.stopPropagation()}>
                        <div className={cx('modal-header')}>
                            <h2>Chi Tiết Liệu Trình</h2>
                            <button className={cx('modal-close')} onClick={handleCloseDetailModal}>
                                ×
                            </button>
                        </div>

                        <div className={cx('modal-body')}>
                            {/* Plan Info */}
                            <div className={cx('detail-section')}>
                                <h3 className={cx('section-title')}>Thông Tin Cơ Bản</h3>
                                <div className={cx('info-grid')}>
                                    <div className={cx('info-row')}>
                                        <span className={cx('label')}>ID Gói:</span>
                                        <span className={cx('value')}>
                                            {selectedDetailPlan.treatmentPlanInfomation.id}
                                        </span>
                                    </div>
                                    <div className={cx('info-row')}>
                                        <span className={cx('label')}>Tên Gói:</span>
                                        <span className={cx('value')}>
                                            {selectedDetailPlan.treatmentPlanInfomation.planName}
                                        </span>
                                    </div>
                                    <div className={cx('info-row')}>
                                        <span className={cx('label')}>Dịch Vụ:</span>
                                        <span className={cx('value')}>
                                            {selectedDetailPlan.serviceInformation.serviceName}
                                        </span>
                                    </div>
                                    <div className={cx('info-row')}>
                                        <span className={cx('label')}>Số Buổi:</span>
                                        <span className={cx('value')}>
                                            {selectedDetailPlan.treatmentPlanInfomation.totalSessions}
                                        </span>
                                    </div>
                                    <div className={cx('info-row')}>
                                        <span className={cx('label')}>Giá Gói:</span>
                                        <span className={cx('value', 'price')}>
                                            {formatCurrency(selectedDetailPlan.treatmentPlanInfomation.price)}
                                        </span>
                                    </div>
                                    <div className={cx('info-row')}>
                                        <span className={cx('label')}>Giá Dịch Vụ:</span>
                                        <span className={cx('value')}>
                                            {formatCurrency(selectedDetailPlan.serviceInformation.price)}
                                        </span>
                                    </div>
                                    <div className={cx('info-row')}>
                                        <span className={cx('label')}>Khoảng Cách Buổi:</span>
                                        <span className={cx('value')}>
                                            {selectedDetailPlan.treatmentPlanInfomation.sessionInterval} ngày
                                        </span>
                                    </div>
                                    <div className={cx('info-row')}>
                                        <span className={cx('label')}>Thời Lượng:</span>
                                        <span className={cx('value')}>
                                            {selectedDetailPlan.serviceInformation.duration} phút
                                        </span>
                                    </div>
                                    {selectedDetailPlan.treatmentPlanInfomation.description && (
                                        <div className={cx('info-row', 'full-width')}>
                                            <span className={cx('label')}>Mô Tả Gói:</span>
                                            <span className={cx('value')}>
                                                {selectedDetailPlan.treatmentPlanInfomation.description}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Treatment Sessions */}
                            <div className={cx('detail-section')}>
                                <h3 className={cx('section-title')}>Các Buổi & Sản Phẩm</h3>
                                {selectedDetailPlan.treatmentSessionInformation &&
                                selectedDetailPlan.treatmentSessionInformation.length > 0 ? (
                                    <div className={cx('sessions-list')}>
                                        {selectedDetailPlan.treatmentSessionInformation.map((session) => {
                                            const sessionProducts =
                                                selectedDetailPlan.sessionProductInformation?.filter(
                                                    (p) => p.treatmentSessionId === session.treatmentSessionId,
                                                ) || [];

                                            return (
                                                <div key={session.treatmentSessionId} className={cx('session-card')}>
                                                    <div className={cx('session-header')}>
                                                        <h4>{session.sessionName}</h4>
                                                        <span className={cx('session-time')}>
                                                            {session.duration} phút
                                                        </span>
                                                    </div>
                                                    <p className={cx('session-description')}>{session.description}</p>

                                                    {sessionProducts.length > 0 && (
                                                        <div className={cx('session-products')}>
                                                            <div className={cx('products-label')}>
                                                                Sản Phẩm Sử Dụng:
                                                            </div>
                                                            <div className={cx('products-list')}>
                                                                {sessionProducts.map((product) => (
                                                                    <div
                                                                        key={product.sessionProductId}
                                                                        className={cx('product-item')}
                                                                    >
                                                                        <span className={cx('product-name')}>
                                                                            {product.productName}
                                                                        </span>
                                                                        <span className={cx('product-quantity')}>
                                                                            x{product.quantityUsed}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className={cx('empty-text')}>Chưa có buổi nào</p>
                                )}
                            </div>
                        </div>

                        <div className={cx('modal-footer')}>
                            <button
                                className={cx('btn-save')}
                                onClick={() =>
                                    navigate(
                                        `/treatment-session-detail/${selectedDetailPlan.treatmentPlanInfomation.id}`,
                                    )
                                }
                            >
                                Quản Lý Buổi
                            </button>
                            <button className={cx('btn-cancel')} onClick={handleCloseDetailModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TreatmentPlan;
