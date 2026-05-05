import React, { useState } from 'react';
import styles from './SectionFilter.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faFilter, faSync } from '@fortawesome/free-solid-svg-icons';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const cx = classNames.bind(styles);

/**
 * Reusable section filter component
 * @param {Function} onFilter - Callback khi user click "Cập nhật" với {startDate, endDate, topCount}
 * @param {Boolean} isLoading - Show loading state
 * @param {Object} defaultValues - Default values {startDate, endDate, topCount}
 */
function SectionFilter({ onFilter, isLoading, defaultValues = {} }) {
    const [localStartDate, setLocalStartDate] = useState(defaultValues.startDate || null);
    const [localEndDate, setLocalEndDate] = useState(defaultValues.endDate || null);
    const [localTopCount, setLocalTopCount] = useState(defaultValues.topCount || 10);

    const handleUpdate = () => {
        if (localStartDate && localEndDate) {
            onFilter({
                startDate: localStartDate,
                endDate: localEndDate,
                topCount: localTopCount,
            });
        }
    };

    const handleReset = () => {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        setLocalStartDate(startDate);
        setLocalEndDate(endDate);
        setLocalTopCount(10);
    };

    return (
        <div className={cx('filter-wrapper')}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className={cx('filter-group')}>
                    <div className={cx('filter-item')}>
                        <label className={cx('filter-label')}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            Từ Ngày
                        </label>
                        <DatePicker
                            value={localStartDate}
                            onChange={setLocalStartDate}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    className: cx('date-input'),
                                },
                            }}
                        />
                    </div>

                    <div className={cx('filter-item')}>
                        <label className={cx('filter-label')}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            Đến Ngày
                        </label>
                        <DatePicker
                            value={localEndDate}
                            onChange={setLocalEndDate}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    className: cx('date-input'),
                                },
                            }}
                        />
                    </div>

                    <div className={cx('filter-item')}>
                        <label className={cx('filter-label')}>
                            <FontAwesomeIcon icon={faFilter} />
                            Số Lượng
                        </label>
                        <input
                            type="number"
                            className={cx('number-input')}
                            value={localTopCount}
                            onChange={(e) => setLocalTopCount(parseInt(e.target.value) || 10)}
                            min="1"
                            max="100"
                        />
                    </div>

                    <div className={cx('filter-actions')}>
                        <button
                            className={cx('btn-update', { loading: isLoading })}
                            onClick={handleUpdate}
                            disabled={isLoading}
                        >
                            <FontAwesomeIcon icon={faSync} className={cx({ spinning: isLoading })} />
                            <span>{isLoading ? 'Đang cập nhật...' : 'Cập nhật'}</span>
                        </button>
                        <button className={cx('btn-reset')} onClick={handleReset}>
                            Đặt Lại
                        </button>
                    </div>
                </div>
            </LocalizationProvider>
        </div>
    );
}

export default SectionFilter;
