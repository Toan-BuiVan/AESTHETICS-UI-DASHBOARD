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

const CombinedPage = () => {
    // State cho Nhà cung cấp
    const [supplierName, setSupplierName] = useState('');
    const [isSupplierFormVisible, setIsSupplierFormVisible] = useState(false);
    const [supplierSuccessMessage, setSupplierSuccessMessage] = useState('');
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [suppliersList, setSuppliersList] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [errorSuppliers, setErrorSuppliers] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);

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

    useEffect(() => {
        const initialize = async () => {
            // await refreshTokenOnLoad();
            fetchSuppliersList({ supplierID: null, supplierName: null });
        };
        initialize();
    }, [fetchSuppliersList]);

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

    return (
        <div className={styles.wrapper}>
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
        </div>
    );
};

export default CombinedPage;
