import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Products.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch, faEdit, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import useDebounce from '~/hooks/useDebounce';

const cx = classNames.bind(styles);
const API_BASE = 'http://localhost:5122/api';

function Products() {
    // State quản lý danh sách sản phẩm
    const [products, setProducts] = useState([]);
    const [totalRecordCount, setTotalRecordCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    // State quản lý form
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // State quản lý dropdown
    const [suppliers, setSuppliers] = useState([]);

    // State quản lý form input
    const [formData, setFormData] = useState({
        supplierId: '',
        productName: '',
        description: '',
        sellingPrice: '',
        quantity: '',
        unit: '',
        minimumStock: '',
        productImages: '',
        costPrice: '',
    });

    // State quản lý hình ảnh upload
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // State tìm kiếm
    const [searchData, setSearchData] = useState({
        productName: '',
        supplierId: '',
    });

    // State quản lý checkbox selection
    const [selectedProducts, setSelectedProducts] = useState(new Set());

    // Lấy danh sách nhà cung cấp
    const fetchSuppliers = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE}/Supplier/paging`, {});
            if (response.data && response.data.baseDatas) {
                setSuppliers(response.data.baseDatas);
            }
        } catch (error) {
            console.error('Lỗi lấy nhà cung cấp:', error);
        }
    }, []);

    // Lấy danh sách sản phẩm
    const fetchProducts = useCallback(
        async (page = 1, searchParams = {}) => {
            try {
                setIsLoading(true);
                const payload = {
                    pageNo: page,
                    pageSize: pageSize,
                    productName: searchParams.productName || '',
                    supplierId: searchParams.supplierId ? parseInt(searchParams.supplierId) : null,
                };

                const response = await axios.post(`${API_BASE}/Product/getproductlist`, payload);
                if (response.data && response.data.baseDatas) {
                    setProducts(response.data.baseDatas);
                    setTotalRecordCount(response.data.totalRecordCount);
                    setPageIndex(response.data.pageIndex);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách sản phẩm:', error);
                setSuccessMessage('Lỗi lấy danh sách sản phẩm');
                setShowSuccessMessage(true);
            } finally {
                setIsLoading(false);
            }
        },
        [pageSize],
    );

    // Khởi tạo dữ liệu
    useEffect(() => {
        fetchSuppliers();
        fetchProducts(1);
    }, [fetchSuppliers, fetchProducts]);

    // Auto-hide success message after 3 seconds
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    // Debounce search data with 3 second delay
    const debouncedSearchData = useDebounce(searchData, 3000);

    // Call API when debounced search data changes
    useEffect(() => {
        setPageIndex(1);
        fetchProducts(1, debouncedSearchData);
    }, [debouncedSearchData, fetchProducts]);

    // Xử lý thay đổi input form
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý tải hình ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Tạo preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                // Lưu base64 vào formData (chỉ lấy phần base64, bỏ prefix)
                const base64String = reader.result.split(',')[1];
                setFormData((prev) => ({
                    ...prev,
                    productImages: base64String,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Xử lý thay đổi input tìm kiếm
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Tìm kiếm
    const handleSearch = () => {
        setPageIndex(1);
        fetchProducts(1, searchData);
    };

    // Mở form thêm sản phẩm
    const handleAddProduct = () => {
        setIsEditMode(false);
        setEditingProductId(null);
        setFormData({
            supplierId: '',
            productName: '',
            description: '',
            sellingPrice: '',
            quantity: '',
            unit: '',
            minimumStock: '',
            productImages: '',
            costPrice: '',
        });
        setImageFile(null);
        setImagePreview('');
        setIsFormVisible(true);
    };

    // Mở form sửa sản phẩm
    const handleEditProduct = (product) => {
        setIsEditMode(true);
        setEditingProductId(product.id);
        setFormData({
            supplierId: product.supplierId || '',
            productName: product.productName || '',
            description: product.description || '',
            sellingPrice: product.sellingPrice || '',
            quantity: product.quantity || '',
            unit: product.unit || '',
            minimumStock: product.minimumStock || '',
            productImages: product.productImages || '',
            costPrice: product.costPrice || '',
        });
        setImageFile(null);
        setImagePreview(product.productImages ? `data:image/jpeg;base64,${product.productImages}` : '');
        setIsFormVisible(true);
    };

    // Gửi form (Thêm hoặc Sửa)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        if (!formData.productName || !formData.supplierId || !formData.serviceTypeId) {
            setSuccessMessage('Vui lòng nhập đủ thông tin bắt buộc');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsLoading(true);
            let payload = { ...formData };
            // Chuyển đổi kiểu dữ liệu
            payload.serviceTypeId = parseInt(payload.serviceTypeId) || 0;
            payload.supplierId = parseInt(payload.supplierId) || 0;
            payload.sellingPrice = parseFloat(payload.sellingPrice) || 0;
            payload.costPrice = parseFloat(payload.costPrice) || 0;
            payload.quantity = parseInt(payload.quantity) || 0;
            payload.minimumStock = parseInt(payload.minimumStock) || 0;

            if (isEditMode) {
                payload.id = editingProductId;
                payload.status = 'active';
                await axios.post(`${API_BASE}/Product/updateproduct`, payload);
            } else {
                await axios.post(`${API_BASE}/Product/addproduct`, payload);
            }

            setSuccessMessage(isEditMode ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
            setShowSuccessMessage(true);
            setIsFormVisible(false);
            fetchProducts(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi:', error);
            setSuccessMessage(error.response?.data?.message || 'Có lỗi xảy ra');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle select checkbox
    const handleSelectProduct = (productId) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
    };

    // Select all checkbox
    const handleSelectAll = () => {
        if (selectedProducts.size === products.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(products.map((p) => p.id)));
        }
    };

    // Xóa sản phẩm (single hoặc multiple)
    const handleDeleteProduct = async (productIds = null) => {
        const idsToDelete = productIds || Array.from(selectedProducts);

        if (idsToDelete.length === 0) {
            setSuccessMessage('Vui lòng chọn sản phẩm để xóa');
            setShowSuccessMessage(true);
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${idsToDelete.length} sản phẩm?`)) {
            return;
        }

        try {
            setIsLoading(true);

            // Xóa từng sản phẩm
            for (const id of idsToDelete) {
                await axios.post(`${API_BASE}/Product/deleteproduct`, { id });
            }

            setSuccessMessage(`Đã xóa ${idsToDelete.length} sản phẩm thành công!`);
            setShowSuccessMessage(true);
            setSelectedProducts(new Set());
            fetchProducts(pageIndex, searchData);
        } catch (error) {
            console.error('Lỗi xóa sản phẩm:', error);
            setSuccessMessage('Lỗi xóa sản phẩm');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Xuất Excel
    const handleExportExcel = async () => {
        if (selectedProducts.size === 0) {
            setSuccessMessage('Vui lòng chọn sản phẩm để xuất');
            setShowSuccessMessage(true);
            return;
        }

        try {
            setIsLoading(true);
            const productIds = Array.from(selectedProducts);
            const response = await axios.post(`${API_BASE}/Product/exportproducttoexcel`, {
                productIds,
            });

            // Download file từ response
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentElement.removeChild(link);

            setSuccessMessage('Xuất Excel thành công!');
            setShowSuccessMessage(true);
        } catch (error) {
            console.error('Lỗi xuất Excel:', error);
            setSuccessMessage('Lỗi xuất Excel');
            setShowSuccessMessage(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Tính số trang
    const totalPages = Math.ceil(totalRecordCount / pageSize);

    return (
        <div className={cx('wrapper')}>
            {showSuccessMessage && <SuccessMessage message={successMessage} />}

            {/* Header */}
            <div className={cx('header')}>
                <h1>Quản Lý Sản Phẩm</h1>
                <div className={cx('header-actions')}>
                    <button className={cx('btn-primary')} onClick={handleAddProduct}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm Sản Phẩm
                    </button>
                    {selectedProducts.size > 0 && (
                        <button
                            className={cx('btn-delete-multiple', {
                                disabled: selectedProducts.size > 1,
                            })}
                            onClick={() => handleDeleteProduct()}
                            disabled={selectedProducts.size > 1}
                            title={
                                selectedProducts.size > 1
                                    ? 'Chỉ có thể xóa 1 sản phẩm tại một lần'
                                    : 'Xóa sản phẩm được chọn'
                            }
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Xóa ({selectedProducts.size})
                        </button>
                    )}
                    {/* <button className={cx('btn-export')} onClick={handleExportExcel}>
                        <FontAwesomeIcon icon={faDownload} />
                        Xuất Excel
                    </button> */}
                </div>
            </div>

            {/* Search */}
            <div className={cx('search-section')}>
                <input
                    type="text"
                    name="productName"
                    placeholder="Tìm kiếm tên sản phẩm..."
                    value={searchData.productName}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                />
                <select
                    name="supplierId"
                    value={searchData.supplierId}
                    onChange={handleSearchChange}
                    className={cx('search-input')}
                >
                    <option value="">-- Tất cả nhà cung cấp --</option>
                    {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                            {supplier.supplierName}
                        </option>
                    ))}
                </select>

                <button className={cx('btn-search')} onClick={handleSearch}>
                    <FontAwesomeIcon icon={faSearch} />
                    Tìm Kiếm
                </button>
            </div>

            {/* Products Table */}
            <div className={cx('table-container')}>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : products.length > 0 ? (
                    <table className={cx('products-table')}>
                        <thead>
                            <tr>
                                <th className={cx('checkbox-cell')}>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.size === products.length && products.length > 0}
                                        onChange={handleSelectAll}
                                        title="Chọn tất cả"
                                    />
                                </th>
                                <th>Tên Sản Phẩm</th>
                                <th>Nhà Cung Cấp</th>
                                <th>Giá Bán</th>
                                <th>Số Lượng</th>
                                <th>Đơn Vị</th>
                                <th>Sửa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className={cx({ selected: selectedProducts.has(product.id) })}>
                                    <td className={cx('checkbox-cell')}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                        />
                                    </td>
                                    <td>{product.productName}</td>
                                    <td>{product.supplierName}</td>
                                    <td>{Number(product.sellingPrice).toLocaleString('vi-VN')} ₫</td>
                                    <td>{product.quantity}</td>
                                    <td>{product.unit}</td>
                                    <td className={cx('action-buttons')}>
                                        <button
                                            className={cx('btn-icon-edit')}
                                            onClick={() => handleEditProduct(product)}
                                            title="Sửa"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={cx('empty-state')}>Không có sản phẩm nào</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    <button disabled={pageIndex === 1} onClick={() => fetchProducts(pageIndex - 1, searchData)}>
                        Trang Trước
                    </button>
                    <span>
                        Trang {pageIndex} / {totalPages}
                    </span>
                    <button
                        disabled={pageIndex === totalPages}
                        onClick={() => fetchProducts(pageIndex + 1, searchData)}
                    >
                        Trang Sau
                    </button>
                </div>
            )}

            {/* Modal Form */}
            {isFormVisible && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h2>{isEditMode ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm'}</h2>
                            <button className={cx('btn-close')} onClick={() => setIsFormVisible(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <form className={cx('form')} onSubmit={handleSubmitForm}>
                            <div className={cx('form-group')}>
                                <label>Tên Sản Phẩm *</label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleFormChange}
                                    placeholder="Nhập tên sản phẩm"
                                    required
                                />
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Nhà Cung Cấp *</label>
                                    <select
                                        name="supplierId"
                                        value={formData.supplierId}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">-- Chọn Nhà Cung Cấp --</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.supplierName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Mô Tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Nhập mô tả sản phẩm"
                                />
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Giá Vốn (₫)</label>
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={formData.costPrice}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Giá Bán (₫) *</label>
                                    <input
                                        type="number"
                                        name="sellingPrice"
                                        value={formData.sellingPrice}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Số Lượng</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Tồn Kho Tối Thiểu</label>
                                    <input
                                        type="number"
                                        name="minimumStock"
                                        value={formData.minimumStock}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Đơn Vị</label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleFormChange}
                                        placeholder="Lọ, Hộp, Chai..."
                                    />
                                </div>

                                <div className={cx('form-group')}>
                                    <label>Hình Ảnh Sản Phẩm</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={cx('file-input')}
                                    />
                                    {imagePreview && (
                                        <div className={cx('image-preview')}>
                                            <img src={imagePreview} alt="Xem trước hình ảnh" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={cx('form-actions')}>
                                <button
                                    type="button"
                                    className={cx('btn-cancel')}
                                    onClick={() => setIsFormVisible(false)}
                                >
                                    Hủy
                                </button>
                                <button type="submit" className={cx('btn-submit')} disabled={isLoading}>
                                    {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập Nhật' : 'Thêm Sản Phẩm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;
