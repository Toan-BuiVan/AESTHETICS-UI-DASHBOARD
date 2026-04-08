import React, { useState, useEffect, useCallback } from 'react';
import styles from './Products.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemProduct from './ItemProduct';

const cx = classNames.bind(styles);
// Hook này dùng để lấy danh sách loại dịch vụ từ API và quản lý trạng thái liên quan.
const useServices = () => {
    // **useState**: Lưu trữ danh sách loại dịch vụ từ API (mảng các object).
    const [services, setServices] = useState([]);
    // **useState**: Quản lý trạng thái tải dữ liệu (true = đang tải, false = hoàn tất).
    const [loading, setLoading] = useState(true);
    // **useState**: Lưu trữ thông báo lỗi khi gọi API (null nếu không có lỗi).
    const [error, setError] = useState(null);

    // **Hàm `refreshTokenOnLoad`**: Làm mới token khi trang được tải để đảm bảo quyền truy cập API.
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

    // **Hàm `fetchServices`**: Lấy danh sách loại dịch vụ từ API và cập nhật state.
    const fetchServices = useCallback(async () => {
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

            const servicesResponse = await fetch(
                'https://buitoandev.somee.com/api/TypeProductsServices/GetList_SreachProductsOfServices',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        productsOfServicesID: null,
                        productsOfServicesName: null,
                        productsOfServicesType: 'Servicess',
                    }),
                },
            );

            const newAccessToken = servicesResponse.headers.get('New-AccessToken');
            const newRefreshToken = servicesResponse.headers.get('New-RefreshToken');

            if (newAccessToken) {
                localStorage.setItem('token', newAccessToken);
            }
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            if (!servicesResponse.ok) {
                throw new Error('Lỗi khi gọi API');
            }

            const data = await servicesResponse.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setServices(proOf);
        } catch (error) {
            setError(error.message);
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // **useEffect**: Gọi làm mới token và lấy dữ liệu khi component mount.
    useEffect(() => {
        // refreshTokenOnLoad();
        fetchServices();
    }, [fetchServices]);

    return { services, loading, error };
};

