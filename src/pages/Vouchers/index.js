import React, { useState, useEffect, useCallback } from 'react';
import styles from './Vouchers.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemVouchers from './ItemVouchers';

const cx = classNames.bind(styles);

function Vouchers() {
    const [description, setDescription] = useState('');
    const [discountValue, setDiscountValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minimumOrderValue, setMinimumOrderValue] = useState('');
    const [maxValue, setMaxValue] = useState('');
    const [rankMember, setRankMember] = useState('');
    const [ratingPoints, setRatingPoints] = useState('');
    const [accumulatedPoints, setAccumulatedPoints] = useState('');
    const [voucherImage, setVoucherImage] = useState(null); // State cho hình ảnh
    const [imagePreview, setImagePreview] = useState(''); // State cho xem trước hình ảnh
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchStartDate, setSearchStartDate] = useState('');
    const [searchEndDate, setSearchEndDate] = useState('');
    const [vouchersList, setVouchersList] = useState([]);
    const [loadingVouchers, setLoadingVouchers] = useState(true);
    const [errorVouchers, setErrorVouchers] = useState(null);
    const [editingVoucher, setEditingVoucher] = useState(null);

    const refreshTokenOnLoad = async () => {
        try {
            const accessToken = localStorage.getItem('token') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';

            const response = await fetch('https://buitoandev.somee.com/api/Authentication/Refresh_Token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken, refreshToken }),
            });

            if (!response.ok) throw new Error('Không thể làm mới token');

            const data = await response.json();
            if (data.responseCode === 1) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                console.log('Đã cập nhật token và refreshToken trong localStorage');
            } else {
                console.error('Làm mới token thất bại:', data.responseMessage);
            }
        } catch (error) {
            console.error('Lỗi khi làm mới token:', error);
        }
    };

    const fetchVouchersList = useCallback(async (searchParams) => {
        try {
            setLoadingVouchers(true);
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
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const defaultParams = {
                voucherID: null,
                startDate: null,
                endDate: null,
                rankMember: null,
            };
            const defaultResponse = await fetch('https://buitoandev.somee.com/api/Vouchers/GetList_SearchVouchers', {
                method: 'POST',
                headers,
                body: JSON.stringify(defaultParams),
            });
            if (!defaultResponse.ok) throw new Error('Lỗi khi gọi API lấy danh sách vouchers mặc định');
            const data = await defaultResponse.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setVouchersList(proOf);

            if (searchParams && Object.values(searchParams).some((value) => value !== null && value !== 0)) {
                const response = await fetch('https://buitoandev.somee.com/api/Vouchers/GetList_SearchVouchers', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(searchParams),
                });
                if (!response.ok) throw new Error('Lỗi khi gọi API lấy danh sách vouchers với tham số');
                const data = await response.json();
                let proOf = [];
                if (Array.isArray(data)) {
                    proOf = data;
                } else if (data && data.data && Array.isArray(data.data)) {
                    proOf = data.data;
                }
                setVouchersList(proOf);
            }
        } catch (error) {
            setErrorVouchers(error.message);
            setVouchersList([]);
        } finally {
            setLoadingVouchers(false);
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            // await refreshTokenOnLoad();
            fetchVouchersList({
                voucherID: null,
                startDate: null,
                endDate: null,
                rankMember: null,
            });
        };
        initialize();
    }, [fetchVouchersList]);

    const handleSearch = () => {
        let searchParams = {
            voucherID: null,
            startDate: searchStartDate ? new Date(searchStartDate).toISOString() : null,
            endDate: searchEndDate ? new Date(searchEndDate).toISOString() : null,
            rankMember: null,
        };
        if (searchTerm) {
            if (!isNaN(searchTerm)) {
                searchParams.voucherID = parseInt(searchTerm, 10);
            } else {
                searchParams.rankMember = searchTerm;
            }
        }
        fetchVouchersList(searchParams);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVoucherImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (voucherID) => {
        const voucherToEdit = vouchersList.find((voucher) => voucher.voucherID === voucherID);
        if (voucherToEdit) {
            setEditingVoucher(voucherToEdit);
            setDescription(voucherToEdit.description);
            setDiscountValue(voucherToEdit.discountValue.toString());
            setStartDate(voucherToEdit.startDate.split('T')[0]);
            setEndDate(voucherToEdit.endDate.split('T')[0]);
            setMinimumOrderValue(voucherToEdit.minimumOrderValue.toString());
            setMaxValue(voucherToEdit.maxValue.toString());
            setRankMember(voucherToEdit.rankMember);
            setRatingPoints(voucherToEdit.ratingPoints.toString());
            setAccumulatedPoints(voucherToEdit.accumulatedPoints.toString());
            setImagePreview(`https://buitoandev.somee.com/Images/${voucherToEdit.voucherImage}`);
            setVoucherImage(null); // Reset hình ảnh mới khi chỉnh sửa
            setIsFormVisible(true);
        }
    };

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

        let voucherImageToSend = '';
        if (voucherImage) {
            voucherImageToSend = imagePreview.split(',')[1];
        } else if (editingVoucher) {
            const imageUrl = `https://buitoandev.somee.com/Images/${editingVoucher.voucherImage}`;
            voucherImageToSend = await urlToBase64(imageUrl);
        }

        const formData = {
            voucherID: editingVoucher?.voucherID,
            description,
            discountValue: parseFloat(discountValue),
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            minimumOrderValue: parseFloat(minimumOrderValue),
            maxValue: parseFloat(maxValue),
            rankMember,
            ratingPoints: parseInt(ratingPoints, 10),
            accumulatedPoints: parseInt(accumulatedPoints, 10),
            voucherImage: voucherImageToSend,
        };

        try {
            const response = await fetch(
                editingVoucher
                    ? 'https://buitoandev.somee.com/api/Vouchers/Update_Vouchers'
                    : 'https://buitoandev.somee.com/api/Vouchers/Insert_Vouchers',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(formData),
                },
            );

            const result = await response.json();
            if (!response.ok) {
                setSuccessMessage(result.resposeMessage || 'Thao tác thất bại!');
            } else {
                setSuccessMessage(result.resposeMessage || 'Thao tác thành công!');
                const newAccessToken = response.headers.get('New-AccessToken');
                const newRefreshToken = response.headers.get('New-RefreshToken');
                if (newAccessToken) localStorage.setItem('token', newAccessToken);
                if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                if (editingVoucher) {
                    setVouchersList(
                        vouchersList.map((voucher) =>
                            voucher.voucherID === editingVoucher.voucherID ? { ...voucher, ...formData } : voucher,
                        ),
                    );
                } else {
                    fetchVouchersList({
                        voucherID: 0,
                        startDate: null,
                        endDate: null,
                        rankMember: null,
                    });
                }

                setDescription('');
                setDiscountValue('');
                setStartDate('');
                setEndDate('');
                setMinimumOrderValue('');
                setMaxValue('');
                setRankMember('');
                setRatingPoints('');
                setAccumulatedPoints('');
                setVoucherImage(null);
                setImagePreview('');
                setEditingVoucher(null);

                setTimeout(() => {
                    setIsFormVisible(false);
                    setSuccessMessage('');
                }, 3500);
            }
        } catch (error) {
            setSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    const handleDeleteSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleDelete = (voucherID) => {
        setVouchersList(vouchersList.filter((voucher) => voucher.voucherID !== voucherID));
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setEditingVoucher(null);
            setDescription('');
            setDiscountValue('');
            setStartDate('');
            setEndDate('');
            setMinimumOrderValue('');
            setMaxValue('');
            setRankMember('');
            setRatingPoints('');
            setAccumulatedPoints('');
            setVoucherImage(null);
            setImagePreview('');
        }
    };

    return (
        <div className={cx('wrapper')}>
            {successMessage && <SuccessMessage message={successMessage} />}
            <div className={cx('header')}>
                <h1>Vouchers</h1>
                <div className={cx('search-container')}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm vouchers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cx('search-input')}
                    />
                    <input
                        type="date"
                        value={searchStartDate}
                        onChange={(e) => setSearchStartDate(e.target.value)}
                        placeholder="Ngày bắt đầu"
                        className={cx('search-input')}
                    />
                    <input
                        type="date"
                        value={searchEndDate}
                        onChange={(e) => setSearchEndDate(e.target.value)}
                        placeholder="Ngày kết thúc"
                        className={cx('search-input')}
                    />
                    <button onClick={handleSearch} className={cx('search-button')}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
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
                    <div>
                        <label htmlFor="description">Mô tả:</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="discountValue">Giảm giá (%):</label>
                        <input
                            type="number"
                            id="discountValue"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="startDate">Ngày bắt đầu:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate">Ngày kết thúc:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="minimumOrderValue">Giá trị đơn tối thiểu (VND):</label>
                        <input
                            type="number"
                            id="minimumOrderValue"
                            value={minimumOrderValue}
                            onChange={(e) => setMinimumOrderValue(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="maxValue">Giá trị tối đa (VND):</label>
                        <input
                            type="number"
                            id="maxValue"
                            value={maxValue}
                            onChange={(e) => setMaxValue(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="rankMember">Hạng thành viên:</label>
                        <input
                            type="text"
                            id="rankMember"
                            value={rankMember}
                            onChange={(e) => setRankMember(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="ratingPoints">Điểm đánh giá:</label>
                        <input
                            type="number"
                            id="ratingPoints"
                            value={ratingPoints}
                            onChange={(e) => setRatingPoints(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="accumulatedPoints">Điểm tích lũy:</label>
                        <input
                            type="number"
                            id="accumulatedPoints"
                            value={accumulatedPoints}
                            onChange={(e) => setAccumulatedPoints(e.target.value)}
                            required
                        />
                    </div>
                    <div className={cx('image-upload')}>
                        <label htmlFor="voucherImage">Hình ảnh voucher:</label>
                        <input type="file" id="voucherImage" accept="image/*" onChange={handleImageChange} />
                        {imagePreview && <img className={cx('img-xemtrc')} src={imagePreview} alt="Xem trước" />}
                    </div>
                    <button className={cx('submit')} type="submit">
                        {editingVoucher ? 'Cập nhật' : 'Thêm'}
                    </button>
                </form>
            )}

            {loadingVouchers ? (
                <div>Đang tải danh sách...</div>
            ) : errorVouchers ? (
                <div>Lỗi: {errorVouchers}</div>
            ) : (
                <ItemVouchers
                    vouchers={vouchersList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}

export default Vouchers;
