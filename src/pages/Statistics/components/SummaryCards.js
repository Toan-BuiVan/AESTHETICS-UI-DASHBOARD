import React from 'react';
import styles from './SummaryCards.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faDollarSign,
    faShoppingCart,
    faUser,
    faComments,
    faStar,
    faTicketAlt,
} from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function SummaryCards({ data }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const cards = [
        {
            title: 'Doanh Thu Tổng',
            value: formatCurrency(data.totalRevenue || 0),
            icon: faDollarSign,
            color: 'primary',
        },
        {
            title: 'Tổng Hóa Đơn',
            value: (data.totalInvoices || 0).toLocaleString('vi-VN'),
            icon: faShoppingCart,
            color: 'secondary',
        },
        {
            title: 'Khách Hàng',
            value: (data.totalCustomers || 0).toLocaleString('vi-VN'),
            icon: faUser,
            color: 'tertiary',
        },
        {
            title: 'Sản Phẩm Bán',
            value: (data.totalProductsSold || 0).toLocaleString('vi-VN'),
            icon: faShoppingCart,
            color: 'quaternary',
        },
        {
            title: 'Mã Giảm Giá',
            value: (data.totalVouchersUsed || 0).toLocaleString('vi-VN'),
            icon: faTicketAlt,
            color: 'quinary',
        },
        {
            title: 'Đánh Giá Trung Bình',
            value: (data.averageRating || 0).toFixed(1),
            icon: faStar,
            color: 'senary',
        },
    ];

    return (
        <div className={cx('cards-grid')}>
            {cards.map((card, index) => (
                <div key={index} className={cx('card', `card-${card.color}`)}>
                    <div className={cx('card-icon')}>
                        <FontAwesomeIcon icon={card.icon} />
                    </div>
                    <div className={cx('card-content')}>
                        <p className={cx('card-label')}>{card.title}</p>
                        <p className={cx('card-value')}>{card.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SummaryCards;
