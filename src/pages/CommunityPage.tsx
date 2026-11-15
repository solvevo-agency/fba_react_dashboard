import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  ThumbsUp,
  Trash2,
  AlertTriangle,
  Eye,
  Ban,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ImageIcon,
  Calendar,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  communityApi,
  type CommunityPostListItem,
  type CommunityPostDetail,
  type CommunityMetrics,
} from '@/services/communityApi';
import { getApiErrorMessage } from '@/services/api';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPostListItem[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics>({
    total_posts: 0,
    total_likes: 0,
    total_comments: 0,
    total_deactivated_posts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

  // View post details modal
  const [viewPostId, setViewPostId] = useState<number | null>(null);
  const [viewPostDetail, setViewPostDetail] = useState<CommunityPostDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Status toggle confirmation modal
  const [postToToggleStatus, setPostToToggleStatus] = useState<CommunityPostListItem | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Delete confirmation modal
  const [postToDelete, setPostToDelete] = useState<CommunityPostListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load community posts and metrics
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [metricsData, postsData] = await Promise.all([
        communityApi.getMetrics(),
        communityApi.getAll(searchQuery, statusFilter),
      ]);
      setMetrics(metricsData);
      setPosts(postsData);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load community posts'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle open view post modal
  const handleOpenViewPost = async (postId: number) => {
    setViewPostId(postId);
    try {
      setIsLoadingDetail(true);
      const detail = await communityApi.getById(postId);
      setViewPostDetail(detail);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load post details'));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle confirm status toggle (active <-> deactivated)
  const handleConfirmToggleStatus = async () => {
    if (!postToToggleStatus) return;

    try {
      setIsTogglingStatus(true);
      const newStatusCode = postToToggleStatus.status === 'active' ? 0 : 1;
      const updated = await communityApi.toggleStatus(postToToggleStatus.id, newStatusCode);

      setPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      // If viewing this post, update view state as well
      if (viewPostDetail && viewPostDetail.id === updated.id) {
        setViewPostDetail((prev) => (prev ? { ...prev, status: updated.status, status_code: updated.status_code } : null));
      }

      // Refresh metrics
      const updatedMetrics = await communityApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success(
        updated.status === 'active'
          ? 'Post activated and published to forum'
          : 'Post deactivated and hidden from forum'
      );
      setPostToToggleStatus(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update post status'));
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);
      await communityApi.delete(postToDelete.id);

      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));

      if (viewPostId === postToDelete.id) {
        setViewPostId(null);
        setViewPostDetail(null);
      }

      // Refresh metrics
      const updatedMetrics = await communityApi.getMetrics();
      setMetrics(updatedMetrics);

      toast.success('Community post deleted successfully');
      setPostToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete post'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary shrink-0" />
            Student Community Forum & Moderation
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor registered student forum discussions, moderate content, and manage post visibility
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isLoading}
          className="h-8 text-xs gap-1.5 self-end sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Row: Total Posts, Total Likes, Total Comments, Total Deactivated */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Total Posts</span>
          <p className="text-xl font-bold mt-1 text-foreground">{metrics.total_posts}</p>
        </Card>
        <Card className="p-4 border shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Total Likes</span>
          <p className="text-xl font-bold mt-1 text-rose-600 dark:text-rose-400">
            {metrics.total_likes}
          </p>
        </Card>
        <Card className="p-4 border shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Total Comments</span>
          <p className="text-xl font-bold mt-1 text-primary">{metrics.total_comments}</p>
        </Card>
        <Card className="p-4 border shadow-xs">
          <span className="text-xs text-muted-foreground font-medium">Deactivated Posts</span>
          <p className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {metrics.total_deactivated_posts}
          </p>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search post title, student name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 placeholder:text-xs"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as 'all' | 'active' | 'deactivated')}
        >
          <SelectTrigger className="w-full sm:w-44 text-xs h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Posts
            </SelectItem>
            <SelectItem value="active" className="text-xs">
              Active Only
            </SelectItem>
            <SelectItem value="deactivated" className="text-xs">
              Deactivated Only
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table with Horizontal Scroll */}
      <Card className="border shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[1000px] w-full text-xs">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="min-w-[200px] whitespace-nowrap text-xs font-semibold">
                  Author / Student
                </TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap text-xs font-semibold">
                  Likes
                </TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap text-xs font-semibold">
                  Replies
                </TableHead>
                <TableHead className="min-w-[130px] whitespace-nowrap text-xs font-semibold">
                  Created Date
                </TableHead>
                <TableHead className="min-w-[120px] whitespace-nowrap text-xs font-semibold">
                  Status
                </TableHead>
                <TableHead className="w-[110px] min-w-[110px] whitespace-nowrap text-xs font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                    Loading community posts...
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-xs text-muted-foreground">
                    No community posts found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/30 transition-colors">
                    {/* Author */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border shrink-0">
                          {post.author_avatar ? (
                            <AvatarImage src={post.author_avatar} alt={post.author_name} />
                          ) : null}
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {post.author_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {post.author_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {post.author_email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Likes */}
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground">
                        <ThumbsUp className="h-3.5 w-3.5 text-rose-500" />
                        {post.likes_count}
                      </span>
                    </TableCell>

                    {/* Replies / Comments */}
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        {post.comments_count}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {post.created_at}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="whitespace-nowrap">
                      {post.status === 'active' ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium gap-1 pointer-events-none"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium gap-1 pointer-events-none"
                        >
                          <Ban className="h-3 w-3" />
                          Deactivated
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions: View, Toggle Status, Delete */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenViewPost(post.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="View post details and comments"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPostToToggleStatus(post)}
                          className={`h-8 w-8 transition-colors ${
                            post.status === 'active'
                              ? 'text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10'
                              : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                          title={post.status === 'active' ? 'Deactivate post' : 'Activate post'}
                        >
                          {post.status === 'active' ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPostToDelete(post)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete post permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Post Details Modal */}
      <Dialog
        open={viewPostId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewPostId(null);
            setViewPostDetail(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary shrink-0" />
              Community Post Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete thread contents, author credentials, and student discussion replies
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
              Loading discussion thread...
            </div>
          ) : viewPostDetail ? (
            <div className="space-y-4 my-2 text-xs">
              {/* Author & Header card */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border shrink-0">
                    {viewPostDetail.author_avatar ? (
                      <AvatarImage
                        src={viewPostDetail.author_avatar}
                        alt={viewPostDetail.author_name}
                      />
                    ) : null}
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                      {viewPostDetail.author_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {viewPostDetail.author_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {viewPostDetail.author_email}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div>
                    {viewPostDetail.status === 'active' ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]"
                      >
                        Deactivated
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{viewPostDetail.created_at}</span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4 rounded-lg border bg-card space-y-3">
                <h3 className="text-base font-bold text-foreground">
                  {viewPostDetail.title}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-xs">
                  {viewPostDetail.description}
                </p>

                {/* Attached Image */}
                {viewPostDetail.image && (
                  <div className="pt-2">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Attached Image:
                    </p>
                    <div className="rounded-md overflow-hidden border max-w-md bg-muted/20">
                      <img
                        src={viewPostDetail.image}
                        alt={viewPostDetail.title}
                        className="w-full max-h-48 object-cover hover:scale-[1.01] transition-transform duration-200"
                      />
                    </div>
                  </div>
                )}

                {/* Engagement Bar */}
                <div className="flex items-center gap-4 pt-2 border-t text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                    <span className="font-semibold text-foreground font-mono">
                      {viewPostDetail.likes_count}
                    </span>{' '}
                    likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-foreground font-mono">
                      {viewPostDetail.comments.length}
                    </span>{' '}
                    comments
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 pt-2">
            {viewPostDetail && (
              <Button
                type="button"
                variant={viewPostDetail.status === 'active' ? 'outline' : 'default'}
                size="sm"
                onClick={() => {
                  setPostToToggleStatus(viewPostDetail);
                }}
                className="h-8 text-xs"
              >
                {viewPostDetail.status === 'active' ? 'Deactivate Post' : 'Activate Post'}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setViewPostId(null);
                setViewPostDetail(null);
              }}
              className="h-8 text-xs font-medium"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Modal */}
      <Dialog
        open={postToToggleStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPostToToggleStatus(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
              {postToToggleStatus?.status === 'active' ? (
                <>
                  <Ban className="h-5 w-5 text-amber-500" />
                  Deactivate Community Post
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Activate Community Post
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {postToToggleStatus?.status === 'active'
                ? 'Are you sure you want to deactivate this post? It will be hidden from the public forum.'
                : 'Are you sure you want to activate this post? It will become publicly visible on the forum.'}
            </DialogDescription>
          </DialogHeader>

          {postToToggleStatus && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <p className="font-semibold text-foreground">{postToToggleStatus.title}</p>
              <p className="text-muted-foreground line-clamp-2">{postToToggleStatus.description}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                <span>By {postToToggleStatus.author_name}</span>
                <span>{postToToggleStatus.created_at}</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPostToToggleStatus(null)}
              disabled={isTogglingStatus}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={postToToggleStatus?.status === 'active' ? 'default' : 'default'}
              size="sm"
              onClick={handleConfirmToggleStatus}
              disabled={isTogglingStatus}
              className="h-9 text-xs font-medium gap-1.5"
            >
              {isTogglingStatus && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {postToToggleStatus?.status === 'active' ? 'Confirm Deactivate' : 'Confirm Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={postToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPostToDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Community Post
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete this community post and all of its comments? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {postToDelete && (
            <div className="border rounded-lg p-3 bg-muted/20 space-y-1.5 my-2 text-xs">
              <p className="font-semibold text-foreground">{postToDelete.title}</p>
              <p className="text-muted-foreground line-clamp-2">{postToDelete.description}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                <span>By {postToDelete.author_name}</span>
                <span>{postToDelete.comments_count} replies</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPostToDelete(null)}
              disabled={isDeleting}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-9 text-xs font-medium gap-1.5"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Trash2 className="h-3.5 w-3.5" />
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
