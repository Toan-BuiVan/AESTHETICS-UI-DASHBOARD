import React, { useState, useEffect, useCallback } from 'react';
import styles from './CombinedPage.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const SuccessMessage = ({ message }) => <div className={styles['success-message']}>{message}</div>;

const ItemSupplier = ({ suppliers, onEdit, onDelete, onDeleteSuccess }) => {
    const handleDelete = async (supplierID) => {
        try {
            const headers = {
                'Content-Type': 'application/json',
                DeviceName: localStorage.getItem('deviceName') || '',
                RefreshToken: localStorage.getItem('refreshToken') || '',
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                UserID: localStorage.getItem('userID') || '',
            };
            const response = await fetch('https://buitoandev.somee.com/api/Supplier/Delete_Supplier', {
                method: 'DELETE',
                headers,
                body: JSON.stringify({ supplierID }),
            });
            if (!response.ok) throw new Error('Xóa thất bại');
            const data = await response.json();
            // Thêm logic cập nhật token
            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            onDelete(supplierID);
            onDeleteSuccess(data.resposeMessage || 'Xóa thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa:', error.message);
        }
    };

    if (!suppliers || suppliers.length === 0) return <div>Đang tải dữ liệu...</div>;

    return (
        <div className={styles['table-wrapper']}>
            <table>
                <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Sửa</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map((item) => (
                        <tr key={item.supplierID}>
                            <td>{item.supplierID}</td>
                            <td>{item.supplierName}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className={styles['edit-icon']}
                                    onClick={() => onEdit(item.supplierID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={styles['delete-icon']}
                                    onClick={() => handleDelete(item.supplierID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ItemProductsOfServices = ({ productsOfServices, onEdit, onDelete, onDeleteSuccess }) => {
    const handleDelete = async (productsOfServicesID) => {
        try {
            const headers = {
                'Content-Type': 'application/json',
                DeviceName: localStorage.getItem('deviceName') || '',
                RefreshToken: localStorage.getItem('refreshToken') || '',
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                UserID: localStorage.getItem('userID') || '',
            };
            const response = await fetch(
                'https://buitoandev.somee.com/api/TypeProductsServices/Delete_TypeProductsOfServices',
                {
                    method: 'DELETE',
                    headers,
                    body: JSON.stringify({ productsOfServicesID }),
                },
            );
            if (!response.ok) throw new Error('Xóa thất bại');
            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            const data = await response.json();
            onDelete(productsOfServicesID);
            onDeleteSuccess(data.resposeMessage || 'Xóa thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa:', error.message);
        }
    };

    if (!productsOfServices || productsOfServices.length === 0) return <div>Đang tải dữ liệu...</div>;

    return (
        <div className={styles['table-wrapper']}>
            <table>
                <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Tên</th>
                        <th>Loại</th>
                        <th>Sửa</th>
                        <th>Xóa</th>
                    </tr>
                </thead>
                <tbody>
                    {productsOfServices.map((item) => (
                        <tr key={item.productsOfServicesID}>
                            <td>{item.productsOfServicesID}</td>
                            <td>{item.productsOfServicesName}</td>
                            <td>{item.productsOfServicesType}</td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className={styles['edit-icon']}
                                    onClick={() => onEdit(item.productsOfServicesID)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className={styles['delete-icon']}
                                    onClick={() => handleDelete(item.productsOfServicesID)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CombinedPage = () => {
    const [activeTab, setActiveTab] = useState('supplier');

    // State cho Nhà cung cấp
    const [supplierName, setSupplierName] = useState('');
    const [isSupplierFormVisible, setIsSupplierFormVisible] = useState(false);
    const [supplierSuccessMessage, setSupplierSuccessMessage] = useState('');
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [suppliersList, setSuppliersList] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [errorSuppliers, setErrorSuppliers] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);

    // State cho Loại sản phẩm và dịch vụ
    const [productsOfServicesName, setProductsOfServicesName] = useState('');
    const [productsOfServicesType, setProductsOfServicesType] = useState('');
    const [isProductsOfServicesFormVisible, setIsProductsOfServicesFormVisible] = useState(false);
    const [productsOfServicesSuccessMessage, setProductsOfServicesSuccessMessage] = useState('');
    const [productsOfServicesSearchTerm, setProductsOfServicesSearchTerm] = useState('');
    const [typeProductsOfServicesList, setTypeProductsOfServicesList] = useState([]);
    const [loadingTypeProductsOfServices, setLoadingTypeProductsOfServices] = useState(true);
    const [errorTypeProductsOfServices, setErrorTypeProductsOfServices] = useState(null);
    const [editingTypeProductsOfServices, setEditingTypeProductsOfServices] = useState(null);

    const refreshTokenOnLoad = async () => {
        try {
            const response = await fetch('https://buitoandev.somee.com/api/Authentication/Refresh_Token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: localStorage.getItem('token') || '',
                    refreshToken: localStorage.getItem('refreshToken') || '',
                }),
            });
            if (!response.ok) throw new Error('Không thể làm mới token');
            const data = await response.json();
            if (data.responseCode === 1) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
            }
        } catch (error) {
            console.error('Lỗi khi làm mới token:', error);
        }
    };

    const fetchSuppliersList = useCallback(async (searchParams) => {
        try {
            setLoadingSuppliers(true);
            const headers = {
                'Content-Type': 'application/json',
                DeviceName: localStorage.getItem('deviceName') || '',
                RefreshToken: localStorage.getItem('refreshToken') || '',
                UserID: localStorage.getItem('userID') || '',
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            };
            const response = await fetch('https://buitoandev.somee.com/api/Supplier/GetList_SearchSupplier', {
                method: 'POST',
                headers,
                body: JSON.stringify(searchParams),
            });
            if (!response.ok) throw new Error('Lỗi khi gọi API');
            const data = await response.json();
            let supplier = [];
            if (Array.isArray(data)) {
                supplier = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                supplier = data.data;
            }
            setSuppliersList(supplier);
        } catch (error) {
            setErrorSuppliers(error.message);
            setSuppliersList([]);
        } finally {
            setLoadingSuppliers(false);
        }
    }, []);

    const fetchTypeProductsOfServicesList = useCallback(async (searchParams) => {
        try {
            setLoadingTypeProductsOfServices(true);
            const headers = {
                'Content-Type': 'application/json',
                DeviceName: localStorage.getItem('deviceName') || '',
                RefreshToken: localStorage.getItem('refreshToken') || '',
                UserID: localStorage.getItem('userID') || '',
                Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            };
            const response = await fetch(
                'https://buitoandev.somee.com/api/TypeProductsServices/GetList_SreachProductsOfServices',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(searchParams),
                },
            );
            if (!response.ok) throw new Error('Lỗi khi gọi API');
            const data = await response.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setTypeProductsOfServicesList(proOf);
        } catch (error) {
            setErrorTypeProductsOfServices(error.message);
            setTypeProductsOfServicesList([]);
        } finally {
            setLoadingTypeProductsOfServices(false);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            // await refreshTokenOnLoad();
            if (activeTab === 'supplier') {
                fetchSuppliersList({ supplierID: null, supplierName: null });
            } else {
                fetchTypeProductsOfServicesList({
                    productsOfServicesID: null,
                    productsOfServicesName: null,
                    productsOfServicesType: null,
                });
            }
        };
        initialize();
    }, [activeTab, fetchSuppliersList, fetchTypeProductsOfServicesList]);

    const handleSupplierSearch = () => {
        const searchParams = supplierSearchTerm
            ? !isNaN(supplierSearchTerm)
                ? { supplierID: parseInt(supplierSearchTerm, 10), supplierName: null }
                : { supplierID: null, supplierName: supplierSearchTerm }
            : { supplierID: null, supplierName: null };
        fetchSuppliersList(searchParams);
    };

    const handleSupplierEdit = (supplierID) => {
        const supplierToEdit = suppliersList.find((s) => s.supplierID === supplierID);
        if (supplierToEdit) {
            setEditingSupplier(supplierToEdit);
            setSupplierName(supplierToEdit.supplierName);
            setIsSupplierFormVisible(true);
        }
    };

    const handleSupplierSubmit = async (e) => {
        e.preventDefault();
        const headers = {
            'Content-Type': 'application/json',
            DeviceName: localStorage.getItem('deviceName') || '',
            RefreshToken: localStorage.getItem('refreshToken') || '',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            UserID: localStorage.getItem('userID') || '',
        };
        const formData = { supplierName };
        if (editingSupplier) formData.supplierID = editingSupplier.supplierID;

        try {
            const response = await fetch(
                editingSupplier
                    ? 'https://buitoandev.somee.com/api/Supplier/Update_Supplier'
                    : 'https://buitoandev.somee.com/api/Supplier/Insert_Supplier',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData),
                },
            );
            const result = await response.json();
            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            if (!response.ok) {
                setSupplierSuccessMessage(result.resposeMessage || 'Thao tác thất bại!');
            } else {
                setSupplierSuccessMessage(result.resposeMessage || 'Thao tác thành công!');

                if (editingSupplier) {
                    setSuppliersList(
                        suppliersList.map((s) =>
                            s.supplierID === editingSupplier.supplierID ? { ...s, ...formData } : s,
                        ),
                    );
                } else {
                    fetchSuppliersList({ supplierID: null, supplierName: null });
                }
                setSupplierName('');
                setEditingSupplier(null);
                setTimeout(() => {
                    setIsSupplierFormVisible(false);
                    setSupplierSuccessMessage('');
                }, 3500);
            }
        } catch (error) {
            setSupplierSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    const handleSupplierDeleteSuccess = (message) => {
        setSupplierSuccessMessage(message);
        setTimeout(() => setSupplierSuccessMessage(''), 3000);
    };

    const handleSupplierDelete = (supplierID) => {
        setSuppliersList(suppliersList.filter((s) => s.supplierID !== supplierID));
    };

    const toggleSupplierFormVisibility = () => {
        setIsSupplierFormVisible(!isSupplierFormVisible);
        if (isSupplierFormVisible) {
            setEditingSupplier(null);
            setSupplierName('');
        }
    };

    const handleProductsOfServicesSearch = () => {
        const searchParams = productsOfServicesSearchTerm
            ? !isNaN(productsOfServicesSearchTerm)
                ? {
                      productsOfServicesID: parseInt(productsOfServicesSearchTerm, 10),
                      productsOfServicesName: null,
                      productsOfServicesType: null,
                  }
                : {
                      productsOfServicesID: null,
                      productsOfServicesName: productsOfServicesSearchTerm,
                      productsOfServicesType: null,
                  }
            : { productsOfServicesID: null, productsOfServicesName: null, productsOfServicesType: null };
        fetchTypeProductsOfServicesList(searchParams);
    };

    const handleProductsOfServicesEdit = (productsOfServicesID) => {
        const typeToEdit = typeProductsOfServicesList.find((t) => t.productsOfServicesID === productsOfServicesID);
        if (typeToEdit) {
            setEditingTypeProductsOfServices(typeToEdit);
            setProductsOfServicesName(typeToEdit.productsOfServicesName);
            setProductsOfServicesType(typeToEdit.productsOfServicesType);
            setIsProductsOfServicesFormVisible(true);
        }
    };

    const handleProductsOfServicesSubmit = async (e) => {
        e.preventDefault();
        const headers = {
            'Content-Type': 'application/json',
            DeviceName: localStorage.getItem('deviceName') || '',
            RefreshToken: localStorage.getItem('refreshToken') || '',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            UserID: localStorage.getItem('userID') || '',
        };
        const formData = { productsOfServicesName, productsOfServicesType };
        if (editingTypeProductsOfServices)
            formData.productsOfServicesID = editingTypeProductsOfServices.productsOfServicesID;

        try {
            const response = await fetch(
                editingTypeProductsOfServices
                    ? 'https://buitoandev.somee.com/api/TypeProductsServices/Update_TypeProductsOfServices'
                    : 'https://buitoandev.somee.com/api/TypeProductsServices/Insert_TypeProductsOfServices',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData),
                },
            );
            const result = await response.json();
            const newAccessToken = response.headers.get('New-AccessToken');
            const newRefreshToken = response.headers.get('New-RefreshToken');
            if (newAccessToken) localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            if (!response.ok) {
                setProductsOfServicesSuccessMessage(result.resposeMessage || 'Thao tác thất bại!');
            } else {
                setProductsOfServicesSuccessMessage(result.resposeMessage || 'Thao tác thành công!');
                if (editingTypeProductsOfServices) {
                    setTypeProductsOfServicesList(
                        typeProductsOfServicesList.map((t) =>
                            t.productsOfServicesID === editingTypeProductsOfServices.productsOfServicesID
                                ? { ...t, ...formData }
                                : t,
                        ),
                    );
                } else {
                    fetchTypeProductsOfServicesList({
                        productsOfServicesID: null,
                        productsOfServicesName: null,
                        productsOfServicesType: null,
                    });
                }
                setProductsOfServicesName('');
                setProductsOfServicesType('');
                setEditingTypeProductsOfServices(null);
                setTimeout(() => {
                    setIsProductsOfServicesFormVisible(false);
                    setProductsOfServicesSuccessMessage('');
                }, 3500);
            }
        } catch (error) {
            setProductsOfServicesSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    const handleProductsOfServicesDeleteSuccess = (message) => {
        setProductsOfServicesSuccessMessage(message);
        setTimeout(() => setProductsOfServicesSuccessMessage(''), 3000);
    };

    const handleProductsOfServicesDelete = (productsOfServicesID) => {
        setTypeProductsOfServicesList(
            typeProductsOfServicesList.filter((t) => t.productsOfServicesID !== productsOfServicesID),
        );
    };

    const toggleProductsOfServicesFormVisibility = () => {
        setIsProductsOfServicesFormVisible(!isProductsOfServicesFormVisible);
        if (isProductsOfServicesFormVisible) {
            setEditingTypeProductsOfServices(null);
            setProductsOfServicesName('');
            setProductsOfServicesType('');
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.tabs}>
                <button
                    className={activeTab === 'supplier' ? styles.active : ''}
                    onClick={() => setActiveTab('supplier')}
                >
                    Nhà Cung Cấp
                </button>
                <button
                    className={activeTab === 'productType' ? styles.active : ''}
                    onClick={() => setActiveTab('productType')}
                >
                    Loại Sản Phẩm & Dịch Vụ
                </button>
            </div>

            {activeTab === 'supplier' && (
                <div>
                    {supplierSuccessMessage && <SuccessMessage message={supplierSuccessMessage} />}
                    <div className={styles.header}>
                        <h1>Nhà Cung Cấp</h1>
                        <div className={styles['search-container']}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhà cung cấp..."
                                value={supplierSearchTerm}
                                onChange={(e) => setSupplierSearchTerm(e.target.value)}
                                className={styles['search-input']}
                            />
                            <button onClick={handleSupplierSearch} className={styles['search-button']}>
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                        {!isSupplierFormVisible && (
                            <div className={styles['open-form-icon']} onClick={toggleSupplierFormVisibility}>
                                <FontAwesomeIcon icon={faPlus} />
                            </div>
                        )}
                    </div>
                    {isSupplierFormVisible && (
                        <div className={styles['form-content']}>
                            <div className={styles['form-header']}>
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    className={styles['close-icon']}
                                    onClick={toggleSupplierFormVisibility}
                                />
                            </div>
                            <div>
                                <label htmlFor="supplierName">Tên nhà cung cấp:</label>
                                <input
                                    type="text"
                                    id="supplierName"
                                    value={supplierName}
                                    onChange={(e) => setSupplierName(e.target.value)}
                                    required
                                />
                            </div>
                            <button className={styles.submit} onClick={handleSupplierSubmit}>
                                {editingSupplier ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    )}
                    {loadingSuppliers ? (
                        <div>Đang tải danh sách...</div>
                    ) : errorSuppliers ? (
                        <div>Lỗi: {errorSuppliers}</div>
                    ) : (
                        <ItemSupplier
                            suppliers={suppliersList}
                            onEdit={handleSupplierEdit}
                            onDelete={handleSupplierDelete}
                            onDeleteSuccess={handleSupplierDeleteSuccess}
                        />
                    )}
                </div>
            )}

            {activeTab === 'productType' && (
                <div>
                    {productsOfServicesSuccessMessage && <SuccessMessage message={productsOfServicesSuccessMessage} />}
                    <div className={styles.header}>
                        <h1>Loại Sản Phẩm & Dịch Vụ</h1>
                        <div className={styles['search-container']}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm loại sản phẩm/dịch vụ..."
                                value={productsOfServicesSearchTerm}
                                onChange={(e) => setProductsOfServicesSearchTerm(e.target.value)}
                                className={styles['search-input']}
                            />
                            <button onClick={handleProductsOfServicesSearch} className={styles['search-button']}>
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                        {!isProductsOfServicesFormVisible && (
                            <div className={styles['open-form-icon']} onClick={toggleProductsOfServicesFormVisibility}>
                                <FontAwesomeIcon icon={faPlus} />
                            </div>
                        )}
                    </div>
                    {isProductsOfServicesFormVisible && (
                        <div className={styles['form-content']}>
                            <div className={styles['form-header']}>
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    className={styles['close-icon']}
                                    onClick={toggleProductsOfServicesFormVisibility}
                                />
                            </div>
                            <div>
                                <label htmlFor="productsOfServicesName">Tên loại sản phẩm/dịch vụ:</label>
                                <input
                                    type="text"
                                    id="productsOfServicesName"
                                    value={productsOfServicesName}
                                    onChange={(e) => setProductsOfServicesName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="productsOfServicesType">Loại:</label>
                                <input
                                    type="text"
                                    id="productsOfServicesType"
                                    value={productsOfServicesType}
                                    onChange={(e) => setProductsOfServicesType(e.target.value)}
                                    required
                                />
                            </div>
                            <button className={styles.submit} onClick={handleProductsOfServicesSubmit}>
                                {editingTypeProductsOfServices ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    )}
                    {loadingTypeProductsOfServices ? (
                        <div>Đang tải danh sách...</div>
                    ) : errorTypeProductsOfServices ? (
                        <div>Lỗi: {errorTypeProductsOfServices}</div>
                    ) : (
                        <ItemProductsOfServices
                            productsOfServices={typeProductsOfServicesList}
                            onEdit={handleProductsOfServicesEdit}
                            onDelete={handleProductsOfServicesDelete}
                            onDeleteSuccess={handleProductsOfServicesDeleteSuccess}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default CombinedPage;
