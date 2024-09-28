interface ConfirmationParams {
    headerText: string;
    modalText: string;
    actionButtonText?: string;
    cancelButtonText?: string;
    actionButtonFunction: (confirmation?: boolean) => void;
    cancelButtonFunction: (confirmation?: boolean) => void;
}

export default ConfirmationParams;