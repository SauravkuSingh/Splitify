import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categoryIcons = {
  food: '🍔', travel: '✈️', accommodation: '🏨',
  entertainment: '🎬', shopping: '🛍️', utilities: '💡',
  medical: '💊', other: '📦',
};

const ExpenseCard = ({ expense, currentUserId }) => {
  const isPaidByMe = expense.paidBy?._id === currentUserId;
  const myShare = expense.splitBetween?.find(s => s.user?._id === currentUserId)?.share || 0;

  return (
    <Card className="bg-white rounded-2xl border-gray-100 p-6 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
        {/* Left — icon + info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-gray-100/50 group-hover:scale-105 transition-all duration-300">
            {categoryIcons[expense.category] || '📦'}
          </div>
          <div>
            <h4 className="font-bold text-foreground text-base tracking-tight mb-1">{expense.title}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full bg-white border-gray-100 text-[8px] font-bold uppercase tracking-widest px-2 py-0">
                {expense.category}
              </Badge>
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <p className="text-[10px] text-muted-foreground font-medium">
                Paid by{' '}
                <span className="text-foreground font-bold">
                  {isPaidByMe ? 'You' : expense.paidBy?.name?.split(' ')[0]}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right — amounts */}
        <div className="text-left sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
          <p className="font-black text-foreground text-xl tracking-tight">₹{expense.amount.toLocaleString()}</p>
          {myShare > 0 && (
            <Badge 
              variant="secondary" 
              className={`mt-1 rounded-full px-2 py-0 border-none font-bold text-[8px] uppercase tracking-widest ${
                isPaidByMe 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {isPaidByMe
                ? `You lent ₹${(expense.amount - myShare).toFixed(0)}`
                : `You owe ₹${myShare.toFixed(0)}`
              }
            </Badge>
          )}
        </div>
      </div>

      {/* Split between — chips */}
      {expense.splitBetween?.length > 0 && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Split with:</span>
          {expense.splitBetween.map((split) => (
            <div 
              key={split.user?._id}
              className="rounded-full text-[8px] font-bold py-0.5 px-3 border border-gray-100 bg-gray-50/50 text-gray-500 flex items-center gap-1"
            >
              {split.user?.name?.split(' ')[0]}
            </div>
          ))}
        </div>
      )}

      {/* Date floating */}
      <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
         <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
            {new Date(expense.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short'
            })}
         </p>
      </div>
    </Card>
  );
};

export default ExpenseCard;