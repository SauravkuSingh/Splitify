import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlusCircle, Loader2 } from "lucide-react";
import api from "../utils/axios";
import toast from "react-hot-toast";

export function AddMemberModal({ isOpen, onClose, groupId, currentMembers, onMemberAdded }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.get('/groups/connections')
        .then(res => {
          // Filter out users who are already in the group
          const currentMemberIds = currentMembers.map(m => m._id.toString());
          const availableConnections = res.data.connections.filter(
            c => !currentMemberIds.includes(c.user._id.toString())
          );
          setConnections(availableConnections);
        })
        .catch(err => {
          console.error("Failed to fetch connections", err);
          toast.error("Could not load connections");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, groupId, currentMembers]);

  const handleAddMember = async (userId) => {
    try {
      setAddingId(userId);
      await api.post(`/groups/${groupId}/members`, { userId });
      toast.success("Member added successfully! 🎉");
      onMemberAdded();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden bg-[#FBFBFC] border-gray-100 shadow-2xl">
        <div className="p-8 pb-6 bg-white border-b border-gray-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground text-center">
              Add Connection
            </DialogTitle>
            <DialogDescription className="text-center text-xs font-medium text-muted-foreground mt-2">
              Select a previous connection to add to this group.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-muted-foreground mt-4 uppercase tracking-widest">Loading connections...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">No connections available</h3>
              <p className="text-xs text-gray-500 font-medium">All your connections are already in this group, or you don't have any past connections yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div 
                  key={connection.user._id}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-2 ring-gray-50 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                        {connection.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black text-gray-900 truncate">{connection.user.name}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate mt-0.5">
                        Shared: {connection.sharedGroups.slice(0, 2).join(', ')}
                        {connection.sharedGroups.length > 2 && '...'}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleAddMember(connection.user._id)}
                    disabled={addingId === connection.user._id}
                    variant="ghost"
                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-primary/10 hover:text-primary text-gray-400 p-0 shrink-0 transition-colors"
                  >
                    {addingId === connection.user._id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
