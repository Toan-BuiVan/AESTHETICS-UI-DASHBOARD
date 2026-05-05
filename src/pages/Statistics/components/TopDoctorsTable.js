import React from 'react';
import styles from './TopDoctorsTable.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function TopDoctorsTable({ data, isLoading }) {
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
                        <th>Họ Tên</th>
                        <th>Chuyên Khoa</th>
                        <th className={cx('right')}>Lịch Hẹn</th>
                        <th className={cx('right')}>Doanh Thu Dịch Vụ</th>
                        <th className={cx('right')}>Hoa Hồng</th>
                        <th className={cx('right')}>Thưởng</th>
                        <th className={cx('right')}>Điểm KPI</th>
                        <th className={cx('center')}>Đánh Giá</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((doctor, index) => (
                        <tr key={doctor.staffId} className={cx('row')}>
                            <td className={cx('index')}>{index + 1}</td>
                            <td className={cx('name')}>
                                <div className={cx('staff-info')}>
                                    <span className={cx('staff-name')}>{doctor.fullName}</span>
                                    {doctor.email && <span className={cx('email')}>{doctor.email}</span>}
                                </div>
                            </td>
                            <td>
                                <span className={cx('specialization')}>{doctor.specialization || 'N/A'}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('badge', 'appointment')}>{doctor.appointmentCount}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('currency')}>{formatCurrency(doctor.totalServiceRevenue)}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('currency', 'commission')}>
                                    {formatCurrency(doctor.totalCommission)}
                                </span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('currency', 'bonus')}>{formatCurrency(doctor.totalBonus)}</span>
                            </td>
                            <td className={cx('right')}>
                                <span className={cx('kpi-score', { active: doctor.kpiScore > 0 })}>
                                    {doctor.kpiScore?.toFixed(2)}
                                </span>
                            </td>
                            <td className={cx('center')}>
                                <span className={cx('rating')}>{doctor.averageRating?.toFixed(1)} ⭐</span>
                                <span className={cx('rating-count')}>({doctor.ratingCount})</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TopDoctorsTable;
