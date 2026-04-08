import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Defaultlayout.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Defaultlayout({ children }) {
    return (
        <div className={cx('wrapper')}>
            {/* <Header /> */}
            <div className={cx('container')}>
                <Sidebar />
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

export default Defaultlayout;
