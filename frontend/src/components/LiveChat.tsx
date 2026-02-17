
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
        display_name: string | null;
        email: string;
    };
}

export function LiveChat({ matchId }: { matchId: string }) {
    const { user, isAdmin } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchComments();
        const channel = subscribeToComments();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId]);

    useEffect(() => {
        // Auto-scroll to bottom on new comments
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const fetchComments = async () => {
        const { data, error } = await (supabase as any)
            .from("comments")
            .select(`
        *,
        profiles:user_id(display_name, email)
      `)
            .eq("match_id", matchId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching comments:", error);
        } else {
            setComments(data as any || []);
        }
        setLoading(false);
    };

    const subscribeToComments = () => {
        return (supabase as any)
            .channel(`comments:${matchId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "comments",
                    filter: `match_id=eq.${matchId}`,
                },
                async (payload: any) => {
                    // Fetch the new comment with profile data
                    const { data } = await (supabase as any)
                        .from("comments")
                        .select(`
              *,
              profiles:user_id(display_name, email)
            `)
                        .eq("id", payload.new.id)
                        .single();

                    if (data) {
                        setComments((prev) => [...prev, data as any]);
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "comments",
                    filter: `match_id=eq.${matchId}`,
                },
                (payload: any) => {
                    setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
                }
            )
            .subscribe();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        const content = newComment.trim();
        setNewComment("");

        const { error } = await (supabase as any).from("comments").insert({
            match_id: matchId,
            user_id: user.id,
            content,
        });

        if (error) {
            toast.error("Failed to post comment");
            console.error(error);
            setNewComment(content); // Restore content on error
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!isAdmin) return;

        const { error } = await (supabase as any)
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (error) {
            toast.error("Failed to delete comment");
        } else {
            toast.success("Comment deleted");
        }
    };

    return (
        <div className="flex flex-col h-[600px] card-glass rounded-xl overflow-hidden border border-border/50">
            <div className="p-4 border-b border-border/50 bg-secondary/30 backdrop-blur-md">
                <h3 className="font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-live animate-pulse" />
                    Live Chat
                </h3>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-muted-foreground text-sm py-4">Loading comments...</p>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No comments yet.</p>
                            <p className="text-xs mt-1">Be the first to say something!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="group animate-fade-in flex gap-3 items-start">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-bold text-foreground">
                                            {comment.profiles?.display_name || comment.profiles?.email?.split('@')[0] || "User"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(comment.created_at), "HH:mm")}
                                        </span>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-destructive hover:bg-destructive/10 p-1 rounded"
                                                title="Delete comment"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-foreground/90 break-words leading-relaxed bg-secondary/50 p-2 rounded-lg rounded-tl-none">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50 bg-secondary/30 backdrop-blur-md">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type a message..."
                            className="bg-background/50"
                            maxLength={500}
                        />
                        <Button type="submit" size="icon" disabled={!newComment.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                ) : (
                    <div className="text-center text-sm text-muted-foreground">
                        Please login to chat
                    </div>
                )}
            </div>
        </div>
    );
}
