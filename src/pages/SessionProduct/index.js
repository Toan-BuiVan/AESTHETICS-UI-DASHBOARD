import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from './SessionProduct.module.scss';
import { useDebounce } from '~/hooks';

const API_BASE = 'http://localhost:5122/api';
const pageSize = 10;

function SessionProduct() {
    const [sessionProducts, setSessionProducts] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [selectedSessionProducts, setSelectedSessionProducts] = useState(new Set());
    const [formData, setFormData] = useState({
        treatmentSessionId: '',
        productId: '',
        quantityUsed: '',
        serviceId: '',
    });
    const [searchParams, setSearchParams] = useState({
        serviceId: '',
        treatmentSessionId: '',
    });
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const successMessageRef = useRef();

    const debouncedSearchParams = useDebounce(searchParams, 3000);

    const fetchSessionProducts = useCallback(async (page = 1, params = {}) => {
        try {
            const payload = {
                pageNo: page,
                pageSize: pageSize,
                serviceId: params.serviceId ? parseInt(params.serviceId) : null,
                treatmentSessionId: params.treatmentSessionId ? parseInt(params.treatmentSessionId) : null,
            };

            const response = await axios.post(`${API_BASE}/SessionProduct/getsessionproductlist`, payload);

            if (response.data && response.data.baseDatas) {
                setSessionProducts(response.data.baseDatas);
                setTotalRecordCount(response.data.totalRecordCount);
                setPageIndex(response.data.pageIndex);
                setSelectedSessionProducts(new Set());
            }
        } catch (error) {
            console.error('Error fetching session products:', error);
        }
    }, []);

    useEffect(() => {
        fetchSessionProducts(1, debouncedSearchParams);
    }, [debouncedSearchParams, fetchSessionProducts]);

    const handleSubmitForm = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.treatmentSessionId || !formData.productId || !formData.quantityUsed || !formData.serviceId) {
            alert('Vui lòng điền tất cả các trường');
            return;
        }

        try {
            if (editingId) {
                // Update
                const updatePayload = {
                    id: editingId,
                    quantityUsed: parseInt(formData.quantityUsed),
                };
                const updateResponse = await axios.post(
                    `${API_BASE}/SessionProduct/updatesessionproduct`,
                    updatePayload,
                );
                if (updateResponse.data && updateResponse.data.success) {
                    setSuccessMessage('Cập nhật sản phẩm sử dụng thành công');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    setEditingId(null);
                    fetchSessionProducts(pageIndex, debouncedSearchParams);
                }
            } else {
                // Create
                const createPayload = {
                    treatmentSessionId: parseInt(formData.treatmentSessionId),
                    productId: parseInt(formData.productId),
                    quantityUsed: parseInt(formData.quantityUsed),
                    serviceId: parseInt(formData.serviceId),
                };
                const createResponse = await axios.post(
                    `${API_BASE}/SessionProduct/createsessionproduct`,
                    createPayload,
                );
                if (createResponse.data && createResponse.data.success) {
                    setSuccessMessage('Tạo sản phẩm sử dụng thành công');
                    setShowSuccessMessage(true);
                    setIsFormVisible(false);
                    setFormData({
                        treatmentSessionId: '',
                        productId: '',
                        quantityUsed: '',
                        serviceId: '',
                    });
                    fetchSessionProducts(1, debouncedSearchParams);
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Có lỗi xảy ra khi xử lý yêu cầu');
        }
    };

    const handleEdit = () => {
        if (selectedSessionProducts.size !== 1) {
            alert('Vui lòng chọn 1 sản phẩm để sửa');
            return;
        }

        const selectedId = Array.from(selectedSessionProducts)[0];
        const selectedProduct = sessionProducts.find((p) => p.id === selectedId);

        if (selectedProduct) {
            setFormData({
                treatmentSessionId: selectedProduct.treatmentSessionId.toString(),
                productId: selectedProduct.productId.toString(),
                quantityUsed: selectedProduct.quantityUsed.toString(),
                serviceId: selectedProduct.serviceId.toString(),
            });
            setEditingId(selectedId);
            setIsFormVisible(true);
        }
    };

    const handleDelete = () => {
        if (selectedSessionProducts.size === 0) {
            alert('Vui lòng chọn sản phẩm để xóa');
            return;
        }

        const selectedId = Array.from(selectedSessionProducts)[0];
        setDeleteTarget(selectedId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            const deleteResponse = await axios.post(`${API_BASE}/SessionProduct/deletesessionproduct`, {
                id: deleteTarget,
            });
            if (deleteResponse.data && deleteResponse.data.success) {
                setSuccessMessage('Xóa sản phẩm sử dụng thành công');
                setShowSuccessMessage(true);
                setShowDeleteModal(false);
                setDeleteTarget(null);
                fetchSessionProducts(pageIndex, debouncedSearchParams);
                setSelectedSessionProducts(new Set());
            }
        } catch (error) {
            console.error('Error deleting session product:', error);
            alert('Có lỗi xảy ra khi xóa');
        }
    };

    const handleSelectProduct = (id) => {
        const newSelected = new Set(selectedSessionProducts);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.clear();
            newSelected.add(id);
        }
        setSelectedSessionProducts(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedSessionProducts.size === sessionProducts.length) {
            setSelectedSessionProducts(new Set());
        } else {
            const allIds = new Set(sessionProducts.map((p) => p.id));
            setSelectedSessionProducts(allIds);
        }
    };

    const handlePreviousPage = () => {
        if (pageIndex > 1) {
            const newPage = pageIndex - 1;
            setPageIndex(newPage);
            fetchSessionProducts(newPage, debouncedSearchParams);
        }
    };

    const handleNextPage = () => {
        if (pageIndex < Math.ceil(totalRecordCount / pageSize)) {
            const newPage = pageIndex + 1;
            setPageIndex(newPage);
            fetchSessionProducts(newPage, debouncedSearchParams);
        }
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setEditingId(null);
        setFormData({
            treatmentSessionId: '',
            productId: '',
            quantityUsed: '',
            serviceId: '',
        });
    };

    return (
        <div className={styles['container']}>
            <div className={styles['header']}>
                <h1>Quản Lý Sản Phẩm Sử Dụng</h1>
                <div className={styles['header-actions']}>
                    <button className={styles['btn-primary']} onClick={() => setIsFormVisible(true)}>
                        + Thêm Sản Phẩm
                    </button>
                    {selectedSessionProducts.size === 1 && (
                        <button className={styles['btn-edit']} onClick={handleEdit}>
                            Sửa
                        </button>
                    )}
                    {selectedSessionProducts.size > 0 && (
                        <button className={styles['btn-delete']} onClick={handleDelete}>
                            Xóa
                        </button>
                    )}
                </div>
            </div>

            <div className={styles['search']}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo Service ID"
                    value={searchParams.serviceId}
                    onChange={(e) => setSearchParams({ ...searchParams, serviceId: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo Treatment Session ID"
                    value={searchParams.treatmentSessionId}
                    onChange={(e) => setSearchParams({ ...searchParams, treatmentSessionId: e.target.value })}
                />
            </div>

            <table className={styles['table']}>
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>
                            <input
                                type="checkbox"
                                checked={
                                    sessionProducts.length > 0 &&
                                    selectedSessionProducts.size === sessionProducts.length
                                }
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th style={{ width: '80px' }}>ID</th>
                        <th style={{ width: '120px' }}>Mã buổi điều trị</th>
                        <th style={{ width: '100px' }}>Mã sản phẩm</th>
                        <th style={{ width: '120px' }}>Mã dịch vụ</th>
                        <th style={{ width: '120px' }}>Số lượng sử dụng</th>
                    </tr>
                </thead>
                <tbody>
                    {sessionProducts.length > 0 ? (
                        sessionProducts.map((product) => (
                            <tr
                                key={product.id}
                                className={selectedSessionProducts.has(product.id) ? styles['selected'] : ''}
                            >
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedSessionProducts.has(product.id)}
                                        onChange={() => handleSelectProduct(product.id)}
                                    />
                                </td>
                                <td>{product.id}</td>
                                <td>{product.treatmentSessionId}</td>
                                <td>{product.productId}</td>
                                <td>{product.serviceId}</td>
                                <td>{product.quantityUsed}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className={styles['no-data']}>
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className={styles['pagination']}>
                <button onClick={handlePreviousPage} disabled={pageIndex === 1}>
                    Trang trước
                </button>
                <span>
                    Trang {pageIndex} / {Math.ceil(totalRecordCount / pageSize) || 1}
                </span>
                <button onClick={handleNextPage} disabled={pageIndex >= Math.ceil(totalRecordCount / pageSize)}>
                    Trang sau
                </button>
            </div>

            {/* Form Modal */}
            {isFormVisible && (
                <div className={styles['modal-overlay']} onClick={handleCloseForm}>
                    <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                        <div className={styles['modal-header']}>
                            <h2>{editingId ? 'Sửa Sản Phẩm Sử Dụng' : 'Thêm Sản Phẩm Sử Dụng'}</h2>
                        </div>
                        <form onSubmit={handleSubmitForm}>
                            <div className={styles['form-group']}>
                                <label>Mã buổi điều trị *</label>
                                <input
                                    type="number"
                                    value={formData.treatmentSessionId}
                                    onChange={(e) => setFormData({ ...formData, treatmentSessionId: e.target.value })}
                                    disabled={editingId}
                                    required
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Mã sản phẩm *</label>
                                <input
                                    type="number"
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    disabled={editingId}
                                    required
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Mã dịch vụ *</label>
                                <input
                                    type="number"
                                    value={formData.serviceId}
                                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                    disabled={editingId}
                                    required
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Số lượng sử dụng *</label>
                                <input
                                    type="number"
                                    value={formData.quantityUsed}
                                    onChange={(e) => setFormData({ ...formData, quantityUsed: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles['form-actions']}>
                                <button type="submit" className={styles['btn-save']}>
                                    {editingId ? 'Cập nhật' : 'Thêm'}
                                </button>
                                <button type="button" className={styles['btn-cancel']} onClick={handleCloseForm}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className={styles['modal-overlay']} onClick={() => setShowDeleteModal(false)}>
                    <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                        <div className={styles['modal-header']}>
                            <h2>Xác Nhận Xóa</h2>
                        </div>
                        <p>Bạn có chắc chắn muốn xóa sản phẩm sử dụng này?</p>
                        <div className={styles['form-actions']}>
                            <button className={styles['btn-delete']} onClick={confirmDelete}>
                                Xóa
                            </button>
                            <button className={styles['btn-cancel']} onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {showSuccessMessage && (
                <div className={styles['success-message']} ref={successMessageRef}>
                    {successMessage}
                </div>
            )}
        </div>
    );
}

export default SessionProduct;
