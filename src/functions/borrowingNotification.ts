export const handleMessageNotification = ({
  statusProcess,
  itemName,
  itemOwner,
  itemBorrower,
}: {
  statusProcess: number;
  itemName: string;
  itemOwner: string;
  itemBorrower: string;
}) => {
  switch (statusProcess) {
    case 1:
      return `Request Item ${itemName} has been APPROVED by ${itemOwner}`;

    case 2:
      return `${itemBorrower} is requesting ${itemName}`;

    case 3:
      return `Requested Item ${itemName} has been CANCELLED.`;

    case 4:
      return `Your Requested Item ${itemName} has been REJECTED`;
    default:
      return "Undefined message.";
  }
};

export const forUser = ({
  status_process,
  owner,
  borrower,
}: {
  status_process: number;
  owner: number;
  borrower: number;
}) => {
  switch (status_process) {
    case 1:
      return borrower;
    case 2:
      return owner;
    case 3:
      return borrower;
    case 4:
      return borrower;
    default:
      return 0;
  }
};
