import * as React from 'react';

import Popover from '@material-ui/core/Popover';
import WarningIcon from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';
import {useState} from 'react';
import {
    createStyles, IconButton, Theme, withStyles,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import axios from 'axios';
import {connect} from 'react-redux';
import {getCookie} from '../../utils/generic';
import {useAsyncRequest, useEffectOnMount} from '../../utils/hooks';
import {MapContainer} from '../../utils/mapBuilder';

const jss = (theme: Eventkit.Theme & Theme) => createStyles({
    popoverBlock: {
        display: 'flex',
        height: '35px',
        color: 'primary',
        borderRadius: '0px',
        borderTop: '1px solid rgb(128, 128, 128)',
        position: 'sticky',
        bottom: 0,
        backgroundColor: theme.eventkit.colors.white,
    },
    warningIconBtn: {
        padding: '8px',
        color: theme.eventkit.colors.running,
        '&:hover': {
            backgroundColor: theme.eventkit.colors.white,
        },
    },
    title: {
        color: theme.eventkit.colors.primary,
        paddingLeft: '5px',
        paddingTop: '9px',
        fontWeight: 600,
    },
    iconBtn: {
        float: 'right',
        '&:hover': {
            backgroundColor: theme.eventkit.colors.white,
        },
    },
});

interface Props extends React.HTMLAttributes<HTMLElement> {
    classes: { [className: string]: string };
}

export function UnavailableFilterPopup(props: Props) {
    const [anchorElement, setAnchor] = useState(null);
    const {classes} = props;

    // const makePermissionsRequest = async () => {
    //     let responseData;
    //     return axios({
    //         url: '/api/providers',
    //         method: 'get',
    //     }).then((response) => {
    //         if (Object.entries(response.data).length === 0) {
    //             responseData = 'No data providers found.';
    //             return responseData;
    //         }
    //         const providers = response.data;
    //         providers.forEach((provider) => {
    //             if (provider.hidden) {
    //                 this.setState({ showPermissionsBanner: true, isOpen: true });
    //             }
    //         });
    //     }).catch((e) => {
    //         console.log(e);
    //     });
    // };
    //
    // useEffectOnMount(() => {
    //     makePermissionsRequest();
    // });

    const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchor(e.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchor(null);
    };

    // const handleErrorMessage = (response) => {
    //     const { data = {errors: []} } = !!response ? response.response : {};
    //     return (
    //         data.errors.map((error, ix) => (
    //             <span key={ix} title={error.title}>
    //                 {error.title}
    //             </span>
    //         ))
    //     )
    // }

    // const style = {
    //     base: {
    //         ...props.baseStyle,
    //     },
    //     icon: {
    //         verticalAlign: 'top',
    //         ...props.iconStyle,
    //     },
    // };

    const openEl = Boolean(anchorElement);
    return (
        <div className={classes.popoverBlock}>
            <IconButton
                className={classes.warningIconBtn}
                onClick={handlePopoverOpen}
            >
                <WarningIcon/>
            </IconButton>
            <span>
                <Typography variant="h6" gutterBottom className={classes.title}>
                    Some sources are unavailable
                </Typography>
            </span>
            <Popover
                // id={id}
                PaperProps={{
                    style: {padding: '16px', width: '30%'},
                }}
                open={openEl}
                anchorEl={anchorElement}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <div>
                    <IconButton
                        className={classes.iconBtn}
                        type="button"
                        onClick={handlePopoverClose}
                    >
                        <CloseIcon/>
                    </IconButton>
                    <div>
                        Some filters are unavailable due to user permissions. If you believe this is an error,
                        contact your administrator.
                    </div>
                </div>
            </Popover>
        </div>
    );
}

export default withStyles(jss)(UnavailableFilterPopup);