function Servicess() {
    // **useState**: Lưu trữ ID của loại sản phẩm/dịch vụ liên quan (lấy từ select).
    const [productsOfServicesID, setProductsOfServicesID] = useState('');
    // **useState**: Lưu trữ tên dịch vụ nhập từ form.
    const [serviceName, setServiceName] = useState('');
    // **useState**: Lưu trữ mô tả dịch vụ nhập từ textarea.
    const [description, setDescription] = useState('');
    // **useState**: Lưu trữ giá dịch vụ (chuỗi, chuyển sang số khi gửi API).
    const [priceService, setPriceService] = useState('');
    // **useState**: Lưu trữ file hình ảnh dịch vụ (File object hoặc null).
    const [serviceImage, setServiceImage] = useState(null);
    // **useState**: Lưu trữ URL tạm thời để hiển thị hình ảnh xem trước.
    const [imagePreview, setImagePreview] = useState('');
    // **useState**: Quản lý trạng thái hiển thị form (true = hiển thị, false = ẩn).
    const [isFormVisible, setIsFormVisible] = useState(false);
    // **useState**: Lưu trữ thông báo thành công hoặc lỗi để hiển thị.
    const [successMessage, setSuccessMessage] = useState('');
    // **useState**: Lưu trữ từ khóa tìm kiếm dịch vụ từ input.
    const [searchTerm, setSearchTerm] = useState('');
    // **useState**: Lưu trữ danh sách dịch vụ từ API (mảng các object).
    const [servicesList, setServicesList] = useState([]);
    // **useState**: Quản lý trạng thái tải danh sách dịch vụ (true = đang tải, false = hoàn tất).
    const [loadingServices, setLoadingServices] = useState(true);
    // **useState**: Lưu trữ thông báo lỗi khi tải danh sách dịch vụ (null nếu không có lỗi).
    const [errorServices, setErrorServices] = useState(null);
    // **useState**: Lưu trữ thông tin dịch vụ đang chỉnh sửa (object hoặc null).
    const [editingService, setEditingService] = useState(null);
    // **useState**: Lưu trữ đường dẫn file Excel để xuất dữ liệu.
    const [excelFilePath, setExcelFilePath] = useState('');
    const { services, loading, error } = useServices();

    // **Hàm `fetchServicesList`**: Lấy danh sách dịch vụ từ API dựa trên tham số tìm kiếm.
    const fetchServicesList = useCallback(async (searchParams) => {
        try {
            setLoadingServices(true);
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const userID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                UserID: userID,
                Authorization: token ? `Bearer ${token}` : '',
            };

            const response = await fetch('https://buitoandev.somee.com/api/Servicess/GetList_SearchServicess', {
                method: 'POST',
                headers,
                body: JSON.stringify(searchParams),
            });

            if (!response.ok) throw new Error('Lỗi khi gọi API');
            const data = await response.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setServicesList(proOf);
        } catch (error) {
            setErrorServices(error.message);
            setServicesList([]);
        } finally {
            setLoadingServices(false);
        }
    }, []);

    // **useEffect**: Tải danh sách dịch vụ mặc định khi component mount.
    useEffect(() => {
        fetchServicesList({});
    }, [fetchServicesList]);

    // **Hàm `handleImageChange`**: Xử lý khi người dùng chọn file hình ảnh để xem trước.
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setServiceImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // **Hàm `handleSearch`**: Tìm kiếm dịch vụ theo ID hoặc tên dựa trên từ khóa.
    const handleSearch = () => {
        let searchParams = {};
        if (searchTerm) {
            searchParams = !isNaN(searchTerm) ? { serviceID: parseInt(searchTerm, 10) } : { serviceName: searchTerm };
        }
        fetchServicesList(searchParams);
    };

    // **Hàm `handleEdit`**: Chuẩn bị dữ liệu để chỉnh sửa dịch vụ và hiển thị form.
    const handleEdit = (serviceID) => {
        const serviceToEdit = servicesList.find((service) => service.serviceID === serviceID);
        if (serviceToEdit) {
            setEditingService(serviceToEdit);
            setProductsOfServicesID(serviceToEdit.productsOfServicesID);
            setServiceName(serviceToEdit.serviceName);
            setDescription(serviceToEdit.description);
            setPriceService(serviceToEdit.priceService.toString());
            setImagePreview(`https://buitoandev.somee.com/Images/${serviceToEdit.serviceImage}`);
            setIsFormVisible(true);
        }
    };

    // **Hàm `handleSubmit`**: Gửi form để thêm hoặc cập nhật dịch vụ qua API.
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

        // **Hàm con `urlToBase64`**: Chuyển URL hình ảnh thành Base64.
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

        let serviceImageToSend = '';
        if (serviceImage) {
            serviceImageToSend = imagePreview.split(',')[1];
        } else if (editingService) {
            const imageUrl = `https://buitoandev.somee.com/Images/${editingService.serviceImage}`;
            serviceImageToSend = await urlToBase64(imageUrl);
        }

        const formData = {
            serviceID: editingService?.serviceID,
            productsOfServicesID: parseInt(productsOfServicesID),
            serviceName,
            description,
            serviceImage: serviceImageToSend,
            priceService: parseFloat(priceService),
        };

        try {
            const response = await fetch(
                editingService
                    ? 'https://buitoandev.somee.com/api/Servicess/Update_Servicess'
                    : 'https://buitoandev.somee.com/api/Servicess/Insert_Servicess',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData),
                },
            );

            const result = await response.json();
            if (!response.ok) {
                console.log('Cập nhật dịch vụ thất bại:', result);
                setSuccessMessage(result.resposeMessage || 'Cập nhật dịch vụ thất bại!');
            } else {
                console.log('Cập nhật dịch vụ thành công:', result);
                setSuccessMessage(result.resposeMessage || 'Cập nhật dịch vụ thành công!');
                const newAccessToken = response.headers.get('New-AccessToken');
                const newRefreshToken = response.headers.get('New-RefreshToken');

                if (newAccessToken) {
                    localStorage.setItem('token', newAccessToken);
                }
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                if (editingService) {
                    setServicesList(
                        servicesList.map((service) =>
                            service.serviceID === editingService.serviceID ? { ...service, ...formData } : service,
                        ),
                    );
                } else {
                    fetchServicesList({});
                }

                setProductsOfServicesID('');
                setServiceName('');
                setDescription('');
                setPriceService('');
                setServiceImage(null);
                setImagePreview('');
                setEditingService(null);

                setTimeout(() => {
                    setIsFormVisible(false);
                    setSuccessMessage('');
                }, 3500);
            }
        } catch (error) {
            console.error('Lỗi khi xử lý dịch vụ:', error);
            setSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    // **Hàm `handleDeleteSuccess`**: Hiển thị thông báo xóa thành công và tự động ẩn sau 3 giây.
    const handleDeleteSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // **Hàm `handleDelete`**: Xóa dịch vụ khỏi danh sách hiển thị.
    const handleDelete = (serviceID) => {
        setServicesList(servicesList.filter((service) => service.serviceID !== serviceID));
    };

    // **Hàm `toggleFormVisibility`**: Chuyển đổi trạng thái hiển thị form và reset dữ liệu khi đóng.
    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setEditingService(null);
            setProductsOfServicesID('');
            setServiceName('');
            setDescription('');
            setPriceService('');
            setImagePreview('');
        }
    };

    // **Hàm `handleExportExcel`**: Xuất danh sách dịch vụ ra file Excel.
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

            const serviceData = editingService
                ? {
                      serviceID: editingService.serviceID,
                      serviceName: editingService.serviceName,
                      productsOfServicesID: editingService.productsOfServicesID,
                      filePath: excelFilePath,
                  }
                : {
                      serviceID: null,
                      serviceName: null,
                      productsOfServicesID: null,
                      filePath: excelFilePath,
                  };

            const response = await fetch('https://buitoandev.somee.com/api/Servicess/ExportServicessToExcel', {
                method: 'POST',
                headers,
                body: JSON.stringify(serviceData),
            });

            if (!response.ok) {
                throw new Error('Xuất Excel thất bại');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'services.xlsx';
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
                <h1>Dịch Vụ</h1>
                <div className={cx('search-container')}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm dịch vụ..."
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
                    <h2 className={cx('form-title')}>{editingService ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ Mới'}</h2>
                    <div className={cx('form-row')}>
                        {loading ? (
                            <p>Đang tải dữ liệu...</p>
                        ) : error ? (
                            <p>Lỗi: {error}</p>
                        ) : (
                            <div className={cx('form-group')}>
                                <label htmlFor="productsOfServicesID">Loại Dịch Vụ:</label>
                                <select
                                    id="productsOfServicesID"
                                    value={productsOfServicesID}
                                    onChange={(e) => setProductsOfServicesID(e.target.value)}
                                    required
                                >
                                    <option value="">Chọn dịch vụ</option>
                                    {services.map((service) => (
                                        <option key={service.productsOfServicesID} value={service.productsOfServicesID}>
                                            {service.productsOfServicesName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className={cx('form-group')}>
                            <label htmlFor="serviceName">Tên dịch vụ:</label>
                            <input
                                type="text"
                                id="serviceName"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group', 'textarea-group')}>
                            <label htmlFor="description">Mô tả:</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="priceService">Giá dịch vụ:</label>
                            <input
                                type="text"
                                id="priceService"
                                value={priceService}
                                onChange={(e) => setPriceService(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="serviceImage">Hình ảnh dịch vụ:</label>
                            <div className={cx('image-container')}>
                                <input type="file" id="serviceImage" accept="image/*" onChange={handleImageChange} />
                                {imagePreview && (
                                    <img className={cx('img-xemtrc')} src={imagePreview} alt="Xem trước" />
                                )}
                            </div>
                        </div>
                    </div>
                    <button className={cx('submit')} type="submit">
                        {editingService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ'}
                    </button>
                </form>
            )}

            {loadingServices ? (
                <div>Đang tải danh sách dịch vụ...</div>
            ) : errorServices ? (
                <div>Lỗi: {errorServices}</div>
            ) : (
                <ItemProduct
                    services={servicesList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}

export default Servicess;
