import React, { useState } from 'react';
import styles from './ProductExamples.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';
import SuccessMessage from '~/components/Layout/Defaultlayout/SuccessMessage';

const cx = classNames.bind(styles);

function ProductExamples() {
    const [selectedCase, setSelectedCase] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');

    // Ví dụ các loại sản phẩm
    const productExamples = [
        {
            id: 1,
            title: 'CASE 1: Thêm Sản Phẩm Mỹ Phẩm - Kem Dưỡng Da',
            type: 'add',
            data: {
                serviceTypeId: 1,
                serviceTypeName: 'Mỹ phẩm',
                supplierId: 5,
                supplierName: 'Công ty TNHH Mỹ Phẩm Hàn Quốc',
                productName: 'Kem Dưỡng Da Ban Đêm - Collagen Plus',
                description:
                    'Kem dưỡng da ban đêm chứa collagen và vitamin E giúp phục hồi da, làm sáng mịn da, giảm nếp nhăn.',
                costPrice: 45000,
                sellingPrice: 85000,
                quantity: 150,
                unit: 'Hộp',
                minimumStock: 20,
                productImages: 'https://via.placeholder.com/300x300?text=Kem+Duong+Da',
            },
        },
        {
            id: 2,
            title: 'CASE 2: Thêm Sản Phẩm Dịch Vụ - Gói Chăm Sóc Tóc',
            type: 'add',
            data: {
                serviceTypeId: 2,
                serviceTypeName: 'Dịch vụ chăm sóc',
                supplierId: 3,
                supplierName: 'Hương Mỹ Hair',
                productName: 'Gói Massage Đầu + Chăm Sóc Tóc',
                description:
                    'Gói chăm sóc tóc trọn gói gồm massage đầu, là duỗi tóc, hấp dầu cao cấp. Thời gian: 60 phút.',
                costPrice: 120000,
                sellingPrice: 250000,
                quantity: 5,
                unit: 'Gói',
                minimumStock: 1,
                productImages: 'https://via.placeholder.com/300x300?text=Goi+Cham+Soc+Toc',
            },
        },
        {
            id: 3,
            title: 'CASE 3: Cập Nhật Sản Phẩm - Thay Đổi Giá và Số Lượng',
            type: 'update',
            data: {
                id: 10,
                serviceTypeId: 1,
                serviceTypeName: 'Mỹ phẩm',
                supplierId: 2,
                supplierName: 'Phân phối mỹ phẩm Amore',
                productName: 'Tinh Chất Chống Lão Hóa - Retinol Advanced',
                description:
                    'Tinh chất chống lão hóa với thành phần retinol giúp giảm nếp nhăn, tái tạo collagen tự nhiên.',
                costPrice: 55000,
                sellingPrice: 99000,
                quantity: 45,
                unit: 'Chai',
                minimumStock: 10,
                productImages: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...',
            },
        },
        {
            id: 4,
            title: 'CASE 4: Thêm Sản Phẩm Mới - Điều Trị Da Mụn',
            type: 'add',
            data: {
                serviceTypeId: 3,
                serviceTypeName: 'Điều trị da',
                supplierId: 7,
                supplierName: 'Dr. Skin Care',
                productName: 'Serum Điều Trị Mụn - Niacinamide 5%',
                description:
                    'Serum chuyên biệt cho da mụn với niacinamide 5%, giúp cấp ẩm, kiểm soát dầu, mờ vết thâm mụn.',
                costPrice: 65000,
                sellingPrice: 129000,
                quantity: 200,
                unit: 'Chai',
                minimumStock: 30,
                productImages: 'https://via.placeholder.com/300x300?text=Serum+Dieu+Tri+Mun',
            },
        },
        {
            id: 5,
            title: 'CASE 5: Cập Nhật Sản Phẩm - Hết Hàng Tạm Thời',
            type: 'update',
            data: {
                id: 8,
                serviceTypeId: 2,
                serviceTypeName: 'Dịch vụ',
                supplierId: 4,
                supplierName: 'Spa Thiên Thanh',
                productName: 'Dịch Vụ Tẩy Tế Bào Chết - Lactic Acid',
                description: 'Dịch vụ tẩy tế bào chết toàn thân bằng Lactic acid an toàn, giúp da mềm mại, trắng sáng.',
                costPrice: 50000,
                sellingPrice: 150000,
                quantity: 0,
                unit: 'Lần',
                minimumStock: 0,
                productImages: 'https://via.placeholder.com/300x300?text=Tay+Te+Bao+Chet',
            },
        },
    ];

    const handleViewCase = (caseItem) => {
        setSelectedCase(caseItem);
    };

    const handleCloseCase = () => {
        setSelectedCase(null);
    };

    const handleExecuteCase = (caseItem) => {
        const action = caseItem.type === 'add' ? 'thêm mới' : 'cập nhật';
        setMessage(`Ví dụ: ${action} sản phẩm "${caseItem.data.productName}" - Đây là ví dụ minh họa`);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 4000);
    };

    return (
        <div className={cx('wrapper')}>
            {showMessage && <SuccessMessage message={message} />}

            {/* Header */}
            <div className={cx('header')}>
                <div>
                    <h1>Ví Dụ Use Cases - Quản Lý Sản Phẩm</h1>
                    <p className={cx('subtitle')}>
                        Xem các ví dụ cụ thể về cách thêm mới hoặc cập nhật sản phẩm trong hệ thống
                    </p>
                </div>
            </div>

            {/* Cases Grid */}
            <div className={cx('cases-grid')}>
                {productExamples.map((caseItem) => (
                    <div key={caseItem.id} className={cx('case-card', caseItem.type)}>
                        <div className={cx('case-badge')}>
                            {caseItem.type === 'add' ? (
                                <>
                                    <FontAwesomeIcon icon={faPlus} /> THÊM MỚI
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faEdit} /> CẬP NHẬT
                                </>
                            )}
                        </div>
                        <h3>{caseItem.title}</h3>
                        <p className={cx('case-info')}>
                            <strong>Sản phẩm:</strong> {caseItem.data.productName}
                        </p>
                        <p className={cx('case-info')}>
                            <strong>Loại:</strong> {caseItem.data.serviceTypeName}
                        </p>
                        <p className={cx('case-info')}>
                            <strong>Nhà cung cấp:</strong> {caseItem.data.supplierName}
                        </p>
                        <div className={cx('case-actions')}>
                            <button className={cx('btn-view')} onClick={() => handleViewCase(caseItem)}>
                                Xem Chi Tiết
                            </button>
                            <button className={cx('btn-execute')} onClick={() => handleExecuteCase(caseItem)}>
                                <FontAwesomeIcon icon={faCheck} />
                                Thực Thi
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedCase && (
                <div className={cx('modal-overlay')} onClick={handleCloseCase}>
                    <div className={cx('modal-content')} onClick={(e) => e.stopPropagation()}>
                        <div className={cx('modal-header')}>
                            <h2>{selectedCase.type === 'add' ? '✚ THÊM PRODUCT' : '✎ CẬP NHẬT PRODUCT'}</h2>
                            <button className={cx('btn-close')} onClick={handleCloseCase}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className={cx('modal-body')}>
                            {/* Case Description */}
                            <div className={cx('section')}>
                                <h3 className={cx('section-title')}>📋 Mô Tả Use Case</h3>
                                <p className={cx('section-content')}>{selectedCase.title}</p>
                            </div>

                            {/* Form Data */}
                            <div className={cx('section')}>
                                <h3 className={cx('section-title')}>📝 Dữ Liệu Form</h3>
                                <div className={cx('data-grid')}>
                                    <div className={cx('data-item')}>
                                        <label>Tên Sản Phẩm:</label>
                                        <code>{selectedCase.data.productName}</code>
                                    </div>
                                    <div className={cx('data-item')}>
                                        <label>Loại Dịch Vụ:</label>
                                        <code>{selectedCase.data.serviceTypeName}</code>
                                    </div>
                                    <div className={cx('data-item')}>
                                        <label>Nhà Cung Cấp:</label>
                                        <code>{selectedCase.data.supplierName}</code>
                                    </div>
                                    <div className={cx('data-item')}>
                                        <label>Giá Vốn:</label>
                                        <code>{selectedCase.data.costPrice.toLocaleString('vi-VN')} ₫</code>
                                    </div>
                                    <div className={cx('data-item')}>
                                        <label>Giá Bán:</label>
                                        <code>{selectedCase.data.sellingPrice.toLocaleString('vi-VN')} ₫</code>
                                    </div>
                                    <div className={cx('data-item')}>
                                        <label>Số Lượng:</label>
                                        <code>{selectedCase.data.quantity}</code>
                                    </div>
                                    <div className={cx('data-item')}>
                                        <label>Đơn Vị:</label>
                                        <code>{selectedCase.data.unit}</code>
                                    </div>
                                    <div className={cx('data-item')}>
                                        <label>Tồn Kho Tối Thiểu:</label>
                                        <code>{selectedCase.data.minimumStock}</code>
                                    </div>
                                    {selectedCase.type === 'update' && (
                                        <div className={cx('data-item')}>
                                            <label>Product ID:</label>
                                            <code>{selectedCase.data.id}</code>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className={cx('section')}>
                                <h3 className={cx('section-title')}>📌 Mô Tả Sản Phẩm</h3>
                                <p className={cx('section-content')}>{selectedCase.data.description}</p>
                            </div>

                            {/* Request Payload */}
                            <div className={cx('section')}>
                                <h3 className={cx('section-title')}>🔧 API Request Payload</h3>
                                <pre className={cx('code-block')}>
                                    {JSON.stringify(
                                        selectedCase.type === 'add'
                                            ? {
                                                  serviceTypeId: selectedCase.data.serviceTypeId,
                                                  supplierId: selectedCase.data.supplierId,
                                                  productName: selectedCase.data.productName,
                                                  description: selectedCase.data.description,
                                                  costPrice: selectedCase.data.costPrice,
                                                  sellingPrice: selectedCase.data.sellingPrice,
                                                  quantity: selectedCase.data.quantity,
                                                  unit: selectedCase.data.unit,
                                                  minimumStock: selectedCase.data.minimumStock,
                                                  productImages: '[BASE64_IMAGE_DATA]',
                                              }
                                            : {
                                                  id: selectedCase.data.id,
                                                  serviceTypeId: selectedCase.data.serviceTypeId,
                                                  supplierId: selectedCase.data.supplierId,
                                                  productName: selectedCase.data.productName,
                                                  description: selectedCase.data.description,
                                                  costPrice: selectedCase.data.costPrice,
                                                  sellingPrice: selectedCase.data.sellingPrice,
                                                  quantity: selectedCase.data.quantity,
                                                  unit: selectedCase.data.unit,
                                                  minimumStock: selectedCase.data.minimumStock,
                                                  productImages: '[BASE64_IMAGE_DATA]',
                                                  status: 'active',
                                              },
                                        null,
                                        2,
                                    )}
                                </pre>
                            </div>

                            {/* Endpoint */}
                            <div className={cx('section')}>
                                <h3 className={cx('section-title')}>🌐 API Endpoint</h3>
                                <code className={cx('endpoint')}>
                                    POST http://localhost:5122/api/Product/
                                    {selectedCase.type === 'add' ? 'addproduct' : 'updateproduct'}
                                </code>
                            </div>

                            {/* Notes */}
                            <div className={cx('section', 'notes')}>
                                <h3 className={cx('section-title')}>💡 Ghi Chú Quan Trọng</h3>
                                <ul>
                                    <li>
                                        <strong>Hình ảnh:</strong> Phải được chuyển đổi thành base64 trước khi gửi
                                    </li>
                                    <li>
                                        <strong>Add Product:</strong> Không cần truyền ID, hệ thống sẽ tự tạo
                                    </li>
                                    <li>
                                        <strong>Update Product:</strong> Bắt buộc phải có ID và status='active'
                                    </li>
                                    <li>
                                        <strong>Validation:</strong> Các trường bắt buộc là productName, supplierId,
                                        serviceTypeId, sellingPrice
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className={cx('modal-footer')}>
                            <button className={cx('btn-close-modal')} onClick={handleCloseCase}>
                                Đóng
                            </button>
                            <button
                                className={cx('btn-execute-modal')}
                                onClick={() => {
                                    handleExecuteCase(selectedCase);
                                    handleCloseCase();
                                }}
                            >
                                Thực Thi Use Case
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductExamples;
