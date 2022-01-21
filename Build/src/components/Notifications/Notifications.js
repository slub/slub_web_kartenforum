/**
 * Created by jacob.mendt@pikobytes.de on 22.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";

import { notificationState } from "../../atoms/atoms";
import { usePrevious } from "../../util/hooks";
import clsx from "clsx";
import "./Notifications.scss";

const NotificationItem = (props) => {
    const { onClose, text, type } = props;
    return (
        <div className="notification-item">
            <div className={clsx("alert", "alert-" + type)} role="alert">
                <div className="close">
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="text">{text}</div>
            </div>
        </div>
    );
};

NotificationItem.propTypes = {
    onClose: PropTypes.func,
    text: PropTypes.string,
    type: PropTypes.string,
};

/**
 * @returns {JSX.Element}
 * @constructor
 */
export const Notifications = () => {
    const notification = useRecoilValue(notificationState);
    const previousNotification = usePrevious(notification);
    const [notificationStack, setNotificationStack] = useState([]);

    useEffect(() => {
        if (
            notification !== null &&
            notification.id !== null &&
            JSON.stringify(notification) !==
                JSON.stringify(previousNotification)
        ) {
            const newNotificationStack = [...notificationStack];

            const notificationIndex = notificationStack.findIndex(
                (o) => o.id === notification.id
            );

            if (notificationIndex > -1) {
                newNotificationStack.splice(
                    notificationIndex,
                    1,
                    // delete or replace, depending on notification text
                    notification.text !== null ? notification : undefined
                );
            } else {
                // add new notification
                newNotificationStack.splice(0, 0, notification);
            }

            setNotificationStack(newNotificationStack);
        }
    }, [notification, notificationStack, previousNotification]);

    return (
        <div
            className={clsx(
                "vkf-notifications",
                notificationStack.length === 0 ? "hide" : ""
            )}
        >
            {notificationStack.map(({ type, text }, index) => (
                <NotificationItem
                    key={index}
                    onClose={() => {
                        const newNotificationStack = [...notificationStack];
                        newNotificationStack.splice(index, 1);
                        setNotificationStack(newNotificationStack);
                    }}
                    type={type}
                    text={text}
                />
            ))}
        </div>
    );
};

export default Notifications;
