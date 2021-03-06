import styles from './navigator.module.css';
import Link from 'next/link';

const PAGES = [
    {url: "/", title: "MAIN"},
    {url: "/history", title: "HISTORY"},
    {url: "/friends", title: "FRIENDS"},
];

export default function Navigator({subURL}) {
    return (<nav className={styles.navigator}>
        <div className={styles.leftGroup}>
            <Link href="/">
                <img src="/images/logo.png" alt="Logo" className={styles.logo75} />
            </Link>
        </div>
        <div className={styles.rightGroup}>
            <button onClick={OpenNav}><i className="fas fa-bars"></i></button>
            <ul id="navList">
                {
                    PAGES.map(data => (
                        <li key={data.url} onClick={(data.url === `/${subURL}`) ? CloseNav : null}>
                            <a href={data.url}>
                                {data.title}
                            </a>
                        </li>
                    ))
                }
                <li className={styles.close} onClick={CloseNav}><a href="#">CLOSE</a></li>
            </ul>
        </div>
    </nav>);
}

function OpenNav(){
    let navList = document.querySelector("#navList");
    navList.classList.add(styles["display-flex"]);
}

function CloseNav(event){
    event.preventDefault();
    event.stopPropagation();

    let navList = document.querySelector("#navList");
    navList.classList.remove(styles["display-flex"]);
}