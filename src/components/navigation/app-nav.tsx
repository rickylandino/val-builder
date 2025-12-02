import { Link, useLocation } from "react-router-dom";

export default function AppNav() {
    const location = useLocation();
    return (
        <nav className="flex gap-6 items-center">
            <Link
                to="/"
                className={`pb-1 font-semibold transition-colors border-b-2 ${location.pathname === '/' ? 'border-primary text-primary' : 'border-transparent text-gray-700 hover:text-primary hover:border-primary'}`}
            >
                Home
            </Link>
            <Link
                to="/management-panel"
                className={`pb-1 font-semibold transition-colors border-b-2 ${location.pathname === '/management-panel' ? 'border-primary text-primary' : 'border-transparent text-gray-700 hover:text-primary hover:border-primary'}`}
            >
                Management Panel
            </Link>
        </nav>
    );
}