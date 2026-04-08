import React, { useState, useEffect, useCallback } from 'react';
import styles from './Servicess.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemProduct from '~/pages/Servicess/ItemServices';

const cx = classNames.bind(styles);

// Hook tùy chỉnh để lấy danh sách loại sản phẩm và nhà cung cấp
const useProductData = () => {
    // Lưu trữ danh sách loại sản phẩm/dịch vụ từ API
    const [productTypes, setProductTypes] = useState([]);
    // Lưu trữ danh sách nhà cung cấp từ API
    const [suppliers, setSuppliers] = useState([]);
    // Quản lý trạng thái tải dữ liệu (true = đang tải, false = hoàn tất)
    const [loading, setLoading] = useState(true);
    // Lưu trữ thông báo lỗi khi gọi API (null nếu không có lỗi)
    const [error, setError] = useState(null);

    // Hàm làm mới token khi trang được tải
    const refreshTokenOnLoad = async () => {
        try {
            const accessToken = localStorage.getItem('token') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';

            const response = await fetch('https://buitoandev.somee.com/api/Authentication/Refresh_Token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Không thể làm mới token');
            }

            const data = await response.json();

            if (data.responseCode === 1) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                console.log('Đã cập nhật token và refreshToken trong localStorage');
            } else {
                console.error('Làm mới token thất bại:', data.resposeMessage);
            }
        } catch (error) {
            console.error('Lỗi khi làm mới token:', error);
        }
    };

    // Hàm lấy danh sách loại sản phẩm và nhà cung cấp từ API
    const fetchProductData = useCallback(async () => {
        try {
            setLoading(true);

            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const userID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                UserID: userID,
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const typesResponse = await fetch(
                'https://buitoandev.somee.com/api/TypeProductsServices/GetList_SreachProductsOfServices',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        productsOfServicesID: null,
                        productsOfServicesName: null,
                        productsOfServicesType: 'Products',
                    }),
                },
            );

            const suppliersResponse = await fetch('https://buitoandev.somee.com/api/Supplier/GetList_SearchSupplier', {
                method: 'POST',
                headers,
                body: JSON.stringify({}),
            });

            const newAccessToken = suppliersResponse.headers.get('New-AccessToken');
            const newRefreshToken = suppliersResponse.headers.get('New-RefreshToken');
            if (newAccessToken) {
                localStorage.setItem('token', newAccessToken);
            }
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            if (!typesResponse.ok || !suppliersResponse.ok) {
                throw new Error('Lỗi khi gọi API');
            }

            const typesData = await typesResponse.json();
            const suppliersData = await suppliersResponse.json();

            // Xử lý dữ liệu linh hoạt cho productTypes
            let productTypesList = [];
            if (Array.isArray(typesData)) {
                productTypesList = typesData;
            } else if (typesData && typesData.data && Array.isArray(typesData.data)) {
                productTypesList = typesData.data;
            }
            setProductTypes(productTypesList);

            // Xử lý dữ liệu linh hoạt cho suppliers
            let suppliersList = [];
            if (Array.isArray(suppliersData)) {
                suppliersList = suppliersData;
            } else if (suppliersData && suppliersData.data && Array.isArray(suppliersData.data)) {
                suppliersList = suppliersData.data;
            }
            setSuppliers(suppliersList);
        } catch (error) {
            setError(error.message);
            setProductTypes([]);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Gọi hàm làm mới token và lấy dữ liệu khi component mount
    useEffect(() => {
        // refreshTokenOnLoad();
        fetchProductData();
    }, [fetchProductData]);

    return { productTypes, suppliers, loading, error };
};

