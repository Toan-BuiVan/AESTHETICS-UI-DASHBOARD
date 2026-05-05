import React from 'react';
import styles from './TopVouchersTable.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function TopVouchersTable({ data, isLoading }) {
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
                        <th>Mã Giảm Giá</th>
                        <th className={cx('right')}>Lần Sử Dụng</th>
                        <th className={cx('right')}>Giá Trị Giảm</th>
                        <th className={cx('right')}>Tổng Giảm Giá</th>
                        <th className={cx('right')}>Giảm Giá Trung Bình</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((voucher, index) => (
                        <tr key={voucher.voucherId} className={cx('row')}>
                            <td className={cx('index')}>{index + 1}</td>
                            <td>
                                <span className={cx('voucher-code')}>{voucher.voucherCode}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('badge')}>{voucher.usageCount}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('discount-value')}>{voucher.discountValue}%</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('currency')}>{formatCurrency(voucher.totalDiscount)}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('currency', 'average')}>
                                    {formatCurrency(voucher.averageDiscount)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TopVouchersTable;
