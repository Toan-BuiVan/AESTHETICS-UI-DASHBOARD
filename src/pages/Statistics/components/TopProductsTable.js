import React from 'react';
import styles from './TopProductsTable.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function TopProductsTable({ data, isLoading }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (isLoading) {
        return <div className={cx('loading')}>Đang tải dữ liệu...</div>;
    }

    if (!data || data.length === 0) {
        return <div className={cx('empty')}>Không có dữ liệu</div>;
    }

    return (
        <div className={cx('table-wrapper')}>
            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên Sản Phẩm</th>
                        <th className={cx('right')}>Số Lượng Bán</th>
                        <th className={cx('right')}>Giá Bán</th>
                        <th className={cx('right')}>Giá Vốn</th>
                        <th className={cx('right')}>Lợi Nhuận</th>
                        <th className={cx('right')}>Tỷ Suất (%)</th>
                        <th className={cx('center')}>Đánh Giá</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((product, index) => (
                        <tr key={product.productId} className={cx('row')}>
                            <td className={cx('index')}>{index + 1}</td>
                            <td className={cx('product-name')}>{product.productName}</td>
                            <td className={cx('right')}>
                                <span className={cx('badge')}>{product.quantitySold}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('currency')}>{formatCurrency(product.sellingPrice)}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('currency', 'cost')}>{formatCurrency(product.costPrice)}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('currency', 'profit')}>{formatCurrency(product.profit)}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('percentage')}>{product.profitMargin?.toFixed(2)}%</span>
                            </td>
                            <td className={cx('center')}>
                                <span className={cx('rating')}>
                                    {product.averageRating?.toFixed(1)} ⭐ ({product.ratingCount})
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TopProductsTable;