function Products() {
    // Lưu trữ mã nhân viên nhập từ form (kiểu chuỗi, chuyển sang số khi gửi API)
    const [employeeID, setEmployeeID] = useState('');
    // Lưu trữ ID của loại sản phẩm/dịch vụ liên quan đến sản phẩm (lấy từ select)
    const [productsOfServicesID, setProductsOfServicesID] = useState('');
    // Lưu trữ ID của nhà cung cấp (lấy từ select)
    const [supplierID, setSupplierID] = useState('');
    // Lưu trữ tên sản phẩm nhập từ form
    const [productName, setProductName] = useState('');
    // Lưu trữ mô tả sản phẩm nhập từ textarea
    const [productDescription, setProductDescription] = useState('');
    // Lưu trữ giá bán sản phẩm (kiểu chuỗi, chuyển sang số khi gửi API)
    const [sellingPrice, setSellingPrice] = useState('');
    // Lưu trữ số lượng sản phẩm (kiểu chuỗi, chuyển sang số khi gửi API)
    const [quantity, setQuantity] = useState('');
    // Lưu trữ file hình ảnh sản phẩm khi người dùng tải lên (kiểu File object hoặc null)
    const [productImages, setProductImages] = useState(null);
    // Lưu trữ URL tạm thời để hiển thị hình ảnh xem trước (tạo từ FileReader hoặc API)
    const [imagePreview, setImagePreview] = useState('');
    // Quản lý trạng thái hiển thị form thêm/chỉnh sửa sản phẩm (true = hiển thị, false = ẩn)
    const [isFormVisible, setIsFormVisible] = useState(false);
    // Lưu trữ thông báo thành công hoặc lỗi để hiển thị cho người dùng
    const [successMessage, setSuccessMessage] = useState('');
    // Lưu trữ từ khóa tìm kiếm sản phẩm nhập từ input
    const [searchTerm, setSearchTerm] = useState('');
    // Lưu trữ danh sách sản phẩm lấy từ API (mảng các object sản phẩm)
    const [productsList, setProductsList] = useState([]);
    // Quản lý trạng thái tải danh sách sản phẩm (true = đang tải, false = hoàn tất)
    const [loadingProducts, setLoadingProducts] = useState(true);
    // Lưu trữ thông báo lỗi khi tải danh sách sản phẩm (null nếu không có lỗi)
    const [errorProducts, setErrorProducts] = useState(null);
    // Lưu trữ thông tin sản phẩm đang được chỉnh sửa (object hoặc null nếu không chỉnh sửa)
    const [editingProduct, setEditingProduct] = useState(null);
    // Lưu trữ đường dẫn file Excel mà người dùng nhập để xuất dữ liệu
    const [excelFilePath, setExcelFilePath] = useState('');
    const { productTypes, suppliers, loading, error } = useProductData();

    // Hàm lấy danh sách sản phẩm từ API dựa trên tham số tìm kiếm
    const fetchProductsList = useCallback(async (searchParams) => {
        try {
            setLoadingProducts(true);
            const response = await fetch('https://buitoandev.somee.com/api/Products/GetList_SearchProducts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchParams),
            });
            if (!response.ok) throw new Error('Lỗi khi gọi API');
            const data = await response.json();
            let products = [];
            if (Array.isArray(data)) {
                products = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                products = data.data;
            }
            setProductsList(products);
        } catch (error) {
            setErrorProducts(error.message);
            setProductsList([]);
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        fetchProductsList({});
    }, [fetchProductsList]);

    // Xử lý khi người dùng chọn file hình ảnh từ input
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImages(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Xử lý tìm kiếm sản phẩm dựa trên từ khóa
    const handleSearch = () => {
        let searchParams = {};
        if (searchTerm) {
            if (!isNaN(searchTerm)) {
                searchParams.productID = parseInt(searchTerm, 10);
            } else {
                searchParams.productName = searchTerm;
            }
        }
        fetchProductsList(searchParams);
    };

    // Chuẩn bị dữ liệu để chỉnh sửa sản phẩm
    const handleEdit = (productID) => {
        const productToEdit = productsList.find((product) => product.productID === productID);
        if (productToEdit) {
            setEditingProduct(productToEdit);
            setEmployeeID(productToEdit.employeeID || '');
            setProductsOfServicesID(productToEdit.productsOfServicesID);
            setSupplierID(productToEdit.supplierID);
            setProductName(productToEdit.productName);
            setProductDescription(productToEdit.productDescription);
            setSellingPrice(productToEdit.sellingPrice.toString());
            setQuantity(productToEdit.quantity.toString());
            setImagePreview(`https://buitoandev.somee.com/Images/${productToEdit.productImages}`);
            setIsFormVisible(true);
        }
    };

    // Xử lý gửi form để thêm hoặc cập nhật sản phẩm
    const handleSubmit = async (e) => {
        e.preventDefault();
        const deviceName = localStorage.getItem('deviceName') || '';
        const refreshToken = localStorage.getItem('refreshToken') || '';
        const token = localStorage.getItem('token') || '';
        const userID = localStorage.getItem('userID') || '';

        const headers = {
            'Content-Type': 'application/json',
            DeviceName: deviceName,
            RefreshToken: refreshToken,
            Authorization: token ? `Bearer ${token}` : '',
            UserID: userID,
        };

        // Hàm chuyển URL hình ảnh thành Base64
        const urlToBase64 = async (url) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error('Lỗi khi chuyển URL thành Base64:', error);
                return '';
            }
        };

        let productImagesToSend = '';
        if (productImages) {
            productImagesToSend = imagePreview.split(',')[1];
        } else if (editingProduct) {
            const imageUrl = `https://buitoandev.somee.com/Images/${editingProduct.productImages}`;
            productImagesToSend = await urlToBase64(imageUrl);
        }

        const formData = {
            employeeID: parseInt(employeeID) || 0,
            productsOfServicesID: parseInt(productsOfServicesID),
            supplierID: parseInt(supplierID),
            productName,
            productDescription,
            sellingPrice: parseFloat(sellingPrice),
            quantity: parseInt(quantity),
            productImages: productImagesToSend,
        };

        if (editingProduct) {
            formData.productID = editingProduct.productID;
        }

        try {
            const response = await fetch(
                editingProduct
                    ? 'https://buitoandev.somee.com/api/Products/Update_Products'
                    : 'https://buitoandev.somee.com/api/Products/Insert_Products',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData),
                },
            );

            const result = await response.json();
            if (!response.ok) {
                console.log('Thao tác thất bại:', result);
                setSuccessMessage(result.resposeMessage || 'Thao tác thất bại!');
            } else {
                console.log('Thao tác thành công:', result);
                setSuccessMessage(result.resposeMessage || 'Thao tác thành công!');
                const newAccessToken = response.headers.get('New-AccessToken');
                const newRefreshToken = response.headers.get('New-RefreshToken');
                if (newAccessToken) localStorage.setItem('token', newAccessToken);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                if (editingProduct) {
                    setProductsList(
                        productsList.map((product) =>
                            product.productID === editingProduct.productID ? { ...product, ...formData } : product,
                        ),
                    );
                } else {
                    fetchProductsList({});
                }

                setEmployeeID('');
                setProductsOfServicesID('');
                setSupplierID('');
                setProductName('');
                setProductDescription('');
                setSellingPrice('');
                setQuantity('');
                setProductImages(null);
                setImagePreview('');
                setEditingProduct(null);

                setTimeout(() => {
                    setIsFormVisible(false);
                    setSuccessMessage('');
                }, 3500);
            }
        } catch (error) {
            console.error('Lỗi khi xử lý sản phẩm:', error);
            setSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    // Hiển thị thông báo thành công sau khi xóa sản phẩm và tự động ẩn sau 3 giây
    const handleDeleteSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Xóa sản phẩm khỏi danh sách hiển thị
    const handleDelete = (productID) => {
        setProductsList(productsList.filter((product) => product.productID !== productID));
    };

    // Chuyển đổi trạng thái hiển thị form và reset dữ liệu khi đóng
    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setEditingProduct(null);
            setEmployeeID('');
            setProductsOfServicesID('');
            setSupplierID('');
            setProductName('');
            setProductDescription('');
            setSellingPrice('');
            setQuantity('');
            setImagePreview('');
        }
    };

    // Xuất danh sách sản phẩm ra file Excel
    const handleExportExcel = async () => {
        if (!excelFilePath) {
            setSuccessMessage('Vui lòng nhập đường dẫn file Excel');
            return;
        }

        try {
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const userID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                Authorization: token ? `Bearer ${token}` : '',
                UserID: userID,
            };

            const exportData = editingProduct
                ? {
                      productID: editingProduct.productID || null,
                      productName: editingProduct.productName || null,
                      productsOfServicesName: editingProduct.productsOfServicesName || null,
                      supplierName: editingProduct.supplierName || null,
                      filePath: excelFilePath,
                  }
                : {
                      productID: null,
                      productName: null,
                      productsOfServicesName: null,
                      supplierName: null,
                      filePath: excelFilePath,
                  };

            const response = await fetch('https://buitoandev.somee.com/api/Products/ExportProductsToExcel', {
                method: 'POST',
                headers,
                body: JSON.stringify(exportData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.resposeMessage || 'Xuất Excel thất bại');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'products.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setSuccessMessage('Xuất Excel thành công');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Lỗi khi xuất Excel:', error);
            setSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    return (
        <div className={cx('wrapper')}>
            {successMessage && <SuccessMessage message={successMessage} />}
            <div className={cx('header')}>
                <h1>Sản Phẩm</h1>
                <div className={cx('search-container')}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cx('search-input')}
                    />
                    <button onClick={handleSearch} className={cx('search-button')}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
                <div className={cx('excel-export')}>
                    <input
                        type="text"
                        placeholder="Nhập đường dẫn file Excel"
                        value={excelFilePath}
                        onChange={(e) => setExcelFilePath(e.target.value)}
                    />
                    <button onClick={handleExportExcel}>Xuất Excel</button>
                </div>
                {!isFormVisible && (
                    <div className={cx('open-form-icon')} onClick={toggleFormVisibility}>
                        <FontAwesomeIcon icon={faPlus} />
                    </div>
                )}
            </div>
            {isFormVisible && (
                <form className={cx('form-content')} onSubmit={handleSubmit}>
                    <div className={cx('form-header')}>
                        <FontAwesomeIcon icon={faTimes} className={cx('close-icon')} onClick={toggleFormVisibility} />
                    </div>
                    {loading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : error ? (
                        <p>Lỗi: {error}</p>
                    ) : (
                        <>
                            {editingProduct === null && (
                                <>
                                    <div>
                                        <label htmlFor="employeeID">Mã Nhân Viên:</label>
                                        <input
                                            type="text"
                                            id="employeeID"
                                            value={employeeID}
                                            onChange={(e) => setEmployeeID(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="productsOfServicesID">Loại Sản Phẩm:</label>
                                        <select
                                            id="productsOfServicesID"
                                            value={productsOfServicesID}
                                            onChange={(e) => setProductsOfServicesID(e.target.value)}
                                            required
                                        >
                                            <option value="">Chọn loại sản phẩm</option>
                                            {productTypes.map((type) => (
                                                <option
                                                    key={type.productsOfServicesID}
                                                    value={type.productsOfServicesID}
                                                >
                                                    {type.productsOfServicesName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="supplierID">Nhà Cung Cấp:</label>
                                        <select
                                            id="supplierID"
                                            value={supplierID}
                                            onChange={(e) => setSupplierID(e.target.value)}
                                            required
                                        >
                                            <option value="">Chọn nhà cung cấp</option>
                                            {suppliers.map((supplier) => (
                                                <option key={supplier.supplierID} value={supplier.supplierID}>
                                                    {supplier.supplierName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                            <div>
                                <label htmlFor="productName">Tên sản phẩm:</label>
                                <input
                                    type="text"
                                    id="productName"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="productDescription">Mô tả:</label>
                                <textarea
                                    id="productDescription"
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="sellingPrice">Giá bán:</label>
                                <input
                                    type="text"
                                    id="sellingPrice"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="quantity">Số lượng:</label>
                                <input
                                    type="text"
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={cx('image-upload')}>
                                <label htmlFor="productImages">Hình ảnh sản phẩm:</label>
                                <input type="file" id="productImages" accept="image/*" onChange={handleImageChange} />
                                {imagePreview && (
                                    <img className={cx('img-xemtrc')} src={imagePreview} alt="Xem trước" />
                                )}
                            </div>
                            <button className={cx('submit')} type="submit">
                                {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                            </button>
                        </>
                    )}
                </form>
            )}

            {loadingProducts ? (
                <div>Đang tải danh sách sản phẩm...</div>
            ) : errorProducts ? (
                <div>Lỗi: {errorProducts}</div>
            ) : (
                <ItemProduct
                    services={productsList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}

export default Products;
