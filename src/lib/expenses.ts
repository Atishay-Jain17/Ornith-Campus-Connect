export interface ParticipantBalance {
  userId: string;
  userName: string;
  totalPaid: number;
  sharedPaid: number;
  personalPaid: number;
  totalShare: number;
  netBalance: number; // positive = receives, negative = owes
}

export interface SettlementTransfer {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  payerId: string;
  payerName: string;
  amount: number;
  description: string;
  isShared: boolean;
  participants: {
    userId: string;
    userName: string;
    shareAmount: number;
  }[];
}

/**
 * Computes individual balances and minimal settlement transfers for a group plan.
 */
export function calculatePlanSettlement(
  members: { userId: string; userName: string }[],
  expenses: ExpenseItem[]
): {
  balances: ParticipantBalance[];
  settlements: SettlementTransfer[];
  totalPlanExpense: number;
  totalSharedExpense: number;
} {
  const memberMap = new Map<string, ParticipantBalance>();

  for (const m of members) {
    memberMap.set(m.userId, {
      userId: m.userId,
      userName: m.userName,
      totalPaid: 0,
      sharedPaid: 0,
      personalPaid: 0,
      totalShare: 0,
      netBalance: 0,
    });
  }

  let totalPlanExpense = 0;
  let totalSharedExpense = 0;

  for (const exp of expenses) {
    totalPlanExpense += exp.amount;
    if (exp.isShared) {
      totalSharedExpense += exp.amount;
    }

    // Payer record
    const payer = memberMap.get(exp.payerId);
    if (payer) {
      payer.totalPaid += exp.amount;
      if (exp.isShared) {
        payer.sharedPaid += exp.amount;
      } else {
        payer.personalPaid += exp.amount;
      }
    }

    // Shares
    for (const part of exp.participants) {
      const participant = memberMap.get(part.userId);
      if (participant) {
        participant.totalShare += part.shareAmount;
      }
    }
  }

  // Calculate Net Balances
  const balances: ParticipantBalance[] = [];
  for (const b of memberMap.values()) {
    b.netBalance = Math.round((b.totalPaid - b.totalShare) * 100) / 100;
    balances.push(b);
  }

  // Minimum Cash Flow Settlement Algorithm (Greedy debt cancellation)
  const debtors: { userId: string; name: string; amount: number }[] = [];
  const creditors: { userId: string; name: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.netBalance < -0.01) {
      debtors.push({ userId: b.userId, name: b.userName, amount: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.01) {
      creditors.push({ userId: b.userId, name: b.userName, amount: b.netBalance });
    }
  }

  const settlements: SettlementTransfer[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amountToSettle = Math.min(debtor.amount, creditor.amount);

    if (amountToSettle > 0.01) {
      settlements.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.name,
        toUserId: creditor.userId,
        toUserName: creditor.name,
        amount: Math.round(amountToSettle * 100) / 100,
      });
    }

    debtor.amount -= amountToSettle;
    creditor.amount -= amountToSettle;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return {
    balances,
    settlements,
    totalPlanExpense: Math.round(totalPlanExpense * 100) / 100,
    totalSharedExpense: Math.round(totalSharedExpense * 100) / 100,
  };
}
