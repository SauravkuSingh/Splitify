import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const GroupCard = ({ group, opacity = 1 }) => {
  const isSettled = group.status === "settled";

  const colors = [
    "bg-primary",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-emerald-500",
  ];
  const colorIndex = group.name.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <Link
      to={`/groups/${group._id}`}
      className="block group transition-all"
      style={{ opacity }}
    >
      <Card className="border-gray-100 rounded-[2.5rem] p-8 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group-hover:-translate-y-2 bg-white flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-5">
            <div
              className={`w-16 h-16 ${avatarColor} rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-black/5 transform group-hover:rotate-6 transition-transform`}
            >
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="max-w-[140px]">
              <h3 className="font-black text-xl text-foreground group-hover:text-primary transition-colors leading-tight truncate">
                {group.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-2 font-black uppercase tracking-widest truncate">
                {group.description || "Shared Group"}
              </p>
            </div>
          </div>

          <Badge
            variant="secondary"
            className={`rounded-full px-3 py-1 border-none font-black text-[10px] uppercase tracking-widest ${
              isSettled
                ? "bg-green-100 text-green-600"
                : "bg-primary/10 text-primary"
            }`}
          >
            {isSettled ? "Settled" : "Active"}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {group.members?.slice(0, 3).map((member, i) => (
                <Avatar
                  key={member._id}
                  className="w-9 h-9 border-4 border-white shadow-lg"
                  style={{ zIndex: 3 - i }}
                >
                  <AvatarFallback className="bg-orange-50 text-primary text-[10px] font-black">
                    {member.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {group.members?.length > 3 && (
                <div className="w-9 h-9 rounded-full bg-gray-50 border-4 border-white flex items-center justify-center text-[10px] text-muted-foreground font-black z-0 shadow-sm">
                  +{group.members.length - 3}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">
              {group.members?.length} Members
            </span>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default GroupCard;
