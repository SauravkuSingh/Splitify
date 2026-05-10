import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const GroupCard = ({ group, opacity = 1 }) => {
  const isSettled = group.status === 'settled';

  const colors = [
    'bg-primary', 
    'bg-amber-500', 
    'bg-rose-500', 
    'bg-indigo-500', 
    'bg-emerald-500'
  ];
  const colorIndex = group.name.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <Link to={`/groups/${group._id}`} className="block group transition-all" style={{ opacity }}>
      <Card className="border-gray-100 rounded-2xl p-6 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group-hover:-translate-y-1 bg-white flex flex-col h-full shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${avatarColor} rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md shadow-black/5 transform group-hover:rotate-3 transition-transform`}>
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="max-w-[140px]">
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                {group.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest truncate">
                {group.description || 'Shared Group'}
              </p>
            </div>
          </div>

          <Badge 
            variant="secondary" 
            className={`rounded-full px-2 py-0.5 border-none font-bold text-[9px] uppercase tracking-widest ${
              isSettled
                ? 'bg-green-100 text-green-600'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {isSettled ? 'Settled' : 'Active'}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {group.members?.slice(0, 3).map((member, i) => (
                <Avatar 
                  key={member._id} 
                  className="w-7 h-7 border-2 border-white shadow-sm"
                  style={{ zIndex: 3 - i }}
                >
                  <AvatarFallback className="bg-orange-50 text-primary text-[8px] font-black">
                    {member.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {group.members?.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[8px] text-muted-foreground font-black z-0 shadow-sm">
                  +{group.members.length - 3}
                </div>
              )}
            </div>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
              {group.members?.length} Members
            </span>
          </div>

          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default GroupCard;
