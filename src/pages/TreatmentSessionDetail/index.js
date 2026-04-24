import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TreatmentSessionDetail.module.scss';
import classNames from 'classnames/bind';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import useDebounce from '~/hooks/useDebounce';
import { useParams, useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function TreatmentSessionDetail() {
    const { treatmentPlanId } = useParams();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [pageNo, setPageNo] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchSessionName, setSearchSessionName] = useState('');
    const debouncedSearch = useDebounce(searchSessionName, 3000);
    const [selectedRows, setSelectedRows] = useState(new Set());

    useEffect(() => {
        if (debouncedSearch !== undefined) {
            setPageNo(1);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNo, debouncedSearch, treatmentPlanId]);

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    const fetchSessions = async () => {
        try {
            setIsLoading(true);
            const payload = {
                pageNo,
                pageSize,
                treatmentPlanId: parseInt(treatmentPlanId),
            };

            const response = await axios.post(`${API_BASE}/TreatmentSession/gettreatmentsessionlist`, payload);

            if (response.data?.baseDatas) {
                let filtered = response.data.baseDatas;

                if (searchSessionName) {
                    filtered = filtered.filter((session) =>
                        session.sessionName.toLowerCase().includes(searchSessionName.toLowerCase()),
                    );
                }

                setSessions(filtered);
                setTotalRecords(response.data.totalRecordCount);
                setTotalPages(response.data.pageCount);
                setSelectedRows(new Set());
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách buổi liệu trình:', error);
            setSuccessMessage('Lỗi lấy danh sách buổi liệu trình');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClick = () => {
        setFormData({
            treatmentPlanId: parseInt(treatmentPlanId),
            sessionNumber: Math.max(...(sessions.map((s) => s.sessionNumber) || [0])) + 1,
            sessionName: '',
            description: '',
            duration: 60,
        });
        setShowCreateModal(true);
    };

    const handleEditClick = (session) => {
        setFormData({
            id: session.id,
            treatmentPlanId: session.treatmentPlanId,
            sessionNumber: session.sessionNumber,
            sessionName: session.sessionName,
            description: session.description,
            duration: session.duration,
        });
        setShowEditModal(true);
    };

    const handleInputChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleCreateSession = async () => {
        if (!formData.sessionName?.trim()) {
            setSuccessMessage('Vui lòng nhập tên buổi');
            setMessageType('error');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                treatmentPlanId: formData.treatmentPlanId,
                sessionNumber: formData.sessionNumber,
                sessionName: formData.sessionName,
                description: formData.description,
                duration: formData.duration,
            };

            const response = await axios.post(`${API_BASE}/TreatmentPlan/updatetreatmentplan`, payload);

            if (response.data?.success) {
                setSuccessMessage('Thêm buổi liệu trình thành công');
                setMessageType('success');
                setShowSuccessMessage(true);
                setShowCreateModal(false);
                setFormData({});
                fetchSessions();
            }
        } catch (error) {
            console.error('Lỗi thêm buổi liệu trình:', error);
            setSuccessMessage('Lỗi thêm buổi liệu trình');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSession = async () => {
        if (!formData.sessionName?.trim()) {
            setSuccessMessage('Vui lòng nhập tên buổi');
            setMessageType('error');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                id: formData.id,
                treatmentPlanId: formData.treatmentPlanId,
                sessionNumber: formData.sessionNumber,
                sessionName: formData.sessionName,
                description: formData.description,
                duration: formData.duration,
            };

            const response = await axios.post(`${API_BASE}/TreatmentPlan/updatetreatmentplan`, payload);

            if (response.data?.success) {
                setSuccessMessage('Cập nhật buổi liệu trình thành công');
                setMessageType('success');
                setShowSuccessMessage(true);
                setShowEditModal(false);
                setFormData({});
                fetchSessions();
            }
        } catch (error) {
            console.error('Lỗi cập nhật buổi liệu trình:', error);
            setSuccessMessage('Lỗi cập nhật buổi liệu trình');
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
            const allIds = sessions.map((session) => session.id);
            setSelectedRows(new Set(allIds));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleConfirmDelete = async () => {
        try {
            setIsSubmitting(true);
            const response = await axios.post(`${API_BASE}/TreatmentPlan/deletetreatmentplan`, { id: deleteId });

            if (response.data?.success) {
                setSuccessMessage('Xóa buổi liệu trình thành công');
                setMessageType('success');
                setShowSuccessMessage(true);
                setShowDeleteConfirm(false);
                setDeleteId(null);
                setSelectedRows(new Set());
                fetchSessions();
            }
        } catch (error) {
            console.error('Lỗi xóa buổi liệu trình:', error);
            setSuccessMessage('Lỗi xóa buổi liệu trình');
            setMessageType('error');
            setShowSuccessMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setFormData({});
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes} phút`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
    };

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} type={messageType} />}

            <div className={cx('container')}>
                <div className={cx('header')}>
                    <div className={cx('header-content')}>
                        <button className={cx('btn-back')} onClick={() => navigate('/treatment-plan')}>
                            <FontAwesomeIcon icon={faArrowLeft} /> Quay Lại
                        </button>
                        <div>
                            <h1>Quản Lý Buổi Liệu Trình</h1>
                            <p className={cx('subtitle')}>Quản lý chi tiết các buổi của gói liệu trình</p>
                        </div>
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
                            <FontAwesomeIcon icon={faPlus} /> Thêm Buổi
                        </button>
                    </div>
                </div>

                <div className={cx('search-section')}>
                    <div className={cx('search-group')}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên buổi"
                            value={searchSessionName}
                            onChange={(e) => setSearchSessionName(e.target.value)}
                            className={cx('search-input')}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : sessions.length > 0 ? (
                    <>
                        <div className={cx('table-container')}>
                            <table className={cx('table')}>
                                <thead>
                                    <tr>
                                        <th className={cx('checkbox-col')}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedRows.size === sessions.length && sessions.length > 0}
                                            />
                                        </th>
                                        <th>Buổi</th>
                                        <th>Tên Buổi</th>
                                        <th>Mô Tả</th>
                                        <th>Thời Lượng</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((session) => (
                                        <tr key={session.id}>
                                            <td className={cx('checkbox-col')}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(session.id)}
                                                    onChange={() => handleCheckboxChange(session.id)}
                                                />
                                            </td>
                                            <td className={cx('center')}>
                                                <span className={cx('session-number')}>{session.sessionNumber}</span>
                                            </td>
                                            <td>
                                                <span className={cx('session-name')}>{session.sessionName}</span>
                                            </td>
                                            <td>
                                                <span className={cx('description')}>{session.description || '-'}</span>
                                            </td>
                                            <td className={cx('center')}>{formatDuration(session.duration)}</td>
                                            <td className={cx('actions')}>
                                                <button
                                                    className={cx('btn-edit')}
                                                    onClick={() => handleEditClick(session)}
                                                    title="Sửa"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    className={cx('btn-delete')}
                                                    onClick={() => handleDeleteClick(session.id)}
                                                    title="Xóa"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
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
                    <div className={cx('empty-state')}>Không có buổi liệu trình nào</div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className={cx('modal-overlay')} onClick={() => setShowDeleteConfirm(false)}>
                    <div className={cx('modal-confirm')} onClick={(e) => e.stopPropagation()}>
                        <h3>Xác Nhận Xóa</h3>
                        <p>Bạn có chắc chắn muốn xóa buổi liệu trình này không?</p>
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
                            <h2>{showEditModal ? 'Sửa Buổi Liệu Trình' : 'Thêm Buổi Liệu Trình'}</h2>
                            <button className={cx('modal-close')} onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <div className={cx('modal-body')}>
                            <div className={cx('form-grid')}>
                                {/* Buổi Số */}
                                <div className={cx('form-group')}>
                                    <label>Buổi Số *</label>
                                    <input
                                        type="number"
                                        value={formData.sessionNumber || ''}
                                        onChange={(e) =>
                                            handleInputChange('sessionNumber', parseInt(e.target.value) || 0)
                                        }
                                        placeholder="Nhập buổi số"
                                        min="1"
                                    />
                                </div>

                                {/* Tên Buổi */}
                                <div className={cx('form-group')}>
                                    <label>Tên Buổi *</label>
                                    <input
                                        type="text"
                                        value={formData.sessionName || ''}
                                        onChange={(e) => handleInputChange('sessionName', e.target.value)}
                                        placeholder="Nhập tên buổi"
                                    />
                                </div>

                                {/* Thời Lượng */}
                                <div className={cx('form-group')}>
                                    <label>Thời Lượng (phút) *</label>
                                    <input
                                        type="number"
                                        value={formData.duration || ''}
                                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                                        placeholder="Nhập thời lượng"
                                        min="1"
                                    />
                                </div>

                                {/* Mô Tả */}
                                <div className={cx('form-group', 'col-full')}>
                                    <label>Mô Tả</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Nhập mô tả buổi liệu trình"
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
                                onClick={showEditModal ? handleUpdateSession : handleCreateSession}
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
        </div>
    );
}

export default TreatmentSessionDetail;
