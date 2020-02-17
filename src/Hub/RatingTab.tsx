import * as React from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import {
    CommonServiceIds,
    IExtensionDataManager,
    IExtensionDataService
} from 'azure-devops-extension-api';

import { Button } from 'azure-devops-ui/Button';
import { TextField } from 'azure-devops-ui/TextField';
import { Toast } from 'azure-devops-ui/Toast';

import SliderInput from './SliderInput';

interface RatingTabState {
    carRating: CarRating;
    ready: boolean;
    isToastVisible: boolean;
    isToastFadingOut: boolean;
    message: string;
    toastTimeout?: number;
}

interface CarRating {
    id: string;
    speed: number;
    handling: number;
    looks: number;
}

const emptyRating = {
    id: '',
    speed: 0,
    handling: 0,
    looks: 0
};

export class RatingTab extends React.Component<{}, RatingTabState> {
    private _dataManager?: IExtensionDataManager;
    private toastRef: React.RefObject<Toast> = React.createRef<Toast>();

    constructor(props: {}) {
        super(props);
        this.state = {
            ready: true,
            isToastVisible: false,
            isToastFadingOut: false,
            message: '',
            carRating: emptyRating
        };
    }

    public componentDidMount() {
        this.initializeState();
    }

    public componentWillUnmount() {
        if (this.state.toastTimeout) {
            clearTimeout(this.state.toastTimeout);
        }
    }

    private async initializeState(): Promise<void> {
        await SDK.ready();
        const accessToken = await SDK.getAccessToken();
        const extDataService = await SDK.getService<IExtensionDataService>(
            CommonServiceIds.ExtensionDataService
        );
        this._dataManager = await extDataService.getExtensionDataManager(
            SDK.getExtensionContext().id,
            accessToken
        );
    }

    public render(): JSX.Element {
        const { ready, carRating } = this.state;

        return (
            <>
                <div className="page-content page-content-top flex-row rhythm-horizontal-16">
                    <TextField
                        value={carRating.id}
                        onChange={this.onNameChange}
                        disabled={!ready}
                        label={'Car model'}
                    />
                    <Button
                        text="Load"
                        onClick={this.onLoadData}
                        disabled={!ready}
                    />
                    <Button
                        text="New"
                        onClick={this.onNewRating}
                        disabled={!ready}
                    />
                    <Button
                        text="Save"
                        primary={true}
                        onClick={this.onSaveData}
                        disabled={!ready}
                    />
                    <Button
                        text="Delete All"
                        danger={true}
                        onClick={this.deleteAllRatings}
                        disabled={!ready}
                    />
                </div>
                <div className="page-content">
                    <SliderInput
                        name="speed"
                        label="Speed"
                        value={carRating.speed}
                        onChange={this.onSliderChange}
                        disabled={!ready}
                    ></SliderInput>
                    <SliderInput
                        name="handling"
                        label="Handling"
                        value={carRating.handling}
                        onChange={this.onSliderChange}
                        disabled={!ready}
                    ></SliderInput>
                    <SliderInput
                        name="looks"
                        label="Looks"
                        value={carRating.looks}
                        onChange={this.onSliderChange}
                        disabled={!ready}
                    ></SliderInput>
                </div>
                {this.state.isToastVisible && (
                    <Toast ref={this.toastRef} message={this.state.message} />
                )}
            </>
        );
    }

    private onNameChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        value: string
    ): void => {
        this.setState({
            carRating: {
                ...this.state.carRating,
                id: value
            }
        });
    };

    private onSliderChange = (name: string, value: string): void => {
        this.setState({
            carRating: {
                ...this.state.carRating,
                [name]: value
            }
        });
    };

    private onLoadData = (): void => {
        if (!this.state.carRating.id) {
            this.showMessage('Search query required.');

            this.setState({
                carRating: emptyRating
            });

            return;
        }

        this.setState({ ready: false });

        this._dataManager!.getDocument('ratings', this.state.carRating.id).then(
            data => {
                this.setState({
                    ready: true,
                    carRating: data
                });

                this.showMessage('Car rating loaded: ' + data.id);
            },
            () => {
                this.showMessage(
                    'Car rating not found: ' + this.state.carRating.id
                );

                this.setState({
                    ready: true
                });
            }
        );
    };

    private onNewRating = (): void => {
        this.setState({ carRating: emptyRating });

        this.showMessage('New car rating created.');
    };

    private onSaveData = (): void => {
        if (!this.state.carRating.id) {
            this.showMessage('Car name required.');

            return;
        }

        this.setState({ ready: false });

        this._dataManager!.setDocument('ratings', this.state.carRating)
            .then(() => {
                this.setState({
                    ready: true
                });
            })
            .catch(error => {
                console.log(error);
                this.setState({
                    ready: true
                });
            });

        this.showMessage('Car rating saved: ' + this.state.carRating.id);
    };

    private deleteAllRatings = (): void => {
        this._dataManager!.getDocument('ratings', '').then(documents => {
            documents.forEach((document: any) => {
                this._dataManager!.deleteDocument('ratings', document.id);
            });
        });

        this.setState({
            carRating: emptyRating
        });

        this.showMessage('Deleted all ratings.');
    };

    private showMessage = (message: string): void => {
        this.setState({
            message: message
        });

        if (this.state.isToastFadingOut || this.state.isToastVisible) {
            return;
        }

        this.setState({ isToastVisible: true });

        const toastTimeout = setTimeout(() => {
            this.setState({ isToastFadingOut: true });

            this.toastRef.current!.fadeOut().promise.then(() => {
                this.setState({
                    isToastVisible: false,
                    isToastFadingOut: false
                });
            });
        }, 2000);

        this.setState({
            toastTimeout
        });
    };
}
