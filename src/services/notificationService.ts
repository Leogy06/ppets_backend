import Notification from "../models/notification.js";

export const addNotification = async (
  message: string,
  transc_id: number,
  sending_user: number
): Promise<void> => {
  try {
    await Notification.create({
      MESSAGE: message,
      BORROW_TRANSAC_ID: transc_id,
      SENDING_USER: sending_user,
    });

    console.log(
      `✅ Notification added: "${message}" (Transaction ID: ${transc_id})`
    );
  } catch (error) {
    console.error(
      `❌ Error adding notification (Transaction ID: ${transc_id}, User: ${sending_user}):`,
      error
    );
  }
};
