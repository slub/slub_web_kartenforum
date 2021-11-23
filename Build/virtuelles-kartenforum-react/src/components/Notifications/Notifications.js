/**
 * Created by jacob.mendt@pikobytes.de on 22.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { notificationState } from "../../atoms/atoms";
import { usePrevious } from "../../util/hooks";
import clsx from "clsx";
import "./Notifications.scss";

const NotificationItem = (props) => {
    const { type, text, onClose } = props;
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
            const notificationIndex = notificationStack.findIndex(
                (o) => o.id === notification.id
            );
            if (notification.text !== null && notificationIndex === -1) {
                // Add notification
                setNotificationStack([...notificationStack, notification]);
            } else if (notification.text !== null && notificationIndex > -1) {
                // Replace notification
                const newNotificationStack = [...notificationStack];
                newNotificationStack.splice(notificationIndex, 1, notification);
                setNotificationStack(newNotificationStack);
            } else if (notification.text === null && notificationIndex > -1) {
                // Remove notification
                const newNotificationStack = [...notificationStack];
                newNotificationStack.splice(notificationIndex, 1);
                setNotificationStack(newNotificationStack);
            }
        }
    }, [notification, notificationStack, setNotificationStack]);

    return (
        <div
            className={clsx(
                "vkf-notifications",
                notificationStack.length === 0 ? "hide" : ""
            )}
        >
            {notificationStack.map(({ type, text }, index) => (
                <NotificationItem
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
