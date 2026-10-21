import amsLogo from '../../images/ams-logo.png';

export default function AppLogo() {
    return (
        <>
            <img
                src={amsLogo}
                alt="AMS logo"
                className="size-9 shrink-0 object-contain"
            />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate text-base leading-tight font-semibold tracking-tight">
                    Army Medical School
                </span>
            </div>
        </>
    );
}