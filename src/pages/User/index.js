import React, { useState, useEffect, useCallback } from 'react';
import styles from './User.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faSearch, faPenAlt } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';
import ItemUser from './ItemUser';
import { useDebounce } from '~/hooks';

const cx = classNames.bind(styles);

function User() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [typePerson, setTypePerson] = useState('');
    const [email, setEmail] = useState('');
    const [dateBirth, setDateBirth] = useState('');
    const [sex, setSex] = useState('');
    const [phone, setPhone] = useState('');
    const [addres, setAddres] = useState('');
    const [idCard, setIdCard] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [errorUsers, setErrorUsers] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [typePersons, setTypePersons] = useState([]);
    const [showRoleList, setShowRoleList] = useState(false);
    const [permissionData, setPermissionData] = useState([]);
    const [userPermissionData, setUserPermissionData] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [errorPermissions, setErrorPermissions] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [checkboxStates, setCheckboxStates] = useState({});
    const [initialCheckboxStates, setInitialCheckboxStates] = useState({});
    const [groupCheckboxStates, setGroupCheckboxStates] = useState({});
    const [originalTypePerson, setOriginalTypePerson] = useState('');
    const [displayUserID, setDisplayUserID] = useState('');
    const [displayUserName, setDisplayUserName] = useState('');

    const debouncedTypePerson = useDebounce(typePerson, 3000);

    const fetchTypePersons = useCallback(async () => {
        try {
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

            const response = await fetch('https://buitoandev.somee.com/api/Permission/GetListTyperson', {
                method: 'POST',
                headers,
            });

            if (!response.ok) throw new Error('Lỗi khi gọi API GetListTyperson');

            const result = await response.text();
            const parsed = JSON.parse(result);
            setTypePersons(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
            console.error('Lỗi fetch typePersons:', error);
            setTypePersons([]);
        }
    }, []);

    const handleSelectRole = (selectedRole) => {
        setTypePerson(selectedRole);
        setEditingUser((prev) => ({ ...prev, typePerson: selectedRole }));
        setShowRoleList(false);
        if (selectedRole !== originalTypePerson) {
            setDisplayUserName('');
            setDisplayUserID('');
        }
    };

    const fetchUsersList = useCallback(async (searchParams) => {
        try {
            setLoadingUsers(true);
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

            const response = await fetch('https://buitoandev.somee.com/api/Users/GetList_SearchUser', {
                method: 'POST',
                headers,
                body: JSON.stringify(searchParams),
            });

            if (!response.ok) throw new Error('Lỗi khi gọi API lấy danh sách người dùng');

            const data = await response.json();
            let proOf = [];
            if (Array.isArray(data)) {
                proOf = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                proOf = data.data;
            }
            setUsersList(proOf);
        } catch (error) {
            setErrorUsers(error.message);
            setUsersList([]);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    // Fetch full permissions from GroupByPermission
    const fetchGroupByPermission = useCallback(async (body = {}) => {
        try {
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

            const response = await fetch('https://buitoandev.somee.com/api/Permission/GroupByPermission', {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Lỗi khi gọi API GroupByPermission');

            const data = await response.json();
            return data.data_Permission || [];
        } catch (error) {
            console.error('Lỗi fetch GroupByPermission:', error);
            setErrorPermissions(error.message);
            return [];
        }
    }, []);

    // General fetch for permissions, can use userID or typePerson
    const fetchPermissions = useCallback(async (body) => {
        try {
            const deviceName = localStorage.getItem('deviceName') || '';
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const token = localStorage.getItem('token') || '';
            const currentUserID = localStorage.getItem('userID') || '';

            const headers = {
                'Content-Type': 'application/json',
                DeviceName: deviceName,
                RefreshToken: refreshToken,
                UserID: currentUserID,
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('https://buitoandev.somee.com/api/Permission/GetPermissionByUserID', {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Lỗi khi gọi API GetPermissionByUserID');

            const data = await response.json();
            return data.data_Permission || [];
        } catch (error) {
            console.error('Lỗi fetch permissions:', error);
            setErrorPermissions(error.message);
            return [];
        }
    }, []);

    // Load and process permissions when permission tab is active
    const loadPermissions = useCallback(async () => {
        setLoadingPermissions(true);
        setErrorPermissions(null); // Reset lỗi
        const fullPermissions = await fetchGroupByPermission();
        let userPermissions;
        if (displayUserID) {
            userPermissions = await fetchPermissions({ userID: editingUser.userID });
        } else {
            await fetchGroupByPermission({ typePerson });
            userPermissions = await fetchPermissions({ typePerson });
        }
        setPermissionData(fullPermissions);
        setUserPermissionData(userPermissions);

        // Khởi tạo expandedGroups với false
        setExpandedGroups(fullPermissions.reduce((acc, _, index) => ({ ...acc, [index]: false }), {}));

        // Khởi tạo checkboxStates cho endpoints và groupCheckboxStates dựa trên matching (match bằng funcitonID)
        const initialEndpointCheckboxes = {};
        const initialGroupCheckboxes = {};
        fullPermissions.forEach((fullGroup, groupIndex) => {
            let hasCheckedEndpoint = false;
            fullGroup.listFuncitons.forEach((fullEndpoint, endpointIndex) => {
                const key = `${groupIndex}_${endpointIndex}`;
                // Tìm matching group trong userPermissions
                const matchingUserGroup = userPermissions.find((ug) => ug.function === fullGroup.function);
                const matchingUserEndpoint = matchingUserGroup
                    ? matchingUserGroup.listFuncitons.find(
                          (uEndpoint) => uEndpoint.funcitonID === fullEndpoint.funcitonID,
                      )
                    : null;
                const isChecked = matchingUserEndpoint ? matchingUserEndpoint.status === 1 : false;
                initialEndpointCheckboxes[key] = isChecked;
                if (isChecked) hasCheckedEndpoint = true;
            });
            initialGroupCheckboxes[groupIndex] = hasCheckedEndpoint;
        });
        setCheckboxStates(initialEndpointCheckboxes);
        setInitialCheckboxStates(initialEndpointCheckboxes); // Lưu trạng thái ban đầu
        setGroupCheckboxStates(initialGroupCheckboxes);
        setLoadingPermissions(false);
    }, [editingUser, typePerson, displayUserID, fetchGroupByPermission, fetchPermissions]);

    const hasFetched = React.useRef(false);
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        const initialize = async () => {
            fetchUsersList({ userID: null });
        };
        initialize();
    }, [fetchUsersList]);

    useEffect(() => {
        if (activeTab === 'permission' && editingUser) {
            if (typePersons.length === 0) fetchTypePersons();
            loadPermissions();
        }
    }, [activeTab, typePersons.length, editingUser, fetchTypePersons, loadPermissions]);

    const handleSearch = () => {
        let searchParams = { userID: null };
        if (searchTerm) {
            const userId = parseInt(searchTerm, 10);
            if (!isNaN(userId)) {
                searchParams.userID = userId;
            } else {
                setSuccessMessage('Vui lòng nhập userID là số');
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 2000);
                return;
            }
        }
        fetchUsersList(searchParams);
    };

    const handleEdit = (userID) => {
        const userToEdit = usersList.find((user) => user.userID === userID);
        if (userToEdit) {
            setEditingUser(userToEdit);
            setUserName(userToEdit.userName || '');
            setDisplayUserName(userToEdit.userName || '');
            setDisplayUserID(userToEdit.userID || '');
            setEmail(userToEdit.email || '');
            setDateBirth(userToEdit.dateBirth ? userToEdit.dateBirth.split('T')[0] : '');
            setSex(userToEdit.sex || '');
            setPhone(userToEdit.phone || '');
            setAddres(userToEdit.addres || '');
            setIdCard(userToEdit.idCard || '');
            setReferralCode(userToEdit.referralCode || '');
            setTypePerson(userToEdit.typePerson || '');
            setOriginalTypePerson(userToEdit.typePerson || '');
            setPassword('');
            setActiveTab('info');
            setIsFormVisible(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Lấy typePerson của người dùng hiện tại từ localStorage
        const currentUserType = localStorage.getItem('typePerson');

        // Kiểm tra quyền khi chọn "Admin"
        if (typePerson === 'Admin' && currentUserType !== 'Admin') {
            setSuccessMessage('Bạn không có quyền tạo tài khoản Admin');
            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);
            return;
        }

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

        let formData;
        if (editingUser) {
            formData = {
                userID: editingUser.userID,
                userName,
                email,
                dateBirth,
                sex,
                phone,
                addres,
                idCard,
                referralCode: referralCode || null,
                typePerson,
            };
            if (password) formData.passWord = password;
        } else {
            formData = {
                userName,
                passWord: password,
                referralCode: referralCode || null,
                typePerson,
            };
        }

        try {
            const response = await fetch(
                editingUser
                    ? 'https://buitoandev.somee.com/api/Users/Update_User'
                    : 'https://buitoandev.somee.com/api/Users/Create_Account',
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
                setSuccessMessage(result.resposeMessage || 'Thao tác thất bại!');
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 2000);
            } else {
                setSuccessMessage(result.resposeMessage || 'Thao tác thành công!');
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 2000);

                if (editingUser) {
                    setUsersList(
                        usersList.map((user) => (user.userID === editingUser.userID ? { ...user, ...formData } : user)),
                    );
                } else {
                    fetchUsersList({ userID: null });
                }

                setUserName('');
                setPassword('');
                setReferralCode('');
                setTypePerson('');
                setEmail('');
                setDateBirth('');
                setSex('');
                setPhone('');
                setAddres('');
                setIdCard('');
                setEditingUser(null);

                setTimeout(() => {
                    setIsFormVisible(false);
                    setSuccessMessage('');
                }, 3500);
            }
        } catch (error) {
            setSuccessMessage('Có lỗi xảy ra: ' + error.message);
        }
    };

    const handleDelete = (userID) => {
        setUsersList(usersList.filter((user) => user.userID !== userID));
    };

    const handleDeleteSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        if (isFormVisible) {
            setEditingUser(null);
            setUserName('');
            setPassword('');
            setReferralCode('');
            setTypePerson('');
            setEmail('');
            setDateBirth('');
            setSex('');
            setPhone('');
            setAddres('');
            setIdCard('');
            setActiveTab('info');
        }
    };

    // Toggle expand group
    const toggleGroup = (index) => {
        setExpandedGroups((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    // Toggle endpoint checkbox
    const toggleEndpointCheckbox = (groupIndex, endpointIndex) => {
        const key = `${groupIndex}_${endpointIndex}`;
        setCheckboxStates((prev) => {
            const newState = { ...prev, [key]: !prev[key] };
            // Update group checkbox if any endpoint checked
            const groupEndpoints = permissionData[groupIndex].listFuncitons;
            const hasChecked = groupEndpoints.some((_, idx) => newState[`${groupIndex}_${idx}`]);
            setGroupCheckboxStates((prevGroup) => ({ ...prevGroup, [groupIndex]: hasChecked }));
            return newState;
        });
    };

    // Toggle group checkbox (check all endpoints in group)
    const toggleGroupCheckbox = (groupIndex) => {
        const isChecked = !groupCheckboxStates[groupIndex];
        setGroupCheckboxStates((prev) => ({ ...prev, [groupIndex]: isChecked }));
        // Update all endpoints
        const updatedCheckboxes = { ...checkboxStates };
        permissionData[groupIndex].listFuncitons.forEach((_, endpointIndex) => {
            updatedCheckboxes[`${groupIndex}_${endpointIndex}`] = isChecked;
        });
        setCheckboxStates(updatedCheckboxes);
    };

    // Hàm xử lý cập nhật quyền
    const handleUpdatePermissions = async () => {
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

        const isEmptyDisplay = !displayUserID && !displayUserName;

        try {
            let allSuccess = true;
            let hasChanges = false;
            let lastMessage = '';

            for (let groupIndex = 0; groupIndex < permissionData.length; groupIndex++) {
                const group = permissionData[groupIndex];
                for (let endpointIndex = 0; endpointIndex < group.listFuncitons.length; endpointIndex++) {
                    const key = `${groupIndex}_${endpointIndex}`;
                    if (checkboxStates[key] !== initialCheckboxStates[key]) {
                        hasChanges = true;
                        const endpoint = group.listFuncitons[endpointIndex];
                        const functionID = endpoint.funcitonID;
                        const status = checkboxStates[key] ? 1 : 0;

                        let body;
                        if (isEmptyDisplay) {
                            body = {
                                functionID: functionID,
                                status,
                                typePerson,
                            };
                        } else {
                            body = {
                                userID: displayUserID,
                                functionID: functionID,
                                status,
                                typePerson,
                            };
                        }

                        const response = await fetch('https://buitoandev.somee.com/api/Permission/Update_Permission', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(body),
                        });

                        const newAccessToken = response.headers.get('New-AccessToken');
                        const newRefreshToken = response.headers.get('New-RefreshToken');
                        if (newAccessToken) localStorage.setItem('token', newAccessToken);
                        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                        const data = await response.json();
                        lastMessage = data.resposeMessage || 'Không có thông báo từ API';

                        if (!response.ok) {
                            allSuccess = false;
                            console.error(
                                'Lỗi cập nhật permission cho functionID:',
                                functionID,
                                ' - Message:',
                                lastMessage,
                            );
                        }
                    }
                }
            }
            if (!hasChanges) {
                setSuccessMessage('Không có thay đổi để cập nhật.');
            } else if (allSuccess) {
                setSuccessMessage(lastMessage || 'Cập nhật thành công.');
            } else {
                setSuccessMessage(lastMessage || 'Có lỗi trong quá trình cập nhật.');
            }

            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);

            if (allSuccess && hasChanges) {
                setInitialCheckboxStates({ ...checkboxStates });
            }
            loadPermissions();
        } catch (error) {
            setSuccessMessage('Có lỗi xảy ra: ' + error.message);
            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);
        }
    };

    return (
        <div className={cx('wrapper')}>
            {successMessage && <SuccessMessage message={successMessage} />}
            <div className={cx('header')}>
                <h1>Người Dùng</h1>
                <div className={cx('search-container')}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                <form className={cx('form-content', { large: !!editingUser })} onSubmit={handleSubmit}>
                    <div className={cx('form-header')}>
                        <FontAwesomeIcon icon={faTimes} className={cx('close-icon')} onClick={toggleFormVisibility} />
                    </div>
                    {!editingUser && (
                        <>
                            <div>
                                <label htmlFor="userName">Tên người dùng:</label>
                                <input
                                    type="text"
                                    id="userName"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password">Mật khẩu:</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="referralCode">Mã giới thiệu:</label>
                                <input
                                    type="text"
                                    id="referralCode"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="typePerson">Loại người dùng:</label>
                                <select
                                    id="typePerson"
                                    value={typePerson}
                                    onChange={(e) => setTypePerson(e.target.value)}
                                    required
                                >
                                    <option value="">Chọn loại người dùng</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Customer">Customer</option>
                                </select>
                            </div>
                            <button className={cx('submit')} type="submit">
                                Thêm
                            </button>
                        </>
                    )}
                    {editingUser && (
                        <>
                            <div className={cx('tabs')}>
                                <button
                                    type="button"
                                    className={cx('tab-button', { active: activeTab === 'info' })}
                                    onClick={() => setActiveTab('info')}
                                >
                                    Thông tin
                                </button>
                                <button
                                    type="button"
                                    className={cx('tab-button', { active: activeTab === 'permission' })}
                                    onClick={() => setActiveTab('permission')}
                                >
                                    Phân quyền
                                </button>
                            </div>
                            <div className={cx('tab-content')}>
                                {activeTab === 'info' && (
                                    <div className={cx('info-section')}>
                                        <h3>Thông tin người dùng</h3>
                                        <div>
                                            <label htmlFor="userID">Mã người dùng:</label>
                                            <input type="text" id="userID" value={editingUser.userID} disabled />
                                        </div>
                                        <div>
                                            <label htmlFor="userName">Tên người dùng:</label>
                                            <input
                                                type="text"
                                                id="userName"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email">Email:</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="dateBirth">Ngày sinh:</label>
                                            <input
                                                type="date"
                                                id="dateBirth"
                                                value={dateBirth}
                                                onChange={(e) => setDateBirth(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="sex">Giới tính:</label>
                                            <input
                                                type="text"
                                                id="sex"
                                                value={sex}
                                                onChange={(e) => setSex(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone">Số điện thoại:</label>
                                            <input
                                                type="text"
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="addres">Địa chỉ:</label>
                                            <input
                                                type="text"
                                                id="addres"
                                                value={addres}
                                                onChange={(e) => setAddres(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="idCard">CMND/CCCD:</label>
                                            <input
                                                type="text"
                                                id="idCard"
                                                value={idCard}
                                                onChange={(e) => setIdCard(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="referralCode">Mã giới thiệu:</label>
                                            <input
                                                type="text"
                                                id="referralCode"
                                                value={referralCode}
                                                onChange={(e) => setReferralCode(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="typePerson">Loại người dùng:</label>
                                            <select
                                                id="typePerson"
                                                value={typePerson}
                                                onChange={(e) => setTypePerson(e.target.value)}
                                                disabled
                                            >
                                                <option value="">Chọn loại người dùng</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Doctor">Doctor</option>
                                                <option value="Employee">Employee</option>
                                                <option value="Customer">Customer</option>
                                            </select>
                                        </div>
                                        <button className={cx('submit')} type="submit">
                                            Cập nhật
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'permission' && (
                                    <div className={cx('menu-tab')}>
                                        <div className={cx('permission-section')}>
                                            <div
                                                className={cx('tab-permisstion')}
                                                style={{ cursor: 'pointer', color: '#fff' }}
                                                onClick={() => setActiveTab('info')}
                                            >
                                                Mã Người Dùng: {displayUserID} - Tên Người Dùng: {displayUserName}{' '}
                                                <div className={cx('menu-title')} onClick={(e) => e.stopPropagation()}>
                                                    {typePersons.length > 0
                                                        ? (() => {
                                                              const matchedTypes = typePersons.filter(
                                                                  (tp) => tp === editingUser.typePerson,
                                                              );
                                                              if (matchedTypes.length > 0) {
                                                                  return `Vai trò: ${matchedTypes.join(', ')}`;
                                                              } else {
                                                                  return `Vai trò: ${editingUser.typePerson} (Không trùng trong list)`;
                                                              }
                                                          })()
                                                        : 'Đang tải vai trò...'}
                                                    {showRoleList && (
                                                        <div className={cx('role-dropdown', { visible: showRoleList })}>
                                                            <ul>
                                                                {typePersons.map((tp) => (
                                                                    <li
                                                                        key={tp}
                                                                        onClick={() => handleSelectRole(tp)}
                                                                        className={cx({
                                                                            selected: tp === typePerson,
                                                                        })}
                                                                    >
                                                                        {tp}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                                <div
                                                    className={cx('menu-actions')}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPenAlt}
                                                        className={cx('action-icon')}
                                                        onClick={() => setShowRoleList(!showRoleList)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cx('permission-menu')}>
                                            {loadingPermissions ? (
                                                <div>Đang tải dữ liệu phân quyền...</div>
                                            ) : errorPermissions ? (
                                                <div>Lỗi: {errorPermissions}</div>
                                            ) : (
                                                <>
                                                    {permissionData.map((group, groupIndex) => (
                                                        <div key={groupIndex} className={cx('permission-group')}>
                                                            <div className={cx('group-header')}>
                                                                <label
                                                                    className={cx('radio-label')}
                                                                    htmlFor={`group_${groupIndex}`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`group_${groupIndex}`}
                                                                        checked={
                                                                            groupCheckboxStates[groupIndex] || false
                                                                        }
                                                                        onChange={() => toggleGroupCheckbox(groupIndex)}
                                                                    />
                                                                    <span className={cx('radio-checkmark')}></span>
                                                                    <h4 onClick={() => toggleGroup(groupIndex)}>
                                                                        {group.function}
                                                                    </h4>
                                                                </label>
                                                                <span onClick={() => toggleGroup(groupIndex)}>
                                                                    {expandedGroups[groupIndex] ? '-' : '+'}
                                                                </span>
                                                            </div>
                                                            {expandedGroups[groupIndex] && (
                                                                <ul className={cx('endpoint-list', 'radio-group')}>
                                                                    {group.listFuncitons.map(
                                                                        (endpoint, endpointIndex) => {
                                                                            const key = `${groupIndex}_${endpointIndex}`;
                                                                            const isChecked = checkboxStates[key];
                                                                            return (
                                                                                <li key={endpointIndex}>
                                                                                    <label
                                                                                        className={cx('radio-label')}
                                                                                        htmlFor={key}
                                                                                    >
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            id={key}
                                                                                            checked={isChecked}
                                                                                            onChange={() =>
                                                                                                toggleEndpointCheckbox(
                                                                                                    groupIndex,
                                                                                                    endpointIndex,
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                        <span
                                                                                            className={cx(
                                                                                                'radio-checkmark',
                                                                                            )}
                                                                                        ></span>
                                                                                        {endpoint.funcitonID}:{' '}
                                                                                        {endpoint.funcionName}
                                                                                    </label>
                                                                                </li>
                                                                            );
                                                                        },
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        className={cx('submit')}
                                                        type="button"
                                                        onClick={handleUpdatePermissions}
                                                        style={{ marginTop: '20px', width: '100%' }}
                                                    >
                                                        Cập nhật
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </form>
            )}

            {loadingUsers ? (
                <div>Đang tải danh sách người dùng...</div>
            ) : errorUsers ? (
                <div>Lỗi: {errorUsers}</div>
            ) : (
                <ItemUser
                    users={usersList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
}

export default User;
