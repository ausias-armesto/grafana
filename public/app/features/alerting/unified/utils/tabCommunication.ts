import { useCallback, useEffect, useRef } from 'react';

export const ALERTING_CHANNEL_NAME = 'alerting';

export enum AlertingTabMessageTypes {
  AlertManagerUpdated = 'alertManagerUpdated',
  // Add more message types here
}

export interface AlertingMessage {
  type: AlertingTabMessageTypes;
  // add data here once we need to pass data in the message
}

/* Hook to subscribe to alerting broadcast channel with a particular message type
 * and execute a callback when a message is received
 * @params type: AlertingTabMessageTypes
 * @params onReceiveMessage: ()=> void
 * Usage:
 * useSubsribeTabCommunicationChannel(AlertingTabMessageTypes.AlertManagerUpdated, ()=> {
 *     console.log('AlertManagerUpdated');
 * });
 */

export const useSubsribeTabCommunicationChannel = (type: AlertingTabMessageTypes, onReceiveMessage: () => void) => {
  const alertingBroadcastChannelReceiverRef = useRef(new BroadcastChannel(ALERTING_CHANNEL_NAME));
  const alertingBroadcastChannelReceiver = alertingBroadcastChannelReceiverRef.current;
  useEffect(() => {
    const onMessage = (event: MessageEvent<AlertingMessage>) => {
      if (event.data.type === type) {
        onReceiveMessage();
      }
    };
    alertingBroadcastChannelReceiver.onmessage = onMessage;
  }, [onReceiveMessage, alertingBroadcastChannelReceiver, type]);
};

/* Hook that returns the method to post a message to the alerting broadcast channel
 * Usage:
 * const {postMessage} = useSendTabCommunicationChannel();
 * postMessage(AlertingTabMessageTypes.AlertManagerUpdated);
 */

export const useSendTabCommunicationChannel = () => {
  const alertingBroadcastChannelSenderRef = useRef(new BroadcastChannel(ALERTING_CHANNEL_NAME));
  const alertingBroadcastChannelSender = alertingBroadcastChannelSenderRef.current;

  const postMessage = useCallback(
    (type: AlertingTabMessageTypes) => {
      alertingBroadcastChannelSender.postMessage({ type });
    },
    [alertingBroadcastChannelSender]
  );

  return { postMessage };
};
