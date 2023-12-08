import { ThreeDots } from 'react-loader-spinner'

export const LoadingIndicator = () => {
    return (
        <div
            style={{
                display: 'grid',
                placeItems: 'center',
            }}
        >
            <ThreeDots
                height="80"
                width="80"
                radius="9"
                color="#7B3FE4"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                visible={true}
            />
        </div>
    );
};