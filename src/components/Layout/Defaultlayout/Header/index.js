import styles from './Header.module.scss';
import classNames from 'classnames/bind';
import images from '~/images/Header/493909817_1392036171936406_6663987176294071202_n.jpg';

const cx = classNames.bind(styles);

function Header() {
    return (
        <header className={cx('wrapper')}>
            <div className={cx('content')}>
                <h1>Minh Anh Spa</h1>
                <div className={cx('content-tiltle')}>
                    <img className={cx('content-img')} src={images} />
                </div>
            </div>
        </header>
    );
}

export default Header;
