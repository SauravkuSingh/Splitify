import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const BalanceCard = ({ balanceData }) => {
  const { user, balance } = balanceData;

  const isPositive = balance > 0;
  const isZero = balance === 0;

  return (
    <Card className={`rounded-2xl p-5 border transition-all group overflow-hidden relative shadow-sm ${
      isZero
        ? 'bg-gray-50/50 border-gray-100 opacity-60'
        : isPositive
        ? 'bg-white border-green-100'
        : 'bg-white border-primary/10'
    }`}>
      <div className="flex items-center justify-between relative z-10">
        {/* User info */}
        <div className="flex items-center gap-4">
          <Avatar className={`w-10 h-10 border-2 border-white shadow-sm transition-all duration-300 group-hover:scale-105`}>
            <AvatarFallback className={`font-bold text-xs ${
              isZero ? 'bg-gray-200 text-gray-600'
              : isPositive ? 'bg-green-50 text-green-600'
              : 'bg-orange-50 text-primary'
            }`}>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">{user.name}</p>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest mt-1 ${
              isZero ? 'bg-gray-100 text-muted-foreground'
              : isPositive ? 'bg-green-100 text-green-600'
              : 'bg-primary/10 text-primary'
            }`}>
              {isZero ? 'Settled Up' : isPositive ? 'Gets Back' : 'Owes Total'}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className={`text-lg font-black tracking-tight transition-all duration-300 group-hover:scale-105 ${
            isZero ? 'text-muted-foreground'
            : isPositive ? 'text-green-600'
            : 'text-primary'
          }`}>
            {isZero ? '₹0' : `${isPositive ? '+' : '-'}₹${Math.abs(balance).toLocaleString()}`}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BalanceCard;